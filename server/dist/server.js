import { WebSocket, WebSocketServer } from "ws";
import cors from "cors";
import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
console.log("🚀 SERVER STARTING...");
console.log("Node version:", process.version);
console.log("Environment:", process.env.NODE_ENV);
console.log("CWD:", process.cwd());
const PORT = Number((process.env.PORT) || 8082);
if (!PORT) {
    console.error("❌ No PORT provided. Railway must set process.env.PORT");
    process.exit(1);
}
const FFMPEG_PATH = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
console.log("Port:", PORT);
console.log("FFmpeg path:", FFMPEG_PATH);
// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("__dirname:", __dirname);
// HLS output directory
const outputDir = path.join(__dirname, "hls");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log("Created HLS output directory:", outputDir);
}
// Express for static HLS
const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use("/hls", express.static(outputDir, {
    setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Access-Control-Allow-Origin", "*");
    },
}));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        broadcasting: isBroadcasting,
        timestamp: new Date().toISOString()
    });
});
app.get("/", (req, res) => {
    res.json({
        status: "WebSocket Server Running",
        port: PORT,
        ffmpegPath: FFMPEG_PATH,
        endpoints: {
            ws: `wss://${req.headers.host}/?role=broadcaster`,
            hls: `https://${req.headers.host}/hls/audio.m3u8`,
            health: `https://${req.headers.host}/health`
        }
    });
});
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HTTP server listening on http://0.0.0.0:${PORT}`);
    console.log(`📡 WebSocket available at ws://0.0.0.0:${PORT}`);
    console.log(`🎵 HLS at /hls/audio.m3u8`);
});
// Handle server errors
server.on("error", (err) => {
    console.error("❌ Server error:", err);
    process.exit(1);
});
const wss = new WebSocketServer({
    server,
    perMessageDeflate: false,
    clientTracking: true
});
console.log("WebSocket server created");
let ffmpegProcess = null;
let isBroadcasting = false;
const listeners = new Set();
const broadcasters = new Set();
function notifyListeners() {
    const msg = JSON.stringify({ type: "status", broadcasting: isBroadcasting });
    for (const ws of listeners) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(msg);
            }
            catch (e) {
                console.error("Failed to notify listener:", e);
            }
        }
    }
}
function startFFmpeg() {
    if (ffmpegProcess) {
        console.log("⚠️ FFmpeg already running");
        return;
    }
    console.log("🎬 Starting FFmpeg -> HLS...");
    const streamKey = "audio";
    const playlist = path.join(outputDir, `${streamKey}.m3u8`);
    const segmentPattern = path.join(outputDir, `${streamKey}_%03d.ts`);
    // Clean previous playlist/segments
    try {
        const files = fs.readdirSync(outputDir);
        for (const f of files) {
            if (f.startsWith(`${streamKey}`)) {
                fs.unlinkSync(path.join(outputDir, f));
            }
        }
        console.log("🧹 Cleaned old HLS segments");
    }
    catch (e) {
        console.error("Error cleaning segments:", e);
    }
    // Check if FFmpeg exists
    console.log("Spawning FFmpeg with path:", FFMPEG_PATH);
    try {
        ffmpegProcess = spawn(FFMPEG_PATH, [
            "-hide_banner",
            "-loglevel", "level+info",
            "-f", "webm",
            "-i", "pipe:0",
            "-vn",
            "-acodec", "aac",
            "-b:a", "128k",
            "-ar", "48000",
            "-ac", "2",
            "-f", "hls",
            "-hls_time", "2",
            "-hls_list_size", "6",
            "-hls_flags", "delete_segments+append_list+discont_start",
            "-hls_segment_type", "mpegts",
            "-hls_segment_filename", segmentPattern,
            playlist,
        ], { stdio: ["pipe", "inherit", "pipe"] });
        console.log("✅ FFmpeg process spawned, PID:", ffmpegProcess.pid);
    }
    catch (e) {
        console.error("❌ Failed to spawn FFmpeg:", e);
        ffmpegProcess = null;
        return;
    }
    if (ffmpegProcess.stderr) {
        ffmpegProcess.stderr.on("data", (buf) => {
            const line = buf.toString();
            if (line.includes("Opening") || line.includes("error") || line.includes("Error")) {
                console.log("[FFmpeg]", line.trim());
            }
        });
    }
    ffmpegProcess.on("error", (err) => {
        console.error("❌ FFmpeg process error:", err);
        ffmpegProcess = null;
        isBroadcasting = false;
        notifyListeners();
    });
    ffmpegProcess.on("close", (code, sig) => {
        console.log(`FFmpeg exited code=${code} sig=${sig}`);
        ffmpegProcess = null;
        isBroadcasting = false;
        notifyListeners();
    });
    isBroadcasting = true;
    notifyListeners();
    console.log("✅ Broadcasting started");
}
function stopFFmpeg() {
    if (!ffmpegProcess)
        return;
    console.log("⏹️ Stopping FFmpeg...");
    try {
        if (ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
            ffmpegProcess.stdin.end();
        }
    }
    catch (e) {
        console.error("Error closing stdin:", e);
    }
    setTimeout(() => {
        try {
            if (ffmpegProcess) {
                ffmpegProcess.kill("SIGINT");
            }
        }
        catch (e) {
            console.error("Error killing FFmpeg:", e);
        }
    }, 200);
    ffmpegProcess = null;
    isBroadcasting = false;
    notifyListeners();
}
wss.on("connection", (ws, req) => {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const role = url.searchParams.get("role");
    const ip = req.socket.remoteAddress;
    console.log(`🔌 WebSocket connection - Role: ${role}, IP: ${ip}`);
    if (role === "broadcaster") {
        console.log("🎙️ Broadcaster connected");
        broadcasters.add(ws);
        // Send connection confirmation
        ws.send(JSON.stringify({
            type: "connected",
            role: "broadcaster",
            broadcasting: isBroadcasting
        }));
        ws.on("message", (data, isBinary) => {
            try {
                if (!isBinary) {
                    const text = data.toString("utf8");
                    if (text.startsWith("{")) {
                        const msg = JSON.parse(text);
                        console.log("📨 Broadcaster message:", msg.type);
                        if (msg.type === "start")
                            startFFmpeg();
                        if (msg.type === "stop")
                            stopFFmpeg();
                        return;
                    }
                }
                // Binary audio data
                if (ffmpegProcess && ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
                    ffmpegProcess.stdin.write(data);
                }
            }
            catch (e) {
                console.error("Broadcaster message error:", e);
            }
        });
        ws.on("close", () => {
            console.log("👋 Broadcaster disconnected");
            broadcasters.delete(ws);
            if (broadcasters.size === 0) {
                stopFFmpeg();
            }
        });
    }
    else {
        console.log("👂 Listener connected");
        listeners.add(ws);
        ws.send(JSON.stringify({ type: "status", broadcasting: isBroadcasting }));
        ws.on("close", () => {
            listeners.delete(ws);
            console.log("👋 Listener disconnected");
        });
    }
    ws.on("error", (err) => {
        console.error("❌ WS error:", err);
        broadcasters.delete(ws);
        listeners.delete(ws);
    });
});
wss.on("listening", () => {
    console.log("✅ WebSocket server is listening");
});
wss.on("error", (err) => {
    console.error("❌ WebSocket server error:", err);
});
process.on("SIGINT", () => {
    console.log("🛑 Shutting down...");
    stopFFmpeg();
    server.close(() => process.exit(0));
});
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down...");
    stopFFmpeg();
    server.close(() => process.exit(0));
});
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled rejection at:", promise, "reason:", reason);
});
console.log("✅ Server initialization complete");

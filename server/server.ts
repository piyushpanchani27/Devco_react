import { WebSocket, WebSocketServer } from "ws";
import cors from "cors";
import express from "express";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
// LOGGING
console.log("🚀 SERVER STARTING...");
console.log("Node version:", process.version);
console.log("Environment:", process.env.NODE_ENV);
console.log("CWD:", process.cwd());
try {
  const command = process.platform === "win32" ? "where ffmpeg" : "which ffmpeg";
  const ffmpegPath = execSync(command).toString().trim();
  console.log("🟢 FFmpeg is installed at:", ffmpegPath);
} catch (err) {
  console.error("🔴 FFmpeg not found in PATH");
}
// const PORT = Number(process.env.PORT || 8082);
const PORT = Number(process.env.PORT);
if (!PORT) {
  console.error("❌ No PORT provided. Railway must set process.env.PORT");
  process.exit(1);  
}
const FFMPEG_PATH = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
//  const FFMPEG_PATH = process.env.FFMPEG_PATH || "C:\\ffmpeg\\bin\\ffmpeg.exe";
console.log("Port:", PORT);
console.log("FFmpeg path:", FFMPEG_PATH);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("__dirname:", __dirname);

const outputDir = path.join(__dirname, "hls");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("✅ Created HLS output directory:", outputDir);
} else {
  console.log("✅ HLS output directory exists:", outputDir);
}

// Verify directory is writable
try {
  const testFile = path.join(outputDir, ".test");
  fs.writeFileSync(testFile, "test");
  fs.unlinkSync(testFile);
  console.log("✅ HLS directory is writable");
} catch (e) {
  console.error("❌ HLS directory is NOT writable:", e);
}

const app = express();
app.use(cors({
  origin: "*",
  credentials: true
}));

// Add middleware to log all /hls requests
app.use("/hls", (req, res, next) => {
  console.log(`🔍 HLS request: ${req.method} ${req.path}`);
  const requestedFile = path.join(outputDir, req.path.replace(/^\//, ""));
  console.log(`   Looking for file: ${requestedFile}`);
  console.log(`   File exists: ${fs.existsSync(requestedFile)}`);
  next();
});

app.use("/hls", express.static(outputDir, {
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(`📤 Serving HLS file: ${filePath}`);
  },
}));

// Add route to list HLS files for debugging
app.get("/hls/list", (req, res) => {
  try {
    const files = fs.readdirSync(outputDir);
    const audioM3u8Path = path.join(outputDir, "audio.m3u8");
    const exists = fs.existsSync(audioM3u8Path);
    let content = null;
    if (exists) {
      try {
        content = fs.readFileSync(audioM3u8Path, 'utf8');
      } catch (e) {
        content = `Error reading file: ${e}`;
      }
    }
    res.json({ 
      directory: outputDir,
      files: files,
      audioM3u8Exists: exists,
      audioM3u8Path: audioM3u8Path,
      audioM3u8Content: content,
      url: `https://${req.headers.host || currentHost}/hls/audio.m3u8`
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Add route to test HLS file access
app.get("/hls/test", (req, res) => {
  const host = req.headers.host || currentHost;
  const hlsUrl = getHlsUrl(host);
  const audioM3u8Path = path.join(outputDir, "audio.m3u8");
  const exists = fs.existsSync(audioM3u8Path);
  
  res.json({
    hlsUrl: hlsUrl,
    filePath: audioM3u8Path,
    fileExists: exists,
    directory: outputDir,
    directoryExists: fs.existsSync(outputDir),
    broadcasting: isBroadcasting,
    ffmpegRunning: ffmpegProcess !== null,
    testUrl: `https://${host}/hls/audio.m3u8`,
    directUrl: `https://${host}/hls/audio.m3u8`
  });
});

app.get("/health", (req, res) => {
  const host = req.headers.host || currentHost;
  const hlsUrl = getHlsUrl(host);
  const playlistExists = fs.existsSync(path.join(outputDir, "audio.m3u8"));
  
  res.json({ 
    status: "ok", 
    broadcasting: isBroadcasting,
    hlsUrl: isBroadcasting ? hlsUrl : null,
    playlistExists: playlistExists,
    listeners: listeners.size,
    broadcasters: broadcasters.size,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  const host = req.headers.host || currentHost;
  const hlsUrl = getHlsUrl(host);
  res.json({ 
    status: "WebSocket Server Running",
    port: PORT,
    ffmpegPath: FFMPEG_PATH,
    broadcasting: isBroadcasting,
    hlsUrl: isBroadcasting ? hlsUrl : null,
    endpoints: {
      ws: `wss://${host}/?role=broadcaster`,
      hls: hlsUrl,
      health: `https://${host}/health`,
      hlsList: `https://${host}/hls/list`
    }
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP server listening on http://0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket available at ws://0.0.0.0:${PORT}`);
  console.log(`🎵 HLS at /hls/audio.m3u8`);
});
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

let ffmpegProcess: ChildProcess | null = null;
let isBroadcasting = false;
let currentHost = "devcoreact-production-d589.up.railway.app"; // Default for Railway

const listeners = new Set<WebSocket>();
const broadcasters = new Set<WebSocket>();

function getHlsUrl(host?: string): string {
  const domain = host || currentHost;
  const protocol = domain.includes("localhost") ? "http" : "https";
  return `${protocol}://${domain}/hls/audio.m3u8`;
}

function notifyListeners(host?: string) {
  const hlsUrl = getHlsUrl(host);
  const msg = JSON.stringify({ 
    type: "status", 
    broadcasting: isBroadcasting,
    hlsUrl: isBroadcasting ? hlsUrl : undefined
  });
  console.log(`📢 Notifying ${listeners.size} listeners: broadcasting=${isBroadcasting}, hlsUrl=${isBroadcasting ? hlsUrl : 'N/A'}`);
  for (const ws of listeners) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(msg);
      } catch (e) {
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
  
  try {
    const files = fs.readdirSync(outputDir);
    for (const f of files) {
      if (f.startsWith(`${streamKey}`)) {
        fs.unlinkSync(path.join(outputDir, f));
      }
    }
    console.log("🧹 Cleaned old HLS segments");
  } catch (e) {
    console.error("Error cleaning segments:", e);
  }

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
      "-hls_list_size", "3",
      "-hls_flags", "delete_segments+append_list+discont_start",
      "-hls_segment_type", "mpegts",
      "-hls_segment_filename", segmentPattern,
      "-hls_allow_cache", "0", 
      "-hls_start_number_source", "epoch",
      playlist,
    ], { stdio: ["pipe", "inherit", "pipe"] });
    console.log("✅ FFmpeg process spawned, PID:", ffmpegProcess.pid);
  } catch (e) {
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
  
  // ADD THIS: Wait for first segment to be created before notifying listeners
  let firstSegmentCreated = false;
  let checkCount = 0;
  const maxChecks = 60; // Check for up to 30 seconds (60 * 500ms)
  
  const checkForFirstSegment = () => {
    if (firstSegmentCreated) return;
    checkCount++;
    
    try {
      const files = fs.readdirSync(outputDir);
      console.log(`🔍 Checking for HLS files (attempt ${checkCount}/${maxChecks}):`, files);
      
      if (fs.existsSync(playlist)) {
        const playlistContent = fs.readFileSync(playlist, 'utf8');
        console.log(`📄 Playlist content (first 200 chars):`, playlistContent.substring(0, 200));
        
        if (playlistContent.includes('.ts')) {
          console.log("✅ First HLS segment created, notifying listeners");
          console.log(`📁 HLS files in directory:`, fs.readdirSync(outputDir));
          console.log(`📂 Full directory path: ${outputDir}`);
          console.log(`🔗 HLS URL should be: https://${currentHost}/hls/audio.m3u8`);
          firstSegmentCreated = true;
          isBroadcasting = true;
          // Get host from any active listener or broadcaster
          const activeWs = listeners.size > 0 ? Array.from(listeners)[0] : 
                          broadcasters.size > 0 ? Array.from(broadcasters)[0] : null;
          const host = activeWs ? (activeWs as any).host : currentHost;
          notifyListeners(host);
        }
      } else {
        console.log(`⏳ Playlist file not found yet: ${playlist}`);
      }
    } catch (e) {
      console.error("❌ Error checking for segments:", e);
    }
    
    if (!firstSegmentCreated && checkCount < maxChecks) {
      setTimeout(checkForFirstSegment, 500); // Check every 500ms
    } else if (!firstSegmentCreated) {
      console.error("❌ Timeout waiting for first HLS segment");
      console.log(`📁 Current files in ${outputDir}:`, fs.readdirSync(outputDir).join(", "));
    }
  };
  
  // Start checking for first segment after a short delay
  setTimeout(checkForFirstSegment, 1000);
  console.log("✅ Broadcasting started (waiting for first segment)");
  console.log(`📂 HLS output directory: ${outputDir}`);
  console.log(`📝 Playlist will be at: ${playlist}`);
}
function stopFFmpeg() {
  if (!ffmpegProcess) return;
  console.log("⏹️ Stopping FFmpeg...");
  try {
    if (ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
      ffmpegProcess.stdin.end();
    }
  } catch (e) {
    console.error("Error closing stdin:", e);
  }
  setTimeout(() => {
    try { 
      if (ffmpegProcess) {
        ffmpegProcess.kill("SIGINT");
      }
    } catch (e) {
      console.error("Error killing FFmpeg:", e);
    }
  }, 200);
  ffmpegProcess = null;
  isBroadcasting = false;
  notifyListeners();
}

wss.on("connection", (ws, req) => {
  const host = req.headers.host || currentHost;
  currentHost = host; // Update current host
  const url = new URL(req.url || "/", `http://${host}`);
  const role = url.searchParams.get("role");
  const ip = req.socket.remoteAddress;

  // Store host on WebSocket for later use
  (ws as any).host = host;

  console.log(`🔌 WebSocket connection - Role: ${role}, IP: ${ip}, Host: ${host}`);
  if (role === "broadcaster") {
    console.log("🎙️ Broadcaster connected");
    broadcasters.add(ws);
    ws.send(JSON.stringify({ 
      type: "connected", 
      role: "broadcaster",
      broadcasting: isBroadcasting,
      hlsUrl: isBroadcasting ? getHlsUrl(host) : undefined
    }));
    ws.on("message", (data, isBinary) => {
      try {
        if (!isBinary) {
          const text = data.toString("utf8");
          if (text.startsWith("{")) {
            const msg = JSON.parse(text);
            console.log("📨 Broadcaster message:", msg.type);
            if (msg.type === "start") startFFmpeg();
            if (msg.type === "stop") stopFFmpeg();
            return;
          }
        }
        if (ffmpegProcess && ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
          ffmpegProcess.stdin.write(data);
        }
      } catch (e) {
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
  } else {
    console.log("👂 Listener connected");
    listeners.add(ws);
    // Send status with HLS URL if broadcasting
    ws.send(JSON.stringify({ 
      type: "status", 
      broadcasting: isBroadcasting,
      hlsUrl: isBroadcasting ? getHlsUrl(host) : undefined
    }));
    console.log(`📤 Sent initial status to listener: broadcasting=${isBroadcasting}, hlsUrl=${isBroadcasting ? getHlsUrl(host) : 'N/A'}`);
    ws.on("close", () => {
      listeners.delete(ws);
      console.log("👋 Listener disconnected");
    });
    
    // Handle getStatus and getHlsUrl requests
    ws.on("message", (data) => {
      try {
        if (Buffer.isBuffer(data)) {
          const text = data.toString("utf8");
          if (text.startsWith("{")) {
            const msg = JSON.parse(text);
            if (msg.type === "getStatus" || msg.type === "getHlsUrl") {
              ws.send(JSON.stringify({ 
                type: "status", 
                broadcasting: isBroadcasting,
                hlsUrl: isBroadcasting ? getHlsUrl(host) : undefined
              }));
              console.log(`📤 Responded to ${msg.type} request`);
            }
          }
        }
      } catch (e) {
        // Ignore parse errors for binary data
      }
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

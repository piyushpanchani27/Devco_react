// import { WebSocket, WebSocketServer } from "ws";
// import cors from "cors";
// import express from "express";
// import { spawn, ChildProcess } from "child_process";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
 
// const PORT = Number(process.env.PORT || 8082);
// // const FFMPEG_PATH = process.env.FFMPEG_PATH || "C:\\ffmpeg\\bin\\ffmpeg.exe";
// // const FFMPEG_PATH = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
// const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
 
// // Resolve __dirname in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
 
// // HLS output directory
// const outputDir = path.join(__dirname, "hls");
// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
 
// // Express for static HLS
// const app = express();
// app.use(cors());
// app.use("/hls", express.static(outputDir, {
//   setHeaders: (res) => {
//     res.setHeader("Cache-Control", "no-store");
//   },
// }));
 
// const server = app.listen(PORT, "0.0.0.0", () => {
//   console.log(`HTTP server listening on http://0.0.0.0:${PORT}`);
//   console.log(`HLS at /hls/audio.m3u8`);
// });
 
// const wss = new WebSocketServer({ server });
 
// let ffmpegProcess: ChildProcess | null = null;
// let isBroadcasting = false;
 
// const listeners = new Set<WebSocket>();
// const broadcasters = new Set<WebSocket>();
 
// function notifyListeners() {
//   const msg = JSON.stringify({ type: "status", broadcasting: isBroadcasting });
//   for (const ws of listeners) {
//     if (ws.readyState === WebSocket.OPEN) ws.send(msg);
//   }
// }
 
// function startFFmpeg() {
//   if (ffmpegProcess) return;
//   console.log("Starting FFmpeg -> HLS...");
 
//   const streamKey = "audio";
//   const playlist = path.join(outputDir, `${streamKey}.m3u8`);
//   const segmentPattern = path.join(outputDir, `${streamKey}_%03d.ts`);
 
//   // Clean previous playlist/segments
//   try {
//     for (const f of fs.readdirSync(outputDir)) {
//       if (f.startsWith(`${streamKey}`)) fs.unlinkSync(path.join(outputDir, f));
//     }
//   } catch {}
 
//   ffmpegProcess = spawn(FFMPEG_PATH, [
//     "-hide_banner",
//     "-loglevel", "level+info",
//     "-f", "webm",
//     "-i", "pipe:0",
//     "-vn",
//     "-acodec", "aac",
//     "-b:a", "128k",
//     "-ar", "48000",
//     "-ac", "2",
//     "-f", "hls",
//     "-hls_time", "2",
//     "-hls_list_size", "6",
//     "-hls_flags", "delete_segments+append_list+discont_start",
//     "-hls_segment_type", "mpegts",
//     "-hls_segment_filename", segmentPattern,
//     playlist,
//   ], { stdio: ["pipe", "inherit", "pipe"] });
 
//   if (ffmpegProcess.stderr) {
//     ffmpegProcess.stderr.on("data", (buf) => {
//       const line = buf.toString();
//       if (line.includes("Opening")) console.log(line.trim());
//       if (line.includes("frame=") || line.includes("time=")) {
//         // progress lines; optional to log
//       }
//     });
//   }
 
//   ffmpegProcess.on("close", (code, sig) => {
//     console.log(`FFmpeg exited code=${code} sig=${sig}`);
//     ffmpegProcess = null;
//     isBroadcasting = false;
//     notifyListeners();
//   });
 
//   isBroadcasting = true;
//   notifyListeners();
// }
 
// function stopFFmpeg() {
//   if (!ffmpegProcess) return;
//   console.log("Stopping FFmpeg...");
//   // Graceful on Windows
//   try {
//     if (ffmpegProcess.stdin) {
//       ffmpegProcess.stdin.end();
//     }
//   } catch {}
//   setTimeout(() => {
//     try { ffmpegProcess?.kill("SIGINT"); } catch {}
//   }, 200);
//   ffmpegProcess = null;
//   isBroadcasting = false;
//   notifyListeners();
// }
 
// wss.on("connection", (ws, req) => {
//   const host = req.headers.host || "localhost";
//   const url = new URL(req.url || "/", `http://${host}`);
//   const role = url.searchParams.get("role");
 
//   if (role === "broadcaster") {
//     console.log("Broadcaster connected");
//     broadcasters.add(ws);
 
//     ws.on("message", (data, isBinary) => {
//       try {
//         if (!isBinary) {
//           const text = data.toString("utf8");
//           if (text.startsWith("{")) {
//             const msg = JSON.parse(text);
//             if (msg.type === "start") startFFmpeg();
//             if (msg.type === "stop") stopFFmpeg();
//             return;
//           }
//         }
//         if (ffmpegProcess && ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
//           ffmpegProcess.stdin.write(data);
//         }
//       } catch (e) {
//         console.error("Broadcaster message error", e);
//       }
//     });
 
//     ws.on("close", () => {
//       console.log("Broadcaster disconnected");
//       broadcasters.delete(ws);
//       if (broadcasters.size === 0) stopFFmpeg();
//     });
//   } else {
//     console.log("Listener connected");
//     listeners.add(ws);
//     ws.send(JSON.stringify({ type: "status", broadcasting: isBroadcasting }));
//     ws.on("close", () => {
//       listeners.delete(ws);
//       console.log("Listener disconnected");
//     });
//   }
 
//   ws.on("error", (err) => {
//     console.error("WS error", err);
//     broadcasters.delete(ws);
//     listeners.delete(ws);
//   });
// });
 
// process.on("SIGINT", () => {
//   stopFFmpeg();
//   server.close(() => process.exit(0));
// });
import { WebSocket, WebSocketServer } from "ws";
import cors from "cors";
import express from "express";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
 
const PORT = Number(process.env.PORT || 8082);
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
 
// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
// HLS output directory
const outputDir = path.join(__dirname, "hls");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
 
// Express for static HLS
const app = express();
app.use(cors());
app.use("/hls", express.static(outputDir, {
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
  },
}));
 
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server listening on http://0.0.0.0:${PORT}`);
  console.log(`HLS at /hls/audio.m3u8`);
});
 
const wss = new WebSocketServer({ 
  server,
  clientTracking: true,
  perMessageDeflate: false, // Disable compression for better performance
  maxPayload: 100 * 1024 * 1024 // 100MB max payload
});
 
let ffmpegProcess: ChildProcess | null = null;
let isBroadcasting = false;
 
const listeners = new Set<WebSocket>();
const broadcasters = new Set<WebSocket>();

// Heartbeat mechanism to keep connections alive (Railway timeout is ~55s)
function heartbeat(this: WebSocket) {
  (this as any).isAlive = true;
}

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    if ((ws as any).isAlive === false) {
      console.log("⚠️ Terminating inactive connection");
      return ws.terminate();
    }
    (ws as any).isAlive = false;
    ws.ping();
  });
}, 20000); // Ping every 20 seconds (well before 55s timeout)
 
function notifyListeners() {
  const msg = JSON.stringify({ type: "status", broadcasting: isBroadcasting });
  for (const ws of listeners) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}
 
function startFFmpeg() {
  if (ffmpegProcess) {
    console.log("FFmpeg already running");
    return;
  }
  console.log("Starting FFmpeg -> HLS...");
 
  const streamKey = "audio";
  const playlist = path.join(outputDir, `${streamKey}.m3u8`);
  const segmentPattern = path.join(outputDir, `${streamKey}_%03d.ts`);
 
  // Clean previous playlist/segments
  try {
    for (const f of fs.readdirSync(outputDir)) {
      if (f.startsWith(`${streamKey}`)) fs.unlinkSync(path.join(outputDir, f));
    }
  } catch {}
 
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
 
  if (ffmpegProcess.stderr) {
    ffmpegProcess.stderr.on("data", (buf) => {
      const line = buf.toString();
      if (line.includes("Opening") || line.includes("error")) {
        console.log(line.trim());
      }
    });
  }
 
  ffmpegProcess.on("close", (code, sig) => {
    console.log(`FFmpeg exited code=${code} sig=${sig}`);
    ffmpegProcess = null;
    isBroadcasting = false;
    notifyListeners();
  });

  ffmpegProcess.on("error", (err) => {
    console.error("FFmpeg error:", err);
    ffmpegProcess = null;
    isBroadcasting = false;
    notifyListeners();
  });
 
  isBroadcasting = true;
  notifyListeners();
}
 
function stopFFmpeg() {
  if (!ffmpegProcess) return;
  console.log("Stopping FFmpeg...");
  
  try {
    if (ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
      ffmpegProcess.stdin.end();
    }
  } catch (e) {
    console.error("Error closing FFmpeg stdin:", e);
  }
  
  setTimeout(() => {
    try { 
      if (ffmpegProcess) {
        ffmpegProcess.kill("SIGINT"); 
      }
    } catch {}
  }, 500);
  
  ffmpegProcess = null;
  isBroadcasting = false;
  notifyListeners();
}
 
wss.on("connection", (ws, req) => {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const role = url.searchParams.get("role");

  // Initialize heartbeat
  (ws as any).isAlive = true;
  ws.on('pong', heartbeat);
 
  if (role === "broadcaster") {
    console.log("🎙️ Broadcaster connected");
    broadcasters.add(ws);

    // Send acknowledgment
    ws.send(JSON.stringify({ type: "connected", role: "broadcaster" }));
 
    ws.on("message", (data, isBinary) => {
      try {
        if (!isBinary) {
          const text = data.toString("utf8");
          if (text.startsWith("{")) {
            const msg = JSON.parse(text);
            console.log("📨 Received message:", msg.type);
            
            if (msg.type === "start") {
              startFFmpeg();
              ws.send(JSON.stringify({ type: "started", success: true }));
            }
            if (msg.type === "stop") {
              stopFFmpeg();
              ws.send(JSON.stringify({ type: "stopped", success: true }));
            }
            return;
          }
        }
        
        // Handle binary audio data
        if (ffmpegProcess && ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
          ffmpegProcess.stdin.write(data);
        } else {
          console.warn("⚠️ Received audio data but FFmpeg not ready");
        }
      } catch (e) {
        console.error("Broadcaster message error", e);
      }
    });
 
    ws.on("close", () => {
      console.log("🔌 Broadcaster disconnected");
      broadcasters.delete(ws);
      if (broadcasters.size === 0) {
        console.log("No broadcasters left, stopping FFmpeg");
        stopFFmpeg();
      }
    });
  } else {
    console.log("👂 Listener connected");
    listeners.add(ws);
    ws.send(JSON.stringify({ type: "status", broadcasting: isBroadcasting }));
    
    ws.on("close", () => {
      listeners.delete(ws);
      console.log("Listener disconnected");
    });
  }
 
  ws.on("error", (err) => {
    console.error("WS error", err);
    broadcasters.delete(ws);
    listeners.delete(ws);
  });
});

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});
 
process.on("SIGINT", () => {
  console.log("Shutting down...");
  stopFFmpeg();
  clearInterval(heartbeatInterval);
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  stopFFmpeg();
  clearInterval(heartbeatInterval);
  server.close(() => process.exit(0));
});
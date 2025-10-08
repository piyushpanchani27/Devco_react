// // import WebSocket, { WebSocketServer } from 'ws';
// // import cors from 'cors';
// // import express from 'express';
// // import { spawn } from 'child_process';
// // import path from 'path';
// // import fs from 'fs';
// // import { fileURLToPath } from "url";

// // const port = 8082;

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // const outputDir = path.join(__dirname, "hls");

// // if (!fs.existsSync(outputDir)) {
// //   fs.mkdirSync(outputDir);
// // }

// // const app = express();
// // app.use(cors());
// // app.use('/hls', express.static(outputDir));

// // const server = app.listen(port, () => {
// //   console.log("HTTP server is listening on port 8082");
// // });

// // const wss = new WebSocketServer({ server });

// // let ffmpegProcess: any = null;

// // const startFFmpeg = () => {
// //   if (ffmpegProcess) {
// //     ffmpegProcess.kill("SIGINT");
// //   }

// //   const streamKey = "audio";
// //   const playlist = path.join(outputDir, `${streamKey}.m3u8`);

// //   ffmpegProcess = spawn("ffmpeg", [
// //     "-f", "webm",
// //     "-i", "pipe:0",
// //     "-c:a", "aac",
// //     "-b:a", "128k",
// //     "-f", "hls",
// //     "-hls_time", "1",
// //     "-hls_list_size", "3",
// //     "-hls_flags", "delete_segments",
// //     "-hls_segment_filename", path.join(outputDir, `${streamKey}_%03d.ts`),
// //     playlist,
// //   ]);

// // //   ffmpegProcess.stdout.on("data", (data: any) => {
// // //     console.log(`FFmpeg stdout: ${data}`);
// // //   });

// // ffmpegProcess.stdout.on("data", (chunk: Buffer) => {
// //   console.log(`FFmpeg produced ${chunk.length} bytes`);

// //   // broadcast to all connected clients
// //   wss.clients.forEach((client) => {
// //     if (client.readyState === 1) { // 1 = OPEN
// //       client.send(chunk);
// //     }
// //   });
// // });


// //   ffmpegProcess.stderr.on("data", (data: any) => {
// //     console.error(`FFmpeg stderr: ${data}`);
// //   });

// //   ffmpegProcess.on("error", (err: any) => {
// //     console.error(`FFmpeg process error: ${err.message}`);
// //     ffmpegProcess = null;
// //   });

// //   ffmpegProcess.on("close", (code: any) => {
// //     console.log(`FFmpeg process exited with code ${code}`);
// //     if (code !== 0) {
// //       console.error(`FFmpeg process exited with non-zero code: ${code}`);
// //     }
// //     ffmpegProcess = null;
// //     // startFFmpeg();
// //     setTimeout(startFFmpeg, 1000);
// //   });
// // };

// // startFFmpeg();

// // wss.on("connection", (ws) => {
// //   console.log("Client connected");

// //   ws.on("message", (message: any) => {
// //     console.log(`Received message of size ${message.byteLength} bytes`);
// //     if (ffmpegProcess) {
// //       try {
// //         ffmpegProcess.stdin.write(Buffer.from(message));
// //       } catch (error: any) {
// //         console.error(`Error writing to FFmpeg stdin: ${error.message}`);
// //       }
// //     } else {
// //       console.error("FFmpeg process not available. Dropping message.");
// //     }
// //   });

// //   ws.on("close", () => {
// //     console.log("Client disconnected");
// //     if (ffmpegProcess) {
// //    ffmpegProcess.kill("SIGINT");
// //       ffmpegProcess = null;   
// //     }
// //   });

// //   ws.on("error", (error) => {
// //     console.error(`WebSocket error: ${error.message}`);
// //   });
// // });

// // Server: websocket-server.js
// // import WebSocket, { WebSocketServer } from 'ws';
// // import cors from 'cors';
// // import fs from "fs";
// // import path from "path";
// // import express from 'express';
// // import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
// // import { fileURLToPath } from "url";

// // const port = 8082;
// // const app = express();
// // app.use(cors());

// // const server = app.listen(port, () => {
// //   console.log("🚀 Server listening on port 8082");
// // });

// // const wss = new WebSocketServer({ server });

// // let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
// // let isStreaming = false;

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // const startFFmpeg = () => {
// //   if (ffmpegProcess) {
// //     ffmpegProcess.kill("SIGINT");
// //   }

// //   console.log("🎬 Starting FFmpeg for WebM/Opus streaming...");
// // const recordingsDir = path.join(__dirname, "hls");  
// // if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });
// // const timestamp = Date.now();
// // const outputFile = path.join(recordingsDir, `recording_${timestamp}.mp3`);
// //   // Output WebM to stdout for WebSocket streaming
// // ffmpegProcess = spawn("ffmpeg", [
// //   "-f", "webm",
// //   "-i", "pipe:0",
// //   "-c:a", "libopus",
// //   "-b:a", "128k",
// //   "-vn",
// //   "-f", "webm",
// //   "-live", "1",
// //   "-cluster_time_limit", "2000",
// //   "-cluster_size_limit", "100000",
// //   outputFile,  // <-- Save audio to this file
// // ]);
// // app.use("/hls", express.static(recordingsDir));


// //   // Send FFmpeg output (WebM chunks) to all WebSocket clients
// //   ffmpegProcess.stdout.on("data", (chunk) => {
// //     if (wss.clients.size > 0) {
// //       wss.clients.forEach((client) => {
// //         if (client.readyState === WebSocket.OPEN) {
// //           try {
// //             client.send(chunk);
// //           } catch (error: any) {
// //             console.error("Error sending to client:", error.message);
// //           }
// //         }
// //       });
// //     }
// //   });

// //   ffmpegProcess.stderr.on("data", (data) => {
// //     // Only log errors, not all FFmpeg info
// //     const message = data.toString();
// //     if (message.includes('error') || message.includes('Error')) {
// //       console.error(`FFmpeg: ${message}`);
// //     }
// //   });

// //   ffmpegProcess.on("error", (err) => {
// //     console.error(`❌ FFmpeg error: ${err.message}`);
// //     ffmpegProcess = null;
// //     isStreaming = false;
// //   });

// //   ffmpegProcess.on("close", (code) => {
// //     console.log(`FFmpeg exited with code ${code}`);
// //     ffmpegProcess = null;
// //     isStreaming = false;
    
// //     // Auto-restart if there are still connected clients
// //     if (wss.clients.size > 0) {
// //       console.log("Restarting FFmpeg in 1 second...");
// //       setTimeout(startFFmpeg, 1000);
// //     }
// //   });

// //   isStreaming = true;
// // };


// // wss.on("connection", (ws) => {
// //   console.log("✅ Client connected, total:", wss.clients.size);

// //   // Start FFmpeg when first client connects
// //   if (!isStreaming) {
// //     startFFmpeg();
// //   }

// //   ws.on("message", (message:any) => {
// //     // Incoming audio from client (e.g., broadcaster)
// //     if (ffmpegProcess && ffmpegProcess.stdin.writable) {
// //       try {
// //         ffmpegProcess.stdin.write(Buffer.from(message));
// //       } catch (error:any) {
// //         console.error(`Error writing to FFmpeg: ${error.message}`);
// //       }
// //     } else {
// //       console.warn("FFmpeg not ready, dropping incoming data");
// //     }
// //   });

// //   ws.on("close", () => {
// //     console.log("❌ Client disconnected, remaining:", wss.clients.size);
    
// //     // Stop FFmpeg when last client disconnects
// //     if (wss.clients.size === 0 && ffmpegProcess) {
// //       console.log("No clients left, stopping FFmpeg");
// //       ffmpegProcess.kill("SIGINT");
// //       ffmpegProcess = null;
// //       isStreaming = false;
// //     }
// //   });

// //   ws.on("error", (error) => {
// //     console.error(`WebSocket error: ${error.message}`);
// //   });
// // });

// // console.log(`
// // 🎙️  WebSocket Audio Server Ready!
// // 📡 Clients connect to: ws://localhost:${port}
// // `);

// import WebSocket, { WebSocketServer } from 'ws';
// import cors from 'cors';
// import fs from "fs";
// import path from "path";
// import express from 'express';
// import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
// import { fileURLToPath } from "url";

// const port = 8082;
// const app = express();
// app.use(cors());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const recordingsDir = path.join(__dirname, "hls");
// if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

// const server = app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
// app.use("/hls", express.static(recordingsDir));

// const wss = new WebSocketServer({ server });

// let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
// let currentFile: string | null = null;

// const startFFmpeg = () => {
//   const timestamp = Date.now();
//   currentFile = path.join(recordingsDir, `recording_${timestamp}.mp3`);
//   console.log("🎬 Starting FFmpeg recording to file:", currentFile);

//   // FFmpeg command to convert incoming WebM/Opus audio to MP3
//   ffmpegProcess = spawn("ffmpeg", [
//     "-f", "webm",
//     "-i", "pipe:0",       // input from WebSocket
//     "-c:a", "libmp3lame", // MP3 encoder
//     "-b:a", "128k",
//     "-vn",                // no video
//     currentFile           // output file
//   ]);

//   ffmpegProcess.stderr.on("data", (data) => {
//     const msg = data.toString();
//     if (msg.toLowerCase().includes("error")) console.error("FFmpeg error:", msg);
//   });

//   ffmpegProcess.on("close", (code) => {
//     console.log(`FFmpeg finished with code ${code}`);
//   });
// };

// wss.on("connection", (ws) => {
//   console.log("✅ Client connected:", wss.clients.size);

//   // Start FFmpeg on first client
//   if (!ffmpegProcess) startFFmpeg();

//   ws.on("message", (message: any) => {
//     if (ffmpegProcess && ffmpegProcess.stdin.writable) {
//       ffmpegProcess.stdin.write(Buffer.from(message));
//     }
//       wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message); // send audio chunk
//       }
//     });
//   });

//   ws.on("close", () => {
//     console.log("❌ Client disconnected:", wss.clients.size);
//     if (wss.clients.size === 0 && ffmpegProcess) {
//       ffmpegProcess.stdin.end();
//       ffmpegProcess = null;
//     }
//   });

//   ws.on("error", (err) => console.error("WebSocket error:", err));
// });

// console.log(`🎙️ WebSocket Audio Server Ready!`);
// console.log(`📂 Saved recordings: http://localhost:${port}/hls`);


import { WebSocket, WebSocketServer } from "ws";
import cors from "cors";
import express from "express";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
 
const PORT = Number(process.env.PORT || 8082);
// const FFMPEG_PATH = process.env.FFMPEG_PATH || "C:\\ffmpeg\\bin\\ffmpeg.exe";
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
  },
}));
 
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server listening on http://0.0.0.0:${PORT}`);
  console.log(`HLS at /hls/audio.m3u8`);
});
 
const wss = new WebSocketServer({ server });
 
let ffmpegProcess: ChildProcess | null = null;
let isBroadcasting = false;
 
const listeners = new Set<WebSocket>();
const broadcasters = new Set<WebSocket>();
 
function notifyListeners() {
  const msg = JSON.stringify({ type: "status", broadcasting: isBroadcasting });
  for (const ws of listeners) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}
 
function startFFmpeg() {
  if (ffmpegProcess) return;
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
      if (line.includes("Opening")) console.log(line.trim());
      if (line.includes("frame=") || line.includes("time=")) {
        // progress lines; optional to log
      }
    });
  }
 
  ffmpegProcess.on("close", (code, sig) => {
    console.log(`FFmpeg exited code=${code} sig=${sig}`);
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
  // Graceful on Windows
  try {
    if (ffmpegProcess.stdin) {
      ffmpegProcess.stdin.end();
    }
  } catch {}
  setTimeout(() => {
    try { ffmpegProcess?.kill("SIGINT"); } catch {}
  }, 200);
  ffmpegProcess = null;
  isBroadcasting = false;
  notifyListeners();
}
 
wss.on("connection", (ws, req) => {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const role = url.searchParams.get("role");
 
  if (role === "broadcaster") {
    console.log("Broadcaster connected");
    broadcasters.add(ws);
 
    ws.on("message", (data, isBinary) => {
      try {
        if (!isBinary) {
          const text = data.toString("utf8");
          if (text.startsWith("{")) {
            const msg = JSON.parse(text);
            if (msg.type === "start") startFFmpeg();
            if (msg.type === "stop") stopFFmpeg();
            return;
          }
        }
        if (ffmpegProcess && ffmpegProcess.stdin && !ffmpegProcess.stdin.destroyed) {
          ffmpegProcess.stdin.write(data);
        }
      } catch (e) {
        console.error("Broadcaster message error", e);
      }
    });
 
    ws.on("close", () => {
      console.log("Broadcaster disconnected");
      broadcasters.delete(ws);
      if (broadcasters.size === 0) stopFFmpeg();
    });
  } else {
    console.log("Listener connected");
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
 
process.on("SIGINT", () => {
  stopFFmpeg();
  server.close(() => process.exit(0));
});
 
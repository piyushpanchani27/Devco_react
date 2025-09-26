import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

const port = 8082;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "hls");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const app = express();
app.use(cors());
app.use('/hls', express.static(outputDir));

const server = app.listen(port, () => {
  console.log("HTTP server is listening on port 8082");
});

const wss = new WebSocketServer({ server });

let ffmpegProcess: any = null;

const startFFmpeg = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
  }

  const streamKey = "audio";
  const playlist = path.join(outputDir, `${streamKey}.m3u8`);

  ffmpegProcess = spawn("ffmpeg", [
    "-f", "webm",
    "-i", "pipe:0",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "hls",
    "-hls_time", "1",
    "-hls_list_size", "3",
    "-hls_flags", "delete_segments",
    "-hls_segment_filename", path.join(outputDir, `${streamKey}_%03d.ts`),
    playlist,
  ]);

  ffmpegProcess.stdout.on("data", (data: any) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data: any) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("error", (err: any) => {
    console.error(`FFmpeg process error: ${err.message}`);
    ffmpegProcess = null;
  });

  ffmpegProcess.on("close", (code: any) => {
    console.log(`FFmpeg process exited with code ${code}`);
    if (code !== 0) {
      console.error(`FFmpeg process exited with non-zero code: ${code}`);
    }
    ffmpegProcess = null;
    startFFmpeg();
  });
};

startFFmpeg();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message: any) => {
    console.log(`Received message of size ${message.byteLength} bytes`);
    if (ffmpegProcess) {
      try {
        ffmpegProcess.stdin.write(Buffer.from(message));
      } catch (error: any) {
        console.error(`Error writing to FFmpeg stdin: ${error.message}`);
      }
    } else {
      console.error("FFmpeg process not available. Dropping message.");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ffmpegProcess) {
      ffmpegProcess.kill("SIGINT");
      ffmpegProcess = null;
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
});
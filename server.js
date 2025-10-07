"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var child_process_1 = require("child_process");
var cors = require("cors");
var express = require("express");
var path = require("path");
var fs = require("fs");
var url_1 = require("url");
var port = 8082;
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
var outputDir = path.join(__dirname, "hls");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
var app = express();
app.use(cors());
app.use('/hls', express.static(outputDir));
var server = app.listen(port, function () {
    console.log("HTTP server is listening on port 8082");
});
var wss = new ws_1.WebSocketServer({ server: server });
var ffmpegProcess = null;
var startFFmpeg = function () {
    if (ffmpegProcess) {
        ffmpegProcess.kill("SIGINT");
    }
    var streamKey = "audio";
    var playlist = path.join(outputDir, "".concat(streamKey, ".m3u8"));
    ffmpegProcess = (0, child_process_1.spawn)("ffmpeg", [
        "-f", "webm",
        "-i", "pipe:0",
        "-c:a", "aac",
        "-b:a", "128k",
        "-f", "hls",
        "-hls_time", "1",
        "-hls_list_size", "3",
        "-hls_flags", "delete_segments",
        "-hls_segment_filename", path.join(outputDir, "".concat(streamKey, "_%03d.ts")),
        playlist,
    ]);
    ffmpegProcess.stdout.on("data", function (data) {
        console.log("FFmpeg stdout: ".concat(data));
    });
    ffmpegProcess.stderr.on("data", function (data) {
        console.error("FFmpeg stderr: ".concat(data));
    });
    ffmpegProcess.on("error", function (err) {
        console.error("FFmpeg process error: ".concat(err.message));
        ffmpegProcess = null;
    });
    ffmpegProcess.on("close", function (code) {
        console.log("FFmpeg process exited with code ".concat(code));
        if (code !== 0) {
            console.error("FFmpeg process exited with non-zero code: ".concat(code));
        }
        ffmpegProcess = null;
        // startFFmpeg();
        setTimeout(startFFmpeg, 1000);
    });
};
startFFmpeg();
wss.on("connection", function (ws) {
    console.log("Client connected");
    ws.on("message", function (message) {
        console.log("Received message of size ".concat(message.byteLength, " bytes"));
        if (ffmpegProcess) {
            try {
                ffmpegProcess.stdin.write(Buffer.from(message));
            }
            catch (error) {
                console.error("Error writing to FFmpeg stdin: ".concat(error.message));
            }
        }
        else {
            console.error("FFmpeg process not available. Dropping message.");
        }
    });
    ws.on("close", function () {
        console.log("Client disconnected");
        if (ffmpegProcess) {
            ffmpegProcess.kill("SIGINT");
            ffmpegProcess = null;
        }
    });
    ws.on("error", function (error) {
        console.error("WebSocket error: ".concat(error.message));
    });
});

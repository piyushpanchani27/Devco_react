'use client';

import { useEffect, useRef, useState } from "react";
import './RecordingPage.css';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          const buffer = await event.data.arrayBuffer();
          console.log(`Sending ${buffer.byteLength} bytes of data`);
          socketRef.current.send(buffer);
        }
      };

      mediaRecorder.start(1000); // send chunks every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8082");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="container">
      <div className="content">
        <h1 className="title">Auction Speaker</h1>
        <button
          className={`record-button ${isRecording ? 'recording' : 'record'}`}
          onClick={toggleRecording}
        ></button>

        <div className="recording-status">
          {isRecording ? (
            <>
              <span className="recording-indicator"></span> Recording...
            </>
          ) : (
            'Click to start recording'
          )}
        </div>
      </div>
    </div>
  );
}

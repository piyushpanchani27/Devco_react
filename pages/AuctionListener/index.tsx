// "use client";
// import { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// // Change these to your backend HLS/WS URLs for production!
// const HLS_URL = "http://localhost:8082/hls/audio.m3u8";
// const WS_URL = "ws://localhost:8082/?role=listener";

// export default function AuctionListener() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isBroadcasting, setIsBroadcasting] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const hlsRef = useRef<Hls | null>(null);

//   const playAudio = () => {
//     if (!audioRef.current) return;
//     if (!hlsRef.current) {
//       if (Hls.isSupported()) {
//         const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
//         hlsRef.current = hls;
//         hls.attachMedia(audioRef.current);
//         hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(HLS_URL));
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           audioRef.current?.play().then(() => setIsPlaying(true));
//         });
//       } else if (
//         audioRef.current.canPlayType("application/vnd.apple.mpegurl")
//       ) {
//         audioRef.current.src = HLS_URL;
//         audioRef.current.play().then(() => setIsPlaying(true));
//       }
//     } else {
//       audioRef.current.play().then(() => setIsPlaying(true));
//     }
//   };

//   const pauseAudio = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
//   };

//   const handleToggle = () => {
//     if (!isPlaying) playAudio();
//     else pauseAudio();
//   };

//   useEffect(() => {
//     const ws = new WebSocket(WS_URL);
//     ws.onopen = () => setIsConnected(true);
//     ws.onclose = () => setIsConnected(false);
//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === "status") {
//           setIsBroadcasting(data.broadcasting);
//           if (!data.broadcasting && isPlaying) pauseAudio();
//         }
//       } catch {}
//     };
//     return () => {
//       ws.close();
//       if (hlsRef.current) hlsRef.current.destroy();
//     };
//     // eslint-disable-next-line
//   }, []);

//   return (
//     <div
//       // style={{
//       //   minHeight: "100vh",
//       //   background: "#232325",
//       //   display: "flex",
//       //   alignItems: "center",
//       //   justifyContent: "center",
//       // }}
//     >
//       <audio ref={audioRef} style={{ display: "none" }} />
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 4,
//         }}
//       >
//         {/* BLINKING GREEN DOT - ONLY WHEN LIVE */}
//         {isConnected && isBroadcasting && (
//           <span
//             style={{
//               display: "inline-block",
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               background: "#28a745",
//                           animation: "pulseDot 1.2s infinite",
//             }}
//           />
//         )}
//         <button
//           onClick={handleToggle}
//           disabled={!isConnected || !isBroadcasting}
//           style={{
//             width:45,
//             height: 45,
//             borderRadius: "50%",
//             fontSize: 30,
//             background:
//               isConnected && isBroadcasting
//                 ? isPlaying
//                   ? "#d9534f"
//                   : "#28a745"
//                 : "#555",
//             border: "none",
//             color: "#fff",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             cursor: isConnected && isBroadcasting ? "pointer" : "not-allowed",
//             boxShadow: "0 4px 24px #1115",
//           }}
//           aria-label={isPlaying ? "Pause" : "Play"}
//         >
//           {isPlaying ? (
//             // Pause icon (two vertical bars)
//             <span
//               style={{
//                 display: "block",
//                 width: 24,
//                 height: 24,
//                 position: "relative",
//               }}
//             >
//               <span
//                 style={{
//                   display: "inline-block",
//                   width: 6,
//                   height: 24,
//                   background: "#fff",
//                   borderRadius: 3,
//                   position: "absolute",
//                   left: 0,
//                 }}
//               />
//               <span
//                 style={{
//                   display: "inline-block",
//                   width: 6,
//                   height: 24,
//                   background: "#fff",
//                   borderRadius: 3,
//                   position: "absolute",
//                   right: 0,
//                 }}
//               />
//             </span>
//           ) : (
//             // Play icon (triangle)
//             <span
//               style={{
//                 display: "inline-block",
//                 width: 0,
//                 height: 0,
//                 borderTop: "12px solid transparent",
//                 borderBottom: "12px solid transparent",
//                 borderLeft: "20px solid #fff",
//                 marginLeft: 5,
//               }}
//             />
//           )}
//         </button>
//       </div>
//       {/* Pulse animation */}
//       <style>{`
//         @keyframes pulseDot {
//           0%, 100% { opacity: 1; box-shadow: 0 0 0 0 #28a745; }
//           50% { opacity: 0.4; box-shadow: 0 0 7px 6px #28a74533; }
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function AuctionListener() {
  const [isConnected, setIsConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Cleanup HLS when component unmounts
  const cleanupHLS = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  };

  // Load HLS stream
  const loadHLSStream = () => {
    if (!audioRef.current) {
      console.error("Audio element not ready");
      return;
    }

    // Clean existing stream
    cleanupHLS();

    const hlsUrl =
      "https://devcoreact-production.up.railway.app/hls/audio.m3u8";
    console.log("Loading HLS stream from:", hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        maxBufferLength: 2,
        maxMaxBufferLength: 4,
      });
      hlsRef.current = hls;

      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS attached to audio element");
        hls.loadSource(hlsUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded, starting playback");
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current
              .play()
              .then(() => {
                console.log("✅ Playing live audio");
                setIsPlaying(true);
              })
              .catch((err) => {
                console.warn("Autoplay blocked:", err);
              });
          }
        }, 2000);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error - retrying...");
              setTimeout(() => hls.startLoad(), 1000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error - recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal error - stopping playback");
              cleanupHLS();
              break;
          }
        }
      });
    } else if (
      audioRef.current &&
      audioRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      console.log("Using native HLS (Safari)");
      audioRef.current.src = hlsUrl;
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn("Native HLS autoplay blocked:", err);
            });
        }
      }, 2000);
    }
  };

  const playAudio = () => {
    if (!audioRef.current) return;
    if (!hlsRef.current) {
      loadHLSStream();
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggle = () => {
    if (!isPlaying) playAudio();
    else pauseAudio();
  };

  useEffect(() => {
    const ws = new WebSocket(
      "wss://devcoreact-production.up.railway.app/?role=listener"
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected as listener");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        if (data.type === "status") {
          setIsBroadcasting(data.broadcasting);

          // Automatically start HLS when broadcast begins
          if (data.broadcasting && !hlsRef.current) {
            console.log("Broadcast started! Loading audio...");
            setTimeout(() => loadHLSStream(), 1000);
          } else if (!data.broadcasting && hlsRef.current) {
            console.log("Broadcast stopped");
            cleanupHLS();
          }
        }
      } catch (err) {
        console.error("Message parse error:", err);
      }
    };

    return () => {
      ws.close();
      cleanupHLS();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <audio
        ref={audioRef}
        style={{ display: "none" }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* BLINKING GREEN DOT - ONLY WHEN LIVE */}
        {isConnected && isBroadcasting && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#28a745",
              animation: "pulseDot 1.2s infinite",
            }}
          />
        )}
        <button
          onClick={handleToggle}
          disabled={!isConnected || !isBroadcasting}
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            fontSize: 30,
            background:
              isConnected && isBroadcasting
                ? isPlaying
                  ? "#d9534f"
                  : "#28a745"
                : "#555",
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isConnected && isBroadcasting ? "pointer" : "not-allowed",
            boxShadow: "0 4px 24px #1115",
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            // Pause icon (two vertical bars)
            <span
              style={{
                display: "block",
                width: 24,
                height: 24,
                position: "relative",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 24,
                  background: "#fff",
                  borderRadius: 3,
                  position: "absolute",
                  left: 0,
                }}
              />
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 24,
                  background: "#fff",
                  borderRadius: 3,
                  position: "absolute",
                  right: 0,
                }}
              />
            </span>
          ) : (
            // Play icon (triangle)
            <span
              style={{
                display: "inline-block",
                width: 0,
                height: 0,
                borderTop: "12px solid transparent",
                borderBottom: "12px solid transparent",
                borderLeft: "20px solid #fff",
                marginLeft: 5,
              }}
            />
          )}
        </button>
      </div>
      {/* Pulse animation */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 #28a745; }
          50% { opacity: 0.4; box-shadow: 0 0 7px 6px #28a74533; }
        }
      `}</style>
    </div>
  );
}
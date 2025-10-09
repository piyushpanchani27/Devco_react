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


// "use client";

// import { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// export default function AuctionListener() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isBroadcasting, setIsBroadcasting] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const wsRef = useRef<WebSocket | null>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const hlsRef = useRef<Hls | null>(null);

//   // Cleanup HLS when component unmounts
//   const cleanupHLS = () => {
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = "";
//     }
//     setIsPlaying(false);
//   };

//   // Load HLS stream
//   const loadHLSStream = () => {
//     if (!audioRef.current) {
//       console.error("Audio element not ready");
//       return;
//     }

//     // Clean existing stream
//     cleanupHLS();

//     const hlsUrl =
//       "https://devcoreact-production.up.railway.app/hls/audio.m3u8";
//     console.log("Loading HLS stream from:", hlsUrl);

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         liveSyncDurationCount: 1,
//         maxBufferLength: 2,
//         maxMaxBufferLength: 4,
//       });
//       hlsRef.current = hls;

//       hls.attachMedia(audioRef.current);

//       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//         console.log("HLS attached to audio element");
//         hls.loadSource(hlsUrl);
//       });

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log("HLS manifest loaded, starting playback");
//         setTimeout(() => {
//           if (audioRef.current) {
//             audioRef.current
//               .play()
//               .then(() => {
//                 console.log("✅ Playing live audio");
//                 setIsPlaying(true);
//               })
//               .catch((err) => {
//                 console.warn("Autoplay blocked:", err);
//               });
//           }
//         }, 2000);
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error("HLS Error:", data);

//         if (data.fatal) {
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               console.log("Network error - retrying...");
//               setTimeout(() => hls.startLoad(), 1000);
//               break;
//             case Hls.ErrorTypes.MEDIA_ERROR:
//               console.log("Media error - recovering...");
//               hls.recoverMediaError();
//               break;
//             default:
//               console.log("Fatal error - stopping playback");
//               cleanupHLS();
//               break;
//           }
//         }
//       });
//     } else if (
//       audioRef.current &&
//       audioRef.current.canPlayType("application/vnd.apple.mpegurl")
//     ) {
//       console.log("Using native HLS (Safari)");
//       audioRef.current.src = hlsUrl;
//       setTimeout(() => {
//         if (audioRef.current) {
//           audioRef.current
//             .play()
//             .then(() => {
//               setIsPlaying(true);
//             })
//             .catch((err) => {
//               console.warn("Native HLS autoplay blocked:", err);
//             });
//         }
//       }, 2000);
//     }
//   };

//   const playAudio = () => {
//     if (!audioRef.current) return;
//     if (!hlsRef.current) {
//       loadHLSStream();
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
//     const ws = new WebSocket(
//       "wss://devcoreact-production.up.railway.app/?role=listener"
//     );
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setIsConnected(true);
//       console.log("Connected as listener");
//     };

//     ws.onclose = () => {
//       setIsConnected(false);
//       console.log("WebSocket closed");
//     };

//     ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log("Received:", data);

//         if (data.type === "status") {
//           setIsBroadcasting(data.broadcasting);

//           // Automatically start HLS when broadcast begins
//           if (data.broadcasting && !hlsRef.current) {
//             console.log("Broadcast started! Loading audio...");
//             setTimeout(() => loadHLSStream(), 1000);
//           } else if (!data.broadcasting && hlsRef.current) {
//             console.log("Broadcast stopped");
//             cleanupHLS();
//           }
//         }
//       } catch (err) {
//         console.error("Message parse error:", err);
//       }
//     };

//     return () => {
//       ws.close();
//       cleanupHLS();
//     };
//     // eslint-disable-next-line
//   }, []);

//   return (
//     <div>
//       <audio
//         ref={audioRef}
//         style={{ display: "none" }}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onEnded={() => setIsPlaying(false)}
//       />
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
//               animation: "pulseDot 1.2s infinite",
//             }}
//           />
//         )}
//         <button
//           onClick={handleToggle}
//           disabled={!isConnected || !isBroadcasting}
//           style={{
//             width: 45,
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

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

export default function AuctionListener() {
  const [isConnected, setIsConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  // Cleanup HLS when component unmounts
  const cleanupHLS = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    retryCountRef.current = 0;
  }, []);

  // Load HLS stream with retry logic
  const loadHLSStream = useCallback(() => {
    if (!audioRef.current) {
      console.error("Audio element not ready");
      return;
    }

    // Clean existing stream
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hlsUrl =
      "https://devcoreact-production.up.railway.app/hls/audio.m3u8";
    console.log(
      `Loading HLS stream from: ${hlsUrl} (Attempt ${
        retryCountRef.current + 1
      }/${maxRetries})`
    );

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        maxBufferLength: 2,
        maxMaxBufferLength: 4,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;

      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS attached to audio element");
        hls.loadSource(hlsUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS manifest loaded successfully!");
        retryCountRef.current = 0; // Reset retry count on success

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
        }, 1000);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error detected");

              // Retry with exponential backoff
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                const retryDelay = Math.min(
                  1000 * Math.pow(2, retryCountRef.current - 1),
                  5000
                );
                console.log(
                  `Retrying in ${retryDelay}ms... (${retryCountRef.current}/${maxRetries})`
                );

                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.destroy();
                  }
                  loadHLSStream(); // Recursively retry
                }, retryDelay);
              } else {
                console.error(
                  "Max retries reached. Stream may not be ready yet."
                );
                cleanupHLS();
              }
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

      audioRef.current.addEventListener("error", (e) => {
        console.error("Native HLS error:", e);
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const retryDelay = Math.min(
            1000 * Math.pow(2, retryCountRef.current - 1),
            5000
          );
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(() => loadHLSStream(), retryDelay);
        }
      });

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              retryCountRef.current = 0;
            })
            .catch((err) => {
              console.warn("Native HLS autoplay blocked:", err);
            });
        }
      }, 1000);
    }
  }, [cleanupHLS]);

  const playAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (!hlsRef.current) {
      loadHLSStream();
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  }, [loadHLSStream]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (!isPlaying) playAudio();
    else pauseAudio();
  }, [isPlaying, playAudio, pauseAudio]);

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

          if (data.broadcasting && !hlsRef.current) {
            console.log(
              "Broadcast started! Waiting for HLS stream to be ready..."
            );
            // INCREASED DELAY: Give server more time to generate HLS segments
            setTimeout(() => {
              console.log("Attempting to connect to HLS stream...");
              loadHLSStream();
            }, 3000); // 3 seconds delay
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
  }, [loadHLSStream, cleanupHLS]);
   const isActive = isConnected && isBroadcasting;
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
          position: "fixed",
          right: 20,
          top: "6.5rem",
          zIndex: 999,
        }}
      >
        {/* Live Streaming Button */}
        <button
          onClick={handleToggle}
          disabled={!isActive}
          style={{
            position: "relative",
            overflow: "hidden",
            width: "200px",
            height: "70px",
            borderRadius: "16px",
            background: isActive
              ? "linear-gradient(177deg, #00008B 0%, #03073b 100%)"
              : "linear-gradient(177deg, #8e949f 0%, #2d3748 100%);",
            border: isActive
              ? "2px solid rgb(47 55 111 / 16%)"
              : "2px solid rgb(145 140 140 / 72%);",
            cursor: isActive ? "pointer" : "not-allowed",
            boxShadow: isActive
              ? "0 8px 30px rgba(102, 126, 234, 0.4)"
              : "0 4px 15px rgba(0, 0, 0, 0.3)",
            transform: isActive ? "scale(1)" : "scale(0.95)",
            transition: "all 0.3s ease",
            padding: 0,
          }}
          aria-label={isPlaying ? "Pause streaming" : "Play streaming"}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 15px",
              height: "100%",
            }}
          >
            {/* Play/Pause Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: isPlaying
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            >
              {isPlaying ? (
                // Pause Icon - Blue color
                <div style={{ display: "flex", gap: "4px" }}>
                  <div
                    style={{
                      width: "4px",
                      height: "18px",
                      background: "#00008B",
                      borderRadius: "2px",
                    }}
                  />
                  <div
                    style={{
                      width: "4px",
                      height: "18px",
                      background: "#00008B",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              ) : (
                // Play Icon - White color
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderTop: "9px solid transparent",
                    borderBottom: "9px solid transparent",
                    borderLeft: "15px solid #fff",
                    marginLeft: "3px",
                  }}
                />
              )}
            </div>

            {/* Text */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  // fontWeight: "bold",
                  color: "#fff",
                  letterSpacing: "1.5px",
                  textShadow: isActive
                    ? "0 2px 10px rgba(0, 0, 0, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              >
                CLICK HERE TO
              </span>
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: isActive ? "rgba(255, 255, 255, 0.95)" : "#fff",
                  marginTop: "-2px",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                }}
              >
                LISTEN LIVE !
              </span>
            </div>
          </div>

          {/* Pulse Animation when active and playing */}
          {isActive && isPlaying && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "16px",
                pointerEvents: "none",
                animation: "pulseGlow 2s infinite",
              }}
            />
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(102, 126, 234, 0);
          }
        }
      `}</style>
    </div>
  );
  // return (
  //   <div>
  //     <audio
  //       ref={audioRef}
  //       style={{ display: "none" }}
  //       onPlay={() => setIsPlaying(true)}
  //       onPause={() => setIsPlaying(false)}
  //       onEnded={() => setIsPlaying(false)}
  //     />
  //     <div
  //       style={{
  //         position: "fixed",
  //         right: 20,
  //         // top: "11%",
  //         top: "6.5rem",
  //         zIndex: 999,
  //       }}
  //     >
  //       {/* BLINKING GREEN DOT - ONLY WHEN LIVE */}

  //       <div
  //         style={{
  //           display: "flex",
  //           alignItems: "center",
  //           gap: 8,
  //           padding: "10px 15px",
  //         }}
  //       >
  //         {isConnected && isBroadcasting && (
  //           <span
  //             style={{
  //               display: "inline-block",
  //               width: 12,
  //               height: 12,
  //               borderRadius: "50%",
  //               background: "#28a745",
  //               animation: "pulseDot 1.2s infinite",
  //               flexShrink: 0,
  //             }}
  //           />
  //         )}
  //         <button
  //           onClick={handleToggle}
  //           disabled={!isConnected || !isBroadcasting}
  //           style={{
  //             width: 45,
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
  //             flexShrink: 0,
  //           }}
  //           aria-label={isPlaying ? "Pause" : "Play"}
  //         >
  //           {isPlaying ? (
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
  //     </div>
  //     <style>{`
  //       @keyframes pulseDot {
  //         0%, 100% { opacity: 1; box-shadow: 0 0 0 0 #28a745; }
  //         50% { opacity: 0.4; box-shadow: 0 0 7px 6px #28a74533; }
  //       }
  //     `}</style>
  //   </div>
  // );
}

// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import Hls from "hls.js";

// export default function AuctionListener() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isBroadcasting, setIsBroadcasting] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const wsRef = useRef<WebSocket | null>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const retryCountRef = useRef(0);
//   const maxRetries = 5;

//   // Cleanup HLS when component unmounts
//   const cleanupHLS = useCallback(() => {
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = "";
//     }
//     setIsPlaying(false);
//     retryCountRef.current = 0;
//   }, []);

//   // Load HLS stream with retry logic
//   const loadHLSStream = useCallback(() => {
//     if (!audioRef.current) {
//       console.error("Audio element not ready");
//       return;
//     }

//     // Clean existing stream
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }
// // const HLS_URL = "http://localhost:8082/hls/audio.m3u8";
// // const WS_URL = "ws://localhost:8082/?role=listener";
// //     const hlsUrl =
// //       "https://devcoreact-production.up.railway.app/hls/audio.m3u8";
// //     console.log(
// //       `Loading HLS stream from: ${hlsUrl} (Attempt ${
// //         retryCountRef.current + 1
// //       }/${maxRetries})`
// //     );
//     const hlsUrl = "http://localhost:8082/hls/audio.m3u8";
//     console.log(
//       `Loading HLS stream from: ${hlsUrl} (Attempt ${
//         retryCountRef.current + 1
//       }/${maxRetries})`
//     );

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         liveSyncDurationCount: 1,
//         maxBufferLength: 2,
//         maxMaxBufferLength: 4,
//         manifestLoadingTimeOut: 10000,
//         manifestLoadingMaxRetry: 3,
//         levelLoadingTimeOut: 10000,
//         levelLoadingMaxRetry: 3,
//       });
//       hlsRef.current = hls;

//       hls.attachMedia(audioRef.current);

//       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//         console.log("HLS attached to audio element");
//         hls.loadSource(hlsUrl);
//       });

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log("✅ HLS manifest loaded successfully!");
//         retryCountRef.current = 0; // Reset retry count on success

//         setTimeout(() => {
//           if (audioRef.current) {
//             audioRef.current
//               .play()
//               .then(() => {
//                 console.log("✅ Playing live audio");
//                 setIsPlaying(true);
//               })
//               .catch((err) => {
//                 console.warn("Autoplay blocked:", err);
//               });
//           }
//         }, 1000);
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error("HLS Error:", data);

//         if (data.fatal) {
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               console.log("Network error detected");

//               // Retry with exponential backoff
//               if (retryCountRef.current < maxRetries) {
//                 retryCountRef.current++;
//                 const retryDelay = Math.min(
//                   1000 * Math.pow(2, retryCountRef.current - 1),
//                   5000
//                 );
//                 console.log(
//                   `Retrying in ${retryDelay}ms... (${retryCountRef.current}/${maxRetries})`
//                 );

//                 setTimeout(() => {
//                   if (hlsRef.current) {
//                     hls.destroy();
//                   }
//                   loadHLSStream(); // Recursively retry
//                 }, retryDelay);
//               } else {
//                 console.error(
//                   "Max retries reached. Stream may not be ready yet."
//                 );
//                 cleanupHLS();
//               }
//               break;

//             case Hls.ErrorTypes.MEDIA_ERROR:
//               console.log("Media error - recovering...");
//               hls.recoverMediaError();
//               break;

//             default:
//               console.log("Fatal error - stopping playback");
//               cleanupHLS();
//               break;
//           }
//         }
//       });
//     } else if (
//       audioRef.current &&
//       audioRef.current.canPlayType("application/vnd.apple.mpegurl")
//     ) {
//       console.log("Using native HLS (Safari)");
//       audioRef.current.src = hlsUrl;

//       audioRef.current.addEventListener("error", (e) => {
//         console.error("Native HLS error:", e);
//         if (retryCountRef.current < maxRetries) {
//           retryCountRef.current++;
//           const retryDelay = Math.min(
//             1000 * Math.pow(2, retryCountRef.current - 1),
//             5000
//           );
//           console.log(`Retrying in ${retryDelay}ms...`);
//           setTimeout(() => loadHLSStream(), retryDelay);
//         }
//       });

//       setTimeout(() => {
//         if (audioRef.current) {
//           audioRef.current
//             .play()
//             .then(() => {
//               setIsPlaying(true);
//               retryCountRef.current = 0;
//             })
//             .catch((err) => {
//               console.warn("Native HLS autoplay blocked:", err);
//             });
//         }
//       }, 1000);
//     }
//   }, [cleanupHLS]);

//   const playAudio = useCallback(() => {
//     if (!audioRef.current) return;
//     if (!hlsRef.current) {
//       loadHLSStream();
//     } else {
//       audioRef.current.play().then(() => setIsPlaying(true));
//     }
//   }, [loadHLSStream]);

//   const pauseAudio = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
//   }, []);

//   const handleToggle = useCallback(() => {
//     if (!isPlaying) playAudio();
//     else pauseAudio();
//   }, [isPlaying, playAudio, pauseAudio]);

//   useEffect(() => {
   
//     // const ws = new WebSocket(
//     //   "wss://devcoreact-production.up.railway.app/?role=listener"
//     // );
//     const ws = new WebSocket("ws://localhost:8082/?role=listener");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setIsConnected(true);
//       console.log("Connected as listener");
//     };

//     ws.onclose = () => {
//       setIsConnected(false);
//       console.log("WebSocket closed");
//     };

//     ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log("Received:", data);

//         if (data.type === "status") {
//           setIsBroadcasting(data.broadcasting);

//           if (data.broadcasting && !hlsRef.current) {
//             console.log(
//               "Broadcast started! Waiting for HLS stream to be ready..."
//             );
//             setTimeout(() => {
//               console.log("Attempting to connect to HLS stream...");
//               loadHLSStream();
//             }, 3000);
//           } else if (!data.broadcasting && hlsRef.current) {
//             console.log("Broadcast stopped");
//             cleanupHLS();
//           }
//         }
//       } catch (err) {
//         console.error("Message parse error:", err);
//       }
//     };

//     return () => {
//       ws.close();
//       cleanupHLS();
//     };
//   }, [loadHLSStream, cleanupHLS]);

//   const isActive = isConnected && isBroadcasting;

//   return (
//     <div>
//       <audio
//         ref={audioRef}
//         style={{ display: "none" }}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onEnded={() => setIsPlaying(false)}
//       />
//       <div
//         style={{
//           position: "fixed",
//           right: 20,
//           top: "6.5rem",
//           zIndex: 999,
//         }}
//       >
//         {/* Live Streaming Button */}
//         <button
//           onClick={handleToggle}
//           disabled={!isActive}
//           style={{
//             position: "relative",
//             overflow: "hidden",
//             width: "200px",
//             height: "70px",
//             borderRadius: "16px",
//             background: isActive
//               ? "linear-gradient(177deg, #00008B 0%, #03073b 100%)"
//               : "linear-gradient(177deg, #8e949f 0%, #2d3748 100%);",
//             border: isActive
//               ? "2px solid rgb(47 55 111 / 16%)"
//               : "2px solid rgb(145 140 140 / 72%);",
//             cursor: isActive ? "pointer" : "not-allowed",
//             boxShadow: isActive
//               ? "0 8px 30px rgba(102, 126, 234, 0.4)"
//               : "0 4px 15px rgba(0, 0, 0, 0.3)",
//             transform: isActive ? "scale(1)" : "scale(0.95)",
//             transition: "all 0.3s ease",
//             padding: 0,
//           }}
//           aria-label={isPlaying ? "Pause streaming" : "Play streaming"}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "0 15px",
//               height: "100%",
//             }}
//           >
//             {/* Play/Pause Icon */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: "40px",
//                 height: "40px",
//                 borderRadius: "50%",
//                 background: isPlaying
//                   ? "rgba(255, 255, 255, 1)"
//                   : "rgba(255, 255, 255, 0.2)",
//                 backdropFilter: "blur(10px)",
//                 transition: "all 0.3s ease",
//                 flexShrink: 0,
//               }}
//             >
//               {isPlaying ? (
//                 // Pause Icon - Blue color
//                 <div style={{ display: "flex", gap: "4px" }}>
//                   <div
//                     style={{
//                       width: "4px",
//                       height: "18px",
//                       background: "#00008B",
//                       borderRadius: "2px",
//                     }}
//                   />
//                   <div
//                     style={{
//                       width: "4px",
//                       height: "18px",
//                       background: "#00008B",
//                       borderRadius: "2px",
//                     }}
//                   />
//                 </div>
//               ) : (
//                 // Play Icon - White color
//                 <div
//                   style={{
//                     width: "0",
//                     height: "0",
//                     borderTop: "9px solid transparent",
//                     borderBottom: "9px solid transparent",
//                     borderLeft: "15px solid #fff",
//                     marginLeft: "3px",
//                   }}
//                 />
//               )}
//             </div>

//             {/* Text */}
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "flex-end",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "12px",
//                   // fontWeight: "bold",
//                   color: "#fff",
//                   letterSpacing: "1.5px",
//                   textShadow: isActive
//                     ? "0 2px 10px rgba(0, 0, 0, 0.3)"
//                     : "none",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 CLICK HERE TO
//               </span>
//               <span
//                 style={{
//                   fontSize: "17px",
//                   fontWeight: "600",
//                   color: isActive ? "rgba(255, 255, 255, 0.95)" : "#fff",
//                   marginTop: "-2px",
//                   letterSpacing: "0.5px",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 LISTEN LIVE !
//               </span>
//             </div>
//           </div>

//           {/* Pulse Animation when active and playing */}
//           {isActive && isPlaying && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: "100%",
//                 borderRadius: "16px",
//                 pointerEvents: "none",
//                 animation: "pulseGlow 2s infinite",
//               }}
//             />
//           )}
//         </button>
//       </div>

//       <style>{`
//         @keyframes pulseGlow {
//           0%, 100% {
//             box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
//           }
//           50% {
//             box-shadow: 0 0 0 15px rgba(102, 126, 234, 0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
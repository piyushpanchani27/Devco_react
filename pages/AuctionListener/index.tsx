
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

//   // Load HLS stream with retry logic - NO AUTO PLAY
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

//     const hlsUrl =
//       // "http://localhost:8082/hls/audio.m3u8";
//       "https://devcoreact-production-d589.up.railway.app/hls/audio.m3u8";
//     console.log(
//       `Loading HLS stream from: ${hlsUrl} (Attempt ${
//         retryCountRef.current + 1
//       }/${maxRetries})`
//     );

//     if (Hls.isSupported()) {
//        const hls = new Hls({
//          enableWorker: true,
//          lowLatencyMode: true,
//          liveSyncDurationCount: 1, // Lower means closer to “live”
//          maxBufferLength: 2, // If user’s browser supports it
//          maxMaxBufferLength: 4,
//        });
//       // const hls = new Hls({
//       //   enableWorker: true,
//       //   lowLatencyMode: true,
//       //   liveSyncDurationCount: 1,
//       //   maxBufferLength: 2,
//       //   maxMaxBufferLength: 4,
//       //   manifestLoadingTimeOut: 10000,
//       //   manifestLoadingMaxRetry: 3,
//       //   levelLoadingTimeOut: 10000,
//       //   levelLoadingMaxRetry: 3,
//       // });
//       hlsRef.current = hls;

//       hls.attachMedia(audioRef.current);

//       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//         console.log("HLS attached to audio element");
//         hls.loadSource(hlsUrl);
//       });

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log("✅ HLS manifest loaded successfully!");
//         retryCountRef.current = 0; // Reset retry count on success
//         // REMOVED AUTO PLAY - User must click button
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

//       // REMOVED AUTO PLAY FOR SAFARI TOO
//     }
//   }, [cleanupHLS]);

//   const playAudio = useCallback(() => {
//     if (!audioRef.current) return;
//     if (!hlsRef.current) {
//       loadHLSStream();
//       // Wait for stream to load, then play
//       setTimeout(() => {
//         if (audioRef.current) {
//           audioRef.current
//             .play()
//             .then(() => {
//               console.log("✅ Playing live audio");
//               setIsPlaying(true);
//             })
//             .catch((err) => {
//               console.error("Play failed:", err);
//             });
//         }
//       }, 2000);
//     } else {
//       audioRef.current
//         .play()
//         .then(() => {
//           console.log("✅ Playing live audio");
//           setIsPlaying(true);
//         })
//         .catch((err) => {
//           console.error("Play failed:", err);
//         });
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
//     // const ws = new WebSocket("ws://localhost:8082/?role=listener")
//     const ws = new WebSocket(
//       "wss://devcoreact-production-d589.up.railway.app/?role=listener"
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

//           if (data.broadcasting && !hlsRef.current) {
//             console.log(
//               "Broadcast started! Waiting for HLS stream to be ready..."
//             );
//             // Load stream but DON'T play automatically
//             setTimeout(() => {
//               console.log("Attempting to connect to HLS stream...");
//               loadHLSStream();
//             }, 3000); // 3 seconds delay
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
//               : "linear-gradient(177deg, #8e949f 0%, #2d3748 100%)",
//             border: isActive
//               ? "2px solid rgb(47 55 111 / 16%)"
//               : "2px solid rgb(145 140 140 / 72%)",
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
//             box-shadow: 0 0 0 0 rgba(0, 0, 139, 0.7);
//           }
//           50% {
//             box-shadow: 0 0 0 15px rgba(0, 0, 139, 0);
//           }
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
  const [streamStatus, setStreamStatus] = useState("Waiting...");

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  const cleanupHLS = useCallback(() => {
    console.log("🧹 Cleaning up HLS");
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
    setStreamStatus("Stopped");
  }, []);

  const loadHLSStream = useCallback(() => {
    if (!audioRef.current) {
      console.error("❌ Audio element not ready");
      setStreamStatus("Audio element not ready");
      return;
    }

    if (hlsRef.current) {
      console.log("Destroying existing HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hlsUrl = "https://devcoreact-production-d589.up.railway.app/hls/audio.m3u8";
    
    console.log(`🔄 Loading HLS stream (Attempt ${retryCountRef.current + 1}/${maxRetries})`);
    console.log(`📍 URL: ${hlsUrl}`);
    setStreamStatus(`Loading stream (${retryCountRef.current + 1}/${maxRetries})...`);

    if (Hls.isSupported()) {
      console.log("✅ HLS.js is supported");
      
      const hls = new Hls({
        debug: true, // Enable debug logging
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        maxBufferLength: 3,
        maxMaxBufferLength: 5,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 5,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 5,
      });
      
      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHING, () => {
        console.log("📎 Attaching media...");
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("✅ Media attached, loading source...");
        setStreamStatus("Connected, loading playlist...");
        hls.loadSource(hlsUrl);
      });

      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        console.log("📥 Loading manifest...");
        setStreamStatus("Loading playlist...");
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ HLS manifest parsed successfully!");
        console.log("Levels:", data.levels);
        setStreamStatus("Stream ready! Click to play");
        retryCountRef.current = 0;
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log("📊 Level loaded:", data.details);
      });

      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        console.log("⬇️ Loading fragment:", data.frag.sn);
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        console.log("✅ Fragment loaded:", data.frag.sn);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS Error:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          error: data.error,
          response: data.response
        });

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("💔 Network error - Stream might not be ready yet");
              setStreamStatus(`Network error (${data.details})`);

              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                const retryDelay = Math.min(2000 * retryCountRef.current, 10000);
                console.log(`🔄 Retrying in ${retryDelay}ms...`);
                
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.destroy();
                  }
                  loadHLSStream();
                }, retryDelay);
              } else {
                console.error("❌ Max retries reached");
                setStreamStatus("Stream unavailable. Broadcaster may have stopped.");
                cleanupHLS();
              }
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("🎵 Media error - attempting recovery...");
              setStreamStatus("Media error, recovering...");
              hls.recoverMediaError();
              break;

            default:
              console.log("💥 Fatal error - stopping");
              setStreamStatus("Fatal error occurred");
              cleanupHLS();
              break;
          }
        } else {
          console.log("⚠️ Non-fatal error:", data.details);
        }
      });

      hls.attachMedia(audioRef.current);
      
    } else if (
      audioRef.current &&
      audioRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      console.log("🍎 Using native HLS (Safari)");
      setStreamStatus("Loading (Safari native)...");
      audioRef.current.src = hlsUrl;

      audioRef.current.addEventListener("loadedmetadata", () => {
        console.log("✅ Metadata loaded (Safari)");
        setStreamStatus("Stream ready! Click to play");
        retryCountRef.current = 0;
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("❌ Native HLS error:", e);
        const error = audioRef.current?.error;
        console.error("Error code:", error?.code, "Message:", error?.message);
        
        setStreamStatus(`Error: ${error?.message || "Unknown error"}`);
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const retryDelay = Math.min(2000 * retryCountRef.current, 10000);
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(() => loadHLSStream(), retryDelay);
        }
      });
    } else {
      console.error("❌ HLS not supported in this browser");
      setStreamStatus("HLS not supported in this browser");
    }
  }, [cleanupHLS]);

  const playAudio = useCallback(() => {
    console.log("▶️ Play button clicked");
    
    if (!audioRef.current) {
      console.error("No audio element");
      return;
    }

    if (!hlsRef.current) {
      console.log("HLS not loaded, loading now...");
      setStreamStatus("Initializing stream...");
      loadHLSStream();
      
      setTimeout(() => {
        if (audioRef.current) {
          console.log("Attempting delayed play...");
          audioRef.current.play()
            .then(() => {
              console.log("✅ Playing!");
              setIsPlaying(true);
              setStreamStatus("Playing live");
            })
            .catch((err) => {
              console.error("❌ Play failed:", err);
              setStreamStatus(`Play failed: ${err.message}`);
            });
        }
      }, 3000);
    } else {
      console.log("Playing existing stream...");
      audioRef.current.play()
        .then(() => {
          console.log("✅ Playing!");
          setIsPlaying(true);
          setStreamStatus("Playing live");
        })
        .catch((err) => {
          console.error("❌ Play failed:", err);
          setStreamStatus(`Play failed: ${err.message}`);
        });
    }
  }, [loadHLSStream]);

  const pauseAudio = useCallback(() => {
    console.log("⏸️ Pause clicked");
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setStreamStatus("Paused");
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (!isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  useEffect(() => {
    console.log("🔌 Connecting to WebSocket...");
    
    const ws = new WebSocket(
      "wss://devcoreact-production-d589.up.railway.app/?role=listener"
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("✅ Connected as listener");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("❌ WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Received from server:", data);

        if (data.type === "status") {
          const wasBroadcasting = isBroadcasting;
          setIsBroadcasting(data.broadcasting);

          if (data.broadcasting && !wasBroadcasting) {
            console.log("🎙️ Broadcast STARTED! Loading stream...");
            setStreamStatus("Broadcast started, connecting...");
            
            setTimeout(() => {
              console.log("Attempting to load HLS stream...");
              loadHLSStream();
            }, 2000);
            
          } else if (!data.broadcasting && wasBroadcasting) {
            console.log("🛑 Broadcast STOPPED");
            setStreamStatus("Broadcast stopped");
            cleanupHLS();
          } else if (!data.broadcasting) {
            console.log("⏳ No active broadcast");
            setStreamStatus("Waiting for broadcast...");
          }
        }
      } catch (err) {
        console.error("Message parse error:", err);
      }
    };

    return () => {
      console.log("Cleaning up WebSocket and HLS");
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
        onPlay={() => {
          console.log("🎵 Audio started playing");
          setIsPlaying(true);
        }}
        onPause={() => {
          console.log("⏸️ Audio paused");
          setIsPlaying(false);
        }}
        onEnded={() => {
          console.log("🏁 Audio ended");
          setIsPlaying(false);
        }}
        onError={(e) => {
          console.error("❌ Audio element error:", e);
        }}
      />
      
      <div style={{
        position: "fixed",
        right: 20,
        top: "6.5rem",
        zIndex: 999,
      }}>
        {/* Status Display */}
        <div style={{
          marginBottom: "10px",
          padding: "8px 12px",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          fontSize: "11px",
          color: "#fff",
          maxWidth: "200px"
        }}>
          <div style={{ marginBottom: "4px" }}>
            <strong>WS:</strong> {isConnected ? "✅ Connected" : "❌ Disconnected"}
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>Broadcast:</strong> {isBroadcasting ? "🔴 Live" : "⚫ Offline"}
          </div>
          <div>
            <strong>Stream:</strong> {streamStatus}
          </div>
        </div>

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
              : "linear-gradient(177deg, #8e949f 0%, #2d3748 100%)",
            border: isActive
              ? "2px solid rgb(47 55 111 / 16%)"
              : "2px solid rgb(145 140 140 / 72%)",
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
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 15px",
            height: "100%",
          }}>
            <div style={{
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
            }}>
              {isPlaying ? (
                <div style={{ display: "flex", gap: "4px" }}>
                  <div style={{
                    width: "4px",
                    height: "18px",
                    background: "#00008B",
                    borderRadius: "2px",
                  }} />
                  <div style={{
                    width: "4px",
                    height: "18px",
                    background: "#00008B",
                    borderRadius: "2px",
                  }} />
                </div>
              ) : (
                <div style={{
                  width: "0",
                  height: "0",
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  borderLeft: "15px solid #fff",
                  marginLeft: "3px",
                }} />
              )}
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}>
              <span style={{
                fontSize: "12px",
                color: "#fff",
                letterSpacing: "1.5px",
                textShadow: isActive ? "0 2px 10px rgba(0, 0, 0, 0.3)" : "none",
                transition: "all 0.3s ease",
              }}>
                CLICK HERE TO
              </span>
              <span style={{
                fontSize: "17px",
                fontWeight: "600",
                color: isActive ? "rgba(255, 255, 255, 0.95)" : "#fff",
                marginTop: "-2px",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}>
                LISTEN LIVE !
              </span>
            </div>
          </div>

          {isActive && isPlaying && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              pointerEvents: "none",
              animation: "pulseGlow 2s infinite",
            }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 139, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(0, 0, 139, 0);
          }
        }
      `}</style>
    </div>
  );
}
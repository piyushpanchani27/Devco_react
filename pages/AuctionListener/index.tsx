
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

export default function AuctionListener() {
  const [isConnected, setIsConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hlsReady, setHlsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlTestResult, setUrlTestResult] = useState<string | null>(null);
  const [showUrlTest, setShowUrlTest] = useState(false);
  const [hlsUrl, setHlsUrl] = useState<string>(
    "https://devcoreact-production-d589.up.railway.app/hls/audio.m3u8"
  );

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10; // Increased retries
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Test if HLS manifest URL is accessible with detailed diagnostics
  const testHLSUrl = useCallback(async (url: string): Promise<{success: boolean, details: string}> => {
    try {
      console.log(`Testing HLS URL: ${url}`);
      setUrlTestResult(`Testing ${url}...`);
      
      // Try HEAD first
      let response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      // If HEAD fails, try GET
      if (!response.ok) {
        console.log("HEAD failed, trying GET...");
        response = await fetch(url, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
      }
      
      const statusText = `${response.status} ${response.statusText}`;
      console.log(`HLS URL test result: ${statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const details = `✅ URL is accessible\nStatus: ${statusText}\nContent-Type: ${contentType || 'unknown'}`;
        setUrlTestResult(details);
        return { success: true, details };
      } else {
        // Try to get error message from response
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = response.statusText;
        }
        const details = `❌ URL not accessible\nStatus: ${statusText}\nError: ${errorText.substring(0, 100)}`;
        setUrlTestResult(details);
        return { success: false, details };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      console.error("HLS URL test failed:", err);
      const details = `❌ Connection failed\nError: ${errorMsg}\n\nPossible issues:\n- URL is incorrect\n- Server is not running\n- CORS is blocking the request\n- Network error`;
      setUrlTestResult(details);
      return { success: false, details };
    }
  }, []);

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
    setHlsReady(false);
    retryCountRef.current = 0;
  }, []);

  // Load HLS stream with retry logic - NO AUTO PLAY
  const loadHLSStream = useCallback(async () => {
    if (!audioRef.current) {
      console.error("Audio element not ready");
      return;
    }

    // Clean existing stream
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Use the current HLS URL (might be updated from backend)
    const currentHlsUrl = hlsUrl;
    console.log(
      `Loading HLS stream from: ${currentHlsUrl} (Attempt ${
        retryCountRef.current + 1
      }/${maxRetries})`
    );
    
    // Test if URL is accessible first
    setError("Testing stream availability...");
    const testResult = await testHLSUrl(currentHlsUrl);
    if (!testResult.success && retryCountRef.current < maxRetries) {
      console.log("HLS URL not accessible yet, will retry...");
      retryCountRef.current++;
      const retryDelay = Math.min(
        2000 * Math.pow(2, retryCountRef.current - 1),
        10000 // Max 10 seconds
      );
      setTimeout(() => loadHLSStream(), retryDelay);
      setError(`Stream not ready yet, retrying in ${retryDelay/1000}s...`);
      return;
    }
    
    if (!testResult.success) {
      setError(`Stream URL is not accessible.\n\n${testResult.details}\n\nPlease check:\n1. Is the backend server running?\n2. Is the URL path correct?\n3. Is broadcasting active?`);
      setShowUrlTest(true); // Show URL test panel
      return;
    }
    
    setError(null);

    if (Hls.isSupported()) {
       const hls = new Hls({
         enableWorker: true,
         lowLatencyMode: true,
         liveSyncDurationCount: 1, // Lower means closer to "live"
         maxBufferLength: 2, // If user's browser supports it
         maxMaxBufferLength: 4,
         manifestLoadingTimeOut: 20000, // 20 seconds timeout
         manifestLoadingMaxRetry: 5,
         levelLoadingTimeOut: 20000,
         levelLoadingMaxRetry: 5,
         fragLoadingTimeOut: 20000,
         fragLoadingMaxRetry: 5,
       });
      // const hls = new Hls({
      //   enableWorker: true,
      //   lowLatencyMode: true,
      //   liveSyncDurationCount: 1,
      //   maxBufferLength: 2,
      //   maxMaxBufferLength: 4,
      //   manifestLoadingTimeOut: 10000,
      //   manifestLoadingMaxRetry: 3,
      //   levelLoadingTimeOut: 10000,
      //   levelLoadingMaxRetry: 3,
      // });
      hlsRef.current = hls;

      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS attached to audio element");
        hls.loadSource(currentHlsUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS manifest loaded successfully!");
        retryCountRef.current = 0; // Reset retry count on success
        setHlsReady(true);
        setError(null);
        // REMOVED AUTO PLAY - User must click button
      });
      
      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log("✅ HLS level loaded - stream is ready!");
        setHlsReady(true);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        setHlsReady(false);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error detected");
              setError(`Network error: ${data.details || "Cannot load stream"}`);

              // Retry with exponential backoff - longer delays
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                const retryDelay = Math.min(
                  2000 * Math.pow(2, retryCountRef.current - 1),
                  10000 // Max 10 seconds between retries
                );
                console.log(
                  `Retrying in ${retryDelay}ms... (${retryCountRef.current}/${maxRetries})`
                );
                setError(`Stream loading failed, retrying in ${Math.round(retryDelay/1000)}s... (${retryCountRef.current}/${maxRetries})`);

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
                setError("Failed to load stream after multiple attempts. The stream may not be ready yet - please wait a few seconds and try again.");
                cleanupHLS();
              }
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error - recovering...");
              setError("Media error - attempting recovery...");
              hls.recoverMediaError();
              break;

            default:
              console.log("Fatal error - stopping playback");
              setError(`Fatal error: ${data.details || "Unknown error"}`);
              cleanupHLS();
              break;
          }
        } else {
          // Non-fatal error, just log it
          console.warn("Non-fatal HLS error:", data);
        }
      });
    } else if (
      audioRef.current &&
      audioRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      console.log("Using native HLS (Safari)");
      audioRef.current.src = currentHlsUrl;
      setHlsReady(false);
      setError(null);

      audioRef.current.addEventListener("loadedmetadata", () => {
        console.log("✅ Native HLS metadata loaded");
        setHlsReady(true);
        setError(null);
      });

      audioRef.current.addEventListener("canplay", () => {
        console.log("✅ Native HLS can play");
        setHlsReady(true);
        setError(null);
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Native HLS error:", e);
        setHlsReady(false);
        const errorMsg = audioRef.current?.error
          ? `Error ${audioRef.current.error.code}: ${audioRef.current.error.message}`
          : "Failed to load stream";
        setError(errorMsg);
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const retryDelay = Math.min(
            1000 * Math.pow(2, retryCountRef.current - 1),
            5000
          );
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(() => loadHLSStream(), retryDelay);
        } else {
          setError("Failed to load stream after multiple attempts.");
        }
      });

      // REMOVED AUTO PLAY FOR SAFARI TOO
    } else {
      setError("HLS is not supported in this browser");
      console.error("HLS not supported");
    }
  }, [cleanupHLS, testHLSUrl, hlsUrl]);

  const playAudio = useCallback(() => {
    if (!audioRef.current) {
      console.error("Audio element not available");
      setError("Audio element not available");
      return;
    }

    // If HLS is not loaded, load it first
    if (!hlsRef.current) {
      console.log("HLS not loaded, loading stream...");
      setError("Loading stream, please wait...");
      retryCountRef.current = 0; // Reset retry count when user manually clicks
      loadHLSStream();
      
      // Wait for HLS to be ready, then play
      const checkAndPlay = () => {
        if (hlsReady && audioRef.current && hlsRef.current) {
          console.log("HLS is ready, attempting to play...");
          audioRef.current
            .play()
            .then(() => {
              console.log("✅ Playing live audio");
              setIsPlaying(true);
              setError(null);
            })
            .catch((err: any) => {
              console.error("Play failed:", err);
              setError(`Playback failed: ${err.message || "Unknown error"}`);
              setIsPlaying(false);
            });
        } else if (!hlsReady) {
          // Check again after a short delay
          setTimeout(checkAndPlay, 500);
        }
      };
      
      // Start checking after 1 second
      setTimeout(checkAndPlay, 1000);
    } else {
      // HLS is already loaded, try to play
      console.log("HLS already loaded, attempting to play...");
      if (hlsReady) {
        audioRef.current
          .play()
          .then(() => {
            console.log("✅ Playing live audio");
            setIsPlaying(true);
            setError(null);
          })
          .catch((err: any) => {
            console.error("Play failed:", err);
            setError(`Playback failed: ${err.message || "Unknown error"}`);
            setIsPlaying(false);
          });
      } else {
        console.log("HLS loaded but not ready yet, waiting...");
        setError("Stream is loading, please wait...");
        // Wait for HLS to be ready
        const checkAndPlay = () => {
          if (hlsReady && audioRef.current) {
            audioRef.current
              .play()
              .then(() => {
                console.log("✅ Playing live audio");
                setIsPlaying(true);
                setError(null);
              })
              .catch((err: any) => {
                console.error("Play failed:", err);
                setError(`Playback failed: ${err.message || "Unknown error"}`);
                setIsPlaying(false);
              });
          } else if (!hlsReady) {
            setTimeout(checkAndPlay, 500);
          }
        };
        setTimeout(checkAndPlay, 500);
      }
    }
  }, [loadHLSStream, hlsReady]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Function to request status from backend
  const requestStatus = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        // Try multiple status request formats
        const statusRequests = [
          { type: "getStatus" },
          { type: "status" },
          { action: "getStatus" },
        ];
        wsRef.current.send(JSON.stringify(statusRequests[0]));
        console.log("Status request sent:", statusRequests[0]);
      } catch (err) {
        console.error("Failed to request status:", err);
      }
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (!isPlaying) {
      console.log("User clicked play - requesting status update...");
      requestStatus(); // Request fresh status before playing
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, playAudio, pauseAudio, requestStatus]);

  useEffect(() => {
    // const ws = new WebSocket("ws://localhost:8082/?role=listener")
    const ws = new WebSocket(
      "wss://devcoreact-production-d589.up.railway.app/?role=listener"
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected as listener");
      
      // Send registration message to backend
      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Try different registration formats that backends commonly expect
          const registrationMessages = [
            { type: "register", role: "listener" },
            { type: "listener", action: "register" },
            { role: "listener" },
          ];
          
          // Send the first registration format
          ws.send(JSON.stringify(registrationMessages[0]));
          console.log("Registration message sent:", registrationMessages[0]);
          
          // Request current status immediately
          setTimeout(() => {
            requestStatus();
          }, 500);
          
          // Set up periodic status check every 3 seconds
          statusCheckIntervalRef.current = setInterval(() => {
            requestStatus();
          }, 3000);
          console.log("Periodic status check started (every 3 seconds)");
        } catch (err) {
          console.error("Failed to send registration:", err);
        }
      } else {
        console.warn("WebSocket not ready, state:", ws.readyState);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket closed");
      // Clear status check interval when connection closes
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        // Handle status updates
        if (data.type === "status" || data.broadcasting !== undefined) {
          const broadcasting = data.broadcasting || data.isBroadcasting || false;
          console.log("Broadcasting status:", broadcasting);
          setIsBroadcasting(broadcasting);
          
          // Check if backend sent HLS URL in the status message
          if (data.hlsUrl || data.streamUrl || data.url) {
            const newUrl = data.hlsUrl || data.streamUrl || data.url;
            console.log("✅ Received HLS URL from backend:", newUrl);
            setHlsUrl(newUrl);
            setError(null);
          }

          if (broadcasting && !hlsRef.current) {
            console.log(
              "Broadcast started! Waiting for HLS stream to be ready..."
            );
            setError("Broadcast detected, waiting for stream to be ready...");
            
            // Request HLS URL from backend if not provided
            if (!data.hlsUrl && !data.streamUrl && !data.url) {
              try {
                ws.send(JSON.stringify({ type: "getHlsUrl" }));
                console.log("Requested HLS URL from backend");
              } catch (err) {
                console.error("Failed to request HLS URL:", err);
              }
            }
            
            // Load stream but DON'T play automatically - wait longer for backend to generate stream
            setTimeout(() => {
              console.log("Attempting to connect to HLS stream...");
              retryCountRef.current = 0; // Reset retry count
              loadHLSStream();
            }, 5000); // Increased to 5 seconds delay to give backend time
          } else if (!broadcasting && hlsRef.current) {
            console.log("Broadcast stopped");
            cleanupHLS();
          }
        }
        
        // Handle HLS URL message
        if (data.type === "hlsUrl" || data.type === "streamUrl") {
          const newUrl = data.url || data.hlsUrl || data.streamUrl;
          if (newUrl) {
            console.log("✅ Received HLS URL from backend:", newUrl);
            setHlsUrl(newUrl);
            setError(null);
            // If we're already trying to load, reload with new URL
            if (hlsRef.current || retryCountRef.current > 0) {
              retryCountRef.current = 0;
              loadHLSStream();
            }
          }
        }
        
        // Handle registration confirmation
        if (data.type === "registered" || data.type === "connected") {
          console.log("✅ Successfully registered as listener");
          // Request status and HLS URL after registration
          try {
            ws.send(JSON.stringify({ type: "getStatus" }));
            ws.send(JSON.stringify({ type: "getHlsUrl" }));
            console.log("Requested status and HLS URL from backend");
          } catch (err) {
            console.error("Failed to request status:", err);
          }
        }
        
        // Handle error messages
        if (data.type === "error" || data.error) {
          console.error("Backend error:", data.error || data.message);
        }
      } catch (err) {
        console.error("Message parse error:", err, "Raw data:", event.data);
      }
    };

    return () => {
      // Clear status check interval
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      ws.close();
      cleanupHLS();
    };
  }, [loadHLSStream, cleanupHLS, requestStatus]);

  // Enable button when connected - allow trying even if broadcasting status is unclear
  // The periodic status check will update broadcasting status
  const isActive = isConnected;

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
          disabled={!isConnected}
          style={{
            position: "relative",
            overflow: "hidden",
            width: "200px",
            height: "70px",
            borderRadius: "16px",
            background: isConnected
              ? isBroadcasting
                ? "linear-gradient(177deg, #00008B 0%, #03073b 100%)"
                : "linear-gradient(177deg, #4a5568 0%, #2d3748 100%)"
              : "linear-gradient(177deg, #8e949f 0%, #2d3748 100%)",
            border: isConnected
              ? isBroadcasting
                ? "2px solid rgb(47 55 111 / 16%)"
                : "2px solid rgb(145 140 140 / 72%)"
              : "2px solid rgb(145 140 140 / 72%)",
            cursor: isConnected ? "pointer" : "not-allowed",
            boxShadow: isConnected && isBroadcasting
              ? "0 8px 30px rgba(102, 126, 234, 0.4)"
              : "0 4px 15px rgba(0, 0, 0, 0.3)",
            transform: isConnected ? "scale(1)" : "scale(0.95)",
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
        
        {/* Error Message Display */}
        {error && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              backgroundColor: "rgba(220, 38, 38, 0.9)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "12px",
              maxWidth: "200px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ marginBottom: error.includes("retrying") ? "0" : "8px" }}>
              {error}
            </div>
            {!error.includes("retrying") && !error.includes("Loading") && !error.includes("waiting") && (
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button
                  onClick={() => {
                    retryCountRef.current = 0;
                    setError(null);
                    loadHLSStream();
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    setShowUrlTest(true);
                    testHLSUrl("https://devcoreact-production-d589.up.railway.app/hls/audio.m3u8");
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 12px",
                    backgroundColor: "rgba(59, 130, 246, 0.6)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Test URL
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Status Info */}
        {isConnected && !error && (
          <div
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              backgroundColor: hlsReady
                ? "rgba(34, 197, 94, 0.9)"
                : "rgba(156, 163, 175, 0.9)",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "11px",
              maxWidth: "200px",
              textAlign: "center",
            }}
          >
            {hlsReady ? "Stream Ready" : "Loading Stream..."}
          </div>
        )}
        
        {/* URL Test Panel */}
        {(showUrlTest || urlTestResult) && (
          <div
            style={{
              marginTop: "10px",
              padding: "12px",
              backgroundColor: "rgba(30, 30, 30, 0.95)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "11px",
              maxWidth: "250px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
              🔍 URL Diagnostic Test
            </div>
            
            {urlTestResult && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
              >
                {urlTestResult}
              </div>
            )}
            
            <div style={{ marginBottom: "8px", fontSize: "10px", opacity: 0.8 }}>
              Current URL:
            </div>
            <div
              style={{
                marginBottom: "10px",
                padding: "6px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "4px",
                fontSize: "9px",
                wordBreak: "break-all",
                fontFamily: "monospace",
              }}
            >
              {hlsUrl}
            </div>
            
            <div style={{ 
              marginBottom: "10px", 
              padding: "8px", 
              backgroundColor: "rgba(255, 193, 7, 0.2)", 
              borderRadius: "4px",
              fontSize: "10px",
              border: "1px solid rgba(255, 193, 7, 0.4)",
            }}>
              ⚠️ <strong>Backend Configuration Required:</strong>
              <br />• Railway shows app on <strong>Port 8080</strong>
              <br />• Backend must serve HLS files at <code>/hls/</code>
              <br />• Check if static file serving is configured
              <br />• Verify HLS files are generated in correct directory
              <br />• Backend should send URL via WebSocket
            </div>
            
            <button
              onClick={async () => {
                await testHLSUrl(hlsUrl);
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                marginBottom: "8px",
              }}
            >
              Test Current URL
            </button>
            
            <button
              onClick={() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  try {
                    wsRef.current.send(JSON.stringify({ type: "getHlsUrl" }));
                    setError("Requesting HLS URL from backend...");
                    console.log("Requested HLS URL from backend");
                  } catch (err) {
                    console.error("Failed to request HLS URL:", err);
                  }
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                marginBottom: "8px",
              }}
            >
              Request URL from Backend
            </button>
            
            <button
              onClick={async () => {
                try {
                  const baseUrl = "https://devcoreact-production-d589.up.railway.app";
                  const testUrl = `${baseUrl}/hls/test`;
                  console.log("Testing backend HLS endpoint:", testUrl);
                  const response = await fetch(testUrl);
                  const data = await response.json();
                  console.log("Backend HLS test result:", data);
                  
                  const result = `Backend Diagnostic:
File exists: ${data.fileExists}
Directory: ${data.directory}
Broadcasting: ${data.broadcasting}
FFmpeg running: ${data.ffmpegRunning}
Test URL: ${data.testUrl}
Direct URL: ${data.directUrl}`;
                  
                  setUrlTestResult(result);
                  if (data.fileExists && data.testUrl) {
                    setHlsUrl(data.testUrl);
                    setError(null);
                    console.log("✅ Updated HLS URL to:", data.testUrl);
                  }
                } catch (err: any) {
                  console.error("Backend test failed:", err);
                  setUrlTestResult(`Error: ${err.message}`);
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(168, 85, 247, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                marginBottom: "8px",
              }}
            >
              Test Backend Endpoint
            </button>
            
            <button
              onClick={async () => {
                try {
                  const baseUrl = "https://devcoreact-production-d589.up.railway.app";
                  const listUrl = `${baseUrl}/hls/list`;
                  console.log("Checking HLS file list:", listUrl);
                  const response = await fetch(listUrl);
                  const data = await response.json();
                  console.log("HLS file list:", data);
                  
                  const result = `HLS Files:
Directory: ${data.directory}
Files: ${data.files?.join(", ") || "none"}
audio.m3u8 exists: ${data.audioM3u8Exists}
URL: ${data.url}
${data.audioM3u8Content ? `\nPlaylist content:\n${data.audioM3u8Content.substring(0, 300)}` : ""}`;
                  
                  setUrlTestResult(result);
                  if (data.audioM3u8Exists && data.url) {
                    setHlsUrl(data.url);
                    setError(null);
                    console.log("✅ Updated HLS URL to:", data.url);
                  }
                } catch (err: any) {
                  console.error("HLS list check failed:", err);
                  setUrlTestResult(`Error: ${err.message}`);
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(245, 158, 11, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                marginBottom: "8px",
              }}
            >
              Check HLS Files
            </button>
            
            <div style={{ 
              marginBottom: "10px", 
              padding: "8px", 
              backgroundColor: "rgba(59, 130, 246, 0.15)", 
              borderRadius: "4px",
              fontSize: "9px",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}>
              <strong>🔧 Railway Setup Check:</strong>
              <br />✅ Port 8080 configured
              <br />✅ Domain accessible
              <br />❌ HLS endpoint missing
              <br /><br />
              <strong>Backend must:</strong>
              <br />1. Generate HLS files when recording
              <br />2. Serve files from <code>/hls/</code> directory
              <br />3. Configure static file serving
              <br />4. Or provide correct URL via WebSocket
            </div>
            
            <div style={{ fontSize: "10px", marginBottom: "6px", opacity: 0.8 }}>
              Try alternative URLs:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                "https://devcoreact-production-d589.up.railway.app/audio.m3u8",
                "https://devcoreact-production-d589.up.railway.app/stream/audio.m3u8",
                "https://devcoreact-production-d589.up.railway.app/live/audio.m3u8",
                "https://devcoreact-production-d589.up.railway.app/hls/stream.m3u8",
                "https://devcoreact-production-d589.up.railway.app/api/hls/audio.m3u8",
                "https://devcoreact-production-d589.up.railway.app/api/stream/audio.m3u8",
              ].map((testUrl, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    const result = await testHLSUrl(testUrl);
                    if (result.success) {
                      setHlsUrl(testUrl);
                      setError(null);
                      console.log("✅ Updated HLS URL to:", testUrl);
                    }
                  }}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "rgba(100, 100, 100, 0.5)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "9px",
                    textAlign: "left",
                  }}
                >
                  Test: {testUrl.split("/").pop()}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowUrlTest(false);
                setUrlTestResult(null);
              }}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "4px",
                backgroundColor: "rgba(100, 100, 100, 0.5)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Close
            </button>
          </div>
        )}
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

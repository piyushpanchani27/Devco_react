// import {Box, Center, Grid, Group, Stack, Text} from "@mantine/core";
// import {Auction} from "../../lib/types";
// // import DateBadge from "../common/DateBadge";
// import dayjs from "dayjs";
// import DateBadge from "../../components/common/DateBadge";

// export default function LotsPageHeader({auction}: { auction: Auction }) {
//   if (!auction) return <Text>Loading auction...</Text>;
//     return (
//         <Box p={10} pt={20} bg={'gray.2'}>
//             <Grid>
//                 <Grid.Col span={6}>
//                     <Group>
//                         <Box bg={'white'} p={5}>
//                             <Group>
//                                 <DateBadge color={'primary.9'} date={dayjs(auction.starts)}/>
//                                 <DateBadge color={'primary.9'} date={dayjs(auction.ends)}/>
//                             </Group>
//                         </Box>
//                         <Text fw={600} fz={14}>{auction.title}</Text>
//                     </Group>
//                     <Group p={10}>
//                         <Text c={'gray.7'} fz={14}>{auction.description}</Text>
//                     </Group>
//                     <Group p={10}>
//                         <Text c={'gray.7'} fw={500} size="xs">ENDS
//                             : {dayjs(auction.ends).format('MMM DD, YYYY HH:mm a')}</Text>
//                     </Group>
//                 </Grid.Col>
//                 <Grid.Col span={3}>
//                     <Center h={'100%'}>
//                         <Text fw={600} fz={15}>Viewing</Text>
//                     </Center>
//                 </Grid.Col>
//                 <Grid.Col span={3}>
//                     <Center h={'100%'}>
//                         <Stack>
//                             <Text fw={600} fz={15}>Location</Text>
//                             <Text c={'gray.7'} fw={500} fz={14}>{auction.location}</Text>
//                         </Stack>
//                     </Center>
//                 </Grid.Col>
//             </Grid>

//         </Box>)
// }


//  import { Box, Center, Grid, Group, Stack, Text } from "@mantine/core";
// import { Auction } from "../../lib/types";
// // import DateBadge from "../common/DateBadge";
// import dayjs from "dayjs";
// import { useEffect, useRef } from "react";
// import DateBadge from "../../components/common/DateBadge";
 
// export default function LotsPageHeader({ auction }: { auction: Auction }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const mediaSourceRef = useRef<MediaSource | null>(null);
//   const sourceBufferRef = useRef<SourceBuffer | null>(null);


//   useEffect(() => {
//     // Connect to backend WebSocket (make sure it broadcasts audio chunks)
//     const socket = new WebSocket("ws://localhost:8082");
//     console.log("🎧 Connecting to WebSocket at ws://localhost:8082",socket);
//     // Create MediaSource for streaming audio
//     const mediaSource = new MediaSource();
//     mediaSourceRef.current = mediaSource;
 
//     if (audioRef.current) {
//       audioRef.current.src = URL.createObjectURL(mediaSource);
//     }
 
//     mediaSource.addEventListener("sourceopen", () => {
//       if (!sourceBufferRef.current && mediaSource.readyState === "open") {
//         sourceBufferRef.current = mediaSource.addSourceBuffer(
//           'audio/webm; codecs="opus"'
//         );
//       }
//     });
 
//     socket.onmessage = (event) => {
//       if (sourceBufferRef.current && event.data instanceof ArrayBuffer) {
//         const chunk = new Uint8Array(event.data);
//         if (!sourceBufferRef.current.updating) {
//           try {
//             sourceBufferRef.current.appendBuffer(chunk);
//           } catch (err) {
//             console.error("appendBuffer error:", err);
//           }
//         }
//       }
//     };
 
//     socket.onopen = () => {
//       console.log("🎧 Listener connected to WebSocket");
//     };
 
//     socket.onclose = () => {
//       console.log("❌ Listener WebSocket closed");
//     };
 
//     return () => {
//       socket.close();
//     };
//   }, []);
 
//   // Add loading check
//   if (!auction) {
//     return <Text>Loading auction...</Text>;
//   }

 
//   return (
//     <Box p={10} pt={20} bg={"gray.2"}>
//       <Grid>
//         <Grid.Col span={6}>
//           <Group>
//             <Box bg={"white"} p={5}>
//               <Group>
//                 <DateBadge color={"primary.9"} date={dayjs(auction.starts)} />
//                 <DateBadge color={"primary.9"} date={dayjs(auction.ends)} />
//               </Group>
//             </Box> 
//             <Text fw={600} fz={14}>
//               {auction.title}
//             </Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fz={14}>
//               {auction.description}
//             </Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fw={500} size="xs">
//               ENDS : {dayjs(auction.ends).format("MMM DD, YYYY HH:mm a")}
//             </Text> 
//           </Group>
//         </Grid.Col>
 
//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Text fw={600} fz={15}>
//               Viewing
//             </Text>
//           </Center>
//         </Grid.Col>
 
//         {/* 🎧 Add Audio Player Section */}
//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Stack>
//               <Text fw={600} fz={15}>
//                 Live Audio
//               </Text>
//               <audio
//                 ref={audioRef}
//                 controls
//                 autoPlay
//                 style={{ width: "100%" }}
//               />
//             </Stack>
//           </Center>
//         </Grid.Col>
//       </Grid>
//     </Box>
//   );
// }

// 'use client';

// import { Box, Center, Grid, Group, Stack, Text } from "@mantine/core";
// import { Auction } from "../../lib/types";
// import dayjs from "dayjs";
// import { useEffect, useRef, useState } from "react";
// import DateBadge from "../../components/common/DateBadge";

// export default function LotsPageHeader({ auction }: { auction: Auction }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const mediaSourceRef = useRef<MediaSource | null>(null);
//   const sourceBufferRef = useRef<SourceBuffer | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   const [connected, setConnected] = useState(false);
//   const [audioReady, setAudioReady] = useState(false);
//   const [error, setError] = useState<string>("");
//   const [savedRecording, setSavedRecording] = useState<string | null>(null); // <-- saved file URL

//   const chunkQueue = useRef<Uint8Array[]>([]);
//   const isAppending = useRef(false);

//   const appendNextChunk = () => {
//     const sb = sourceBufferRef.current;
//     const ms = mediaSourceRef.current;

//     if (!sb || !ms || ms.readyState !== 'open') return;
//     if (sb.updating || isAppending.current) return;
//     if (chunkQueue.current.length === 0) return;

//     isAppending.current = true;
//     const chunk = chunkQueue.current.shift();

//     if (chunk) {
//       try {
//         sb.appendBuffer(new Uint8Array(chunk));
//       } catch (err) {
//         console.error('Append error:', err);
//         isAppending.current = false;
//       }
//     } else {
//       isAppending.current = false;
//     }
//   };

//   useEffect(() => {
//     let cleanup = false;

//     // --- Initialize MediaSource for live playback ---
//     const mediaSource = new MediaSource();
//     mediaSourceRef.current = mediaSource;

//     if (audioRef.current) {
//       audioRef.current.src = URL.createObjectURL(mediaSource);
//     }

//     mediaSource.addEventListener('sourceopen', () => {
//       try {
//         const codec = 'audio/webm; codecs=opus';
//         if (!MediaSource.isTypeSupported(codec)) throw new Error('Codec not supported');

//         const sb = mediaSource.addSourceBuffer(codec);
//         sb.mode = 'sequence';
//         sb.addEventListener('updateend', () => {
//           isAppending.current = false;
//           appendNextChunk();
//         });

//         sourceBufferRef.current = sb;
//         setAudioReady(true);

//       } catch (err) {
//         console.error('MediaSource initialization failed:', err);
//         setError('Audio initialization failed');
//       }
//     });

//     // --- Initialize WebSocket ---
//     const socket = new WebSocket('ws://localhost:8082');
//     socket.binaryType = 'arraybuffer';
//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log('WebSocket connected');
//       setConnected(true);
//     };

//     socket.onmessage = (event) => {
//       if (cleanup) return;

//       if (event.data instanceof ArrayBuffer) {
//         // Live audio chunk
//         const chunk = new Uint8Array(event.data);
//         chunkQueue.current.push(chunk);
//         appendNextChunk();
//       } else {
//         // Server sent JSON (saved file path)
//         try {
//           const msg = JSON.parse(event.data);
//           if (msg.type === 'recordingFile' && msg.path) {
//             setSavedRecording(`http://localhost:8082${msg.path}`);
//           }
//         } catch (err) {
//           console.error('Failed to parse server message:', err);
//         }
//       }
//     };

//     socket.onclose = () => setConnected(false);
//     // socket.onerror = (err) => console.error('WebSocket error:', err);

//     return () => {
//       cleanup = true;
//       socket.close();
//       if (mediaSourceRef.current?.readyState === 'open') {
//         try { mediaSourceRef.current.endOfStream(); } catch {}
//       }
//       if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
//       chunkQueue.current = [];
//     };
//   }, []);

//   if (!auction) return <Text>Loading auction...</Text>;

//   return (
//     <Box p={10} pt={20} bg={"gray.2"}>
//       <Grid>
//         <Grid.Col span={6}>
//           <Group>
//             <Box bg={"white"} p={5}>
//               <Group>
//                 <DateBadge color={"primary.9"} date={dayjs(auction.starts)} />
//                 <DateBadge color={"primary.9"} date={dayjs(auction.ends)} />
//               </Group>
//             </Box>
//             <Text fw={600} fz={14}>{auction.title}</Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fz={14}>{auction.description}</Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fw={500} size="xs">
//               ENDS : {dayjs(auction.ends).format("MMM DD, YYYY HH:mm a")}
//             </Text>
//           </Group>
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Text fw={600} fz={15}>Viewing</Text>
//           </Center>
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Stack gap="xs">
//               <Text fw={600} fz={15}>Live Audio</Text>
//               <audio ref={audioRef} controls autoPlay style={{ width: '100%' }} />
//               <Group gap="xs">
//                 <Text size="xs" c={connected ? "green" : "red"}>
//                   {connected ? "🟢 Live" : "🔴 Offline"}
//                 </Text>
//                 {audioReady && <Text size="xs" c="blue">🔊 Ready</Text>}
//               </Group>
//               {error && <Text size="xs" c="red">{error}</Text>}

//               {/* --- Saved recording playback --- */}
//               {savedRecording && (
//                 <>
//                   <Text size="xs" fw={600} c="purple">Saved Recording:</Text>
//                   <audio src={savedRecording} controls autoPlay style={{ width: '100%' }} />
//                 </>
//               )}
//             </Stack>
//           </Center>
//         </Grid.Col>
//       </Grid>
//     </Box>
//   );
// }


// 'use client';

// import { Box, Center, Grid, Group, Stack, Text } from "@mantine/core";
// import { Auction } from "../../lib/types";
// import dayjs from "dayjs";
// import { useEffect, useRef, useState } from "react";
// import DateBadge from "../../components/common/DateBadge";

// export default function LotsPageHeader({ auction }: { auction: Auction }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const mediaSourceRef = useRef<MediaSource | null>(null);
//   const sourceBufferRef = useRef<SourceBuffer | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   const [connected, setConnected] = useState(false);
//   const [audioReady, setAudioReady] = useState(false);
//   const [error, setError] = useState<string>("");
//   const [savedRecordings, setSavedRecordings] = useState<string[]>([]); // Array for multiple recordings

//   const chunkQueue = useRef<Uint8Array[]>([]);
//   const isAppending = useRef(false);

//   const appendNextChunk = () => {
//     const sb = sourceBufferRef.current;
//     const ms = mediaSourceRef.current;

//     if (!sb || !ms || ms.readyState !== 'open') return;
//     if (sb.updating || isAppending.current) return;
//     if (chunkQueue.current.length === 0) return;

//     isAppending.current = true;
//     const chunk = chunkQueue.current.shift();

//     if (chunk) {
//       try {
//         sb.appendBuffer(new Uint8Array(chunk));
//       } catch (err) {
//         console.error('Append error:', err);
//       } finally {
//         isAppending.current = false;
//       }
//     } else {
//       isAppending.current = false;
//     }
//   };

//   useEffect(() => {
//     let cleanup = false;

//     // --- Initialize MediaSource for live playback ---
//     const mediaSource = new MediaSource();
//     mediaSourceRef.current = mediaSource;

//     if (audioRef.current) {
//       audioRef.current.src = URL.createObjectURL(mediaSource);
//     }

//     mediaSource.addEventListener('sourceopen', () => {
//       try {
//         const codec = 'audio/webm; codecs=opus';
//         if (!MediaSource.isTypeSupported(codec)) throw new Error('Codec not supported');

//         const sb = mediaSource.addSourceBuffer(codec);
//         sb.mode = 'sequence';
//         sb.addEventListener('updateend', () => appendNextChunk());

//         sourceBufferRef.current = sb;
//         setAudioReady(true);
//       } catch (err) {
//         console.error('MediaSource initialization failed:', err);
//         setError('Audio initialization failed');
//       }
//     });

//     // --- Initialize WebSocket ---
//     const socket = new WebSocket('ws://localhost:8082');
//     socket.binaryType = 'arraybuffer';
//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log('WebSocket connected');
//       setConnected(true);
//     };

//     socket.onmessage = (event) => {
//       if (cleanup) return;

//       if (event.data instanceof ArrayBuffer) {
//         // Live audio chunk
//         const chunk = new Uint8Array(event.data);
//         chunkQueue.current.push(chunk);
//         appendNextChunk();
//       } else {
//         // Server sent JSON with saved recording path
//         try {
//           const msg = JSON.parse(event.data);
//           if (msg.type === 'recordingFile' && msg.path) {
//             const url = `http://localhost:8082${msg.path}?t=${Date.now()}`; // cache-buster
//             setSavedRecordings(prev => [...prev, url]);
//           }
//         } catch (err) {
//           console.error('Failed to parse server message:', err);
//         }
//       }
//     };

//     socket.onclose = () => setConnected(false);
//     socket.onerror = (err) => console.error('WebSocket error:', err);

//     return () => {
//       cleanup = true;
//       socket.close();
//       if (mediaSourceRef.current?.readyState === 'open') {
//         try { mediaSourceRef.current.endOfStream(); } catch {}
//       }
//       if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
//       chunkQueue.current = [];
//     };
//   }, []);

//   if (!auction) return <Text>Loading auction...</Text>;

//   return (
//     <Box p={10} pt={20} bg={"gray.2"}>
//       <Grid>
//         <Grid.Col span={6}>
//           <Group>
//             <Box bg={"white"} p={5}>
//               <Group>
//                 <DateBadge color={"primary.9"} date={dayjs(auction.starts)} />
//                 <DateBadge color={"primary.9"} date={dayjs(auction.ends)} />
//               </Group>
//             </Box>
//             <Text fw={600} fz={14}>{auction.title}</Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fz={14}>{auction.description}</Text>
//           </Group>
//           <Group p={10}>
//             <Text c={"gray.7"} fw={500} size="xs">
//               ENDS : {dayjs(auction.ends).format("MMM DD, YYYY HH:mm a")}
//             </Text>
//           </Group>
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Text fw={600} fz={15}>Viewing</Text>
//           </Center>
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Stack gap="xs">
//               <Text fw={600} fz={15}>Live Audio</Text>
//               <audio ref={audioRef} controls autoPlay style={{ width: '100%' }} />
//               <Group gap="xs">
//                 <Text size="xs" c={connected ? "green" : "red"}>
//                   {connected ? "🟢 Live" : "🔴 Offline"}
//                 </Text>
//                 {audioReady && <Text size="xs" c="blue">🔊 Ready</Text>}
//               </Group>
//               {error && <Text size="xs" c="red">{error}</Text>}

//               {/* Saved recordings playback */}
//               {savedRecordings.length > 0 && (
//                 <>
//                   <Text size="xs" fw={600} c="purple">Saved Recordings:</Text>
//                   {savedRecordings.map((url, idx) => (
//                     <audio key={idx} src={url} controls style={{ width: '100%' }} />
//                   ))}
//                 </>
//               )}
//             </Stack>
//           </Center>
//         </Grid.Col>
//       </Grid>
//     </Box>
//   );
// }


// 'use client';

// import { Box, Center, Grid, Group, Stack, Text } from "@mantine/core";
// import { Auction } from "../../lib/types";
// import dayjs from "dayjs";
// import { useEffect, useRef, useState } from "react";
// import DateBadge from "../../components/common/DateBadge";

// export default function LotsPageHeader({ auction }: { auction?: Auction }) {
//     console
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const mediaSourceRef = useRef<MediaSource | null>(null);
//   const sourceBufferRef = useRef<SourceBuffer | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const [connected, setConnected] = useState(false);
//   const [audioReady, setAudioReady] = useState(false);
//   const [error, setError] = useState<string>("");

//   const chunkQueue = useRef<Uint8Array[]>([]);
//   const isAppending = useRef(false);
//   const isCleaningUp = useRef(false);

//   const appendNextChunk = () => {
//     const sb = sourceBufferRef.current;
//     const ms = mediaSourceRef.current;

//     if (!sb || !ms || ms.readyState !== 'open') return;
//     if (sb.updating || isAppending.current) return;
//     if (chunkQueue.current.length === 0) return;

//     isAppending.current = true;
//     const chunk = chunkQueue.current.shift();

//     if (chunk && chunk.byteLength > 0) {
//       try {
//         sb.appendBuffer(new Uint8Array(chunk));
//       } catch (err: any) {
//         console.error('Append error:', err.message);
//         isAppending.current = false;
        
//         if (chunkQueue.current.length > 100) {
//           console.warn('Queue overflow, clearing');
//           chunkQueue.current = chunkQueue.current.slice(-30);
//         }
//       }
//     } else {
//       isAppending.current = false;
//     }
//   };

//   const initWebSocket = () => {
//     if (isCleaningUp.current) return;

//     try {
//       const socket = new WebSocket('ws://localhost:8082');
//       socket.binaryType = 'arraybuffer';
//       socketRef.current = socket;

//       socket.onopen = () => {
//         if (isCleaningUp.current) {
//           socket.close();
//           return;
//         }
//         console.log('WebSocket connected');
//         setConnected(true);
//         setError('');
//       };

//       socket.onmessage = (event) => {
//         if (isCleaningUp.current) return;

//         if (event.data instanceof ArrayBuffer && event.data.byteLength > 0) {
//           const buffer = new Uint8Array(event.data);
//           const copy = new Uint8Array(buffer.length);
//           copy.set(buffer);
          
//           chunkQueue.current.push(copy);
          
//           if (chunkQueue.current.length > 150) {
//             chunkQueue.current = chunkQueue.current.slice(-50);
//           }
          
//           appendNextChunk();
//         }
//       };

//       socket.onclose = () => {
//         console.log('WebSocket closed');
//         setConnected(false);
//         socketRef.current = null;

//         if (!isCleaningUp.current) {
//           reconnectTimeoutRef.current = setTimeout(() => {
//             console.log('Reconnecting...');
//             initWebSocket();
//           }, 3000);
//         }
//       };

//       socket.onerror = () => {
//         setError('Connection failed');
//       };

//     } catch (err: any) {
//       console.error('WebSocket init failed:', err.message);
//       setError('Connection error');
//     }
//   };

//   useEffect(() => {
//     isCleaningUp.current = false;

//     const mediaSource = new MediaSource();
//     mediaSourceRef.current = mediaSource;

//     if (audioRef.current) {
//       audioRef.current.src = URL.createObjectURL(mediaSource);
//     }

//     mediaSource.addEventListener('sourceopen', () => {
//       if (isCleaningUp.current) return;

//       try {
//         const codec = 'audio/webm; codecs=opus';
        
//         if (!MediaSource.isTypeSupported(codec)) {
//           throw new Error('Codec not supported');
//         }

//         const sb = mediaSource.addSourceBuffer(codec);
//         sb.mode = 'sequence';
        
//         sb.addEventListener('updateend', () => {
//           isAppending.current = false;
//           appendNextChunk();
//         });

//         sb.addEventListener('error', () => {
//           isAppending.current = false;
//         });

//         sourceBufferRef.current = sb;
//         setAudioReady(true);
//         console.log('MediaSource ready');

//         appendNextChunk();

//       } catch (err: any) {
//         console.error('MediaSource init failed:', err.message);
//         setError('Audio init failed');
//       }
//     });

//     initWebSocket();

//     return () => {
//       console.log('Cleaning up');
//       isCleaningUp.current = true;

//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }

//       if (socketRef.current) {
//         socketRef.current.close();
//       }

//       if (mediaSourceRef.current?.readyState === 'open') {
//         try {
//           mediaSourceRef.current.endOfStream();
//         } catch (e) {}
//       }

//       if (audioRef.current?.src) {
//         URL.revokeObjectURL(audioRef.current.src);
//       }

//       chunkQueue.current = [];
//     };
//   }, []);

//   return (
//     <Box p={10} pt={20} bg={"gray.2"}>
//       <Grid>
//         <Grid.Col span={6}>
//           {auction ? (
//             <>
//               <Group>
//                 <Box bg={"white"} p={5}>
//                   <Group>
//                     <DateBadge color={"primary.9"} date={dayjs(auction.starts)} />
//                     <DateBadge color={"primary.9"} date={dayjs(auction.ends)} />
//                   </Group>
//                 </Box>
//                 <Text fw={600} fz={14}>{auction.title}</Text>
//               </Group>
//               <Group p={10}>
//                 <Text c={"gray.7"} fz={14}>{auction.description}</Text>
//               </Group>
//               <Group p={10}>
//                 <Text c={"gray.7"} fw={500} size="xs">
//                   ENDS : {dayjs(auction.ends).format("MMM DD, YYYY HH:mm a")}
//                 </Text>
//               </Group>
//             </>
//           ) : (
//             <Text c="gray.6" fz={14}>Loading auction details...</Text>
//           )}
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Text fw={600} fz={15}>Viewing</Text>
//           </Center>
//         </Grid.Col>

//         <Grid.Col span={3}>
//           <Center h={"100%"}>
//             <Stack gap="xs">
//               <Text fw={600} fz={15}>Live Audio</Text>
              
//               <audio 
//                 ref={audioRef} 
//                 controls 
//                 autoPlay 
//                 style={{ width: '100%' }}
//               />
              
//               <Group gap="xs">
//                 <Text size="xs" c={connected ? "green" : "red"} fw={500}>
//                   {connected ? "Live" : "Offline"}
//                 </Text>
//                 {audioReady && (
//                   <Text size="xs" c="blue" fw={500}>
//                     Ready
//                   </Text>
//                 )}
//               </Group>

//               {error && (
//                 <Text size="xs" c="red" fw={500}>
//                   {error}
//                 </Text>
//               )}
//             </Stack>
//           </Center>
//         </Grid.Col>
//       </Grid>
//     </Box>
//   );
// }
// // pages/auction-listener.tsx


 
"use client";
 
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
 
export default function LoginPageHeader() {
  const [isConnected, setIsConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(100);

  const wsRef = useRef<WebSocket | null>(null);

  const hlsRef = useRef<Hls | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Connect to WebSocket as listener
  useEffect(() => {
    // const ws = new WebSocket("ws://localhost:8082/?role=listener");
    const ws = new WebSocket(
      "wss://devcoreact-production.up.railway.app/?role=listener"
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError("");
      console.log("Connected as listener");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket closed");
    };

    ws.onerror = (err) => {
      setError("Connection failed. Make sure backend is running.");
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
  }, []);

  // Load HLS stream
  //   const loadHLSStream = () => {
  //     if (!audioRef.current) {
  //       console.error("Audio element not ready");
  //       return;
  //     }

  //     // Clean existing stream
  //     cleanupHLS();

  //     // const hlsUrl = "http://localhost:8082/hls/audio.m3u8";
  // const hlsUrl = "https://devcoreact-production.up.railway.app/hls/audio.m3u8";
  //     console.log("Loading HLS stream from:", hlsUrl);

  //     if (Hls.isSupported()) {
  //       const hls = new Hls({
  //         enableWorker: true,
  //         lowLatencyMode: true,
  //         maxBufferLength: 10,
  //         maxMaxBufferLength: 20,
  //         liveSyncDurationCount: 3,
  //       });
  //       hlsRef.current = hls;

  //       hls.attachMedia(audioRef.current);

  //       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
  //         console.log("HLS attached to audio element");
  //         hls.loadSource(hlsUrl);
  //       });

  //       hls.on(Hls.Events.MANIFEST_PARSED, () => {
  //         console.log("HLS manifest loaded, starting playback");
  //         audioRef.current
  //           ?.play()
  //           .then(() => {
  //             console.log("✅ Playing live audio");
  //             setIsPlaying(true);
  //             setError("");
  //           })
  //           .catch((err) => {
  //             console.warn("Autoplay blocked:", err);
  //             setError("Click 'Play' button to start listening");
  //           });
  //       });

  //       hls.on(Hls.Events.ERROR, (event, data) => {
  //         console.error("HLS Error:", data);

  //         if (data.fatal) {
  //           switch (data.type) {
  //             case Hls.ErrorTypes.NETWORK_ERROR:
  //               console.log("Network error - retrying...");
  //               setError("Connection issue - retrying...");
  //               setTimeout(() => hls.startLoad(), 1000);
  //               break;
  //             case Hls.ErrorTypes.MEDIA_ERROR:
  //               console.log("Media error - recovering...");
  //               hls.recoverMediaError();
  //               break;
  //             default:
  //               console.log("Fatal error - stopping playback");
  //               setError("Playback failed. Please refresh the page.");
  //               cleanupHLS();
  //               break;
  //           }
  //         }
  //       });
  //     } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
  //       // Safari native HLS
  //       console.log("Using native HLS (Safari)");
  //       audioRef.current.src = hlsUrl;
  //       audioRef.current
  //         .play()
  //         .then(() => {
  //           setIsPlaying(true);
  //           setError("");
  //         })
  //         .catch((err) => {
  //           console.warn("Native HLS autoplay blocked:", err);
  //           setError("Click 'Play' button to start listening");
  //         });
  //     } else {
  //       setError(
  //         "HLS not supported in this browser. Please use Chrome, Firefox, or Safari."
  //       );
  //     }
  //   };
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
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        liveSyncDurationCount: 3,
        // FIX: Remove these conflicting options or adjust values
        // startLevel: -1,
        // liveBackBufferLength: 0,
        // liveMaxLatencyDurationCount: 3, // This was causing the error
        // liveDurationInfinity: true,
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
                setError("");
              })
              .catch((err) => {
                console.warn("Autoplay blocked:", err);
                setError("Click 'Play' button to start listening");
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
              setError("Connection issue - retrying...");
              setTimeout(() => hls.startLoad(), 1000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error - recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal error - stopping playback");
              setError("Playback failed. Please refresh the page.");
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
              setError("");
            })
            .catch((err) => {
              console.warn("Native HLS autoplay blocked:", err);
              setError("Click 'Play' button to start listening");
            });
        }
      }, 2000);
    } else {
      setError(
        "HLS not supported in this browser. Please use Chrome, Firefox, or Safari."
      );
    }
  };
  // Manual play button
  const handlePlay = () => {
    if (isBroadcasting) {
      loadHLSStream();
    } else {
      setError("No broadcast available. Waiting for speaker...");
    }
  };

  // Handle volume change
  // const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const vol = parseInt(e.target.value);
  //   setVolume(vol);
  //   if (audioRef.current) {
  //     audioRef.current.volume = vol / 100;
  //   }
  // };
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    // FIX: Add null check
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 40,
          maxWidth: 500,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#333",
            marginBottom: 30,
            fontSize: 32,
          }}
        >
          🎧 Auction Listener
        </h1>

        {/* Connection Status */}
        <div
          style={{
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            background: isConnected ? "#d4edda" : "#f8d7da",
            color: isConnected ? "#155724" : "#721c24",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {isConnected ? "✅ Connected to Server" : "❌ Not Connected"}
        </div>

        {/* Broadcasting Status */}
        <div
          style={{
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            background: isBroadcasting ? "#fff3cd" : "#e2e3e5",
            color: isBroadcasting ? "#856404" : "#383d41",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {isBroadcasting
            ? "🔴 Speaker is Broadcasting"
            : "⚫ Waiting for Speaker..."}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
              background: "#f8d7da",
              color: "#721c24",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Audio Player */}
        {/* <audio
          ref={audioRef}
          style={{ display: "none" }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        /> */}
        <audio
          ref={audioRef}
          style={{ display: "none" }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        {/* Custom Player UI */}
        <div
          style={{
            background: "#f8f9fa",
            padding: 30,
            borderRadius: 15,
            marginBottom: 20,
          }}
        >
          {/* Play/Pause Button */}
          <button
            onClick={handlePlay}
            disabled={!isConnected || !isBroadcasting}
            style={{
              width: "100%",
              padding: "20px 40px",
              fontSize: 18,
              fontWeight: "bold",
              borderRadius: 50,
              border: "none",
              background:
                isConnected && isBroadcasting
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#ccc",
              color: "white",
              cursor: isConnected && isBroadcasting ? "pointer" : "not-allowed",
              marginBottom: 20,
              transition: "all 0.3s",
              transform: isPlaying ? "scale(0.95)" : "scale(1)",
            }}
          >
            {isPlaying ? "🔊 Playing Live" : "▶️ Start Listening"}
          </button>

          {/* Status Indicator */}
          {isPlaying && (
            <div
              style={{
                textAlign: "center",
                color: "#28a745",
                fontWeight: "bold",
                marginBottom: 20,
                fontSize: 16,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#28a745",
                  animation: "pulse 1.5s infinite",
                  marginRight: 10,
                }}
              ></span>
              Live Audio Playing
            </div>
          )}

          {/* Volume Control */}
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontSize: 14,
                color: "#666",
                textAlign: "center",
              }}
            >
              🔊 Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: "100%",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: "#e7f3ff",
            padding: 15,
            borderRadius: 10,
            fontSize: 13,
            color: "#004085",
          }}
        >
          <strong>📌 Instructions:</strong>
          <ol style={{ margin: "10px 0 0 0", paddingLeft: 20 }}>
            <li>Make sure backend server is running</li>
            <li>Wait for speaker to start broadcasting</li>
            <li>Click "Start Listening" to hear live audio</li>
            <li>Adjust volume as needed</li>
          </ol>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
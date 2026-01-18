import React, { useEffect, useRef, useState } from 'react';
import { Scene } from '../types';
import { Play, Pause, SkipForward, SkipBack, Loader2, Volume2, VolumeX, Disc, Repeat, Download } from 'lucide-react';

interface PlayerProps {
  scenes: Scene[];
  currentSceneId: string | null;
  showCaptions: boolean;
  onSceneChange: (sceneId: string) => void;
  useKenBurnsEffect?: boolean;
}

export const Player: React.FC<PlayerProps> = ({ scenes, currentSceneId, showCaptions, onSceneChange, useKenBurnsEffect = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const [playCount, setPlayCount] = useState(0);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const isLoopingRef = useRef(isLooping);
  
  const durationRef = useRef(5);
  const elapsedTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  const currentSceneIndex = scenes.findIndex(s => s.id === currentSceneId);
  const currentScene = scenes[currentSceneIndex];

  // Sync ref with state
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Handle Controls Visibility
  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 2500);
    }
  };

  useEffect(() => {
      if (!isPlaying) {
          setShowControls(true);
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
          handleInteraction();
      }
      return () => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      };
  }, [isPlaying]);

  // Reset when scene changes
  useEffect(() => {
    setPlayCount(0);
    elapsedTimeRef.current = 0;
    durationRef.current = 5; 
  }, [currentSceneId]);

  // Initialize Elements
  useEffect(() => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioDestRef.current = audioCtxRef.current.createMediaStreamDestination();
    }
    
    if (!videoElRef.current) {
        const v = document.createElement('video');
        v.crossOrigin = 'anonymous';
        v.playsInline = true;
        v.muted = true; 
        v.loop = false; 
        videoElRef.current = v;
    }
    if (!imgElRef.current) {
        const i = document.createElement('img');
        i.crossOrigin = 'anonymous';
        imgElRef.current = i;
    }

    return () => {
       audioCtxRef.current?.close(); 
    };
  }, []);

  // Asset Loading & Rendering Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoElRef.current;
    const img = imgElRef.current;

    if (!canvas || !ctx || !video || !img || !currentScene) return;

    // --- 1. Load Assets ---
    const loadAssets = async () => {
        setIsLoading(true);
        if (currentScene.videoUrl) {
            if (video.src !== currentScene.videoUrl) {
                video.src = currentScene.videoUrl;
                video.load();
                await new Promise((resolve) => {
                    video.onloadeddata = resolve;
                });
                if (video.duration && !currentScene.audioUrl) {
                    durationRef.current = video.duration;
                }
            }
            if (isPlaying) {
                video.play().catch(e => console.warn("Video play interrupted", e));
            } else {
                video.pause();
            }
        } else if (currentScene.imageUrl) {
            if (img.src !== currentScene.imageUrl) {
                img.src = currentScene.imageUrl;
                await new Promise((resolve) => {
                    if (img.complete) resolve(true);
                    img.onload = resolve;
                });
            }
        }
        setIsLoading(false);
    };
    
    loadAssets();

    // --- 2. Render Loop ---
    const render = () => {
        const now = Date.now();
        
        if (isPlaying && !isLoading) {
            if (lastFrameTimeRef.current > 0) {
                const dt = (now - lastFrameTimeRef.current) / 1000;
                if (dt < 0.5) { 
                    elapsedTimeRef.current += dt;
                }
            }
        }
        
        lastFrameTimeRef.current = now;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (currentScene.videoUrl) {
            const aspect = video.videoWidth / video.videoHeight || 16/9;
            const canvasAspect = canvas.width / canvas.height;
            let drawW = canvas.width;
            let drawH = canvas.height;
            
            if (aspect > canvasAspect) {
               drawW = canvas.height * aspect;
            } else {
               drawH = canvas.width / aspect;
            }
            const x = (canvas.width - drawW) / 2;
            const y = (canvas.height - drawH) / 2;
            
            ctx.drawImage(video, x, y, drawW, drawH);
        } else if (currentScene.imageUrl) {
            const aspect = img.naturalWidth / img.naturalHeight || 16/9;
            // KEN BURNS CONDITIONAL
            const scale = (isPlaying && useKenBurnsEffect) ? 1 + (elapsedTimeRef.current * 0.05) : 1; 
            
            let drawW = canvas.width * scale;
            let drawH = canvas.height * scale;
            
            if (aspect > canvas.width/canvas.height) {
                drawW = drawH * aspect;
            } else {
                drawH = drawW / aspect;
            }
            
            const x = (canvas.width - drawW) / 2;
            const y = (canvas.height - drawH) / 2;
            ctx.drawImage(img, x, y, drawW, drawH);
        }

        // Draw Karaoke Captions
        if (showCaptions && currentScene.narrative) {
            const text = currentScene.narrative;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            const totalDuration = durationRef.current > 0 ? durationRef.current : 5;
            const progress = Math.min(Math.max(elapsedTimeRef.current / totalDuration, 0), 1);
            const activeWordIndex = Math.floor(progress * words.length);

            const fontSize = 42; 
            const lineHeight = 64;
            ctx.font = `700 ${fontSize}px Outfit, sans-serif`; 
            ctx.textBaseline = 'top'; 
            
            const maxWidth = canvas.width * 0.8;
            const lines: { words: { text: string, index: number, width: number }[], width: number }[] = [];
            let currentLine: { text: string, index: number, width: number }[] = [];
            let currentLineWidth = 0;
            let wordGlobalIndex = 0;

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const wordText = word + ' ';
                const metrics = ctx.measureText(wordText);
                const wordWidth = metrics.width;
                if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
                    lines.push({ words: currentLine, width: currentLineWidth });
                    currentLine = [];
                    currentLineWidth = 0;
                }
                currentLine.push({ text: wordText, index: wordGlobalIndex, width: wordWidth });
                currentLineWidth += wordWidth;
                wordGlobalIndex++;
            }
            if (currentLine.length > 0) lines.push({ words: currentLine, width: currentLineWidth });

            const totalTextHeight = lines.length * lineHeight;
            const startY = canvas.height - 100 - totalTextHeight; 

            let y = startY;
            lines.forEach((line) => {
                let x = (canvas.width - line.width) / 2;
                line.words.forEach((w) => {
                    const isActive = w.index === activeWordIndex;
                    const isPast = w.index < activeWordIndex;
                    
                    ctx.shadowColor = 'rgba(0,0,0,1)';
                    ctx.shadowBlur = 12;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;

                    if (isActive) {
                        ctx.fillStyle = '#ffffff'; 
                        ctx.shadowColor = 'rgba(245, 158, 11, 1)'; 
                        ctx.shadowBlur = 30;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                    } else if (isPast) {
                        ctx.fillStyle = '#f59e0b'; 
                        ctx.shadowBlur = 8;
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
                        ctx.shadowBlur = 8;
                    }
                    ctx.fillText(w.text, x, y);
                    x += w.width;
                });
                y += lineHeight;
            });
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentScene, isPlaying, showCaptions, useKenBurnsEffect]);

  // --- 3. Playback Logic ---
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    const goNext = () => {
        handleNext();
    };

    const checkEndInterval = setInterval(() => {
        if (elapsedTimeRef.current >= durationRef.current) {
            clearInterval(checkEndInterval);
            goNext();
        }
    }, 200);

    return () => {
        clearInterval(checkEndInterval);
    };
  }, [isPlaying, currentSceneId, playCount]);

  // --- 4. Audio Engine ---
  useEffect(() => {
    if (!currentScene?.audioUrl || !audioCtxRef.current) return;

    const playAudio = async () => {
        try {
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch(e){}
                sourceNodeRef.current = null;
            }

            if (!isPlaying) return;

            const response = await fetch(currentScene.audioUrl!);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

            durationRef.current = audioBuffer.duration;

            const source = audioCtxRef.current.createBufferSource();
            source.buffer = audioBuffer;
            
            const gainNode = audioCtxRef.current.createGain();
            gainNode.gain.value = isMuted ? 0 : 1;
            
            source.connect(gainNode);
            gainNode.connect(audioCtxRef.current.destination);
            
            if (audioDestRef.current) {
              gainNode.connect(audioDestRef.current);
            }
            
            let startOffset = elapsedTimeRef.current;
            if (startOffset >= audioBuffer.duration) startOffset = 0; 
            
            source.start(0, startOffset);
            sourceNodeRef.current = source;
            
            if (videoElRef.current && currentScene.videoUrl) {
                videoElRef.current.loop = true;
                videoElRef.current.play().catch(()=>{});
            }

        } catch (e) {
            console.error("Audio error", e);
            durationRef.current = 5;
        }
    };

    playAudio();

    return () => {
         if (sourceNodeRef.current) {
             try { sourceNodeRef.current.stop(); } catch(e){}
         }
    };
  }, [currentSceneId, isPlaying, playCount]);


  // --- Handlers ---

  const handlePlayToggle = (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    const newState = !isPlaying;
    setIsPlaying(newState);
    handleInteraction();
    
    if (newState) {
        lastFrameTimeRef.current = Date.now();
        if (elapsedTimeRef.current >= durationRef.current) {
            elapsedTimeRef.current = 0;
        }
    }
    
    if(videoElRef.current) {
        if(newState) videoElRef.current.play().catch(()=>{});
        else videoElRef.current.pause();
    }
    
    if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  const handleNext = () => {
    if (isLoopingRef.current) {
        setPlayCount(prev => prev + 1);
        elapsedTimeRef.current = 0; 
        if (videoElRef.current) {
            videoElRef.current.currentTime = 0;
            videoElRef.current.play().catch(() => {});
        }
        return;
    }

    if (currentSceneIndex < scenes.length - 1) {
        onSceneChange(scenes[currentSceneIndex + 1].id);
    } else {
        setIsPlaying(false);
        if (isExporting) stopExport();
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
        onSceneChange(scenes[currentSceneIndex - 1].id);
    }
  };

  const startExport = async () => {
    if (isExporting || !canvasRef.current) return;
    if (scenes.length === 0) return;

    setIsExporting(true);
    onSceneChange(scenes[0].id);
    
    setTimeout(() => {
        setIsPlaying(true);
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        lastFrameTimeRef.current = Date.now();
        elapsedTimeRef.current = 0;

        const canvasStream = canvasRef.current!.captureStream(30);
        const audioStream = audioDestRef.current?.stream;
        const combinedTracks = [
          ...canvasStream.getVideoTracks(),
          ...(audioStream ? audioStream.getAudioTracks() : [])
        ];
        const combinedStream = new MediaStream(combinedTracks);

        const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        
        recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lumiere_Story_${Date.now()}.webm`;
            a.click();
            recordedChunksRef.current = [];
            setIsExporting(false);
            setIsPlaying(false);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
    }, 500);
  };

  const stopExport = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
  };

  if (!currentScene) return <div className="w-full aspect-video bg-black/50 rounded-xl flex items-center justify-center border border-white/10">Select a scene to preview</div>;

  return (
    <div 
        className="flex flex-col gap-4 w-full group/player"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
    >
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            
            <canvas 
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain cursor-pointer"
                onClick={handlePlayToggle}
            />
            
            {/* Top Gradient */}
            <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            {/* Top Right Actions */}
            <div className={`absolute top-6 right-6 flex items-center gap-3 transition-opacity duration-300 z-40 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {isExporting && (
                    <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        REC
                    </div>
                )}
                
                <button 
                    onClick={(e) => { e.stopPropagation(); startExport(); }}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-gold-500 text-white backdrop-blur-md border border-white/10 hover:border-gold-400 rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-gold-500/20"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Recording...' : 'Download Movie'}
                </button>
            </div>

            {/* Big Center Play Button Overlay */}
            {!isPlaying && !isLoading && !isExporting && (
                <div 
                    onClick={handlePlayToggle}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] cursor-pointer hover:bg-black/10 transition-all group/play z-20"
                >
                    <div className="w-24 h-24 bg-gold-500/90 rounded-full flex items-center justify-center pl-2 shadow-[0_0_40px_rgba(245,158,11,0.6)] group-hover/play:scale-110 transition-transform duration-300 ring-2 ring-gold-400/50">
                        <Play size={48} fill="white" className="text-white" />
                    </div>
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                        <span className="text-sm text-gold-200 font-bold tracking-widest uppercase shadow-black drop-shadow-lg">Loading Media...</span>
                    </div>
                </div>
            )}

            {/* Controls Overlay (Bottom) */}
            <div 
                className={`absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between transition-all duration-500 z-30 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()} // Prevent click through to video toggle
            >
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none -z-10" />

               <div className="flex items-center gap-6">
                   <button onClick={handlePlayToggle} className="text-white hover:text-gold-400 transition transform hover:scale-110" disabled={isExporting}>
                       {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                   </button>
                   
                   <div className="flex items-center gap-3 bg-white/10 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                       <button onClick={handlePrev} className="text-slate-300 hover:text-white transition disabled:opacity-30" disabled={currentSceneIndex === 0 || isExporting}>
                           <SkipBack size={18} />
                       </button>
                       <span className="text-xs text-slate-300 font-mono w-12 text-center">
                           {currentSceneIndex + 1} / {scenes.length}
                       </span>
                       <button onClick={handleNext} className="text-slate-300 hover:text-white transition disabled:opacity-30" disabled={currentSceneIndex === scenes.length - 1 || isExporting}>
                           <SkipForward size={18} />
                       </button>
                   </div>

                   <button 
                        onClick={() => setIsLooping(!isLooping)} 
                        className={`transition ml-2 ${isLooping ? 'text-gold-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-300 hover:text-white'}`}
                        title="Loop Scene"
                    >
                       <Repeat size={20} />
                   </button>

                   <button onClick={() => setIsMuted(!isMuted)} className="text-slate-300 hover:text-white transition">
                       {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                   </button>
               </div>
               
               <div className="flex items-center gap-6">
                  {/* Progress Bar */}
                  <div className="hidden md:block h-1.5 w-48 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        style={{ width: `${((currentSceneIndex + 1) / scenes.length) * 100}%` }} 
                      />
                  </div>
               </div>
            </div>
        </div>
    </div>
  );
};

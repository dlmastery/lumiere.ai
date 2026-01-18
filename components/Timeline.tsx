
import React from 'react';
import { Scene, SceneStatus } from '../types';
import { Film, Image as ImageIcon, Video, Mic, Loader2, PlayCircle, ChevronDown, Star, ArrowLeftRight } from 'lucide-react';

interface TimelineProps {
  scenes: Scene[];
  currentSceneId: string | null;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  onSelectScene: (id: string) => void;
  onGenerateImage: (scene: Scene) => void;
  onGenerateVideo: (scene: Scene) => void;
  onGenerateAudio: (scene: Scene) => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const Timeline: React.FC<TimelineProps> = ({ 
  scenes, 
  currentSceneId, 
  selectedVoice,
  onSelectVoice,
  onSelectScene,
}) => {

  const playAudio = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/80 backdrop-blur-md border-r border-white/5 w-80 shrink-0 z-20">
      <div className="p-4 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gold-100 flex items-center gap-2">
            <Film className="w-4 h-4 text-gold-500" /> Storyboard
            </h3>
            <span className="text-xs text-slate-500">{scenes.length} Scenes</span>
        </div>
        
        <div className="bg-slate-900/50 border border-white/5 rounded-lg p-2 flex items-center justify-between hover:border-gold-500/30 transition-colors">
            <div className="flex items-center gap-2 text-xs text-gold-400">
                <Mic size={14} />
                <span>Voice:</span>
            </div>
            <div className="relative group">
                <select 
                    value={selectedVoice}
                    onChange={(e) => onSelectVoice(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-200 appearance-none pr-6 focus:outline-none cursor-pointer w-full"
                >
                    {VOICES.map(v => <option key={v} value={v} className="bg-slate-900 text-white">{v}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {scenes.map((scene, idx) => {
          const isActive = currentSceneId === scene.id;
          const hasImage = !!scene.imageUrl;
          const hasLastFrame = !!scene.lastFrameImageUrl;
          const hasVideo = !!scene.videoUrl;
          const hasAudio = !!scene.audioUrl;
          const isBusy = [SceneStatus.GENERATING_IMAGE, SceneStatus.GENERATING_VIDEO, SceneStatus.GENERATING_AUDIO].includes(scene.status);

          return (
            <div 
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`
                group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                ${isActive 
                    ? 'bg-gradient-to-r from-gold-900/20 to-slate-900/80 border-gold-500 shadow-[0_0_25px_rgba(245,158,11,0.3)]' 
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/40'}
              `}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-gold-400' : 'text-slate-500'}`}>
                        {scene.isThumbnail ? 'Thumbnail' : `Scene ${idx + 1}`}
                    </span>
                    {scene.isThumbnail && <Star size={10} className="text-gold-500 fill-gold-500" />}
                </div>
                {isBusy && <Loader2 className="w-3 h-3 text-gold-500 animate-spin" />}
              </div>
              
              <div className={`aspect-video w-full bg-slate-950/50 rounded-lg mb-3 overflow-hidden border relative group/media ${isActive ? 'border-gold-500/30' : 'border-white/5'}`}>
                {hasImage ? (
                  <div className="relative w-full h-full">
                    <img src={scene.imageUrl} alt="Scene" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                    {hasLastFrame && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 pointer-events-none">
                         <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[8px] text-white/60 font-bold bg-black/40 px-1 rounded">
                             <ArrowLeftRight size={8} /> Interpolation
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ImageIcon size={20} />
                    </div>
                )}

                <div className="absolute bottom-1 left-1 flex gap-1">
                    {hasVideo && <div className="bg-green-500/20 text-green-400 p-1 rounded backdrop-blur-md shadow-lg border border-green-500/20"><Video size={10} /></div>}
                    {hasAudio && (
                        <button 
                            onClick={(e) => playAudio(e, scene.audioUrl!)}
                            className="bg-gold-500 text-black p-1 rounded backdrop-blur-md hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
                        >
                            <PlayCircle size={10} fill="currentColor" />
                        </button>
                    )}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 relative z-10 font-light group-hover:text-slate-300 transition-colors">
                {scene.narrative}
              </p>

              {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-500 shadow-[0_0_15px_#f59e0b]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

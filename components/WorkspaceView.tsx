import React from 'react';
import { Scene, SceneStatus } from '../types';
import { Timeline } from './Timeline';
import { Player } from './Player';
import { ChatInterface } from './ChatInterface';
import { Image as ImageIcon, Video, RefreshCw, Loader2 } from 'lucide-react';

interface WorkspaceViewProps {
  scenes: Scene[];
  currentSceneId: string | null;
  setCurrentSceneId: (id: string) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  onGenerateImage: (scene: Scene, isLastFrame?: boolean) => void;
  onGenerateVideo: (scene: Scene) => void;
  onGenerateAudio: (scene: Scene) => void;
  onUpdateScene: (id: string | 'project', instruction: string) => Promise<void>;
  onTextChange: (id: string, field: keyof Scene, val: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  showCaptions: boolean;
  projectContext: string;
  useKenBurnsEffect?: boolean;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  scenes, currentSceneId, setCurrentSceneId, selectedVoice, setSelectedVoice,
  onGenerateImage, onGenerateVideo, onGenerateAudio, onUpdateScene, onTextChange,
  isChatOpen, setIsChatOpen, showCaptions, projectContext, useKenBurnsEffect = true
}) => {
  const currentScene = scenes.find(s => s.id === currentSceneId);

  return (
    <main className="flex-1 flex overflow-hidden z-10">
      <Timeline 
        scenes={scenes} 
        currentSceneId={currentSceneId} 
        selectedVoice={selectedVoice} 
        onSelectVoice={setSelectedVoice} 
        onSelectScene={setCurrentSceneId} 
        onGenerateImage={() => {}} 
        onGenerateVideo={() => {}} 
        onGenerateAudio={() => {}} 
      />
      
      <div className="flex-1 bg-[#050914] flex flex-col relative overflow-hidden">
        <div className="w-full max-w-4xl mx-auto p-8 pb-0 z-10 shrink-0">
          <Player scenes={scenes} currentSceneId={currentSceneId} showCaptions={showCaptions} onSceneChange={setCurrentSceneId} useKenBurnsEffect={useKenBurnsEffect} />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 z-10 w-full max-w-4xl mx-auto">
          {currentScene && (() => {
            const isBusy = [SceneStatus.GENERATING_VIDEO, SceneStatus.GENERATING_AUDIO, SceneStatus.GENERATING_IMAGE].includes(currentScene.status);
            return (
              <div className="flex flex-col gap-4 px-6 py-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">{currentScene.isThumbnail ? 'Thumbnail / Poster' : `Scene ${currentScene.order + 1} Editor`}</h2>
                      <div className="flex gap-2">
                          <button onClick={() => onGenerateImage(currentScene, false)} disabled={isBusy} className="p-2 rounded-lg bg-white/5 hover:bg-gold-500/20 text-slate-400 hover:text-gold-400 transition"><ImageIcon size={16} /></button>
                          <button onClick={() => onGenerateVideo(currentScene)} disabled={isBusy || !currentScene.imageUrl} className="px-4 py-1.5 bg-gold-600 text-white rounded-lg text-xs font-bold transition shadow-lg flex items-center gap-2">
                            {isBusy ? <Loader2 className="animate-spin w-3 h-3"/> : <Video className="w-3 h-3"/>} Animate (Veo 3.1)
                          </button>
                      </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Frame</label>
                            <div className="text-xs text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">{currentScene.description}</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-purple-400">Context</label>
                            <p className="text-[9px] text-slate-500 italic px-3">{projectContext}</p>
                          </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                          <div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Narrative & Audio</label></div>
                          <div className="flex gap-2">
                            <textarea 
                              value={currentScene.narrative} 
                              onChange={(e) => onTextChange(currentScene.id, 'narrative', e.target.value)} 
                              className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white resize-none" rows={4} 
                            />
                            <button onClick={() => onGenerateAudio(currentScene)} disabled={isBusy} className="p-3 bg-slate-800 rounded-lg text-gold-400"><RefreshCw className="w-4 h-4"/></button>
                          </div>
                      </div>
                 </div>
              </div>
            );
          })()}
        </div>
      </div>
      
      <ChatInterface 
        currentScene={currentScene || null} 
        onUpdateScene={onUpdateScene} 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </main>
  );
};

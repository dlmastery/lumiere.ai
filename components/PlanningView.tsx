import React from 'react';
import { Scene } from '../types';
import { FileJson, Rocket, X, AlertCircle } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

interface PlanningViewProps {
  scenes: Scene[];
  projectContext: string;
  currentSceneId: string | null;
  setCurrentSceneId: (id: string) => void;
  onStartProduction: () => void;
  onTextChange: (id: string, field: keyof Scene, val: string) => void;
  onUpdateScene: (id: string | 'project', instruction: string) => Promise<void>;
  rawEditor: {
    show: boolean;
    setShow: (v: boolean) => void;
    text: string;
    setText: (v: string) => void;
    error: string | null;
    onSave: () => void;
    onOpen: () => void;
  };
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  scenes, projectContext, currentSceneId, setCurrentSceneId, onStartProduction, onTextChange, onUpdateScene, rawEditor
}) => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden z-10 p-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 overflow-hidden relative">
        
        {rawEditor.show && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-10 animate-fade-in-up rounded-[3rem] border border-white/10">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <FileJson className="text-gold-500 w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold text-white">Raw Blueprint Editor</h2>
                  <p className="text-xs text-slate-400">Paste your structured scene-by-scene JSON transcript below.</p>
                </div>
              </div>
              <button onClick={() => rawEditor.setShow(false)} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative group">
              <textarea
                value={rawEditor.text}
                onChange={(e) => rawEditor.setText(e.target.value)}
                className="w-full h-full bg-black/50 border border-white/10 rounded-2xl p-8 font-mono text-sm text-gold-200/90 outline-none focus:border-gold-500/50 transition-all custom-scrollbar resize-none"
              />
              {rawEditor.error && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-900/90 border border-red-500/50 rounded-xl flex items-center gap-3 text-white text-xs font-bold animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  {rawEditor.error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 shrink-0">
               <button onClick={() => rawEditor.setShow(false)} className="px-8 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition">Cancel</button>
               <button onClick={rawEditor.onSave} className="px-10 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-gold-500/20 transition-all active:scale-95">Save Blueprint</button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between shrink-0">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Project Blueprint</h2>
                <div className="bg-gold-500/5 border border-gold-500/20 p-2 rounded-lg text-[10px] text-gold-400 font-bold uppercase tracking-widest inline-block">Visual DNA: {projectContext}</div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={rawEditor.onOpen} className="px-6 py-4 border border-white/10 bg-white/5 text-slate-300 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-xl">
                  <FileJson size={14} /> RAW TRANSCRIPT EDITOR
                </button>
                <button onClick={onStartProduction} className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-700 text-white rounded-2xl font-bold text-sm flex items-center gap-3 shadow-2xl hover:scale-105 transition-all">INITIALIZE PRODUCTION</button>
            </div>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar pb-20">
                {scenes.map((scene, idx) => (
                    <div key={scene.id} onClick={() => setCurrentSceneId(scene.id)} className={`p-10 bg-slate-900/40 border-2 rounded-[3rem] transition-all cursor-pointer relative ${currentSceneId === scene.id ? 'border-gold-500 bg-slate-900/80 shadow-[0_0_50px_rgba(245,158,11,0.1)]' : 'border-white/5'}`}>
                        <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gold-600 text-white flex items-center justify-center font-black text-xl shadow-xl">{idx + 1}</div>
                        <h3 className="font-bold text-white uppercase tracking-widest text-lg mb-8 border-b border-white/5 pb-4">{scene.isThumbnail ? 'Thumbnail Poster' : `Scene ${idx + 1}`}</h3>
                        <div className="grid grid-cols-1 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gold-500/80 uppercase tracking-[0.2em]">Start Frame Visual Vision (200+ Words)</label>
                                        <span className="text-[9px] text-slate-500">{scene.description.split(' ').length} words</span>
                                    </div>
                                    <textarea 
                                        value={scene.description} 
                                        onChange={(e) => onTextChange(scene.id, 'description', e.target.value)} 
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-slate-300 resize-none h-80 leading-relaxed font-light focus:border-gold-500/50 outline-none transition-colors" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-purple-400/80 uppercase tracking-[0.2em]">Interpolation End Frame Vision (200+ Words)</label>
                                        <span className="text-[9px] text-slate-500">{scene.lastFrameDescription?.split(' ').length || 0} words</span>
                                    </div>
                                    <textarea 
                                        value={scene.lastFrameDescription} 
                                        onChange={(e) => onTextChange(scene.id, 'lastFrameDescription', e.target.value)} 
                                        className="w-full bg-black/40 border border-purple-500/10 rounded-2xl p-6 text-sm text-slate-400 resize-none italic h-60 leading-relaxed font-light focus:border-purple-500/30 outline-none transition-colors" 
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-950/60 p-8 rounded-3xl border border-blue-500/10">
                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 block">Narrative & Voiceover</label>
                                <textarea 
                                    value={scene.narrative} 
                                    onChange={(e) => onTextChange(scene.id, 'narrative', e.target.value)} 
                                    className="w-full bg-transparent border-none p-0 text-xl text-white resize-none font-medium h-32 focus:ring-0 leading-relaxed" 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-[400px] shrink-0 bg-slate-900/60 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <ChatInterface currentScene={scenes.find(s => s.id === currentSceneId) || null} onUpdateScene={onUpdateScene} isOpen={true} onToggle={() => {}} />
            </div>
        </div>
      </div>
    </main>
  );
};
import React from 'react';
import { Sparkles, Loader, Crown, ChevronDown, Layers } from 'lucide-react';

interface HeroViewProps {
  topic: string;
  setTopic: (v: string) => void;
  isGeneratingScript: boolean;
  onGenerate: () => void;
  config: {
    selectedVoice: string;
    setSelectedVoice: (v: string) => void;
    videoType: string;
    setVideoType: (v: string) => void;
    targetAudience: string;
    setTargetAudience: (v: string) => void;
    imageStyle: string;
    setImageStyle: (v: string) => void;
    useCharacterConsistency: boolean;
    setUseCharacterConsistency: (v: boolean) => void;
    useKenBurnsEffect: boolean;
    setUseKenBurnsEffect: (v: boolean) => void;
    sceneCount: number;
    setSceneCount: (v: number) => void;
  };
  options: {
    voices: string[];
    videoTypes: string[];
    audiences: string[];
    styles: string[];
  };
}

export const HeroView: React.FC<HeroViewProps> = ({ 
  topic, setTopic, isGeneratingScript, onGenerate, config, options 
}) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 overflow-hidden">
      {/* Decorative background elements for title */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
      
      <div className="text-center space-y-8 max-w-5xl mb-12">
        <div className="relative inline-block">
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] text-white flex flex-col md:flex-row items-center justify-center gap-x-8">
            <span className="inline-block animate-text-reveal [animation-delay:0.1s] opacity-0 select-none">
              Visual
            </span>
            <span className="relative inline-block animate-text-reveal [animation-delay:0.3s] opacity-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-300 via-white to-gold-500 bg-[length:200%_auto] animate-gradient-x select-none drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                Alchemy
              </span>
              <span className="absolute -inset-2 bg-gold-500/10 blur-2xl rounded-full -z-10 animate-pulse"></span>
            </span>
          </h1>
          {/* Subtle sparkle icon floaties around title */}
          <Sparkles className="absolute -top-8 -right-8 text-gold-400/40 w-12 h-12 animate-float-slow" />
          <Sparkles className="absolute -bottom-4 -left-12 text-gold-300/30 w-8 h-8 animate-float-delayed" />
        </div>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up [animation-delay:0.8s] opacity-0 fill-mode-forwards">
          Transform your imagination into <span className="text-white font-medium">cinema-grade</span> video experiences.
        </p>
      </div>
      
      <div className="w-full max-w-5xl bg-[#05050a]/90 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up [animation-delay:1s] opacity-0 fill-mode-forwards">
        <textarea 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          placeholder="Describe your story vision..." 
          rows={6} 
          className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-10 py-10 text-2xl font-light resize-none leading-relaxed text-left" 
        />
        
        <div className="bg-black/40 border-t border-white/5 p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Voice', value: config.selectedVoice, setter: config.setSelectedVoice, opts: options.voices },
              { label: 'Type', value: config.videoType, setter: config.setVideoType, opts: options.videoTypes },
              { label: 'Audience', value: config.targetAudience, setter: config.setTargetAudience, opts: options.audiences },
              { label: 'Style', value: config.imageStyle, setter: config.setImageStyle, opts: options.styles },
            ].map((item) => (
              <div key={item.label} className="relative group">
                <select 
                  value={item.value} 
                  onChange={(e) => item.setter(e.target.value)} 
                  className="w-full bg-slate-900/90 border border-white/10 rounded-lg p-3 text-xs font-semibold text-white appearance-none focus:border-gold-500 outline-none transition-all cursor-pointer shadow-xl"
                >
                  {item.opts.map(v => <option key={v} value={v} className="bg-slate-900 text-white">{v}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold-400">
                    <Layers size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Story Depth (Scene Count)</span>
                </div>
                <span className="text-xl font-black text-white">{config.sceneCount} <span className="text-[10px] text-slate-500">SCENES</span></span>
             </div>
             <input 
                type="range" 
                min="5" 
                max="25" 
                step="1" 
                value={config.sceneCount} 
                onChange={(e) => config.setSceneCount(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
             />
             <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Fast Short (5)</span>
                <span>Epic Detail (25)</span>
             </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer uppercase tracking-widest text-[10px] font-bold text-slate-200 hover:text-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.useCharacterConsistency} 
                    onChange={(e) => config.setUseCharacterConsistency(e.target.checked)} 
                    className="w-4 h-4 rounded bg-slate-900 border-white/10 accent-gold-500" 
                  /> 
                  Consistency
                </label>
                <label className="flex items-center gap-2 cursor-pointer uppercase tracking-widest text-[10px] font-bold text-slate-200 hover:text-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.useKenBurnsEffect} 
                    onChange={(e) => config.setUseKenBurnsEffect(e.target.checked)} 
                    className="w-4 h-4 rounded bg-slate-900 border-white/10 accent-gold-500" 
                  /> 
                  Dynamic Zoom
                </label>
            </div>
            <button 
              onClick={onGenerate} 
              disabled={!topic.trim() || isGeneratingScript} 
              className="bg-white text-black px-12 py-3 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-white/5"
            >
              {isGeneratingScript ? <Loader className="animate-spin w-4 h-4" /> : <Sparkles size={16} />} CRAFT NARRATIVE
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
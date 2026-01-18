
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Wand2, Rocket, MessageSquare, Sparkles, Film, Music, Camera, Activity, Cpu, Clock } from 'lucide-react';

interface ConceptViewProps {
  concept: string;
  setConcept: (v: string) => void;
  isGeneratingScript: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

const LOADING_MESSAGES = [
  "Casting digital actors...",
  "Scouting virtual locations...",
  "Drafting lighting maps...",
  "Polishing cinematic arcs...",
  "Reviewing storyboard continuity...",
  "Sourcing ethereal soundscapes...",
  "Syncing frame-by-frame narrative...",
  "Optimizing visual DNA...",
  "Rendering conceptual blueprints...",
  "Directing the digital cast...",
  "Composing visual poetry...",
  "Aligning stars for the first frame..."
];

export const ConceptView: React.FC<ConceptViewProps> = ({ 
  concept, setConcept, isGeneratingScript, onConfirm, onBack 
}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [tokens, setTokens] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isGeneratingScript) {
      setSeconds(0);
      setTokens(0);
      
      // Message cycling
      const msgInterval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);

      // Time counter
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);

      // Simulated token counter (stochastic growth for realism)
      tokenRef.current = setInterval(() => {
        setTokens(prev => prev + Math.floor(Math.random() * 45) + 15);
      }, 150);

      return () => {
        clearInterval(msgInterval);
        if (timerRef.current) clearInterval(timerRef.current);
        if (tokenRef.current) clearInterval(tokenRef.current);
      };
    }
  }, [isGeneratingScript]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 animate-fade-in-up relative">
      {/* Cinematic Loading Overlay */}
      {isGeneratingScript && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12 overflow-hidden animate-fade-in">
          {/* Animated Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[600px] h-[600px] border-2 border-gold-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-[400px] h-[400px] border border-gold-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute w-[800px] h-[800px] border border-purple-500/10 rounded-full animate-pulse-slow" />
          </div>

          <div className="relative flex flex-col items-center gap-10 text-center max-w-2xl">
             <div className="relative">
                <div className="w-40 h-40 bg-gold-500/5 rounded-full flex items-center justify-center border-2 border-gold-500/30 relative">
                    <div className="absolute inset-2 border border-gold-500/10 rounded-full animate-ping" />
                    <Loader2 className="w-20 h-20 text-gold-500 animate-[spin_2s_linear_infinite]" />
                </div>
                {/* Floating cinematic icons */}
                <Film className="absolute -top-4 -left-4 text-gold-400/40 w-10 h-10 animate-float" />
                <Camera className="absolute -bottom-2 -right-6 text-purple-400/40 w-12 h-12 animate-float-delayed" />
                <Music className="absolute top-1/2 -right-12 text-gold-200/30 w-8 h-8 animate-float-slow" />
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">Orchestrating Blueprint</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">Initializing Cinematic AI Pipeline</p>
                </div>

                <div className="grid grid-cols-3 gap-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-gold-400 mb-1">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Runtime</span>
                        </div>
                        <span className="text-3xl font-mono font-black text-white tabular-nums">{seconds}s</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-white/10 px-8">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                            <Cpu size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tokens</span>
                        </div>
                        <span className="text-3xl font-mono font-black text-white tabular-nums">{tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Activity size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Stream</span>
                        </div>
                        <span className="text-3xl font-mono font-black text-white tabular-nums">Active</span>
                    </div>
                </div>

                <div className="h-8 relative">
                   {LOADING_MESSAGES.map((msg, i) => (
                      <p 
                        key={i} 
                        className={`absolute inset-0 text-gold-400 text-sm font-bold uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-2 ${msgIndex === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
                      >
                         <Sparkles className="w-4 h-4 animate-pulse" /> {msg}
                      </p>
                   ))}
                </div>
             </div>

             <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden mt-4 relative">
                <div className="absolute inset-0 bg-gold-500/10 blur-sm" />
                <div className="h-full bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600 animate-[shine_2s_linear_infinite] bg-[length:200%_100%] transition-all duration-500" style={{ width: '100%' }} />
             </div>

             <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium leading-relaxed max-w-md mx-auto">
                Lumiere AI is hand-painting every scene description using Gemini Pro. This deep orchestration phase generates vivid, 200+ word visual essays per frame to ensure cinematic depth.
                </p>
                <div className="flex items-center justify-center gap-1 text-[8px] text-gold-500/40 font-black uppercase tracking-[0.5em] mt-4">
                    Processing • Logic • Visuals • Sound
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-[#05050a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20">
                <Wand2 className="text-gold-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Director's Treatment</h2>
              <p className="text-slate-400 text-sm font-light">I've paraphrased your vision into an expansive pitch. Does this look right? Feel free to refine it.</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <textarea 
              value={concept} 
              onChange={(e) => setConcept(e.target.value)} 
              className="relative w-full bg-black/40 border border-white/5 rounded-3xl p-8 text-lg text-slate-200 leading-relaxed font-light min-h-[400px] focus:outline-none focus:border-gold-500/50 transition-all custom-scrollbar"
              placeholder="Refine your conceptual treatment here..."
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={onBack}
              className="px-8 py-3 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              Back to Input
            </button>
            
            <button 
              onClick={onConfirm}
              disabled={isGeneratingScript || !concept.trim()}
              className="px-12 py-4 bg-white text-black rounded-2xl font-black text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-gold-500 hover:text-white transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              <Rocket size={18} />
              Proceed to Storyboard
            </button>
          </div>
        </div>
        
        <div className="bg-gold-500/5 border-t border-white/5 p-6 flex items-center gap-4">
            <MessageSquare className="text-gold-500 w-5 h-5 shrink-0" />
            <p className="text-[10px] text-gold-200/60 leading-tight uppercase tracking-widest font-bold">
              Tip: Correcting me here ensures I don't misinterpret the vibe during full scene generation.
            </p>
        </div>
      </div>
    </main>
  );
};

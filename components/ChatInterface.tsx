
import React, { useState, useEffect, useRef } from 'react';
import { Scene, ChatMessage } from '../types';
import { Send, Wand2, Bot, ChevronRight, MessageSquare, Sparkles, Globe, Target } from 'lucide-react';

interface ChatInterfaceProps {
  currentScene: Scene | null;
  onUpdateScene: (sceneId: string | 'project', instruction: string) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentScene, onUpdateScene, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Ready for direction. You can refine the active scene or apply changes to the whole movie.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scope, setScope] = useState<'scene' | 'project'>('scene');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || (scope === 'scene' && !currentScene) || isProcessing) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: scope === 'project' ? 'Recalibrating entire project blueprint...' : 'Refining scene vision...', timestamp: Date.now() }]);
      await onUpdateScene(scope === 'project' ? 'project' : currentScene!.id, userMsg.content);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Directives applied successfully. Check the updated blueprint.', timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Modification failed. Please refine your instruction.', timestamp: Date.now() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-950/20 backdrop-blur-3xl border-l border-white/5 shrink-0 transition-all duration-500 ease-out ${isOpen ? 'w-full' : 'w-16'}`}>
      <div className="p-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between h-16 cursor-pointer" onClick={!isOpen ? onToggle : undefined}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3"><Sparkles size={14} className="text-gold-500" /><h3 className="font-bold text-white text-xs uppercase tracking-widest">Creative Director</h3></div>
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="text-slate-500 hover:text-white p-2 transition"><ChevronRight size={18} /></button>
          </>
        ) : <div className="w-full flex justify-center"><Sparkles className="w-6 h-6 text-gold-500 animate-pulse" /></div>}
      </div>

      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[1.2rem] px-4 py-3 text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-white text-black font-bold' : 'bg-slate-800/80 text-slate-200 border border-white/5'}`}>{msg.content}</div>
                </div>
             ))}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900/80 border-t border-white/5 space-y-4">
             <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                <button onClick={() => setScope('scene')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-bold uppercase transition ${scope === 'scene' ? 'bg-gold-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Target size={12} /> Target Scene</button>
                <button onClick={() => setScope('project')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-bold uppercase transition ${scope === 'project' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={12} /> All Frames</button>
             </div>
             <form onSubmit={handleSubmit} className="relative group">
               <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={scope === 'project' ? "Project-wide instruction..." : "Instruction for active scene..."} className="w-full bg-black border border-white/10 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-gold-500 transition-all text-xs" disabled={isProcessing} />
               <button type="submit" disabled={!input.trim() || isProcessing} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gold-600 text-white rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={14} />}</button>
             </form>
          </div>
        </div>
      )}

      {!isOpen && <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={onToggle}><div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-slate-500 text-[10px] tracking-[0.4em] font-black py-12">DIRECTOR</div></div>}
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

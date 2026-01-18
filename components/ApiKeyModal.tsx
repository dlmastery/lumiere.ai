import React, { useEffect, useState } from 'react';
import { checkApiKey, promptForKeySelection } from '../services/geminiService';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  onValid: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onValid }) => {
  const [checking, setChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = async () => {
    setChecking(true);
    try {
      const valid = await checkApiKey();
      setHasKey(valid);
      if (valid) {
        onValid();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      await promptForKeySelection();
      // Assume success after dialog interaction, or re-check
      await check(); 
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  if (checking || hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-gold-500/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
        
        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
            <Key className="w-8 h-8 text-gold-500" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Google Cloud</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            To generate legendary videos using Veo and Gemini Pro, you need to select a billing-enabled Google Cloud Project.
          </p>
        </div>

        <button 
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-amber-700 hover:from-gold-500 hover:to-amber-600 text-white font-semibold rounded-lg shadow-lg shadow-gold-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-gold-500/20"
        >
          Select API Key
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-gold-400 transition-colors"
        >
          Learn more about billing <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
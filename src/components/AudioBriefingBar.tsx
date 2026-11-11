import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, X, Loader2, Radio, Sparkles } from 'lucide-react';
import { api } from '../api';

interface AudioBriefingBarProps {
  isOpen: boolean;
  onClose: () => void;
  defaultText?: string;
  matchTitle?: string;
}

export const AudioBriefingBar: React.FC<AudioBriefingBarProps> = ({
  isOpen,
  onClose,
  defaultText,
  matchTitle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Charon'>('Kore');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scriptText =
    defaultText ||
    `Welcome to the Haule Backup Community daily football briefing.
Today our prediction engine evaluated fixtures across Europe, Africa, and South America under our strict 75% confidence threshold.
Top qualifying picks include Arsenal over Everton with 85% home win probability, Real Madrid vs Dortmund over 2.5 goals at 82% confidence, and Simba SC vs Al Ahly in the CAF Champions League showing strong defensive metrics.
Remember to apply strict bankroll discipline and follow our automated settlement ledger.`;

  const playSpeech = async () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calls Gemini TTS endpoint running model gemini-3.8-flash-tts
      const result = await api.generateTTS(scriptText, voice);
      const audioUrl = `data:${result.mimeType};base64,${result.audioBase64}`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setError('Audio playback error in browser.');
        setIsPlaying(false);
      };

      await audio.play();
    } catch (err: any) {
      console.error('TTS Playback failed:', err);
      setError(err.message || 'Failed to generate voice audio.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[480px] z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl shadow-cyan-950/60 text-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h4 className="text-xs font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span>{matchTitle ? `Audio Preview: ${matchTitle}` : 'Haule Match Preview Podcast'}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  gemini-3.8-flash-tts
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">Broadcast-quality neural football commentary</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Voice options */}
        <div className="py-2.5">
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 italic">
            "{scriptText}"
          </p>

          <div className="flex items-center justify-between mt-2.5 text-[11px]">
            <div className="flex items-center space-x-1 text-slate-400">
              <span>Voice:</span>
              {(['Kore', 'Puck', 'Fenrir', 'Charon'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => {
                    setVoice(v);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    voice === v
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {error && <span className="text-rose-400 text-[10px]">{error}</span>}
          </div>
        </div>

        {/* Audio control button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {isPlaying && (
              <div className="flex items-center space-x-0.5 h-3">
                <span className="w-1 bg-cyan-400 h-3 animate-bounce rounded-full"></span>
                <span className="w-1 bg-cyan-400 h-2 animate-bounce delay-75 rounded-full"></span>
                <span className="w-1 bg-cyan-400 h-3.5 animate-bounce delay-150 rounded-full"></span>
                <span className="w-1 bg-cyan-400 h-1.5 animate-bounce delay-100 rounded-full"></span>
              </div>
            )}
            <span className="text-[10px] text-slate-400">
              {isLoading ? 'Generating high-fidelity audio...' : isPlaying ? 'Broadcasting live voice...' : 'Ready to listen'}
            </span>
          </div>

          <button
            onClick={playSpeech}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

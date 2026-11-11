import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User as UserIcon,
  Volume2,
  Sparkles,
  Loader2,
  Trash2,
  Radio,
  Zap,
  Cpu
} from 'lucide-react';
import { api } from '../api';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  onPlayAudio: (text: string, title: string) => void;
  initialPrompt?: string;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  onPlayAudio,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-01',
      role: 'model',
      text: `Greetings! I am the Chief Football Scout & Tactical Analyst for the Haule Backup Community.
I analyze live fixtures, expected goals (xG), recent head-to-head records, defensive setups, and apply our strict 75% confidence criteria.
How can I assist your match analysis or bet validation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for multi-turn conversational context
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { reply } = await api.sendChat(prompt.trim(), historyPayload, selectedModel);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Error analyzing fixture: ${err.message || 'Scout network disconnected'}. Please check your connection or switch models.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Explain the data behind today’s Top 4 picks',
    'Tactical preview for Simba SC vs Al Ahly in CAF Champions League',
    'Why is Double Chance 1X qualifying for Arsenal vs Everton?',
    'What are the highest risk matches under the 75% threshold today?'
  ];

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px] max-w-4xl mx-auto">
      {/* Header with Model Selector */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center space-x-2">
              <span>Haule Chief Football Scout & Analyst</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">Multi-turn scouting & statistical verification</p>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center space-x-1.5 text-xs">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 text-[11px] hidden sm:inline">Engine:</span>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-purple-400 font-mono"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General Scout)</option>
            <option value="gemini-4-carbon">gemini-4-carbon (Deep Tactical Reasoning)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex Interactive)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Response)</option>
          </select>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              }`}
            >
              {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{msg.timestamp}</span>

                {msg.role === 'model' && (
                  <button
                    onClick={() => onPlayAudio(msg.text, 'AI Scout Voice Briefing')}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Listen to this response via Gemini TTS"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen with TTS</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Scout evaluating match indicators with {selectedModel}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Quick Ask:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 text-slate-300 hover:text-white hover:bg-purple-950 hover:border-purple-500/50 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask the AI Scout about any fixture, xG matchup, form trend, or market probability..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>
        </form>
      </div>
    </div>
  );
};

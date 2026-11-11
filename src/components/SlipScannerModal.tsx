import React, { useState } from 'react';
import {
  Upload,
  FileImage,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  ScanLine
} from 'lucide-react';
import { api } from '../api';

interface SlipScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAudio: (text: string, title: string) => void;
}

export const SlipScannerModal: React.FC<SlipScannerModalProps> = ({
  isOpen,
  onClose,
  onPlayAudio
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setMimeType(file.type);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setError(null);

    try {
      // Calls server route that uses gemini-4-argon as required
      const { analysis } = await api.analyzeSlipImage(imagePreview, mimeType, customPrompt);
      setAnalysisResult(analysis);
    } catch (err: any) {
      console.error('Slip scan failed:', err);
      setError(err.message || 'Image analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl shadow-cyan-950/60 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ScanLine className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Betting Slip & Lineup Scanner
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  gemini-4-argon
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload a betting ticket, lineup sheet, or pitch tactical board for automated scout audit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-5 space-y-4">
          {!imagePreview ? (
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all text-center">
              <Upload className="w-10 h-10 text-cyan-400 mb-3" />
              <span className="text-sm font-bold text-white">Click or drag & drop football photo here</span>
              <span className="text-xs text-slate-400 mt-1">
                Betting tickets, squad lineups, tactical formations, or match stats
              </span>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">PNG, JPG, WEBP up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
              <img
                src={imagePreview}
                alt="Uploaded ticket"
                className="max-h-56 mx-auto object-contain rounded-xl"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900/90 text-rose-400 hover:bg-rose-950 border border-rose-500/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Optional Prompt adjustment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Scouting Focus (Optional):
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g. Audit leg #3 for Poisson goal expectancy, or check team injury risk"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleScan}
            disabled={!imagePreview || isLoading}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Slip with gemini-4-argon...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Tactical Slip Audit</span>
              </>
            )}
          </button>

          {/* Analysis Report */}
          {analysisResult && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Scout Audit Verdict:</span>
                </span>
                <button
                  onClick={() => onPlayAudio(analysisResult, 'Slip Scout Voice Audit')}
                  className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Audit</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

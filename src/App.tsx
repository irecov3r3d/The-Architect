/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, 
  Plus, 
  Trash2, 
  Send, 
  Copy, 
  Check, 
  Layers, 
  AlertCircle, 
  FolderTree, 
  Zap,
  Terminal,
  ChevronRight,
  Sparkles,
  PencilRuler
} from 'lucide-react';
import { generateArchitecture, ArchitectResult } from './services/gemini';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [vision, setVision] = useState('');
  const [existingBuilds, setExistingBuilds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArchitectResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddBuild = () => setExistingBuilds([...existingBuilds, '']);
  const handleRemoveBuild = (index: number) => {
    const newBuilds = existingBuilds.filter((_, i) => i !== index);
    setExistingBuilds(newBuilds.length ? newBuilds : ['']);
  };
  const handleBuildChange = (index: number, value: string) => {
    const newBuilds = [...existingBuilds];
    newBuilds[index] = value;
    setExistingBuilds(newBuilds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vision.trim()) return;
    
    setLoading(true);
    try {
      const buildsString = existingBuilds.filter(b => b.trim()).join(', ');
      const data = await generateArchitecture(vision, buildsString);
      setResult(data);
    } catch (error) {
      console.error('Failed to generate architecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <PencilRuler className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">The Architect</h1>
          </div>
          <div className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50">
            v1.0.0-alpha
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">Blueprint Your Vision</h2>
              <p className="text-zinc-400 leading-relaxed">
                Define your goal and list your existing assets. We'll unify them into a master specification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  App Vision / Goal
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="e.g., A real-time collaborative roguelike deckbuilder with persistent player progression..."
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Existing Builds & Tools
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBuild}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Asset
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {existingBuilds.map((build, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        value={build}
                        onChange={(e) => handleBuildChange(index, e.target.value)}
                        placeholder="e.g., Firebase Auth module, D3 chart component..."
                        className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBuild(index)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !vision.trim()}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                  loading 
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    Architecting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Master Spec
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Header Info */}
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <PencilRuler className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                        {result.domain}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{result.architectureName}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4" /> {result.mapping.length} Modules
                        </span>
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> {result.gaps.length} Gaps Identified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mapping & Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Asset Mapping
                      </h4>
                      <div className="space-y-3">
                        {result.mapping.map((m, i) => (
                          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-sm font-semibold text-white">{m.build}</div>
                            <div className="text-xs text-indigo-400 font-mono mt-0.5">Role: {m.role}</div>
                            <div className="text-xs text-zinc-500 mt-2 leading-relaxed">{m.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Gap Analysis
                      </h4>
                      <div className="space-y-3">
                        {result.gaps.map((g, i) => (
                          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-sm font-semibold text-white">{g.feature}</div>
                            <div className="text-xs text-amber-400/80 mt-2 flex items-start gap-1.5">
                              <Zap className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{g.recommendation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Structure & Communication */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-400" /> Module Structure
                      </h4>
                      <pre className="text-xs font-mono text-zinc-400 bg-black/40 p-4 rounded-lg overflow-x-auto border border-zinc-800/50">
                        {result.structure}
                      </pre>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" /> Communication Protocol
                      </h4>
                      <div className="text-sm text-zinc-400 leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{result.communication}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Master System Prompt
                      </h4>
                      <button
                        onClick={() => copyToClipboard(result.systemPrompt)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          copied 
                            ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                            : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30"
                        )}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Prompt
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                          {result.systemPrompt}
                        </pre>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
                      Paste this into Google AI Studio to initiate the build
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-zinc-800 rounded-3xl p-12"
                >
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                    <PencilRuler className="w-10 h-10 text-zinc-700" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-xl font-bold text-zinc-300">Awaiting Blueprint</h3>
                    <p className="text-sm text-zinc-500">
                      Fill out the vision and assets on the left to generate your unified master specification.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['Game Design', 'SaaS Platform', 'Data Tool', 'Social App'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}

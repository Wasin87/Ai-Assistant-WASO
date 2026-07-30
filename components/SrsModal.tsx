import React, { useState } from 'react';
import { X, Printer, Download, BookOpen, Layers, Cpu, Code2, Sparkles, ShieldCheck, Palette, Bot } from 'lucide-react';

interface SrsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SrsModal: React.FC<SrsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'ai' | 'features' | 'ui'>('overview');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in print:p-0 print:bg-white print:text-black">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0a192f] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden print:h-auto print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#00b4d8]/20 border border-[#00b4d8]/30 rounded-xl text-[#00b4d8]">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                WASO CORE 2.5 — SRS & PRD Documentation
              </h2>
              <p className="text-xs text-gray-400 font-mono">Document ID: SRS-WASO-2026-V2.5 • Author: Architect Wasin</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00b4d8] to-blue-500 hover:from-[#0096b4] hover:to-blue-600 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Printer size={16} />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation for Screen Reading */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-white/5 bg-white/5 overflow-x-auto custom-scrollbar print:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#00b4d8] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot size={14} />
            <span>1. Executive & Persona</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'architecture' ? 'bg-[#00b4d8] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} />
            <span>2. Software Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-[#00b4d8] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu size={14} />
            <span>3. AI Engines & Specs</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'features' ? 'bg-[#00b4d8] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 size={14} />
            <span>4. Line-by-Line Features</span>
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ui' ? 'bg-[#00b4d8] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={14} />
            <span>5. UI Tokens & Styling</span>
          </button>
        </div>

        {/* Modal Body / SRS Content (Printable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar text-gray-200 print:overflow-visible print:p-0 print:text-black">
          
          {/* Printable Header for PDF */}
          <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-black uppercase text-black">WASO AI ASSISTANT (WARVI)</h1>
            <h2 className="text-xl font-bold text-gray-700">SOFTWARE REQUIREMENTS SPECIFICATION (SRS) & PRD</h2>
            <p className="text-sm text-gray-600 mt-2">Architect: Wasin • System Version: WASO CORE 2.5 • Date: July 2026</p>
          </div>

          {/* SECTION 1: OVERVIEW & PERSONA */}
          {(activeTab === 'overview' || window.matchMedia('print').matches) && (
            <section className="space-y-6 animate-fade-in print:block">
              <div className="border-l-4 border-[#00b4d8] pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight print:text-black">1. Executive Summary & Core Persona</h3>
                <p className="text-sm text-gray-400 print:text-gray-600">Product Vision & AI System Persona Specification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-black/40 border border-white/10 rounded-2xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="text-[#00b4d8] font-bold text-sm uppercase mb-2 flex items-center gap-2 print:text-blue-700">
                    <Sparkles size={16} /> Identity & Nomenclature
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300 print:text-gray-800">
                    <li><strong>Full Name:</strong> WASO (Wasin AI Responsive Virtual Intelligence)</li>
                    <li><strong>Alias:</strong> WARVI</li>
                    <li><strong>Creator & Lead Architect:</strong> Wasin</li>
                    <li><strong>Target Domain:</strong> Software Architecture, Full-Stack Development, AI Analysis, Visual Synthesis.</li>
                  </ul>
                </div>

                <div className="p-5 bg-black/40 border border-white/10 rounded-2xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="text-purple-400 font-bold text-sm uppercase mb-2 flex items-center gap-2 print:text-purple-700">
                    <ShieldCheck size={16} /> Language & Behavioral Mandates
                  </h4>
                  <ul className="text-sm space-y-2 text-gray-300 print:text-gray-800">
                    <li><strong>Bilingual Proficiency:</strong> Seamless English and Bengali (বাংলা) dialect handling.</li>
                    <li><strong>Persona Depth:</strong> Senior Software Architect & Lead Developer.</li>
                    <li><strong>Instruction Prompt:</strong> Strict high-reasoning, optimized clean code output, authoritative yet supportive tone.</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 bg-black/60 border border-white/10 rounded-2xl font-mono text-xs text-cyan-300 print:bg-gray-50 print:text-gray-900 print:border-gray-300">
                <p className="font-bold text-gray-400 uppercase mb-1">System Greeting Protocol:</p>
                <p className="italic font-serif text-sm">"Hey, I am WASO. Wasin created me. I am ready to assist you with elite engineering, analysis, and premium visual generation."</p>
              </div>
            </section>
          )}

          {/* SECTION 2: SOFTWARE ARCHITECTURE */}
          {(activeTab === 'architecture' || window.matchMedia('print').matches) && (
            <section className="space-y-6 animate-fade-in print:block">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight print:text-black">2. System Architecture & Tech Stack</h3>
                <p className="text-sm text-gray-400 print:text-gray-600">Full-Stack Component Hierarchy & Runtime Dependencies</p>
              </div>

              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl print:bg-gray-100 print:border-gray-300 space-y-4">
                <h4 className="text-[#00b4d8] font-bold text-sm uppercase print:text-blue-800">Tech Stack Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <span className="text-gray-400 block font-semibold print:text-gray-600">UI Framework</span>
                    <span className="text-white font-bold text-sm print:text-black">React 19.0</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <span className="text-gray-400 block font-semibold print:text-gray-600">Build Tool & Bundler</span>
                    <span className="text-white font-bold text-sm print:text-black">Vite 6.2</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <span className="text-gray-400 block font-semibold print:text-gray-600">Type System</span>
                    <span className="text-white font-bold text-sm print:text-black">TypeScript 5.8</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <span className="text-gray-400 block font-semibold print:text-gray-600">Styling Engine</span>
                    <span className="text-white font-bold text-sm print:text-black">Tailwind CSS</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <h5 className="font-bold text-xs uppercase text-gray-300 mb-2 print:text-black">Core Dependencies</h5>
                    <ul className="text-xs space-y-1.5 font-mono text-cyan-200 print:text-gray-800">
                      <li>• @google/genai: ^1.38.0 (Official SDK)</li>
                      <li>• lucide-react: ^0.563.0 (Iconography)</li>
                      <li>• react-markdown: ^9.0.3 (Markdown Parsing)</li>
                      <li>• remark-gfm: ^4.0.1 (GitHub Flavored Tables)</li>
                      <li>• react-syntax-highlighter: ^16.1.0 (Code Highlight)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-gray-300">
                    <h5 className="font-bold text-xs uppercase text-gray-300 mb-2 print:text-black">Browser Audio Pipeline</h5>
                    <ul className="text-xs space-y-1.5 font-mono text-purple-200 print:text-gray-800">
                      <li>• Web Audio API (AudioContext 16kHz / 24kHz)</li>
                      <li>• Web Speech API (SpeechRecognition)</li>
                      <li>• ScriptProcessorNode (PCM Chunking)</li>
                      <li>• Int16 / Float32 PCM Encoder/Decoder</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: AI ENGINES & SPECS */}
          {(activeTab === 'ai' || window.matchMedia('print').matches) && (
            <section className="space-y-6 animate-fade-in print:block">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight print:text-black">3. AI Engine & Gemini Model Matrix</h3>
                <p className="text-sm text-gray-400 print:text-gray-600">Model Mapping, Prompt Engineering & Audio Specs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-white/10 rounded-2xl overflow-hidden print:border-gray-300">
                  <thead className="bg-black/60 text-cyan-300 font-bold uppercase print:bg-gray-200 print:text-black">
                    <tr>
                      <th className="p-3 border-b border-white/10 print:border-gray-300">Capability</th>
                      <th className="p-3 border-b border-white/10 print:border-gray-300">Model Alias</th>
                      <th className="p-3 border-b border-white/10 print:border-gray-300">Configuration / Constraints</th>
                      <th className="p-3 border-b border-white/10 print:border-gray-300">Output Modality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 print:divide-gray-300 print:text-black">
                    <tr>
                      <td className="p-3 font-bold text-white print:text-black">Deep Reasoning & Code</td>
                      <td className="p-3 font-mono text-cyan-300 print:text-blue-700">gemini-3-pro-preview</td>
                      <td className="p-3">thinkingBudget: 32768, System Persona Instruction</td>
                      <td className="p-3 font-semibold text-green-400 print:text-green-800">Text / Markdown</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white print:text-black">Visual Image Synthesis</td>
                      <td className="p-3 font-mono text-purple-300 print:text-purple-700">gemini-3-pro-image-preview</td>
                      <td className="p-3">1:1 Aspect Ratio, 1K Resolution, 8k Masterpiece Prompt Inject</td>
                      <td className="p-3 font-semibold text-purple-400 print:text-purple-800">PNG Data URL (Base64)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white print:text-black">Multimodal Document Analysis</td>
                      <td className="p-3 font-mono text-cyan-300 print:text-blue-700">gemini-3-flash-preview</td>
                      <td className="p-3">Base64 file stream input (PDF, PPTX, Image)</td>
                      <td className="p-3 font-semibold text-green-400 print:text-green-800">Text Summary / Analysis</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white print:text-black">Text-To-Speech (TTS)</td>
                      <td className="p-3 font-mono text-yellow-300 print:text-amber-700">gemini-2.5-flash-preview-tts</td>
                      <td className="p-3">Voice: 'Charon', Modality.AUDIO</td>
                      <td className="p-3 font-semibold text-yellow-400 print:text-amber-800">24kHz PCM Audio Base64</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white print:text-black">Live Duplex Voice Stream</td>
                      <td className="p-3 font-mono text-red-300 print:text-red-700">gemini-2.5-flash-native-audio-preview-12-2025</td>
                      <td className="p-3">WebSocket session, 16kHz Input PCM, 24kHz Output PCM</td>
                      <td className="p-3 font-semibold text-red-400 print:text-red-800">Bidirectional Audio Stream</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SECTION 4: LINE-BY-LINE FEATURES */}
          {(activeTab === 'features' || window.matchMedia('print').matches) && (
            <section className="space-y-6 animate-fade-in print:block">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight print:text-black">4. Comprehensive Functional Requirements</h3>
                <p className="text-sm text-gray-400 print:text-gray-600">Line-by-Line System Feature Breakdown</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-[#00b4d8] mb-1 print:text-blue-800">FR-01: Session & Chat State Persistence</h4>
                  <p className="text-gray-300 print:text-gray-800">Automatic local persistence in `localStorage` (`waso_chats`). Sanitization algorithm validates unique session IDs (`generateId()`) with timestamp and random salt to eliminate duplicate key collisions. Auto-creates a new chat if local data is corrupted.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-purple-400 mb-1 print:text-purple-800">FR-02: Image Generation Mode Toggle</h4>
                  <p className="text-gray-300 print:text-gray-800">Allows toggling between standard Text Analysis mode and High-End Image Synthesis mode. In Image Mode, the input field glows purple with dynamic particle sparkles and prepends high-art prompt directives before sending to `gemini-3-pro-image-preview`.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-cyan-300 mb-1 print:text-blue-800">FR-03: Multimodal File Analysis Upload</h4>
                  <p className="text-gray-300 print:text-gray-800">Supports image, PDF, and PPTX uploads. Previews file name in a floating chip with pulse indicator. Converted into Base64 data URL and passed to `gemini-3-flash-preview` for deep architectural analysis.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-green-400 mb-1 print:text-green-800">FR-04: Code Block Syntax Highlighting & Copying</h4>
                  <p className="text-gray-300 print:text-gray-800">Renders markdown code blocks using `react-syntax-highlighter` with Prism `vscDarkPlus` theme. Includes language badge, instant clipboard copy with status feedback ('Copied'), and clean dark background styling.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-yellow-400 mb-1 print:text-amber-800">FR-05: Message Editing & Branch Re-Synthesis</h4>
                  <p className="text-gray-300 print:text-gray-800">User messages include an 'Edit Msg' button. Editing truncates conversation history up to that point and triggers a clean re-synthesis, enabling iterative prompt engineering without polluting chat history.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/10 rounded-xl print:bg-gray-100 print:border-gray-300">
                  <h4 className="font-bold text-sm text-red-400 mb-1 print:text-red-800">FR-06: Live Real-time Duplex Voice Interface</h4>
                  <p className="text-gray-300 print:text-gray-800">Tab switcher in Navbar opens `LiveArea`. Uses Web Audio API to record at 16kHz PCM, streams chunks in real-time over WebSocket, decodes 24kHz audio turns from Gemini Live, and features an interactive dynamic avatar with animated outer glow rings.</p>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: UI TOKENS */}
          {(activeTab === 'ui' || window.matchMedia('print').matches) && (
            <section className="space-y-6 animate-fade-in print:block">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight print:text-black">5. UI Tokens & Visual Theme System</h3>
                <p className="text-sm text-gray-400 print:text-gray-600">Color Palette, Glassmorphism & Micro-Interactions</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center text-center print:bg-gray-100 print:border-gray-300">
                  <div className="w-10 h-10 rounded-full bg-[#00b4d8] mb-2 shadow-[0_0_15px_rgba(0,180,216,0.5)]"></div>
                  <span className="font-bold text-white print:text-black">Primary Cyan</span>
                  <span className="font-mono text-gray-400">#00b4d8</span>
                </div>

                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center text-center print:bg-gray-100 print:border-gray-300">
                  <div className="w-10 h-10 rounded-full bg-[#0a192f] mb-2 border border-white/20"></div>
                  <span className="font-bold text-white print:text-black">Deep Navy</span>
                  <span className="font-mono text-gray-400">#0a192f</span>
                </div>

                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center text-center print:bg-gray-100 print:border-gray-300">
                  <div className="w-10 h-10 rounded-full bg-purple-500 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                  <span className="font-bold text-white print:text-black">Synth Purple</span>
                  <span className="font-mono text-gray-400">#a855f7</span>
                </div>

                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center text-center print:bg-gray-100 print:border-gray-300">
                  <div className="w-10 h-10 rounded-full bg-black mb-2 border border-white/20"></div>
                  <span className="font-bold text-white print:text-black">Canvas Black</span>
                  <span className="font-mono text-gray-400">#000000</span>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-xs text-gray-400 print:hidden">
          <span>WASO AI Assistant • Software Requirements Specification & PRD</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

export default SrsModal;


import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Image as ImageIcon, FileUp, X, Loader2, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string, file?: File, mode?: 'text' | 'image') => void;
  isProcessing: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [genMode, setGenMode] = useState<'text' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || isProcessing) return;
    onSendMessage(input, selectedFile || undefined, genMode);
    setInput('');
    setSelectedFile(null);
    // Reset to text mode after sending an image request
    setGenMode('text');
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error", e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toggleMode = (mode: 'image') => {
    setGenMode(genMode === mode ? 'text' : mode);
  };

  const getPlaceholder = () => {
    switch (genMode) {
      case 'image': return "Describe a high-end visual masterpiece for WASO to synthesize...";
      default: return "Collaborate with WASO...";
    }
  };

  const getModeStyles = () => {
    switch (genMode) {
      case 'image': return 'border-purple-500/40 ring-1 ring-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.2)]';
      default: return 'border-white/10 focus-within:border-[#00b4d8]/50 shadow-2xl';
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-4 md:py-6 px-3 md:px-0 relative z-20">
      <div className="w-full max-w-4xl">
        {selectedFile && (
          <div className="mb-3 ml-2 flex items-center space-x-3 bg-blue-500/20 text-white px-4 py-1.5 rounded-full w-fit border border-blue-500/30 shadow-2xl animate-fade-in backdrop-blur-md">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-tight truncate max-w-[180px] md:max-w-[300px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="p-1 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {genMode === 'image' && (
          <div className="mb-2 ml-4 flex items-center space-x-2 text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">
            <Sparkles size={12} />
            <span>Image Synthesis Engine Active</span>
          </div>
        )}

        <div className={`relative input-glass rounded-[28px] md:rounded-[32px] overflow-hidden border transition-all duration-500 group ${getModeStyles()}`}>
          <div className="flex items-end p-2 md:p-3">
            <div className="flex items-center space-x-0.5 md:space-x-1 pl-1 pb-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-[#00b4d8] rounded-full transition-all hover:bg-white/10 active:scale-90"
                title="Analysis Upload"
              >
                <FileUp size={20} />
              </button>
              <button 
                onClick={() => toggleMode('image')}
                className={`p-2 rounded-full transition-all active:scale-90 ${genMode === 'image' ? 'text-purple-400 bg-purple-500/15' : 'text-gray-400 hover:text-purple-400 hover:bg-white/10'}`}
                title="Professional Image Synthesis"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 px-3 text-white placeholder-gray-600 max-h-40 text-sm md:text-base leading-relaxed custom-scrollbar font-medium"
              rows={1}
            />

            <div className="flex items-center space-x-1 pr-1 pb-1">
              <button 
                onClick={toggleListen}
                className={`p-2.5 rounded-full transition-all active:scale-90 ${isListening ? 'text-red-400 bg-red-500/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:text-[#00b4d8] hover:bg-white/10'}`}
              >
                <Mic size={22} />
              </button>
              
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && !selectedFile) || isProcessing}
                className={`p-2.5 rounded-full transition-all ${
                  (!input.trim() && !selectedFile) || isProcessing
                  ? 'text-gray-700 bg-white/5 opacity-50 cursor-not-allowed' 
                  : `text-black ${genMode === 'image' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-gradient-to-r from-[#00b4d8] to-blue-500 hover:shadow-[0_0_20px_rgba(0,180,216,0.5)]'} active:scale-90`
                }`}
              >
                {isProcessing ? <Loader2 size={22} className="animate-spin text-gray-400" /> : <ArrowUp size={22} />}
              </button>
            </div>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.pptx"
        />
        
        <div className="flex justify-center mt-3 space-x-4 opacity-50">
           <p className="text-[9px] text-center text-gray-500 uppercase tracking-[0.25em] font-black">
             WASO CORE 2.5 • ARCHITECT WASIN
           </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;

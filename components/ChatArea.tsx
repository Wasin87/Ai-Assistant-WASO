
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Bot, User, Loader2, Edit2, Check, X as CloseIcon, Copy, ClipboardCheck, Download, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { gemini, decodeAudioData, decode } from '../services/geminiService';

interface ChatAreaProps {
  messages: Message[];
  isProcessing: boolean;
  processingMsg?: string;
  onEditMessage?: (id: string, newText: string) => void;
}

const CopyButton = ({ text, className = "" }: { text: string; className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
        copied ? 'text-green-400 bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
      } ${className}`}
      title="Copy text"
    >
      {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
      <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 group/code">
      <div className="pro-code-header flex items-center justify-between px-4 py-2.5 select-none bg-[#1a1a1a]">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 font-mono">{language || 'code'}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center space-x-1.5 text-[11px] font-medium text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <ClipboardCheck size={14} className="text-green-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      <div className="bg-[#000000] p-0 m-0">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '14px',
            backgroundColor: '#000000',
            lineHeight: '1.6',
            border: 'none',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", monospace',
              backgroundColor: 'transparent',
              display: 'block',
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isProcessing, processingMsg, onEditMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const speak = async (message: Message) => {
    if (playingId === message.id) {
      setPlayingId(null);
      return;
    }

    try {
      setPlayingId(message.id);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const base64Audio = await gemini.tts(message.content);
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContextRef.current,
          24000,
          1
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingId(null);
        source.start();
      } else {
        setPlayingId(null);
      }
    } catch (err) {
      console.error(err);
      setPlayingId(null);
    }
  };

  const startEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const submitEdit = (id: string) => {
    if (onEditMessage && editValue.trim()) {
      onEditMessage(id, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar space-y-4 md:space-y-6 pt-4 pb-12 px-1 md:px-2 scroll-smooth w-full"
    >
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex w-full md:max-w-[99%] space-x-1.5 md:space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse pl-2' : 'flex-row pr-2'}`}>
            <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all mt-1 ${msg.role === 'user' ? 'bg-[#00b4d8]/20 ring-1 ring-[#00b4d8]/30' : 'bg-white/10 ring-1 ring-white/20 shadow-lg'}`}>
              {msg.role === 'user' ? <User size={18} className="text-[#00b4d8]" /> : <Bot size={18} className="text-blue-400" />}
            </div>
            
            <div className="flex flex-col space-y-1 flex-1 min-w-0">
              <div className={`p-4 md:p-6 rounded-2xl relative group transition-all duration-300 shadow-xl w-full ${
                msg.role === 'user' 
                ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-tr-none' 
                : 'bg-[#0a192f]/50 backdrop-blur-md border border-white/5 text-gray-200 rounded-tl-none'
              }`}>
                {msg.imageUrl && (
                  <div className="relative group/img mb-5 max-w-3xl">
                    <img 
                      src={msg.imageUrl} 
                      alt="AI Generated" 
                      className="w-full rounded-xl shadow-2xl border border-white/10 animate-fade-in" 
                    />
                    <button 
                      onClick={() => downloadFile(msg.imageUrl!, `waso-gen-${msg.id}.png`)}
                      className="absolute top-4 right-4 p-3 bg-black/70 backdrop-blur-md text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all hover:bg-[#00b4d8] active:scale-90 shadow-2xl"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                )}
                
                {editingId === msg.id ? (
                  <div className="flex flex-col space-y-4 w-full">
                    <textarea 
                      className="bg-black/50 border border-[#00b4d8]/40 rounded-xl p-4 text-sm md:text-base text-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8] min-h-[150px] transition-all w-full"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-3">
                      <button onClick={cancelEditing} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-all">
                        <CloseIcon size={20} />
                      </button>
                      <button onClick={() => submitEdit(msg.id)} className="p-2.5 text-[#00b4d8] hover:text-[#00d8ff] hover:bg-white/5 rounded-full transition-all">
                        <Check size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-content select-text overflow-hidden">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const value = String(children).replace(/\n$/, '');
                          return !inline ? (
                            <CodeBlock language={match ? match[1] : ''} value={value} />
                          ) : (
                            <code className="bg-black/40 text-blue-300 px-1.5 py-0.5 rounded text-[13px] font-mono border border-white/5" {...props}>
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => <h1 className="text-2xl font-black mb-4 mt-6 text-[#00b4d8] border-b border-white/10 pb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 flex items-center"><span className="w-2.5 h-2.5 bg-[#00b4d8] mr-2.5 transform rotate-45"></span>{children}</h2>,
                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-[15px] md:text-[16px] opacity-90">{children}</p>,
                        ul: ({ children }) => <ul className="list-none space-y-2.5 mb-4 ml-2">{children}</ul>,
                        li: ({ children }) => <li className="flex items-start"><span className="text-[#00b4d8] mr-3 mt-1.5 scale-90">◆</span><span>{children}</span></li>,
                        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    <div className={`flex items-center flex-wrap gap-2 md:gap-3 mt-5 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {(msg.role === 'assistant' && msg.content) && (
                        <button 
                          onClick={() => speak(msg)}
                          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-[10px] font-black tracking-tighter uppercase transition-all ${
                            playingId === msg.id 
                            ? 'bg-[#00b4d8] text-black shadow-[0_0_20px_rgba(0,180,216,0.5)]' 
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {playingId === msg.id ? <VolumeX size={15} className="animate-pulse" /> : <Volume2 size={15} />}
                          <span>{playingId === msg.id ? 'Stop Voice' : 'Play Voice'}</span>
                        </button>
                      )}

                      <CopyButton text={msg.content} />

                      {msg.role === 'user' && !isProcessing && (
                        <button 
                          onClick={() => startEditing(msg)}
                          className="flex items-center space-x-2 px-3.5 py-2 text-gray-400 hover:text-[#00b4d8] hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Edit2 size={15} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Edit Msg</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {isProcessing && (
        <div className="flex justify-start items-center space-x-4 ml-4 py-6 animate-fade-in">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#0a192f] flex items-center justify-center ring-1 ring-blue-500/40">
              <Loader2 size={18} className="text-blue-400 animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full animate-ping opacity-30"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-[#00b4d8] uppercase tracking-widest">{processingMsg || 'Waso Analysis Mode'}</span>
            <span className="text-[10px] text-gray-500 font-semibold italic">Processing with deep multi-agent logic...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;

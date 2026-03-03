
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Loader2 } from 'lucide-react';
import { gemini, decode, decodeAudioData, createBlob } from '../services/geminiService';
import Avatar from './Avatar';

const LiveArea: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<any>(null);

  const stopLive = () => {
    setIsActive(false);
    setIsConnecting(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
  };

  const startLive = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = gemini.connectLive({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          
          const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: any) => {
          const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64EncodedAudioString) {
            setIsSpeaking(true);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
            const audioBuffer = await decodeAudioData(
              decode(base64EncodedAudioString),
              outputAudioContextRef.current!,
              24000,
              1,
            );
            const source = outputAudioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current!.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsSpeaking(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            for (const source of sourcesRef.current.values()) {
              try { source.stop(); } catch(e) {}
              sourcesRef.current.delete(source);
            }
            nextStartTimeRef.current = 0;
            setIsSpeaking(false);
          }
        },
        onerror: (e) => console.error('Live Error:', e),
        onclose: () => stopLive(),
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start live session:', err);
      setIsConnecting(false);
      alert("Please ensure your microphone is available.");
    }
  };

  useEffect(() => {
    return () => stopLive();
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 md:space-y-12">
      <div className="relative">
        <Avatar 
          isSpeaking={isSpeaking}
          className="w-48 h-48 md:w-64 md:h-64 transition-all duration-500" 
        />
        {isActive && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end justify-center space-x-1 h-8">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full ${isSpeaking ? 'animate-pulse' : 'opacity-20'}`}
                style={{ 
                  height: isSpeaking ? `${Math.random() * 100 + 20}%` : '20%',
                  transition: 'height 0.1s ease-in-out',
                  animationDelay: `${i * 0.1}s` 
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-3 px-6 text-center">
        <h2 className={`text-xl md:text-2xl font-black uppercase tracking-widest ${isSpeaking ? 'text-white' : 'text-[#00b4d8]'}`}>
          {isConnecting ? 'Initializing System' : isActive ? 'System Online' : 'Voice Assistant'}
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-[280px] md:max-w-sm font-medium">
          {isActive ? 'WASO is listening to your command.' : 'Enter professional voice mode for instant interaction.'}
        </p>
      </div>

      <div className="flex items-center space-x-6">
        {!isActive ? (
          <button 
            onClick={startLive}
            disabled={isConnecting}
            className="group relative flex items-center space-x-3 px-10 py-4 bg-[#00b4d8] hover:bg-[#0096b4] text-black font-black rounded-full transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            {isConnecting ? <Loader2 size={20} className="animate-spin" /> : <Radio size={20} />}
            <span className="text-sm md:text-base uppercase tracking-wider">{isConnecting ? 'Establishing Link...' : 'Initiate Live'}</span>
          </button>
        ) : (
          <button 
            onClick={stopLive}
            className="flex items-center space-x-3 px-10 py-4 bg-white/5 border border-red-500/50 text-red-500 hover:bg-red-500/10 font-black rounded-full transition-all shadow-xl active:scale-95"
          >
            <PhoneOff size={20} />
            <span className="text-sm md:text-base uppercase tracking-wider">Terminate</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveArea;

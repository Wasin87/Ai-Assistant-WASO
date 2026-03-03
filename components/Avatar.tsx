
import React from 'react';

interface AvatarProps {
  className?: string;
  isSpeaking?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ className = "", isSpeaking = false }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {/* Dynamic Outer Glow for Speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 blur-2xl opacity-40 animate-pulse scale-125"></div>
      )}
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[#00b4d8] rounded-full blur-3xl opacity-10 animate-pulse"></div>
      
      {/* Speaking Pulse Rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full animate-ping-slow"></div>
          <div className="absolute inset-[-10px] border border-blue-500/30 rounded-full animate-ping-slower"></div>
        </>
      )}

      {/* Avatar Container - Removed solid dark background as requested */}
      <div className={`relative w-full h-full rounded-full transition-all duration-500 flex items-center justify-center ${
        isSpeaking ? 'scale-110' : 'scale-100'
      }`}>
        <img 
          src="https://i.ibb.co.com/TBzBrKdg/Av-removebg-preview.png" 
          alt="WASO Avatar" 
          className="w-full h-full object-contain transform transition-transform duration-500"
        />
        
        {/* Decorative Animated Rings */}
        <div className={`absolute inset-0 border-[2px] border-t-[#00b4d8]/40 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-fast ${isSpeaking ? 'opacity-100' : 'opacity-40'}`}></div>
        <div className={`absolute inset-4 border-[1px] border-b-[#00b4d8]/30 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-reverse ${isSpeaking ? 'opacity-80' : 'opacity-20'}`}></div>
      </div>
      
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 3s linear infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Avatar;

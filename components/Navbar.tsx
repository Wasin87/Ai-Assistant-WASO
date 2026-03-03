
import React from 'react';
import { History, Plus, MessageSquare, Radio } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  onNewChat: () => void;
  activeTab: 'chat' | 'live';
  onTabChange: (tab: 'chat' | 'live') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onNewChat, activeTab, onTabChange }) => {
  return (
    <nav className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 glass-effect z-10 w-full shrink-0">
      <div className="flex items-center space-x-2 md:space-x-3 group">
        <img 
          src="https://i.ibb.co.com/Hp1PLn3q/Ai-removebg-preview.png" 
          alt="WASO Logo" 
          className="w-8 h-8 md:w-10 md:h-10 object-contain group-hover:scale-110 transition-transform cursor-pointer"
        />
        <span className="font-extrabold text-lg md:text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-blue-400 to-cyan-300 drop-shadow-sm">
          WASO
        </span>
      </div>

      <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10 mx-2 shadow-inner">
        <button 
          onClick={() => onTabChange('chat')}
          className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 rounded-full transition-all text-xs md:text-sm font-semibold ${
            activeTab === 'chat' 
            ? 'bg-gradient-to-r from-[#00b4d8] to-blue-500 text-black shadow-[0_0_15px_rgba(0,180,216,0.4)]' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button 
          onClick={() => onTabChange('live')}
          className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 rounded-full transition-all text-xs md:text-sm font-semibold ${
            activeTab === 'live' 
            ? 'bg-gradient-to-r from-[#00b4d8] to-blue-500 text-black shadow-[0_0_15px_rgba(0,180,216,0.4)]' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio size={14} />
          <span className="hidden sm:inline">Live</span>
        </button>
      </div>

      <div className="flex items-center space-x-1 md:space-x-2">
        <button 
          onClick={onOpenSidebar}
          className="p-2 text-gray-400 hover:text-[#00b4d8] hover:bg-white/10 rounded-lg transition-all"
          title="History"
        >
          <History size={20} />
        </button>
        
        <button 
          onClick={onNewChat}
          className="p-2 text-gray-400 hover:text-[#00b4d8] hover:bg-white/10 rounded-lg transition-all"
          title="New Chat"
        >
          <Plus size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

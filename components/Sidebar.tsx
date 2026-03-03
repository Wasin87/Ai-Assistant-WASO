
import React from 'react';
import { X, MessageSquare, Trash2, Plus } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onSelectSession,
  onNewChat,
  onDeleteSession
}) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 bottom-0 w-80 glass-effect border-r border-white/10 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-lg font-bold">Chat History</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <button 
              onClick={() => { onNewChat(); onClose(); }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-[#00b4d8] hover:bg-[#0096b4] text-black font-semibold rounded-xl transition-colors mb-4"
            >
              <Plus size={20} />
              <span>New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-6">
            {sessions.map(session => (
              <div 
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  currentSessionId === session.id 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => { onSelectSession(session.id); onClose(); }}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <MessageSquare size={18} className={currentSessionId === session.id ? 'text-[#00b4d8]' : 'text-gray-500'} />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                No recent chats
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import LiveArea from './components/LiveArea';
import Avatar from './components/Avatar';
import { ChatSession, Message } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'live'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('WASO Analysis Mode');
  
  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    const saved = localStorage.getItem('waso_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('waso_chats', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
    setActiveTab('chat');
  };

  const handleSendMessage = async (text: string, file?: File, mode: 'text' | 'image' = 'text') => {
    if (!currentSessionId || (!text && !file)) return;

    setIsProcessing(true);
    setProcessingMsg(mode === 'image' ? 'WASO Image Synthesis' : 'WASO Analysis Mode');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: file ? (file.type.startsWith('image/') ? 'image' : 'file') : (mode as any),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? (text.slice(0, 30) || (mode === 'image' ? 'Image Generation' : 'Interaction')) : s.title,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    try {
      let aiResponse: string | null = '';
      let imageUrl: string | undefined;

      if (mode === 'image') {
        setProcessingMsg('Synthesizing Visual Latents...');
        const result = await gemini.generateImage(text);
        if (result.url) {
          aiResponse = "Generated visual masterpiece:";
          imageUrl = result.url;
        } else {
          aiResponse = result.error || "WASO was unable to complete the visual synthesis.";
        }
      } else if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result?.toString().split(',')[1];
          if (base64) {
            const resp = await gemini.processMultimodal(text, base64, file.type);
            addAiMessage(resp || 'Failed to process file.');
          }
        };
        reader.readAsDataURL(file);
        return;
      } else {
        const history = currentSession?.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })) || [];
        aiResponse = await gemini.generateTextResponse(text, history);
      }

      if (aiResponse) addAiMessage(aiResponse, imageUrl);
    } catch (err) {
      console.error(err);
      addAiMessage("An unexpected neural interrupt occurred during synthesis.");
    } finally {
      setIsProcessing(false);
      setProcessingMsg('WASO Analysis Mode');
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!currentSessionId || !newText.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const msgIndex = s.messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return s;
        
        const newMessages = s.messages.slice(0, msgIndex);
        return {
          ...s,
          messages: newMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    await handleSendMessage(newText);
  };

  const addAiMessage = (content: string, imageUrl?: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      imageUrl,
      timestamp: Date.now(),
      type: imageUrl ? 'image' : 'text',
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, aiMessage], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) setCurrentSessionId(remaining[0].id);
      else createNewChat();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full theme-gradient text-white overflow-hidden" style={{ height: 'var(--dvh)' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
      />
      
      <Navbar 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChat={createNewChat}
      />
      
      <div className="flex-1 relative flex flex-col min-w-0 w-full overflow-hidden">
        <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col w-full mx-auto px-1.5 md:px-4 relative overflow-hidden">
              {currentSession?.messages.length === 0 && !isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in text-center space-y-4 md:space-y-6 px-4 z-0 pointer-events-none">
                  <Avatar className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_30px_rgba(0,180,216,0.3)] pointer-events-auto" />
                  <div className="pointer-events-auto">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                      Hey, I am WASO
                    </h1>
                    <p className="text-gray-400 max-w-sm md:text-lg mt-2">
                      Professional AI Assistant. I can generate high-end visual masterpieces. Wasin created me.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-hidden relative flex flex-col w-full">
                <ChatArea 
                  messages={currentSession?.messages || []} 
                  isProcessing={isProcessing}
                  processingMsg={processingMsg}
                  onEditMessage={handleEditMessage}
                />
              </div>

              <div className="shrink-0 w-full max-w-5xl mx-auto">
                <InputArea 
                  onSendMessage={handleSendMessage} 
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-4xl mx-auto px-4 h-full flex flex-col overflow-hidden">
              <LiveArea />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

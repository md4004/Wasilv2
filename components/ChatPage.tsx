
import React, { useState, useEffect, useRef } from 'react';
import { Dispatcher, User, Message } from '../types';

interface ChatPageProps {
  currentUser: User;
  dispatchers: Dispatcher[];
  activeDispatcherIds: string[];
  initialDispatcherId?: string | null;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, dispatchers, activeDispatcherIds, initialDispatcherId }) => {
  // Only show dispatchers who are active for the user
  const activeDispatchers = dispatchers.filter(d => activeDispatcherIds.includes(d.id));
  
  const [selectedDispId, setSelectedDispId] = useState(
    initialDispatcherId || activeDispatchers[0]?.id || ''
  );

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'disp-1': [
      { id: '1', senderId: 'disp-1', text: 'Marhaba Jad, I am heading to Mama Layla now. I have the batteries ready.', timestamp: '10:15 AM' },
      { id: '2', senderId: 'user', text: 'Thank you Samer. Please check the solar panels for dust as well.', timestamp: '10:17 AM' }
    ],
    'disp-2': [
      { id: '1', senderId: 'disp-2', text: 'Hello Jad, the medication for Baba Samir is secured.', timestamp: 'Yesterday' }
    ]
  });
  
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedDisp = dispatchers.find(d => d.id === selectedDispId);
  const currentChat = messages[selectedDispId] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat]);

  // Update selection if prop changes
  useEffect(() => {
    if (initialDispatcherId && activeDispatcherIds.includes(initialDispatcherId)) {
      setSelectedDispId(initialDispatcherId);
    }
  }, [initialDispatcherId, activeDispatcherIds]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [selectedDispId]: [...(prev[selectedDispId] || []), newMessage]
    }));
    setInputText('');
  };

  if (activeDispatchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] bg-white rounded-[3rem] border border-navy/5 shadow-sm p-12 text-center animate-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center text-4xl mb-6">💬</div>
        <h3 className="text-2xl font-serif font-bold text-navy mb-2">No Active Conversations</h3>
        <p className="text-navy/40 max-w-sm">Secure messaging is activated when a service request is assigned to a dispatcher.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Dispatcher List */}
      <div className="w-80 hidden md:flex flex-col bg-white rounded-3xl border border-navy/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy/5 bg-sand/20">
          <h3 className="font-serif font-bold text-navy">Active Dispatchers</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-navy/5">
          {activeDispatchers.map(disp => (
            <button 
              key={disp.id}
              onClick={() => setSelectedDispId(disp.id)}
              className={`w-full p-4 flex items-center gap-4 transition-all ${
                selectedDispId === disp.id ? 'bg-sage/10' : 'hover:bg-sand/30'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                <img src={disp.photoUrl} alt={disp.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-bold text-navy text-sm truncate">{disp.name}</p>
                <p className="text-[10px] text-navy/40 truncate uppercase tracking-tighter">{disp.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Window */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-navy/5 shadow-sm overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-navy/5 flex justify-between items-center bg-sand/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src={selectedDisp?.photoUrl} alt={selectedDisp?.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-navy text-sm">{selectedDisp?.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-navy/30 uppercase tracking-widest">Active Member</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-navy/5 text-navy/40 transition-colors" title="Audio Call">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
            <button className="p-2 rounded-full hover:bg-navy/5 text-navy/40 transition-colors" title="Video Call">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sand/5">
          {currentChat.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.senderId === 'user' 
                  ? 'bg-navy text-sand' 
                  : 'bg-sage text-navy'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${msg.senderId === 'user' ? 'opacity-40' : 'opacity-60'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 md:p-6 bg-white border-t border-navy/5">
          <div className="flex items-center gap-3 bg-sand rounded-2xl p-2 pl-4">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-navy placeholder:text-navy/20"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-navy text-sand w-10 h-10 rounded-xl flex items-center justify-center hover:bg-navy/90 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;


import React, { useState, useEffect, useRef } from 'react';
import { ServiceRequest, User, Dispatcher, Message } from '../types';

interface ChatModalProps {
  request: ServiceRequest;
  onClose: () => void;
  currentUser: User;
  dispatcher: Dispatcher;
}

const ChatModal: React.FC<ChatModalProps> = ({ request, onClose, currentUser, dispatcher }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      senderId: dispatcher.id, 
      text: `Marhaba ${currentUser.name.split(' ')[0]}, I am your dispatcher for the ${request.serviceTitle} request. How can I help?`, 
      timestamp: 'Just now' 
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#FDFCF8] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Chat Header */}
        <div className="p-6 border-b border-navy/5 flex justify-between items-center bg-sand/20 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={dispatcher.photoUrl} alt={dispatcher.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-navy text-lg leading-none mb-1">Mission Support</h3>
              <p className="text-[10px] text-sage font-bold uppercase tracking-widest">{request.id.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Notice */}
        <div className="bg-sage/10 px-6 py-2 border-b border-sage/10 text-center">
          <p className="text-[9px] font-bold text-sage uppercase tracking-widest">
            This chat will close when the task is marked Complete.
          </p>
        </div>

        {/* Messages Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.senderId === 'user' 
                  ? 'bg-navy text-sand rounded-br-none' 
                  : 'bg-white text-navy border border-navy/5 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Footer / Input */}
        <div className="p-6 pb-12 bg-white border-t border-navy/5">
          <div className="flex items-center gap-3 bg-sand/50 rounded-2xl p-2 pl-4 border border-navy/5 shadow-inner">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message Samer..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-navy placeholder:text-navy/30"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-navy text-sand w-12 h-12 rounded-xl flex items-center justify-center hover:bg-navy shadow-lg active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

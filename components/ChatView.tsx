
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Message, MessageType } from '../types';
import { BADGES } from '../constants';

interface ChatViewProps {
  partner: UserProfile;
  onBack: () => void;
  onShowDetails: (user: UserProfile) => void;
}

const MOCK_GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGpxas3CCKe6A/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlSno60Q855h3l6/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26AHG5K9V94S58i1G/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeJpnrWC4XWblM4/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZXR4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTfuxV5F60S9y/giphy.gif"
];

const ChatView: React.FC<ChatViewProps> = ({ partner, onBack }) => {
  const { currentUser, messages, addMessage, deleteMessage, markAsRead, toggleLikeMessage, setAppState, typingStates, setTypingStatus } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isNudging, setIsNudging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<number>(0);
  const typingTimeoutRef = useRef<number | null>(null);

  const chatMessages = useMemo(() => {
    if (!currentUser) return [];
    return messages
      .filter(m => 
        (m.senderId === currentUser.id && m.recipientId === partner.id) ||
        (m.senderId === partner.id && m.recipientId === currentUser.id)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, currentUser?.id, partner.id]);

  const isPartnerTyping = useMemo(() => {
    return typingStates[partner.id] === currentUser?.id;
  }, [typingStates, partner.id, currentUser?.id]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, isPartnerTyping]);

  useEffect(() => {
    if (partner.id && currentUser?.id) {
      markAsRead(partner.id);
    }
  }, [partner.id, chatMessages.length, currentUser?.id, markAsRead]);

  // Handle notifying typing status
  useEffect(() => {
    if (!currentUser) return;
    if (inputText.trim()) {
      setTypingStatus(currentUser.id, partner.id);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        setTypingStatus(currentUser.id, null);
      }, 3000);
    } else {
      setTypingStatus(currentUser.id, null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [inputText, currentUser?.id, partner.id, setTypingStatus]);

  const sendMessage = (type: MessageType, content: string) => {
    if (!currentUser || (type === 'text' && !content.trim())) return;
    
    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 12),
      senderId: currentUser.id,
      recipientId: partner.id,
      content,
      type,
      timestamp: Date.now(),
      isRead: false,
      isDelivered: true, // In this mock, it's immediately delivered
      readAt: null
    };
    
    addMessage(newMsg);
    setInputText('');
    setShowGifPicker(false);
    setTypingStatus(currentUser.id, null);
  };

  const handleNudge = () => {
    setIsNudging(true);
    sendMessage('nudge', 'Knuff!');
    setTimeout(() => setIsNudging(false), 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      setAppState({ maintenanceMode: false, globalNotification: "Geolocation stöds ej." });
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      sendMessage('location', `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
    }, () => {
      setAppState({ maintenanceMode: false, globalNotification: "Kunde inte hämta din plats." });
    });
  };

  const handleReaction = (msgId: string) => {
    toggleLikeMessage(msgId);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm("Ta bort meddelandet permanent?")) {
      deleteMessage(id);
      setSwipingId(null);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-950 transition-all duration-500 relative overflow-hidden ${isNudging ? 'shake' : ''}`}>
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.05),transparent_50%)] pointer-events-none"></div>
      
      <input type="file" ref={imageInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />

      {/* Premium Sticky Header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-gray-900/40 backdrop-blur-3xl sticky top-0 z-[60] h-24 shadow-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90 bg-white/5 rounded-2xl border border-white/10">
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowMenu(true)}>
            <div className="relative">
              <img src={partner.profileImage} className="w-14 h-14 rounded-2xl border-2 border-white/10 object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-[3.5px] border-gray-900 ${partner.isOnline ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-gray-600'}`}></div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-[17px] text-white truncate tracking-tighter uppercase ${partner.usernameGlow ? 'username-glow' : ''}`} style={partner.usernameGlow ? { '--glow-color': partner.usernameGlow } as any : {}}>
                  {partner.displayName}
                </span>
                {partner.isVerified && <i className="fas fa-check-circle text-blue-400 text-[11px]"></i>}
                {partner.isAdmin && <i className="fas fa-shield-halved text-red-500 text-[11px]"></i>}
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${partner.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                  {partner.isOnline ? 'ONLINE' : 'OFFLINE'}
                </p>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 truncate">{partner.city}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleNudge} 
            className="w-11 h-11 flex items-center justify-center bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-amber-500/20 shadow-xl"
          >
             <i className="fas fa-hand-point-right"></i>
          </button>
          <button 
            onClick={() => setShowMenu(true)} 
            className="w-11 h-11 flex items-center justify-center bg-white/5 text-gray-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-white/10"
          >
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-1 scroll-smooth scrollbar-hide bg-transparent" 
        ref={containerRef}
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-10 animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-gray-900/60 rounded-[3.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50 animate-pulse"></div>
               <i className="fas fa-comment-alt-lines text-5xl text-amber-500/20 group-hover:text-amber-500/40 transition-all duration-700"></i>
            </div>
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.5em] mb-4">Inga meddelanden än</h3>
            <p className="text-[11px] font-medium text-gray-500 max-w-[220px] leading-relaxed uppercase tracking-tighter italic">Börja konversationen genom att skicka en hälsning eller en knuff!</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.id;
            const isSwiping = swipingId === msg.id;
            const isHeartMsg = msg.content === '❤️';
            const isConsecutive = idx > 0 && chatMessages[idx-1].senderId === msg.senderId;
            const showAvatar = !isMe && !isConsecutive;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end gap-2.5 relative ${isConsecutive ? 'mt-0.5' : 'mt-5'} ${isMe ? 'animate-message-in-right' : 'animate-message-in-left'}`}
                onDoubleClick={() => handleReaction(msg.id)}
                onTouchStart={(e) => { touchStartRef.current = e.touches[0].clientX; }}
                onTouchMove={(e) => {
                  const diff = touchStartRef.current - e.touches[0].clientX;
                  if (isMe && diff > 60) setSwipingId(msg.id);
                  else if (!isMe && diff < -60) setSwipingId(msg.id);
                  if (Math.abs(diff) < 20) setSwipingId(null);
                }}
              >
                {!isMe && (
                  <div className="w-8 shrink-0 mb-0.5">
                    {showAvatar ? (
                      <img src={partner.profileImage} className="w-8 h-8 rounded-xl object-cover border border-white/5 shadow-lg" alt="" />
                    ) : <div className="w-8" />}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] transition-all duration-500 ${isSwiping ? (isMe ? '-translate-x-14' : 'translate-x-14') : ''}`}>
                  <div className={`message-bubble relative group/bubble ${
                    isMe 
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_4px_15px_-3px_rgba(245,158,11,0.3)]' 
                    : 'bg-white/5 text-gray-100 border border-white/5'
                  } ${['gif', 'image'].includes(msg.type) ? 'p-1' : 'p-3 px-4'} ${
                    isMe 
                    ? (isConsecutive ? 'rounded-2xl rounded-tr-sm rounded-br-sm' : 'rounded-2xl rounded-tr-none rounded-br-none' )
                    : (isConsecutive ? 'rounded-2xl rounded-tl-sm rounded-bl-sm' : 'rounded-2xl rounded-tl-none rounded-bl-none' )
                  }`}>
                    
                    {msg.type === 'text' && (
                      <p className={`text-[15px] font-bold leading-snug whitespace-pre-wrap tracking-tight ${isHeartMsg ? 'text-4xl py-2 animate-bounce' : ''}`}>
                        {msg.content}
                      </p>
                    )}
                    
                    {msg.type === 'gif' && (
                      <img src={msg.content} className="w-64 h-auto rounded-xl object-cover" alt="GIF" />
                    )}

                    {msg.type === 'image' && (
                      <div className="relative rounded-xl overflow-hidden cursor-pointer group/img" onClick={() => setZoomedImage(msg.content)}>
                        <img src={msg.content} className="max-w-[260px] h-auto object-cover" alt="Img" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                           <i className="fas fa-expand text-white text-xl"></i>
                        </div>
                      </div>
                    )}

                    {msg.type === 'location' && (
                      <div className="flex flex-col gap-3 min-w-[200px] p-1">
                        <div className="bg-gray-800 rounded-xl h-28 relative overflow-hidden cursor-pointer shadow-inner" onClick={() => window.open(msg.content, '_blank')}>
                           <div className="absolute inset-0 flex items-center justify-center bg-gray-950/40">
                             <i className="fas fa-map-pin text-amber-500 text-4xl animate-bounce"></i>
                           </div>
                           <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg">
                             <p className="text-[8px] font-black text-center text-white uppercase tracking-widest">MIN POSITION</p>
                           </div>
                        </div>
                        <button onClick={() => window.open(msg.content, '_blank')} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isMe ? 'bg-white/10 text-white' : 'bg-amber-500 text-white'}`}>ÖPPNA I KARTA</button>
                      </div>
                    )}
                    
                    {msg.type === 'nudge' && (
                      <div className="flex items-center gap-3 py-1.5 px-2 animate-pulse">
                        <i className="fas fa-hand-point-right text-xl text-white"></i>
                        <p className="text-[12px] font-black uppercase tracking-[0.2em]">KNUFF!</p>
                      </div>
                    )}

                    {/* Liked Indicator */}
                    {msg.liked && (
                      <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-gray-900 border border-white/10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300`}>
                        <i className="fas fa-heart text-[10px] text-red-500"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp & Status Logic */}
                  {!isConsecutive && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <div className="flex items-center gap-1.5">
                           {msg.isRead ? (
                             <>
                               <i className="fas fa-check-double text-[8px] text-blue-400"></i>
                               <span className="text-[7px] font-black uppercase tracking-widest text-blue-400">LÄST</span>
                             </>
                           ) : msg.isDelivered ? (
                             <>
                               <i className="fas fa-check-double text-[8px] text-gray-700"></i>
                               <span className="text-[7px] font-black uppercase tracking-widest text-gray-700">LEVERERAT</span>
                             </>
                           ) : (
                             <>
                               <i className="fas fa-check text-[8px] text-gray-800"></i>
                               <span className="text-[7px] font-black uppercase tracking-widest text-gray-800">SKICKAT</span>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isSwiping && (
                   <button onClick={() => handleDeleteMessage(msg.id)} className={`absolute ${isMe ? 'right-0' : 'left-0'} top-0 bottom-0 w-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-xl z-50 animate-in slide-in-from-${isMe ? 'right' : 'left'} duration-300`}>
                     <i className="fas fa-trash-alt"></i>
                   </button>
                )}
              </div>
            );
          })
        )}

        {isPartnerTyping && (
          <div className="flex items-center gap-3 mt-4 animate-in fade-in duration-300">
            <img src={partner.profileImage} className="w-8 h-8 rounded-xl object-cover border border-white/5 shadow-lg" alt="" />
            <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">Skriver</span>
              <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce delay-0"></div>
              <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Modern Input Console */}
      <div className="px-4 pb-10 pt-4 bg-transparent z-[70]">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          
          {showGifPicker && (
            <div className="bg-gray-900/80 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 mb-2">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Snabba GIFs</span>
                <button onClick={() => setShowGifPicker(false)} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_GIFS.map((gif, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform" onClick={() => sendMessage('gif', gif)}>
                    <img src={gif} className="w-full h-full object-cover" alt="GIF" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-3xl p-2 rounded-[2.2rem] border border-white/10 shadow-2xl ring-1 ring-white/5">
            <div className="flex gap-1 pl-1">
              <button 
                onClick={() => setShowGifPicker(!showGifPicker)} 
                className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${showGifPicker ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                <i className="fas fa-bolt"></i>
              </button>
              <button 
                onClick={() => cameraInputRef.current?.click()} 
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-all"
              >
                <i className="fas fa-camera"></i>
              </button>
            </div>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage('text', inputText)}
              placeholder="Skriv ett meddelande..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-gray-100 placeholder:text-gray-700 px-2"
            />

            <div className="flex gap-1 pr-1">
              {inputText.trim() ? (
                <button onClick={() => sendMessage('text', inputText)} className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                  <i className="fas fa-paper-plane"></i>
                </button>
              ) : (
                <>
                  <button onClick={() => imageInputRef.current?.click()} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-all">
                    <i className="fas fa-image"></i>
                  </button>
                  <button onClick={handleLocationShare} className="w-11 h-11 bg-white/5 text-gray-500 border border-white/5 rounded-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-amber-500 hover:text-white">
                    <i className="fas fa-location-arrow"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-[100] glass-dark flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowMenu(false)}>
          <div className="bg-gray-950 w-full max-w-sm rounded-[3.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <img src={partner.profileImage} className="w-40 h-40 rounded-[3rem] border-[6px] border-gray-900 object-cover shadow-2xl" alt="" />
                {partner.isOnline && <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 border-[6px] border-gray-950 rounded-full"></div>}
              </div>
              
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className={`text-3xl font-black text-white uppercase tracking-tighter ${partner.usernameGlow ? 'username-glow' : ''}`} style={partner.usernameGlow ? { '--glow-color': partner.usernameGlow } as any : {}}>
                    {partner.displayName}
                  </h2>
                  {partner.isVerified && <i className="fas fa-check-circle text-blue-400 text-xl"></i>}
                </div>
                <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.3em]">@{partner.username}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                   {partner.isAdmin && BADGES.admin}
                   {partner.isVIP && BADGES.vip}
                   {partner.isVerified && BADGES.verified}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-[8px] text-gray-600 uppercase font-black mb-2 tracking-widest">HEMSTAD</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{partner.city}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-[8px] text-gray-600 uppercase font-black mb-2 tracking-widest">KÖN</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{partner.gender}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowMenu(false)} 
                className="w-full bg-amber-500 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                FORTSÄTT CHATTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Zoom Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoom" className="max-w-full max-h-full rounded-[2rem] object-contain shadow-2xl border border-white/10" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl"><i className="fas fa-times-circle"></i></button>
        </div>
      )}
    </div>
  );
};

export default ChatView;

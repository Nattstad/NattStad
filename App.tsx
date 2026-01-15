
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { BOT_ID } from './constants';
import LoginPage from './components/LoginPage';
import ChatView from './components/ChatView';
import DiscoveryView from './components/DiscoveryView';
import FriendsView from './components/FriendsView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import Notifications from './components/Notifications';
import CreateGroupModal from './components/CreateGroupModal';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    appState, 
    logout, 
    users, 
    setUsers,
    messages,
    groups,
    deleteChat,
    theme 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'discovery' | 'profile'>('chats');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [swipingChatId, setSwipingChatId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const updateStatus = () => {
        setUsers(prev => prev.map(u => 
          u.id === currentUser.id 
            ? { ...u, isOnline: true, lastActive: Date.now() } 
            : u
        ));
      };
      updateStatus();
      const interval = setInterval(updateStatus, 30000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentUser, setUsers]);

  if (appState.maintenanceMode && !currentUser?.isAdmin) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-950 p-6 text-center">
        <i className="fas fa-tools text-6xl text-amber-500 mb-6"></i>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Appen uppdateras</h1>
        <p className="text-gray-500 mt-4 max-w-md text-xs font-bold uppercase tracking-widest">Vi utför underhåll för att förbättra tjänsten. Vi är snart tillbaka!</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'}>
        <LoginPage />
      </div>
    );
  }

  const renderContent = () => {
    if (showAdmin && currentUser.isAdmin) {
      return <AdminPanel onClose={() => setShowAdmin(false)} />;
    }

    if (selectedChatUserId) {
      const chatPartner = users.find(u => u.id === selectedChatUserId);
      if (!chatPartner) return null;
      return (
        <ChatView 
          partner={chatPartner} 
          onBack={() => setSelectedChatUserId(null)} 
          onShowDetails={(user) => {}}
        />
      );
    }

    switch (activeTab) {
      case 'chats':
        const recentMessages = messages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id);
        const chatPartners = Array.from(new Set(recentMessages.map(m => m.senderId === currentUser.id ? m.recipientId : m.senderId)));
        const myGroups = groups.filter(g => g.members.includes(currentUser.id));

        return (
          <div className="flex flex-col h-full bg-gray-950">
            <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/90 backdrop-blur-md sticky top-0 z-10 h-20">
              <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase">NATTSTAD</h1>
              <div className="flex gap-2">
                {currentUser.isAdmin && (
                  <button onClick={() => setShowAdmin(true)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20">
                    <i className="fas fa-shield-halved"></i>
                  </button>
                )}
                <button 
                  onClick={() => setShowCreateGroup(true)} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${currentUser.isVIP ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-gray-800 text-gray-600 border-gray-700'}`}
                >
                  <i className="fas fa-users-medical"></i>
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
              {chatPartners.length === 0 && myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-gray-700 text-center px-10">
                  <div className="w-20 h-20 bg-gray-900/40 rounded-3xl flex items-center justify-center mb-6 border border-gray-800/50">
                    <i className="fas fa-comment-dots text-3xl opacity-10"></i>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Inga aktiva nätter än</p>
                  <p className="text-[10px] mt-2 leading-relaxed font-bold">Hitta vänner i Upptäck-fliken eller skapa en grupp för att börja chatta!</p>
                  
                  <button 
                    onClick={() => setSelectedChatUserId(BOT_ID)}
                    className="mt-8 px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    TESTA CHATTEN MED NATTBOT 🤖
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-900">
                  {myGroups.map(group => (
                    <div key={group.id} className="flex items-center p-4 gap-4 bg-gray-950/40 hover:bg-gray-900/40 transition-all border-b border-gray-900/40">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg border border-white/10">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                           <span className="font-black text-[14px] text-gray-100 uppercase tracking-tight truncate">{group.name}</span>
                           <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-black">GRUPP</span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-bold">{group.members.length} medlemmar</p>
                      </div>
                    </div>
                  ))}

                  {chatPartners.map(pId => {
                    const partner = users.find(u => u.id === pId);
                    if (!partner) return null;
                    const chatMsgs = messages.filter(m => 
                      (m.senderId === currentUser.id && m.recipientId === pId) || 
                      (m.senderId === pId && m.recipientId === currentUser.id)
                    ).sort((a, b) => b.timestamp - a.timestamp);
                    const lastMsg = chatMsgs[0];
                    const unreadCount = chatMsgs.filter(m => m.senderId === pId && !m.isRead).length;

                    return (
                      <div 
                        key={pId}
                        className="relative overflow-hidden group touch-pan-x"
                        onTouchStart={(e) => { (e.currentTarget as any).startX = e.touches[0].clientX; }}
                        onTouchMove={(e) => {
                           const diff = (e.currentTarget as any).startX - e.touches[0].clientX;
                           if (diff > 50) setSwipingChatId(pId);
                           if (diff < -50) setSwipingChatId(null);
                        }}
                      >
                        <div 
                          onClick={() => setSelectedChatUserId(pId)}
                          className={`flex items-center p-4 gap-4 bg-gray-950 border-b border-gray-900/40 transition-all duration-300 hover:bg-gray-900/20 ${swipingChatId === pId ? '-translate-x-20' : ''}`}
                        >
                          <div className="relative">
                            <img src={partner.profileImage} alt="" className="w-14 h-14 rounded-2xl object-cover border border-gray-800" />
                            {partner.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`font-black text-[14px] text-gray-100 uppercase tracking-tight truncate ${partner.usernameGlow ? 'username-glow' : ''}`} style={partner.usernameGlow ? { '--glow-color': partner.usernameGlow } as any : {}}>{partner.displayName}</span>
                                {partner.isVerified && <i className="fas fa-check-circle text-blue-400 text-[10px]"></i>}
                                {partner.isAdmin && <i className="fas fa-shield-halved text-red-500 text-[10px]"></i>}
                              </div>
                              <span className="text-[9px] font-black text-gray-600 uppercase">
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className={`text-xs font-bold truncate pr-4 ${unreadCount > 0 ? 'text-gray-100' : 'text-gray-600'}`}>
                                {lastMsg?.type === 'text' ? lastMsg.content : lastMsg?.type ? `[${lastMsg.type.toUpperCase()}]` : 'Starta en konversation'}
                              </p>
                              {unreadCount > 0 && <span className="bg-amber-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/30">{unreadCount}</span>}
                            </div>
                          </div>
                        </div>
                        {swipingChatId === pId && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm("Radera chatten permanent?")) deleteChat(pId); setSwipingChatId(null); }}
                            className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 text-white flex items-center justify-center animate-in slide-in-from-right duration-200"
                          >
                            <i className="fas fa-trash-alt text-lg"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
          </div>
        );
      case 'discovery': return <DiscoveryView onChat={(id) => { setSelectedChatUserId(id); setActiveTab('chats'); }} />;
      case 'friends': return <FriendsView onChat={(id) => { setSelectedChatUserId(id); setActiveTab('chats'); }} />;
      case 'profile': return <ProfileView onLogout={logout} onZoomImage={setZoomedImage} />;
      default: return null;
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Notifications />
      <main className="flex-1 relative overflow-hidden">{renderContent()}</main>

      {!selectedChatUserId && !showAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/95 backdrop-blur-3xl flex justify-around items-center px-6 border-t border-gray-800/50 z-50">
          {[
            { id: 'chats', icon: 'fa-comment-dots', label: 'CHAT' },
            { id: 'discovery', icon: 'fa-compass', label: 'UPPTÄCK' },
            { id: 'friends', icon: 'fa-user-group', label: 'VÄNNER' },
            { id: 'profile', icon: 'fa-user-circle', label: 'PROFIL' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === tab.id ? 'text-amber-500' : 'text-gray-600'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-0.5 transition-all ${activeTab === tab.id ? 'bg-amber-500/10' : ''}`}>
                <i className={`fas ${tab.icon} text-lg`}></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoom" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
          <button className="absolute top-8 right-8 text-white text-3xl"><i className="fas fa-times"></i></button>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <MainAppContent />
  </AuthProvider>
);

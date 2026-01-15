
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { CITIES, GENDER_CONFIG, BADGES } from '../constants';
import { UserProfile } from '../types';

interface DiscoveryViewProps {
  onChat: (userId: string) => void;
}

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ onChat }) => {
  const { users, currentUser, setUsers, setAppState } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const totalOnlineCount = useMemo(() => {
    return users.filter(u => u.id !== currentUser?.id && u.isOnline && u.status !== 'dnd').length;
  }, [users, currentUser?.id]);

  const getOnlineCount = (cityName: string) => {
    return users.filter(u => 
      u.id !== currentUser?.id && 
      u.isOnline && 
      u.status !== 'dnd' && 
      u.city === cityName
    ).length;
  };

  const filteredUsers = users.filter(u => {
    if (u.id === currentUser?.id) return false;
    if (u.status === 'dnd') return false;
    if (!u.isOnline) return false;
    if (u.id === 'bot-1') return true; 
    if (selectedCity && u.city !== selectedCity) return false;
    if (!selectedCity) return false;
    return true;
  });

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const isFriend = (userId: string) => currentUser?.friends.includes(userId);
  const hasIncomingRequest = (userId: string) => currentUser?.pendingRequests.includes(userId);
  const hasOutgoingRequest = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.pendingRequests.includes(currentUser?.id || '');
  };

  const handleAddFriend = (targetId: string) => {
    if (!currentUser) return;
    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) return;
    if (targetUser.pendingRequests.includes(currentUser.id)) return;
    const limit = currentUser.isVIP ? 100 : 50;
    if (currentUser.friends.length >= limit) {
      setAppState({ maintenanceMode: false, globalNotification: "Vän-gräns nådd! ✨" });
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === targetId) return { ...u, pendingRequests: [...new Set([...u.pendingRequests, currentUser.id])] };
      return u;
    }));
    setAppState({ maintenanceMode: false, globalNotification: "Vänförfrågan skickad! 📨" });
  };

  const handleAccept = (targetId: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { 
          ...u, 
          friends: [...new Set([...u.friends, targetId])], 
          pendingRequests: u.pendingRequests.filter(id => id !== targetId) 
        };
      }
      if (u.id === targetId) return { ...u, friends: [...new Set([...u.friends, currentUser.id])] };
      return u;
    }));
    setAppState({ maintenanceMode: false, globalNotification: "Vänförfrågan accepterad! 🎉" });
  };

  if (!selectedCity) {
    return (
      <div className="flex flex-col h-full bg-gray-950 overflow-y-auto pb-40 scrollbar-hide animate-in fade-in duration-700">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
        
        <header className="px-6 pt-16 pb-8 text-center sm:text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                Upptäck <span className="text-amber-500">Nattstad</span>
              </h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] ml-1">Välj din stad för att se nattugglor</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-[1.5rem] w-fit mx-auto sm:mx-0 shadow-2xl">
              <div className="relative">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">{totalOnlineCount} VAKNA JUST NU</span>
            </div>
          </div>
        </header>

        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {CITIES.map((city, idx) => {
            const count = getOnlineCount(city.name);
            return (
              <button 
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                style={{ animationDelay: `${idx * 30}ms` }}
                className="group relative h-48 w-full bg-gray-900 rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] active:scale-95 animate-in slide-in-from-bottom-8 fill-mode-both"
              >
                {/* Background Patterns & Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-2xl transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                      {city.emoji}
                    </div>
                    
                    <div className={`px-4 py-2 rounded-2xl border transition-all duration-500 flex items-center gap-2 ${count > 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-800/50 border-white/5 text-gray-600'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest`}>{count} {count === 1 ? 'AKTIV' : 'AKTIVA'}</span>
                      {count > 0 && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-amber-500 transition-colors duration-300">
                      {city.name}
                    </h3>
                    <div className="h-1 w-12 bg-white/10 rounded-full group-hover:w-24 group-hover:bg-amber-500/50 transition-all duration-500"></div>
                  </div>
                </div>

                {/* Glassy reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 animate-in fade-in duration-300">
      <header className="p-6 pt-10 border-b border-white/5 sticky top-0 z-50 bg-gray-900/40 backdrop-blur-3xl flex items-center gap-6 h-28">
        <button 
          onClick={() => setSelectedCity(null)}
          className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-[1.5rem] flex items-center justify-center text-amber-500 active:scale-90 transition-all border border-white/10 shadow-2xl"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div className="min-w-0">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none truncate">{selectedCity}</h2>
          <div className="flex items-center gap-2.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${filteredUsers.length > 0 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-gray-700'}`}></span>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">
              {filteredUsers.length} ONLINE JUST NU
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-40 space-y-4 scrollbar-hide">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 bg-gray-900/60 rounded-[3.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <i className="fas fa-moon-cloud text-5xl text-gray-800 opacity-30"></i>
            </div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Ingen är vaken...</h3>
            <p className="text-[12px] font-bold text-gray-700 max-w-[240px] leading-relaxed uppercase">Alla i {selectedCity} verkar ha lagt sig. Prova en annan stad på kartan!</p>
            <button 
              onClick={() => setSelectedCity(null)} 
              className="mt-12 px-10 py-4 bg-gray-900 border border-white/10 text-amber-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 active:scale-95 transition-all shadow-xl"
            >
              Tillbaka till kartan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user, idx) => (
              <div 
                key={user.id}
                onClick={() => setViewingUser(user)}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="bg-gray-900/50 hover:bg-gray-900/80 border border-white/5 rounded-[2.5rem] p-5 flex items-center gap-5 transition-all active:scale-[0.97] group cursor-pointer animate-in slide-in-from-bottom-4 fill-mode-both"
              >
                <div className="relative shrink-0">
                  <img src={user.profileImage} className="w-18 h-18 rounded-[1.8rem] object-cover border-2 border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[4px] border-gray-900 rounded-full shadow-[0_0_12px_#22c55e]`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`font-black text-[17px] text-white truncate tracking-tighter uppercase ${user.usernameGlow ? 'username-glow' : ''}`} style={user.usernameGlow ? { '--glow-color': user.usernameGlow } as any : {}}>{user.displayName}</span>
                    {user.isVerified && <i className="fas fa-check-circle text-blue-400 text-[11px]"></i>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5">
                      {GENDER_CONFIG[user.gender].emoji} {user.gender}
                    </span>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5">
                      {calculateAge(user.dob)} ÅR
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 flex items-center justify-center text-gray-700 group-hover:text-amber-500 transition-colors">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Quick View Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[120] glass-dark flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setViewingUser(null)}>
          <div className="bg-gray-950 w-full max-w-sm rounded-[3.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <img src={viewingUser.profileImage} className="w-40 h-40 rounded-[3rem] border-[6px] border-gray-900 object-cover shadow-2xl" alt="" />
                <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 border-[6px] border-gray-950 rounded-full shadow-lg"></div>
              </div>
              
              <div className="text-center mb-10 w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className={`text-3xl font-black text-white uppercase tracking-tighter ${viewingUser.usernameGlow ? 'username-glow' : ''}`} style={viewingUser.usernameGlow ? { '--glow-color': viewingUser.usernameGlow } as any : {}}>{viewingUser.displayName}</h3>
                  {viewingUser.isVerified && <i className="fas fa-check-circle text-blue-400 text-xl"></i>}
                  {viewingUser.isAdmin && <i className="fas fa-shield-halved text-red-500 text-xl"></i>}
                </div>
                <p className="text-gray-500 text-sm font-black uppercase tracking-[0.3em]">@{viewingUser.username}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                   {viewingUser.isAdmin && BADGES.admin}
                   {viewingUser.isVerified && BADGES.verified}
                   {viewingUser.isVIP && BADGES.vip}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center shadow-inner">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">HEMSTAD</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{viewingUser.city}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center shadow-inner">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">KÖN</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{viewingUser.gender}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center shadow-inner">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">ÅLDER</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{calculateAge(viewingUser.dob)} ÅR</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 text-center shadow-inner">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">STATUS</p>
                  <p className="text-[11px] font-black text-green-500 uppercase tracking-widest">VAKEN</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {hasIncomingRequest(viewingUser.id) ? (
                   <button 
                    onClick={() => { handleAccept(viewingUser.id); setViewingUser(null); }}
                    className="w-full py-6 bg-green-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-green-500/20 active:scale-[0.98] transition-all"
                  >
                    ACCEPTERA VÄN
                  </button>
                ) : isFriend(viewingUser.id) ? (
                  <button 
                    onClick={() => { onChat(viewingUser.id); setViewingUser(null); }}
                    className="w-full py-6 bg-amber-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all"
                  >
                    STARTA CHATT
                  </button>
                ) : hasOutgoingRequest(viewingUser.id) ? (
                  <button 
                    disabled
                    className="w-full py-6 bg-gray-800 text-gray-500 font-black text-xs uppercase tracking-[0.3em] rounded-[1.8rem] border border-white/5 opacity-80"
                  >
                    REDAN SKICKAD
                  </button>
                ) : (
                  <button 
                    onClick={() => { handleAddFriend(viewingUser.id); setViewingUser(null); }}
                    className="w-full py-6 bg-amber-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all"
                  >
                    SKICKA VÄNFRÅGA
                  </button>
                )}
                <button 
                  onClick={() => setViewingUser(null)}
                  className="w-full py-5 text-gray-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                >
                  STÄNG PROFIL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryView;

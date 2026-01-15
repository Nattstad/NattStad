
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { BADGES } from '../constants';

interface FriendsViewProps {
  onChat: (userId: string) => void;
}

type SortMode = 'name' | 'online' | 'recent';

const FriendsView: React.FC<FriendsViewProps> = ({ onChat }) => {
  const { users, currentUser, setUsers, setAppState } = useAuth();
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'online' | 'requests' | 'search'>('list');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Derive the latest current user data from the global users list
  const me = useMemo(() => users.find(u => u.id === currentUser?.id) || currentUser, [users, currentUser]);

  const sortUsers = (a: UserProfile, b: UserProfile) => {
    switch (sortMode) {
      case 'name':
        return a.displayName.localeCompare(b.displayName);
      case 'online':
        if (a.isOnline === b.isOnline) return a.displayName.localeCompare(b.displayName);
        return a.isOnline ? -1 : 1;
      case 'recent':
        return (b.lastActive || 0) - (a.lastActive || 0);
      default:
        return 0;
    }
  };

  const friends = useMemo(() => {
    return users
      .filter(u => me?.friends.includes(u.id))
      .sort(sortUsers);
  }, [users, me, sortMode]);

  const onlineFriends = useMemo(() => {
    return friends
      .filter(u => u.isOnline)
      .sort(sortUsers);
  }, [friends, sortMode]);

  const requests = useMemo(() => users.filter(u => me?.pendingRequests.includes(u.id)), [users, me]);
  
  const searchResults = search.trim() 
    ? users.filter(u => 
        (u.username.toLowerCase().includes(search.toLowerCase()) || 
         u.displayName.toLowerCase().includes(search.toLowerCase())) && 
        u.id !== currentUser?.id
      )
    : [];

  const handleAddFriend = (targetId: string) => {
    if (!currentUser) return;
    
    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) return;

    if (targetUser.pendingRequests.includes(currentUser.id)) {
      setAppState({ maintenanceMode: false, globalNotification: "Vänförfrågan är redan skickad! 📨" });
      return;
    }

    if (currentUser.friends.includes(targetId)) {
      setAppState({ maintenanceMode: false, globalNotification: "Ni är redan vänner! 🤝" });
      return;
    }

    const limit = currentUser.isVIP ? 100 : 50;
    if (currentUser.friends.length >= limit) {
      setAppState({ maintenanceMode: false, globalNotification: `Vän-gräns nådd! Uppgradera till VIP för upp till 100 vänner. ✨` });
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === targetId) {
        return { ...u, pendingRequests: [...new Set([...u.pendingRequests, currentUser.id])] };
      }
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
      if (u.id === targetId) {
        return { ...u, friends: [...new Set([...u.friends, currentUser.id])] };
      }
      return u;
    }));
    setAppState({ maintenanceMode: false, globalNotification: "Vänförfrågan accepterad! 🎉" });
    if (selectedUser?.id === targetId) setSelectedUser(null);
  };

  const handleRemove = (targetId: string) => {
    if (!currentUser || !confirm("Vill du permanent ta bort denna vän?")) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, friends: u.friends.filter(id => id !== targetId) };
      }
      if (u.id === targetId) {
        return { ...u, friends: u.friends.filter(id => id !== currentUser.id) };
      }
      return u;
    }));
    setAppState({ maintenanceMode: false, globalNotification: "Vän borttagen." });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const isFriend = (userId: string) => me?.friends.includes(userId);
  const hasIncomingRequest = (userId: string) => me?.pendingRequests.includes(userId);
  const hasOutgoingRequest = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.pendingRequests.includes(me?.id || '');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <header className="p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
              <i className="fas fa-user-group text-sm"></i>
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Vänner</h2>
          </div>
          
          {(activeSubTab === 'list' || activeSubTab === 'online') && (
            <div className="flex bg-gray-800/40 p-1 rounded-xl border border-gray-700/30 gap-1">
              {[
                { id: 'name', icon: 'fa-sort-alpha-down' },
                { id: 'online', icon: 'fa-toggle-on' },
                { id: 'recent', icon: 'fa-clock' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setSortMode(opt.id as SortMode)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${sortMode === opt.id ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title={`Sortera efter ${opt.id}`}
                >
                  <i className={`fas ${opt.icon} text-[10px]`}></i>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex bg-gray-950 p-1 rounded-2xl gap-1 border border-gray-800/50">
          <button onClick={() => setActiveSubTab('online')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeSubTab === 'online' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-600'}`}>ONLINE</button>
          <button onClick={() => setActiveSubTab('list')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeSubTab === 'list' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-600'}`}>ALLA</button>
          <button onClick={() => setActiveSubTab('requests')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl relative transition-all uppercase tracking-widest ${activeSubTab === 'requests' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-600'}`}>
            KÖ {requests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-black border-2 border-gray-900">{requests.length}</span>}
          </button>
          <button onClick={() => setActiveSubTab('search')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeSubTab === 'search' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-600'}`}>SÖK</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
        {activeSubTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"></i>
              <input 
                type="text" 
                placeholder="Hitta vänner..."
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {searchResults.length === 0 && search.trim() && (
                <p className="text-center text-gray-600 text-[10px] font-black uppercase py-8 tracking-widest">Inga användare hittades</p>
              )}
              {searchResults.map(user => {
                const sent = hasOutgoingRequest(user.id);
                const friend = isFriend(user.id);
                const incoming = hasIncomingRequest(user.id);

                return (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900/40 rounded-3xl border border-gray-800/50 hover:bg-gray-900 transition-all">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <img src={user.profileImage} className="w-12 h-12 rounded-2xl object-cover border border-gray-800 shadow-lg" alt="" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-black text-[14px] text-gray-100 truncate tracking-tight uppercase ${user.usernameGlow ? 'username-glow' : ''}`} style={user.usernameGlow ? { '--glow-color': user.usernameGlow } as any : {}}>{user.displayName}</p>
                          {user.isVerified && <i className="fas fa-check-circle text-blue-400 text-[10px]"></i>}
                        </div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">@{user.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => !sent && !friend && !incoming && handleAddFriend(user.id)}
                      disabled={sent || friend || incoming}
                      className={`px-5 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${sent || incoming ? 'bg-gray-800 text-gray-600 border border-gray-700' : friend ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/10'}`}
                    >
                      {sent ? 'SKICKAD' : incoming ? 'I KÖ' : friend ? 'VÄN' : 'LÄGG TILL'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(activeSubTab === 'list' || activeSubTab === 'online') && (
          <div className="space-y-3">
            {(activeSubTab === 'list' ? friends : onlineFriends).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-700">
                <i className="fas fa-user-clock text-4xl opacity-10 mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">Inga vänner här än</p>
              </div>
            )}
            {(activeSubTab === 'list' ? friends : onlineFriends).map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900/40 rounded-3xl border border-gray-800/50 hover:bg-gray-900 transition-all">
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <div className="relative">
                    <img src={user.profileImage} className="w-14 h-14 rounded-2xl border border-gray-800 object-cover shadow-lg" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-gray-950 ${user.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black text-[14px] text-white uppercase tracking-tight ${user.usernameGlow ? 'username-glow' : ''}`} style={user.usernameGlow ? { '--glow-color': user.usernameGlow } as any : {}}>{user.displayName}</span>
                      {user.isVerified && <i className="fas fa-check-circle text-blue-400 text-[10px]"></i>}
                      {user.isAdmin && <i className="fas fa-shield-halved text-red-500 text-[10px]"></i>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {user.city} • {user.isOnline ? 'ONLINE' : (user.lastActive ? `AKTIV ${new Date(user.lastActive).toLocaleDateString()}` : 'OFFLINE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChat(user.id)} className="w-10 h-10 flex items-center justify-center text-amber-500 bg-amber-500/10 rounded-xl hover:bg-amber-500/20 transition-all"><i className="fas fa-comment"></i></button>
                  <button onClick={() => handleRemove(user.id)} className="w-10 h-10 flex items-center justify-center text-red-500/30 hover:text-red-500 bg-red-500/5 rounded-xl transition-all"><i className="fas fa-user-minus"></i></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-700">
                <i className="fas fa-inbox text-4xl opacity-10 mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">Inga nya förfrågningar</p>
              </div>
            )}
            {requests.map(user => (
              <div key={user.id} className="p-5 bg-gray-900/40 rounded-[2.5rem] border border-gray-800/50 space-y-5 shadow-xl hover:bg-gray-900 transition-all">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <img src={user.profileImage} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-gray-800 shadow-2xl" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-lg text-white uppercase tracking-tighter truncate ${user.usernameGlow ? 'username-glow' : ''}`} style={user.usernameGlow ? { '--glow-color': user.usernameGlow } as any : {}}>{user.displayName}</p>
                      {user.isVerified && <i className="fas fa-check-circle text-blue-400 text-sm"></i>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">@{user.username} • {user.city}</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-800 text-xs"></i>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAccept(user.id)} className="flex-1 py-4 bg-green-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-green-500/10 active:scale-95 transition-all">ACCEPTERA</button>
                  <button className="flex-1 py-4 bg-gray-800 text-gray-500 text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] active:scale-95 transition-all">NEKA</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Detail Pop-up */}
      {selectedUser && (
        <div className="fixed inset-0 z-[120] glass-dark flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setSelectedUser(null)}>
          <div className="bg-gray-950 w-full max-w-sm rounded-[3.5rem] p-8 border border-gray-800 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img 
                  src={selectedUser.profileImage} 
                  className="w-36 h-36 rounded-[2.8rem] border-4 border-gray-900 object-cover shadow-2xl mb-4 cursor-pointer hover:brightness-110 active:scale-95 transition-all" 
                  alt="" 
                  onClick={() => setZoomedImage(selectedUser.profileImage)}
                />
                {selectedUser.isOnline && <div className="absolute bottom-6 right-2 w-7 h-7 bg-green-500 border-4 border-gray-950 rounded-full"></div>}
              </div>

              <div className="text-center mb-8 w-full">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className={`text-3xl font-black text-white uppercase tracking-tighter ${selectedUser.usernameGlow ? 'username-glow' : ''}`} style={selectedUser.usernameGlow ? { '--glow-color': selectedUser.usernameGlow } as any : {}}>{selectedUser.displayName}</h3>
                  {selectedUser.isVerified && <i className="fas fa-check-circle text-blue-400 text-xl"></i>}
                  {selectedUser.isAdmin && <i className="fas fa-shield-halved text-red-500 text-xl"></i>}
                </div>
                <p className="text-gray-500 text-sm font-black uppercase tracking-widest">@{selectedUser.username}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                   {selectedUser.isAdmin && BADGES.admin}
                   {selectedUser.isVerified && BADGES.verified}
                   {selectedUser.isVIP && BADGES.vip}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <div className="bg-gray-900/60 p-5 rounded-[1.8rem] border border-gray-800 shadow-inner text-center">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-1.5 tracking-widest">HEMSTAD</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{selectedUser.city}</p>
                </div>
                <div className="bg-gray-900/60 p-5 rounded-[1.8rem] border border-gray-800 shadow-inner text-center">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-1.5 tracking-widest">KÖN</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{selectedUser.gender}</p>
                </div>
                <div className="bg-gray-900/60 p-5 rounded-[1.8rem] border border-gray-800 shadow-inner text-center">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-1.5 tracking-widest">ÅLDER</p>
                  <p className="text-[13px] font-black text-gray-200 uppercase">{calculateAge(selectedUser.dob)} ÅR</p>
                </div>
                <div className="bg-gray-900/60 p-5 rounded-[1.8rem] border border-gray-800 shadow-inner text-center">
                  <p className="text-[9px] text-gray-600 uppercase font-black mb-1.5 tracking-widest">STATUS</p>
                  <p className={`text-[11px] font-black uppercase ${selectedUser.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                    {selectedUser.isOnline ? 'VAKEN' : 'SOVER'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {hasIncomingRequest(selectedUser.id) ? (
                  <button 
                    onClick={() => handleAccept(selectedUser.id)} 
                    className="w-full py-6 bg-green-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                  >
                    ACCEPTERA VÄN
                  </button>
                ) : isFriend(selectedUser.id) ? (
                  <button 
                    onClick={() => { onChat(selectedUser.id); setSelectedUser(null); }} 
                    className="w-full py-6 bg-amber-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    SKICKA MEDDELANDE
                  </button>
                ) : hasOutgoingRequest(selectedUser.id) ? (
                  <button 
                    disabled
                    className="w-full py-6 bg-gray-800 text-gray-500 font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] border border-gray-700 opacity-80"
                  >
                    VÄNFRÅGAN SKICKAD
                  </button>
                ) : (
                  <button 
                    onClick={() => { handleAddFriend(selectedUser.id); setSelectedUser(null); }}
                    className="w-full py-6 bg-amber-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    SKICKA VÄNFRÅGA
                  </button>
                )}
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="w-full py-6 bg-gray-900 text-gray-500 font-black text-xs uppercase tracking-widest rounded-[1.5rem] border border-gray-800 active:scale-95 transition-all"
                >
                  STÄNG PROFIL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-full max-h-full">
            <img src={zoomedImage} alt="Zoom" className="rounded-3xl object-contain shadow-2xl ring-1 ring-white/10" />
            <button className="absolute -top-12 right-0 text-white text-3xl p-4 hover:scale-110 transition-transform"><i className="fas fa-times"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsView;

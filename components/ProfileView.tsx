
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BADGES, CITIES, GENDERS, GENDER_CONFIG } from '../constants';
import { Gender, UserProfile } from '../types';
import VIPView from './VIPView';

interface ProfileViewProps {
  onLogout: () => void;
  onZoomImage: (url: string) => void;
}

const GLOW_COLORS = [
  { name: 'Guld', color: '#f59e0b' },
  { name: 'Neon Blå', color: '#3b82f6' },
  { name: 'Rosa', color: '#ec4899' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Lila', color: '#a855f7' },
  { name: 'Röd', color: '#ef4444' },
  { name: 'Ingen', color: 'transparent' }
];

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout, onZoomImage }) => {
  const { currentUser, setCurrentUser, theme, setTheme, users, setUsers, setAppState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [selectedBlockedUser, setSelectedBlockedUser] = useState<UserProfile | null>(null);
  const [blockUsername, setBlockUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editData, setEditData] = useState({
    displayName: currentUser?.displayName || '',
    username: currentUser?.username || '',
    city: currentUser?.city || '',
    gender: currentUser?.gender || 'Man' as Gender,
    status: currentUser?.status || 'active',
    age: '',
    month: '',
    day: '',
    glowColor: currentUser?.usernameGlow || 'transparent'
  });

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const parts = dob.split('-');
    const birthYear = parseInt(parts[0]);
    return new Date().getFullYear() - birthYear;
  };

  useEffect(() => {
    if (isEditing && currentUser) {
      const parts = currentUser.dob.split('-');
      setEditData({
        displayName: currentUser.displayName,
        username: currentUser.username,
        city: currentUser.city,
        gender: currentUser.gender,
        status: currentUser.status,
        age: calculateAge(currentUser.dob).toString(),
        month: parts[1] || '',
        day: parts[2] || '',
        glowColor: currentUser.usernameGlow || 'transparent'
      });
    }
  }, [isEditing, currentUser]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = { ...currentUser, profileImage: base64String };
        setCurrentUser(updated);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        setAppState({ maintenanceMode: false, globalNotification: "Profilbild uppdaterad! 📸" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!currentUser) return;
    
    // Check if city changed and if user is VIP
    if (editData.city !== currentUser.city && !currentUser.isVIP) {
      setAppState({ 
        maintenanceMode: false, 
        globalNotification: "VIP KRÄVS: Du måste vara VIP-medlem för att byta stad! ✨" 
      });
      return;
    }

    // Check username uniqueness if changed
    if (editData.username.toLowerCase() !== currentUser.username.toLowerCase()) {
      const exists = users.some(u => u.username.toLowerCase() === editData.username.toLowerCase() && u.id !== currentUser.id);
      if (exists) {
        setAppState({ maintenanceMode: false, globalNotification: "Användarnamnet är upptaget! 🛑" });
        return;
      }
    }

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(editData.age || '0');
    const formattedDate = `${birthYear}-${editData.month.padStart(2, '0')}-${editData.day.padStart(2, '0')}`;
    
    const updated: UserProfile = { 
      ...currentUser, 
      displayName: editData.displayName,
      username: editData.username,
      city: editData.city, 
      gender: editData.gender, 
      dob: formattedDate,
      usernameGlow: editData.glowColor !== 'transparent' ? editData.glowColor : undefined
    };

    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setIsEditing(false);
    setAppState({ maintenanceMode: false, globalNotification: "Profil uppdaterad! ✨" });
  };

  const setAnimation = (anim: UserProfile['profileAnimation']) => {
    if (!currentUser) return;
    const updated = { ...currentUser, profileAnimation: anim };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setAppState({ maintenanceMode: false, globalNotification: `Profil-effekt uppdaterad! ✨` });
  };

  const handleBlock = () => {
    const targetInput = blockUsername.trim().toLowerCase();
    if (!targetInput || !currentUser) return;
    
    if (targetInput === currentUser.username.toLowerCase()) {
      setAppState({ maintenanceMode: false, globalNotification: "Du kan inte blockera dig själv." });
      return;
    }

    const targetUser = users.find(u => u.username.toLowerCase() === targetInput);
    if (!targetUser) {
      setAppState({ maintenanceMode: false, globalNotification: "Användaren hittades inte." });
      return;
    }

    const updated = { ...currentUser, blockedUsers: [...new Set([...currentUser.blockedUsers, targetInput])] };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setBlockUsername('');
    setAppState({ maintenanceMode: false, globalNotification: `Användare @${targetInput} blockerad.` });
  };

  const handleUnblock = (username: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, blockedUsers: currentUser.blockedUsers.filter(u => u !== username.toLowerCase()) };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setSelectedBlockedUser(null);
    setAppState({ maintenanceMode: false, globalNotification: `Användare @${username} avblockerad.` });
  };

  const toggleDND = () => {
    if (!currentUser) return;
    const newStatus = currentUser.status === 'dnd' ? 'active' : 'dnd';
    const updated = { ...currentUser, status: newStatus as any };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  if (showVIP) {
    return <VIPView onBack={() => setShowVIP(false)} />;
  }

  const userAge = currentUser ? calculateAge(currentUser.dob) : 0;
  const birthDay = currentUser?.dob ? currentUser.dob.split('-')[2] : '';
  const birthMonth = currentUser?.dob ? currentUser.dob.split('-')[1] : '';

  const getAnimationClass = () => {
    switch (currentUser?.profileAnimation) {
      case 'pulse': return 'anim-pulse';
      case 'glow': return 'anim-glow';
      case 'border-flow': return 'anim-border-flow';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-y-auto pb-32 scrollbar-hide">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      {/* Banner Area */}
      <div className="relative h-48 shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-gray-950"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <button onClick={onLogout} className="absolute top-6 right-6 w-10 h-10 bg-black/40 hover:bg-red-500 rounded-2xl text-white backdrop-blur-md transition-all z-20 flex items-center justify-center shadow-lg"><i className="fas fa-power-off"></i></button>
      </div>

      <div className="px-6 -mt-16 relative z-10 flex flex-col items-center">
        {/* Profile Card */}
        <div className={`bg-gray-900 w-full max-w-sm rounded-[2rem] p-6 pt-0 shadow-2xl border border-gray-800 mb-6 transition-all duration-700 ${getAnimationClass()}`}>
          <div className="flex flex-col items-start">
            <div className="relative -mt-14 mb-4 group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-28 h-28 rounded-full border-[6px] border-gray-900 overflow-hidden bg-gray-950 shadow-2xl relative">
                <img src={currentUser?.profileImage} className="w-full h-full object-cover" alt="Avatar" />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"><i className="fas fa-camera text-white text-xl"></i></div>
              </div>
              <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full border-[4px] border-gray-900 z-20 shadow-lg ${currentUser?.status === 'dnd' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            </div>
            
            <div className="w-full">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className={`text-2xl font-black text-white uppercase tracking-tighter ${currentUser?.usernameGlow ? 'username-glow' : ''}`} style={currentUser?.usernameGlow ? { '--glow-color': currentUser.usernameGlow } as any : {}}>
                  {currentUser?.displayName}
                </h2>
                {currentUser?.isVerified && <i className="fas fa-check-circle text-blue-400 text-lg"></i>}
              </div>
              <p className="text-gray-500 text-sm font-black uppercase tracking-widest mb-4">@{currentUser?.username}</p>
              
              <div className="h-px bg-gray-800 w-full mb-4"></div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {currentUser?.isAdmin && BADGES.admin}
                {currentUser?.isVIP && BADGES.vip}
                {currentUser?.isVerified && BADGES.verified}
              </div>
            </div>
          </div>
        </div>

        {/* Animation Picker */}
        <div className="w-full max-w-sm mb-6 bg-gray-900/50 border border-gray-800 rounded-[1.5rem] p-5 shadow-xl">
           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Profil-effekter</h4>
           <div className="flex bg-gray-950 p-1 rounded-2xl gap-1 border border-gray-800/30 overflow-x-auto scrollbar-hide">
              {[
                { id: 'none', label: 'INGEN', icon: 'fa-ban' },
                { id: 'pulse', label: 'PULS', icon: 'fa-heartbeat' },
                { id: 'glow', label: 'GLÖD', icon: 'fa-sun' },
                { id: 'border-flow', label: 'FLÖDE', icon: 'fa-spinner' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setAnimation(opt.id as any)}
                  className={`flex-1 min-w-[70px] py-3 flex flex-col items-center gap-1.5 rounded-xl transition-all ${currentUser?.profileAnimation === opt.id ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  <i className={`fas ${opt.icon} text-xs`}></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Action Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-8">
          <button onClick={() => setIsEditing(true)} className="bg-gray-900 border border-gray-800 py-4 rounded-2xl font-black text-[10px] tracking-widest text-white flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
            <i className="fas fa-user-edit text-amber-500"></i> REDIGERA PROFIL
          </button>
          <button onClick={() => setShowVIP(true)} className="bg-gradient-to-br from-amber-400 to-amber-600 py-4 rounded-2xl font-black text-[10px] tracking-widest text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
            <i className="fas fa-crown"></i> VIP FÖRDELAR
          </button>
          <button onClick={toggleDND} className={`col-span-2 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 border ${currentUser?.status === 'dnd' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-gray-900 border-gray-800 text-white'}`}>
            <i className="fas fa-moon"></i> {currentUser?.status === 'dnd' ? 'STÖR EJ: PÅ' : 'STÖR EJ: AV'}
          </button>
        </div>

        {/* Info & Block List */}
        <div className="w-full max-w-sm space-y-4">
          <section className="bg-gray-900 rounded-[1.5rem] p-6 border border-gray-800 shadow-xl">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Om Mig</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">HEMSTAD</span>
                   <span className="text-xs font-black text-white uppercase">{currentUser?.city} {CITIES.find(c => c.name === currentUser?.city)?.emoji}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">ÅLDER</span>
                   <span className="text-xs font-black text-white uppercase">{userAge} ÅR ({birthMonth}/{birthDay})</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">KÖN</span>
                   <span className="text-xs font-black text-white uppercase">{currentUser?.gender} {GENDER_CONFIG[currentUser?.gender || 'Man'].emoji}</span>
                </div>
             </div>
          </section>

          <section className="bg-gray-900 w-full max-w-sm rounded-[1.5rem] p-6 border border-gray-800 shadow-xl">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Blockerade kontakter</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={blockUsername} 
                  onChange={e => setBlockUsername(e.target.value)} 
                  placeholder="Skriv användarnamn..." 
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-[11px] font-bold text-white focus:border-red-500 outline-none" 
                />
                <button onClick={handleBlock} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Spara</button>
              </div>
              
              {currentUser?.blockedUsers && currentUser.blockedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentUser.blockedUsers.map(u => (
                    <button key={u} onClick={() => { const obj = users.find(usr => usr.username.toLowerCase() === u.toLowerCase()); if(obj) setSelectedBlockedUser(obj); }} className="bg-gray-800 text-[9px] font-black text-gray-400 px-3 py-1.5 rounded-lg border border-gray-700">@{u}</button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[150] glass-dark flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-gray-950 w-full max-w-sm rounded-[3rem] p-8 border border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
            <h2 className="text-xl font-black text-white uppercase mb-4">Redigera Profil</h2>
            
            {/* Live Glow Preview Box */}
            <div className="mb-6 p-6 bg-gray-900 rounded-[2rem] border border-gray-800 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <span 
                key={editData.glowColor}
                className={`text-2xl font-black uppercase tracking-tighter inline-block ${editData.glowColor !== 'transparent' ? 'username-glow' : 'text-white'}`} 
                style={editData.glowColor !== 'transparent' ? { '--glow-color': editData.glowColor } as any : {}}
              >
                {editData.displayName || 'Displaynamn'}
              </span>
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.4em] mt-3 opacity-60">FÖRHANDSVISNING</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-1.5 block tracking-widest">Displaynamn</label>
                <input type="text" value={editData.displayName} onChange={e => setEditData({...editData, displayName: e.target.value})} placeholder="Ditt namn" className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" />
              </div>

              {currentUser?.isVIP && (
                <div className="animate-in slide-in-from-left duration-500">
                  <label className="text-[10px] text-amber-500 font-black uppercase mb-1.5 block tracking-widest flex items-center gap-2">
                    <i className="fas fa-crown"></i> Användarnamn (VIP)
                  </label>
                  <input type="text" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} placeholder="Välj användarnamn" className="w-full bg-gray-900 border border-amber-500/30 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" />
                </div>
              )}

              {currentUser?.isVIP && (
                <div className="animate-in slide-in-from-right duration-500">
                  <label className="text-[10px] text-amber-500 font-black uppercase mb-3 block tracking-widest flex items-center gap-2">
                    <i className="fas fa-sparkles"></i> Namn-glöd (VIP)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {GLOW_COLORS.map(c => (
                      <button 
                        key={c.name}
                        type="button"
                        onClick={() => setEditData(prev => ({ ...prev, glowColor: c.color }))}
                        className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl border transition-all ${editData.glowColor === c.color ? 'bg-amber-500/10 border-amber-500 scale-105' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                      >
                        <div className={`w-6 h-6 rounded-full border border-white/10 shadow-lg ${c.color === 'transparent' ? 'bg-gray-800 relative overflow-hidden' : ''}`} style={{ backgroundColor: c.color !== 'transparent' ? c.color : undefined }}>
                           {c.color === 'transparent' && <div className="absolute inset-0 border-t-2 border-red-500/50 rotate-45 top-1/2 -translate-y-1/2"></div>}
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-1.5 block tracking-widest">Stad</label>
                <div className="relative">
                  <select 
                    value={editData.city} 
                    onChange={e => setEditData({...editData, city: e.target.value})} 
                    className={`w-full bg-gray-900 border border-gray-800 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none appearance-none ${!currentUser?.isVIP ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!currentUser?.isVIP}
                  >
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                  {!currentUser?.isVIP && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 flex items-center gap-1">
                      <i className="fas fa-lock text-[10px]"></i>
                      <span className="text-[8px] font-black uppercase">VIP</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-1.5 block tracking-widest">Födelsedatum</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="År" value={editData.age} onChange={e => setEditData({...editData, age: e.target.value})} className="bg-gray-900 border border-gray-800 rounded-xl py-4 text-center text-sm font-bold text-white outline-none" />
                  <input type="number" placeholder="MM" value={editData.month} onChange={e => setEditData({...editData, month: e.target.value})} className="bg-gray-900 border border-gray-800 rounded-xl py-4 text-center text-sm font-bold text-white outline-none" />
                  <input type="number" placeholder="DD" value={editData.day} onChange={e => setEditData({...editData, day: e.target.value})} className="bg-gray-900 border border-gray-800 rounded-xl py-4 text-center text-sm font-bold text-white outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-900 text-gray-500 font-black rounded-xl uppercase text-[10px] tracking-widest border border-gray-800">Avbryt</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-amber-500 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all">Spara</button>
            </div>
          </div>
        </div>
      )}

      {selectedBlockedUser && (
        <div className="fixed inset-0 z-[160] glass-dark flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setSelectedBlockedUser(null)}>
          <div className="bg-gray-950 w-full max-w-sm rounded-[3rem] p-8 border border-red-500/20 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <img src={selectedBlockedUser.profileImage} className="w-24 h-24 rounded-2xl border-2 border-red-500/20 object-cover mb-4" alt="" />
              <h3 className="text-xl font-black text-white uppercase">{selectedBlockedUser.displayName}</h3>
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">BLOCKERAD KONTAKT</p>
              <button onClick={() => handleUnblock(selectedBlockedUser.username)} className="w-full mt-8 py-4 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-green-500/20">AVBLOCKERA</button>
              <button onClick={() => setSelectedBlockedUser(null)} className="w-full mt-3 py-4 bg-gray-900 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-800">STÄNG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;

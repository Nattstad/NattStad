
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { users, setUsers, appState, setAppState, currentUser, setCurrentUser } = useAuth();
  const [showPinId, setShowPinId] = useState<string | null>(null);
  const [showPassId, setShowPassId] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const toggleMaintenance = () => {
    setAppState(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setAppState(prev => ({ ...prev, globalNotification: broadcastMsg }));
    setBroadcastMsg('');
    alert("Notis skickad till alla användare!");
  };

  const updateUserStatus = (userId: string, key: 'isAdmin' | 'isVerified' | 'isVIP', val: boolean) => {
    setIsSaving(userId);
    
    // Update the master list
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, [key]: val } : u));
    
    // Crucial: Update currentUser state immediately if the admin is editing themselves
    // so the UI and persistence logic picks it up right away.
    if (currentUser && userId === currentUser.id) {
      setCurrentUser(prev => prev ? { ...prev, [key]: val } : null);
    }
    
    setTimeout(() => setIsSaving(null), 500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-y-auto pb-32">
      <header className="p-4 border-b border-red-900/50 bg-red-950/20 sticky top-0 z-40 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-500/20">
             <i className="fas fa-shield-halved text-sm"></i>
          </div>
          <h2 className="text-lg font-black text-red-500 tracking-tighter uppercase">Admin Kontroll</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
          <i className="fas fa-times"></i>
        </button>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Broadcast Notis</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <textarea 
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Skriv ett meddelande till alla användare..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm focus:border-red-500 outline-none h-24 resize-none"
            />
            <button 
              onClick={handleBroadcast}
              className="w-full bg-red-500 text-white font-black py-3 rounded-xl text-[10px] tracking-widest uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all"
            >
              SKICKA NOTIS TILL ALLA
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Server Kontroll</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <p className="font-bold text-sm text-gray-100">Underhållsläge</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Endast admins kan logga in</p>
            </div>
            <button 
              onClick={toggleMaintenance}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border ${
                appState.maintenanceMode 
                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              {appState.maintenanceMode ? 'AKTIVERAT' : 'DEAKTIVERAT'}
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Användarhantering ({users.length})</h3>
            {isSaving && <span className="text-[8px] font-black text-green-500 animate-pulse uppercase">SPARAR...</span>}
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-5 shadow-2xl">
                <div className="flex items-start gap-4">
                  <img src={user.profileImage} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-800" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-100 truncate">
                      {user.displayName} <span className="text-gray-600 font-medium text-xs">@{user.username}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Stad: {user.city}</p>
                    <div className="flex gap-2 mt-2">
                       <button 
                        onClick={() => { setShowPassId(null); setShowPinId(showPinId === user.id ? null : user.id); }}
                        className="text-[8px] bg-gray-800 text-amber-500 px-3 py-1.5 rounded-lg border border-gray-700 font-black"
                       >
                         {showPinId === user.id ? 'DÖLJ PIN' : 'VISA PIN'}
                       </button>
                       <button 
                        onClick={() => { setShowPinId(null); setShowPassId(showPassId === user.id ? null : user.id); }}
                        className="text-[8px] bg-gray-800 text-blue-500 px-3 py-1.5 rounded-lg border border-gray-700 font-black"
                       >
                         {showPassId === user.id ? 'DÖLJ LÖSEN' : 'VISA LÖSEN'}
                       </button>
                    </div>
                  </div>
                </div>

                {(showPinId === user.id || showPassId === user.id) && (
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl text-center animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[9px] uppercase font-black text-gray-500 mb-1">
                      {showPinId === user.id ? 'Säkerhets PIN' : 'Konto Lösenord'}
                    </p>
                    <p className="text-2xl font-black tracking-[0.2em] text-white">
                      {showPinId === user.id ? user.pin : user.password}
                    </p>
                    <button 
                      onClick={() => { setShowPinId(null); setShowPassId(null); }}
                      className="mt-3 text-[9px] text-amber-500 font-black uppercase tracking-widest"
                    >
                      OK / DÖLJ
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => updateUserStatus(user.id, 'isAdmin', !user.isAdmin)} className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all ${user.isAdmin ? 'bg-red-500 text-white border-red-400' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>ADMIN</button>
                  <button onClick={() => updateUserStatus(user.id, 'isVerified', !user.isVerified)} className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all ${user.isVerified ? 'bg-blue-500 text-white border-blue-400' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>VERIFIERAD</button>
                  <button onClick={() => updateUserStatus(user.id, 'isVIP', !user.isVIP)} className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all ${user.isVIP ? 'bg-amber-500 text-white border-amber-400' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>VIP</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;


import React from 'react';
import { useAuth } from '../context/AuthContext';

interface VIPViewProps {
  onBack: () => void;
}

const VIPView: React.FC<VIPViewProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, setUsers, setAppState } = useAuth();

  const handleUpgrade = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isVIP: true };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setAppState({ maintenanceMode: false, globalNotification: "VÄLKOMMEN TILL NATTSTAD VIP! 👑" });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-y-auto pb-32 scrollbar-hide animate-in fade-in slide-in-from-bottom duration-500">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-gray-950/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-amber-500">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">VIP Medlemskap</h2>
      </header>

      <div className="px-8 flex flex-col items-center">
        <div className="relative mb-12 mt-8">
          <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-20 animate-pulse"></div>
          <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl shadow-2xl relative z-10">
            <i className="fas fa-crown"></i>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Skaffa Vip nu</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Upplev Nattstad utan gränser</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="bg-gray-900/60 border border-amber-500/20 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-2xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase leading-tight">100 Vänner</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Dubbelt så many kontakter</p>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-amber-500/20 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-2xl">
              <i className="fas fa-comments"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase leading-tight">Gruppchattar</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Skapa egna rum för dina vänner</p>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-amber-500/20 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-2xl">
              <i className="fas fa-city"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase leading-tight">Fritt Stadsbyte</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Byt stad när du vill</p>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-amber-500/20 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-2xl">
              <i className="fas fa-certificate"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase leading-tight">Exklusiv Badge</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">Guldstjärna på din profil</p>
            </div>
          </div>
        </div>

        {!currentUser?.isVIP ? (
          <button 
            onClick={handleUpgrade}
            className="w-full max-w-sm mt-12 py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-amber-500/30 active:scale-95 transition-all"
          >
            AKTIVERA VIP NU
          </button>
        ) : (
          <div className="mt-12 p-6 bg-amber-500/10 border border-amber-500/30 rounded-[2rem] text-center">
            <p className="text-amber-500 font-black uppercase text-xs tracking-widest">Du är redan en VIP-medlem! 👑</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPView;

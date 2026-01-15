
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Notifications: React.FC = () => {
  const { appState, setAppState } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (appState.globalNotification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setAppState(prev => ({ ...prev, globalNotification: null }));
        }, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appState.globalNotification, setAppState]);

  if (!appState.globalNotification) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-[1000] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
      <div className="bg-amber-500 border border-amber-400/50 rounded-2xl p-4 shadow-2xl shadow-amber-500/30 flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <i className="fas fa-bell text-white animate-bounce"></i>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-white/70 font-black uppercase tracking-widest mb-0.5">MEDDELANDE FRÅN NATTSTAD</p>
          <p className="text-sm font-bold text-white leading-tight">{appState.globalNotification}</p>
        </div>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white p-2">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Notifications;

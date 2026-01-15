
import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterPage from './RegisterPage';

const LoginPage: React.FC = () => {
  const { users, setUsers, setCurrentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === passwordInput
    );

    if (user) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isOnline: true } : u));
      setCurrentUser(user);
    } else {
      setError('Felaktigt användarnamn eller lösenord');
    }
  };

  const handleVerifyForReset = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.pin === pinInput);
    if (user) {
      setError('');
      setIsResetStep(true);
    } else {
      setError("Användarnamn eller PIN matchar inte.");
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Nytt lösenord krävs");
      return;
    }
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    if (!hasUpperCase || !hasSpecialChar) {
      setError("Lösenordet ska bestå av minst en stor bokstav och ett specialtecken");
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    }));

    alert("Ditt lösenord har uppdaterats! Du kan nu logga in.");
    setIsForgot(false);
    setIsResetStep(false);
    setNewPassword('');
    setPinInput('');
    setPasswordInput('');
  };

  if (isRegistering) return <RegisterPage onBack={() => setIsRegistering(false)} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-950">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-6">
            <i className="fas fa-moon text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">NATTSTAD</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Staden som aldrig sover</p>
        </div>

        <form onSubmit={isResetStep ? handleUpdatePassword : (isForgot ? handleVerifyForReset : handleLogin)} className="space-y-4">
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
          
          <div className="space-y-4">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input 
                type="text" 
                placeholder="Användarnamn"
                className={`w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-all placeholder:text-gray-600 ${isResetStep ? 'opacity-50' : ''}`}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                readOnly={isResetStep}
              />
            </div>
            
            {isResetStep ? (
              <div className="relative animate-in slide-in-from-top duration-300">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input 
                  type="password" 
                  placeholder="Välj nytt lösenord"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-all placeholder:text-gray-600"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
            ) : isForgot ? (
              <div className="relative">
                <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input 
                  type="password" 
                  placeholder="6-siffrig PIN för återställning"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-all tracking-[0.2em] font-black placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-600"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input 
                  type="password" 
                  placeholder="Lösenord"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-all placeholder:text-gray-600"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {!isForgot && !isResetStep && (
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-amber-500 border-amber-500' : 'border-gray-700 bg-gray-900'}`}>
                  {rememberMe && <i className="fas fa-check text-[10px] text-white"></i>}
                </div>
                <span className="text-xs text-gray-400 font-bold group-hover:text-gray-300">Kom ihåg mig</span>
              </label>
              <button 
                type="button" 
                onClick={() => { setIsForgot(true); setError(''); }}
                className="text-xs text-amber-500 font-bold hover:text-amber-400 transition-colors"
              >
                Glömt lösenord?
              </button>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all tracking-widest text-sm"
          >
            {isResetStep ? 'UPPDATERA LÖSENORD' : (isForgot ? 'VERIFIERA PIN' : 'LOGGA IN')}
          </button>
          
          {(isForgot || isResetStep) && (
             <button 
              type="button"
              onClick={() => { setIsForgot(false); setIsResetStep(false); setError(''); }}
              className="w-full bg-gray-900 border border-gray-800 text-gray-400 font-bold py-4 rounded-2xl active:scale-95 transition-all text-xs"
            >
              TILLBAKA
            </button>
          )}
        </form>

        {!isForgot && !isResetStep && (
          <div className="text-center pt-8">
            <p className="text-gray-500 text-xs">Har du inget konto?</p>
            <button 
              onClick={() => setIsRegistering(true)}
              className="mt-2 text-white font-black hover:text-amber-500 transition-colors tracking-widest text-xs"
            >
              SKAPA KONTO NU
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-700 uppercase font-black tracking-widest">© 2024 NATTSTAD • ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

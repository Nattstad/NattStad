
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CITIES, GENDERS, GENDER_CONFIG, BOT_ID } from '../constants';
import { Gender, UserProfile } from '../types';

interface RegisterPageProps {
  onBack: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack }) => {
  const { users, setUsers, setCurrentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    gender: 'Man' as Gender,
    city: 'Stockholm',
    pin: '',
    terms: false,
    age: '',
    month: '',
    day: ''
  });

  const isSimplePin = (pin: string) => {
    if (/^(\d)\1+$/.test(pin)) return true;
    if ("0123456789".includes(pin) || "9876543210".includes(pin)) return true;
    const commonSimple = ['123456', '654321', '123123', '000111', '111000'];
    return commonSimple.includes(pin);
  };

  const validateStep1 = () => {
    if (!formData.username.trim()) return "Användarnamn krävs";
    if (!formData.displayName.trim()) return "Displaynamn krävs";
    const exists = users.some(u => u.username.toLowerCase() === formData.username.toLowerCase());
    if (exists) return "Användarnamnet är redan upptaget";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.password) return "Lösenord krävs";
    if (!formData.age || !formData.month || !formData.day) return "Födelsedata saknas";
    
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 18) return "Du måste vara minst 18 år för att registrera dig.";
    if (ageNum > 100) return "Ogiltig ålder.";

    if (!formData.pin || formData.pin.length !== 6) return "6-siffrig PIN krävs";

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (!hasUpperCase || !hasSpecialChar) return "Lösenordet ska bestå av minst en stor bokstav och ett specialtecken";

    if (isSimplePin(formData.pin)) return "PIN-koden är för enkel.";
    if (!formData.terms) return "Du måste acceptera villkoren";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(formData.age);
    const formattedDob = `${birthYear}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
    
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: formData.username,
      displayName: formData.displayName,
      password: formData.password,
      dob: formattedDob,
      gender: formData.gender,
      city: formData.city,
      pin: formData.pin,
      isAdmin: false,
      isVerified: false,
      isVIP: false,
      isOnline: true,
      profileImage: `https://picsum.photos/seed/${formData.username}/200`,
      status: 'active',
      blockedUsers: [],
      friends: [BOT_ID], // Automatically add NattBot as friend
      pendingRequests: [],
      pushEnabled: true
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-md space-y-8 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-black text-amber-500 tracking-tighter uppercase">Skapa Konto</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold opacity-50">Steg {step} av 2</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in shake duration-300">
            <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Användarnamn</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Välj användarnamn" />
              </div>
              <div>
                <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Displaynamn</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="Ditt namn i appen" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Kön</label>
                  <select className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                    {GENDERS.map(g => <option key={g} value={g}>{GENDER_CONFIG[g].emoji} {GENDER_CONFIG[g].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Stad</label>
                  <select className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" onClick={handleNext} className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/10 tracking-widest uppercase text-xs">NÄSTA STEG</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Lösenord</label>
                <input type="password" placeholder="Stor bokstav + symbol" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Födelsedata (Min. 18 år)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Ålder" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 text-center text-sm font-bold text-white outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  <input type="number" placeholder="MM" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 text-center text-sm font-bold text-white outline-none" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
                  <input type="number" placeholder="DD" className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 text-center text-sm font-bold text-white outline-none" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-600 font-black uppercase mb-2 block tracking-widest">Säkerhets PIN (6 siffror)</label>
                <input type="password" maxLength={6} className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-4 text-sm font-black text-white focus:border-amber-500 outline-none tracking-[0.5em]" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} />
              </div>
              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.terms ? 'bg-amber-500 border-amber-500' : 'border-gray-700 bg-gray-900'}`}>{formData.terms && <i className="fas fa-check text-xs text-white"></i>}</div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-tight">Jag accepterar villkoren</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-900 border border-gray-800 text-gray-500 font-black py-4 rounded-2xl text-[10px] uppercase">BAKÅT</button>
                <button type="submit" className="flex-[2] bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/20 text-[10px] uppercase tracking-widest">REGISTRERA</button>
              </div>
            </div>
          )}
        </form>
        <button onClick={onBack} className="w-full text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">TILLBAKA</button>
      </div>
    </div>
  );
};

export default RegisterPage;

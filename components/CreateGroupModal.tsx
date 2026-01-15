
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GroupChat } from '../types';

interface CreateGroupModalProps {
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const { currentUser, users, addGroup, setAppState } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const friends = users.filter(u => currentUser?.friends.includes(u.id));

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!currentUser) return;
    if (!currentUser.isVIP) {
      setAppState({ maintenanceMode: false, globalNotification: "VIP KRÄVS: Endast VIP-medlemmar kan skapa grupper! ✨" });
      return;
    }
    if (!groupName.trim()) {
      setAppState({ maintenanceMode: false, globalNotification: "Gruppnamn saknas!" });
      return;
    }
    if (selectedMembers.length === 0) {
      setAppState({ maintenanceMode: false, globalNotification: "Välj minst en vän!" });
      return;
    }

    const newGroup: GroupChat = {
      id: Math.random().toString(36).substr(2, 9),
      name: groupName,
      members: [currentUser.id, ...selectedMembers],
      ownerId: currentUser.id
    };

    addGroup(newGroup);
    setAppState({ maintenanceMode: false, globalNotification: `Gruppen "${groupName}" har skapats! 🎉` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] glass-dark flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-gray-950 w-full max-w-sm rounded-[3rem] p-8 border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
        <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
          <i className="fas fa-users-medical text-amber-500"></i> Skapa Grupp
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block tracking-widest">Gruppnamn</label>
            <input 
              type="text" 
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Namnge din grupp..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase mb-2 block tracking-widest">Bjud in vänner ({selectedMembers.length})</label>
            {friends.length === 0 ? (
              <p className="text-center text-gray-700 text-[10px] font-black uppercase py-8">Inga vänner att bjuda in</p>
            ) : (
              <div className="space-y-2">
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    onClick={() => toggleMember(friend.id)}
                    className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer ${selectedMembers.includes(friend.id) ? 'bg-amber-500/10 border-amber-500' : 'bg-gray-900 border-gray-800'}`}
                  >
                    <img src={friend.profileImage} className="w-8 h-8 rounded-lg object-cover mr-3" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{friend.displayName}</p>
                    </div>
                    {selectedMembers.includes(friend.id) ? (
                      <i className="fas fa-check-circle text-amber-500"></i>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-700"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-900 text-gray-500 font-black rounded-xl uppercase text-[10px] tracking-widest border border-gray-800">Avbryt</button>
          <button onClick={handleCreate} className="flex-1 py-4 bg-amber-500 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20">Skapa</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

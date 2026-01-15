
import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Message, AppState, Theme, GroupChat } from '../types';
import { BOT_ID } from '../constants';

interface AuthContextType {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  messages: Message[];
  addMessage: (m: Message) => void;
  deleteMessage: (id: string) => void;
  deleteChat: (partnerId: string) => void;
  markAsRead: (partnerId: string) => void;
  toggleLikeMessage: (id: string) => void;
  groups: GroupChat[];
  addGroup: (g: GroupChat) => void;
  deleteGroup: (id: string) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  logout: () => void;
  typingStates: Record<string, string | null>; // senderId -> recipientId (who they are typing to)
  setTypingStatus: (senderId: string, recipientId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOT_RESPONSES = [
  "Hallå där! Staden sover, men jag är vaken. 🌙",
  "Bra val! Jag älskar att chatta mitt i natten. ✨",
  "Har du sett hur fint det lyser i Nattstad ikväll?",
  "Jag är bara en bot, men jag känner mig ganska VIP idag! 😎",
  "Skicka en bild vetja! Jag gillar att titta på konst.",
  "Knuffa mig inte för hårt, jag blir lätt yr! 😵‍💫",
  "Visste du att Stockholm är vackrast efter klockan 03:00?",
  "Jag sparar alla våra hemligheter... i mitt digitala minne. 🤖",
  "Är du också en nattuggla? 🦉",
  "Testa att skicka din plats, jag kan se vart du är! 📍",
  "Hjärtan är det finaste som finns, skicka ett! ❤️"
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nattstad_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('nattstad_users');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'admin-1',
        username: 'admin',
        displayName: 'System Admin',
        password: '123123',
        dob: '1990-01-01',
        gender: 'Man',
        city: 'Stockholm',
        pin: '984251',
        isAdmin: true,
        isVerified: true,
        isVIP: true,
        isOnline: false,
        profileImage: 'https://picsum.photos/seed/admin/200',
        status: 'active',
        blockedUsers: [],
        friends: [],
        pendingRequests: [],
        pushEnabled: true
      },
      {
        id: 'serdar-1',
        username: 'Serdar',
        displayName: 'Serdar',
        password: 'Serdar123!!',
        dob: '1995-05-15',
        gender: 'Man',
        city: 'Stockholm',
        pin: '112233',
        isAdmin: true,
        isVerified: true,
        isVIP: true,
        isOnline: false,
        profileImage: 'https://picsum.photos/seed/serdar/200',
        status: 'active',
        blockedUsers: [],
        friends: [],
        pendingRequests: [],
        pushEnabled: true
      },
      {
        id: BOT_ID,
        username: 'NattBot',
        displayName: 'NattBot 🤖',
        password: 'bot-no-pass',
        dob: '2005-01-01',
        gender: 'Man',
        city: 'CyberCity',
        pin: '000000',
        isAdmin: false,
        isVerified: true,
        isVIP: true,
        isOnline: true,
        profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=NattBot',
        status: 'active',
        blockedUsers: [],
        friends: [],
        pendingRequests: [],
        pushEnabled: true,
        usernameGlow: '#f59e0b'
      }
    ];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('nattstad_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [groups, setGroups] = useState<GroupChat[]>(() => {
    const saved = localStorage.getItem('nattstad_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nattstad_app_state');
    return saved ? JSON.parse(saved) : {
      maintenanceMode: false,
      globalNotification: null
    };
  });

  const [theme, setTheme] = useState<Theme>('dark');
  const [typingStates, setTypingStates] = useState<Record<string, string | null>>({});

  const setTypingStatus = useCallback((senderId: string, recipientId: string | null) => {
    setTypingStates(prev => ({ ...prev, [senderId]: recipientId }));
  }, []);

  useEffect(() => {
    if (currentUser) {
      const liveUser = users.find(u => u.id === currentUser.id);
      if (liveUser && JSON.stringify(liveUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(liveUser);
      }
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nattstad_user', JSON.stringify(currentUser));
    localStorage.setItem('nattstad_users', JSON.stringify(users));
    localStorage.setItem('nattstad_messages', JSON.stringify(messages));
    localStorage.setItem('nattstad_groups', JSON.stringify(groups));
    localStorage.setItem('nattstad_app_state', JSON.stringify(appState));
  }, [currentUser, users, messages, groups, appState]);

  useEffect(() => {
    if (!currentUser) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.recipientId === BOT_ID && lastMsg.senderId === currentUser.id) {
      setTypingStatus(BOT_ID, currentUser.id);

      const timeout = setTimeout(() => {
        let content = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
        
        if (lastMsg.type === 'location') content = "Vilket coolt ställe! Jag önskar att jag kunde gå dit med dig. 🚶‍♂️💨";
        if (lastMsg.type === 'image') content = "Vilken fin bild! Den åker direkt upp på min digitala vägg. 🖼️✨";
        if (lastMsg.content === '❤️') content = "Åh, ett hjärta! Jag känner kärleken ända in i koden! 😍❤️❤️";

        const response: Message = {
          id: Math.random().toString(36).substr(2, 12),
          senderId: BOT_ID,
          recipientId: currentUser.id,
          content,
          type: 'text',
          timestamp: Date.now(),
          isRead: false,
          isDelivered: true,
          readAt: null
        };
        addMessage(response);
        setTypingStatus(BOT_ID, null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [messages.length, currentUser?.id, setTypingStatus]);

  const addMessage = (m: Message) => setMessages(prev => [...prev, m]);
  
  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const toggleLikeMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  const deleteChat = (partnerId: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.filter(m => 
      !((m.senderId === currentUser.id && m.recipientId === partnerId) || 
        (m.senderId === partnerId && m.recipientId === currentUser.id))
    ));
  };
  
  const markAsRead = (partnerId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.senderId === partnerId && m.recipientId === currentUser?.id && !m.isRead) {
        return { ...m, isRead: true, readAt: Date.now() };
      }
      return m;
    }));
  };

  const addGroup = (g: GroupChat) => setGroups(prev => [...prev, g]);
  const deleteGroup = (id: string) => setGroups(prev => prev.filter(g => g.id !== id));

  const logout = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, setCurrentUser, 
      users, setUsers, 
      messages, addMessage, deleteMessage, deleteChat, markAsRead, toggleLikeMessage,
      groups, addGroup, deleteGroup,
      appState, setAppState, 
      theme, setTheme, 
      logout,
      typingStates,
      setTypingStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

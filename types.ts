
export type Gender = 'Man' | 'Kvinna';
export type Theme = 'dark' | 'light';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  password?: string;
  dob: string; // ISO String
  gender: Gender;
  city: string;
  pin: string;
  isAdmin: boolean;
  isVerified: boolean;
  isVIP: boolean;
  isOnline: boolean;
  profileImage: string;
  status: 'active' | 'dnd' | 'offline';
  blockedUsers: string[]; // usernames
  friends: string[]; // user IDs
  pendingRequests: string[]; // user IDs
  pushEnabled: boolean;
  lastActive?: number;
  profileAnimation?: 'none' | 'pulse' | 'glow' | 'border-flow';
  usernameGlow?: string; // Hex color for the glow effect
}

export type MessageType = 'text' | 'voice' | 'image' | 'location' | 'nudge' | 'gif';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string; // or groupId
  content: string; // text or media URL
  type: MessageType;
  timestamp: number;
  isRead: boolean;
  isDelivered: boolean;
  liked?: boolean;
  readAt: number | null;
}

export interface GroupChat {
  id: string;
  name: string;
  members: string[]; // user IDs
  ownerId: string;
}

export interface AppState {
  maintenanceMode: boolean;
  globalNotification: string | null;
}

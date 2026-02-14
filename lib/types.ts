export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentNumber: string;
  buildingName: string;
  floor: string;
  moveInDate: string;
  isSetup: boolean;
  created_at?: string; // Backend field
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'general' | 'maintenance' | 'event' | 'emergency';
  createdAt: string;
  isRead: boolean;
  author: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'noise' | 'cleanliness' | 'parking' | 'other';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface GuestVisit {
  id: string;
  guestName: string;
  purpose: string;
  vehicleNumber: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'expected' | 'checked_in' | 'checked_out';
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Neighbor {
  id: string;
  name: string;
  apartmentNumber: string;
  floor: string;
}

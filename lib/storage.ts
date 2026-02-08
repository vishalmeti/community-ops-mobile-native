import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Announcement, Complaint, GuestVisit, ChatRoom, Message, Neighbor } from './types';
import { defaultProfile, seedAnnouncements, seedComplaints, seedGuestVisits, seedChatRooms, seedMessages, seedNeighbors } from './seed-data';

const KEYS = {
  PROFILE: '@haven_profile',
  ANNOUNCEMENTS: '@haven_announcements',
  COMPLAINTS: '@haven_complaints',
  GUESTS: '@haven_guests',
  CHAT_ROOMS: '@haven_chat_rooms',
  MESSAGES: '@haven_messages',
  NEIGHBORS: '@haven_neighbors',
  INITIALIZED: '@haven_initialized',
};

async function getItem<T>(key: string): Promise<T | null> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function initializeData(): Promise<void> {
  const initialized = await AsyncStorage.getItem(KEYS.INITIALIZED);
  if (initialized) return;

  await Promise.all([
    setItem(KEYS.PROFILE, defaultProfile),
    setItem(KEYS.ANNOUNCEMENTS, seedAnnouncements),
    setItem(KEYS.COMPLAINTS, seedComplaints),
    setItem(KEYS.GUESTS, seedGuestVisits),
    setItem(KEYS.CHAT_ROOMS, seedChatRooms),
    setItem(KEYS.MESSAGES, seedMessages),
    setItem(KEYS.NEIGHBORS, seedNeighbors),
  ]);

  await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
}

export async function getProfile(): Promise<UserProfile> {
  const profile = await getItem<UserProfile>(KEYS.PROFILE);
  return profile || defaultProfile;
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getProfile();
  const updated = { ...current, ...profile };
  await setItem(KEYS.PROFILE, updated);
  return updated;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const items = await getItem<Announcement[]>(KEYS.ANNOUNCEMENTS);
  return items || seedAnnouncements;
}

export async function markAnnouncementRead(id: string): Promise<void> {
  const items = await getAnnouncements();
  const updated = items.map(a => a.id === id ? { ...a, isRead: true } : a);
  await setItem(KEYS.ANNOUNCEMENTS, updated);
}

export async function getComplaints(): Promise<Complaint[]> {
  const items = await getItem<Complaint[]>(KEYS.COMPLAINTS);
  return items || seedComplaints;
}

export async function addComplaint(complaint: Complaint): Promise<void> {
  const items = await getComplaints();
  items.unshift(complaint);
  await setItem(KEYS.COMPLAINTS, items);
}

export async function getGuestVisits(): Promise<GuestVisit[]> {
  const items = await getItem<GuestVisit[]>(KEYS.GUESTS);
  return items || seedGuestVisits;
}

export async function addGuestVisit(guest: GuestVisit): Promise<void> {
  const items = await getGuestVisits();
  items.unshift(guest);
  await setItem(KEYS.GUESTS, items);
}

export async function updateGuestStatus(id: string, status: GuestVisit['status']): Promise<void> {
  const items = await getGuestVisits();
  const updated = items.map(g => {
    if (g.id === id) {
      return {
        ...g,
        status,
        checkOutTime: status === 'checked_out' ? new Date().toISOString() : g.checkOutTime,
        checkInTime: status === 'checked_in' && !g.checkInTime ? new Date().toISOString() : g.checkInTime,
      };
    }
    return g;
  });
  await setItem(KEYS.GUESTS, updated);
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const items = await getItem<ChatRoom[]>(KEYS.CHAT_ROOMS);
  return items || seedChatRooms;
}

export async function getMessages(roomId: string): Promise<Message[]> {
  const allMessages = await getItem<Record<string, Message[]>>(KEYS.MESSAGES);
  const msgs = allMessages || seedMessages;
  return msgs[roomId] || [];
}

export async function sendMessage(roomId: string, text: string, senderName: string): Promise<Message> {
  const allMessages = await getItem<Record<string, Message[]>>(KEYS.MESSAGES) || seedMessages;
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const message: Message = {
    id,
    roomId,
    senderId: 'user_1',
    senderName,
    text,
    timestamp: new Date().toISOString(),
    isMe: true,
  };
  if (!allMessages[roomId]) allMessages[roomId] = [];
  allMessages[roomId].push(message);
  await setItem(KEYS.MESSAGES, allMessages);

  const rooms = await getChatRooms();
  const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, lastMessage: text, lastMessageTime: message.timestamp } : r);
  await setItem(KEYS.CHAT_ROOMS, updatedRooms);

  return message;
}

export async function getNeighbors(): Promise<Neighbor[]> {
  const items = await getItem<Neighbor[]>(KEYS.NEIGHBORS);
  return items || seedNeighbors;
}

export async function createChatRoom(room: ChatRoom): Promise<void> {
  const rooms = await getChatRooms();
  rooms.unshift(room);
  await setItem(KEYS.CHAT_ROOMS, rooms);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

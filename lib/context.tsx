import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { UserProfile, Announcement, Complaint, GuestVisit, ChatRoom, Neighbor } from './types';
import * as Storage from './storage';

interface AppContextValue {
  profile: UserProfile | null;
  announcements: Announcement[];
  complaints: Complaint[];
  guests: GuestVisit[];
  chatRooms: ChatRoom[];
  neighbors: Neighbor[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  refreshComplaints: () => Promise<void>;
  refreshGuests: () => Promise<void>;
  refreshChatRooms: () => Promise<void>;
  refreshAll: () => Promise<void>;
  unreadAnnouncementCount: number;
  totalUnreadChats: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [guests, setGuests] = useState<GuestVisit[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const p = await Storage.getProfile();
    setProfile(p);
  }, []);

  const refreshAnnouncements = useCallback(async () => {
    const a = await Storage.getAnnouncements();
    setAnnouncements(a);
  }, []);

  const refreshComplaints = useCallback(async () => {
    const c = await Storage.getComplaints();
    setComplaints(c);
  }, []);

  const refreshGuests = useCallback(async () => {
    const g = await Storage.getGuestVisits();
    setGuests(g);
  }, []);

  const refreshChatRooms = useCallback(async () => {
    const r = await Storage.getChatRooms();
    setChatRooms(r);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshProfile(),
      refreshAnnouncements(),
      refreshComplaints(),
      refreshGuests(),
      refreshChatRooms(),
      Storage.getNeighbors().then(setNeighbors),
    ]);
  }, [refreshProfile, refreshAnnouncements, refreshComplaints, refreshGuests, refreshChatRooms]);

  useEffect(() => {
    (async () => {
      await Storage.initializeData();
      await refreshAll();
      setIsLoading(false);
    })();
  }, [refreshAll]);

  const unreadAnnouncementCount = useMemo(() => announcements.filter(a => !a.isRead).length, [announcements]);
  const totalUnreadChats = useMemo(() => chatRooms.reduce((acc, r) => acc + r.unreadCount, 0), [chatRooms]);

  const value = useMemo(() => ({
    profile,
    announcements,
    complaints,
    guests,
    chatRooms,
    neighbors,
    isLoading,
    refreshProfile,
    refreshAnnouncements,
    refreshComplaints,
    refreshGuests,
    refreshChatRooms,
    refreshAll,
    unreadAnnouncementCount,
    totalUnreadChats,
  }), [profile, announcements, complaints, guests, chatRooms, neighbors, isLoading, refreshProfile, refreshAnnouncements, refreshComplaints, refreshGuests, refreshChatRooms, refreshAll, unreadAnnouncementCount, totalUnreadChats]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

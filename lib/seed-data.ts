import { Announcement, Complaint, GuestVisit, ChatRoom, Message, Neighbor, UserProfile } from './types';

export const defaultProfile: UserProfile = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex.chen@email.com',
  phone: '+1 (555) 234-5678',
  apartmentNumber: '12B',
  buildingName: 'The Residences at Park View',
  floor: '12',
  moveInDate: '2024-06-15',
  isSetup: true,
};

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Water Supply Maintenance',
    body: 'Water supply will be temporarily interrupted on Feb 10th from 10:00 AM to 2:00 PM for scheduled pipeline maintenance. Please store sufficient water beforehand. We apologize for any inconvenience.',
    category: 'maintenance',
    createdAt: '2026-02-07T09:00:00Z',
    isRead: false,
    author: 'Building Management',
  },
  {
    id: 'ann_2',
    title: 'Community BBQ Event',
    body: 'Join us for our monthly community BBQ this Saturday at the rooftop garden! Food and beverages will be provided. Families are welcome. RSVP at the front desk by Thursday.',
    category: 'event',
    createdAt: '2026-02-06T14:30:00Z',
    isRead: false,
    author: 'Social Committee',
  },
  {
    id: 'ann_3',
    title: 'New Parking Regulations',
    body: 'Starting March 1st, all vehicles must display updated parking permits. Please visit the management office to collect your new permit. Vehicles without valid permits may be towed.',
    category: 'general',
    createdAt: '2026-02-05T11:00:00Z',
    isRead: true,
    author: 'Building Management',
  },
  {
    id: 'ann_4',
    title: 'Elevator Upgrade Complete',
    body: 'We are pleased to announce that the elevator modernization project in Tower A has been completed. Both elevators are now operational with improved speed and safety features.',
    category: 'general',
    createdAt: '2026-02-04T16:00:00Z',
    isRead: true,
    author: 'Building Management',
  },
  {
    id: 'ann_5',
    title: 'Fire Drill Notice',
    body: 'A mandatory fire drill will be conducted on February 15th at 11:00 AM. All residents are required to participate. Please familiarize yourself with the evacuation routes posted on each floor.',
    category: 'emergency',
    createdAt: '2026-02-03T08:00:00Z',
    isRead: true,
    author: 'Safety Officer',
  },
];

export const seedComplaints: Complaint[] = [
  {
    id: 'comp_1',
    title: 'Leaking faucet in kitchen',
    description: 'The kitchen faucet has been dripping constantly for the past two days. Water is pooling under the sink cabinet.',
    category: 'plumbing',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2026-02-06T10:30:00Z',
    updatedAt: '2026-02-07T09:00:00Z',
  },
  {
    id: 'comp_2',
    title: 'Hallway lights flickering',
    description: 'The lights in the 12th floor hallway near apartments B and C have been flickering intermittently. Potential safety concern.',
    category: 'electrical',
    status: 'open',
    priority: 'high',
    createdAt: '2026-02-07T15:00:00Z',
    updatedAt: '2026-02-07T15:00:00Z',
  },
  {
    id: 'comp_3',
    title: 'Noise complaint - Apt 11C',
    description: 'Excessive noise from apartment 11C during late night hours (past midnight). Has been ongoing for the past week.',
    category: 'noise',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-01-28T22:00:00Z',
    updatedAt: '2026-02-02T14:00:00Z',
  },
];

export const seedGuestVisits: GuestVisit[] = [
  {
    id: 'guest_1',
    guestName: 'Robert Miller',
    purpose: 'Family visit',
    vehicleNumber: 'ABC-1234',
    checkInTime: '2026-02-08T10:00:00Z',
    checkOutTime: '',
    status: 'expected',
  },
  {
    id: 'guest_2',
    guestName: 'Lisa Wong',
    purpose: 'Package delivery',
    vehicleNumber: '',
    checkInTime: '2026-02-07T14:30:00Z',
    checkOutTime: '2026-02-07T14:45:00Z',
    status: 'checked_out',
  },
  {
    id: 'guest_3',
    guestName: 'David Park',
    purpose: 'Dinner gathering',
    vehicleNumber: 'XYZ-5678',
    checkInTime: '2026-02-07T18:00:00Z',
    checkOutTime: '2026-02-07T22:30:00Z',
    status: 'checked_out',
  },
];

export const seedNeighbors: Neighbor[] = [
  { id: 'n_1', name: 'Sarah Mitchell', apartmentNumber: '12A', floor: '12' },
  { id: 'n_2', name: 'James Rivera', apartmentNumber: '12C', floor: '12' },
  { id: 'n_3', name: 'Maya Patel', apartmentNumber: '11B', floor: '11' },
  { id: 'n_4', name: 'Tom Nguyen', apartmentNumber: '12D', floor: '12' },
  { id: 'n_5', name: 'Emma Wilson', apartmentNumber: '11A', floor: '11' },
];

export const seedChatRooms: ChatRoom[] = [
  {
    id: 'room_1',
    name: 'Sarah Mitchell',
    type: 'direct',
    participants: ['user_1', 'n_1'],
    lastMessage: 'Sure, I can water your plants!',
    lastMessageTime: '2026-02-08T08:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'room_2',
    name: 'James Rivera',
    type: 'direct',
    participants: ['user_1', 'n_2'],
    lastMessage: 'Thanks for letting me know about the parking.',
    lastMessageTime: '2026-02-07T19:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'room_3',
    name: 'Floor 12 Neighbors',
    type: 'group',
    participants: ['user_1', 'n_1', 'n_2', 'n_4'],
    lastMessage: 'Anyone up for the rooftop BBQ?',
    lastMessageTime: '2026-02-07T20:15:00Z',
    unreadCount: 3,
  },
  {
    id: 'room_4',
    name: 'Building Community',
    type: 'group',
    participants: ['user_1', 'n_1', 'n_2', 'n_3', 'n_4', 'n_5'],
    lastMessage: 'The new gym hours are posted in the lobby.',
    lastMessageTime: '2026-02-07T16:00:00Z',
    unreadCount: 0,
  },
];

export const seedMessages: Record<string, Message[]> = {
  room_1: [
    { id: 'm1_1', roomId: 'room_1', senderId: 'user_1', senderName: 'You', text: 'Hey Sarah! I\'m going out of town this weekend. Could you water my plants?', timestamp: '2026-02-08T08:15:00Z', isMe: true },
    { id: 'm1_2', roomId: 'room_1', senderId: 'n_1', senderName: 'Sarah Mitchell', text: 'Sure, I can water your plants!', timestamp: '2026-02-08T08:30:00Z', isMe: false },
  ],
  room_2: [
    { id: 'm2_1', roomId: 'room_2', senderId: 'n_2', senderName: 'James Rivera', text: 'Hey, did you see the new parking regulations?', timestamp: '2026-02-07T18:30:00Z', isMe: false },
    { id: 'm2_2', roomId: 'room_2', senderId: 'user_1', senderName: 'You', text: 'Yes, I picked up my new permit today. Don\'t forget to get yours!', timestamp: '2026-02-07T18:45:00Z', isMe: true },
    { id: 'm2_3', roomId: 'room_2', senderId: 'n_2', senderName: 'James Rivera', text: 'Thanks for letting me know about the parking.', timestamp: '2026-02-07T19:00:00Z', isMe: false },
  ],
  room_3: [
    { id: 'm3_1', roomId: 'room_3', senderId: 'n_1', senderName: 'Sarah Mitchell', text: 'The hallway lights are flickering again on our floor', timestamp: '2026-02-07T19:30:00Z', isMe: false },
    { id: 'm3_2', roomId: 'room_3', senderId: 'n_4', senderName: 'Tom Nguyen', text: 'I noticed that too. Should we file a complaint?', timestamp: '2026-02-07T19:45:00Z', isMe: false },
    { id: 'm3_3', roomId: 'room_3', senderId: 'user_1', senderName: 'You', text: 'Already filed one. Management said they\'ll look into it.', timestamp: '2026-02-07T20:00:00Z', isMe: true },
    { id: 'm3_4', roomId: 'room_3', senderId: 'n_2', senderName: 'James Rivera', text: 'Anyone up for the rooftop BBQ?', timestamp: '2026-02-07T20:15:00Z', isMe: false },
  ],
  room_4: [
    { id: 'm4_1', roomId: 'room_4', senderId: 'n_5', senderName: 'Emma Wilson', text: 'Has anyone tried the new gym equipment?', timestamp: '2026-02-07T15:30:00Z', isMe: false },
    { id: 'm4_2', roomId: 'room_4', senderId: 'n_3', senderName: 'Maya Patel', text: 'Yes! The new treadmills are great', timestamp: '2026-02-07T15:45:00Z', isMe: false },
    { id: 'm4_3', roomId: 'room_4', senderId: 'n_1', senderName: 'Sarah Mitchell', text: 'The new gym hours are posted in the lobby.', timestamp: '2026-02-07T16:00:00Z', isMe: false },
  ],
};

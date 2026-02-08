import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';
import { ChatRoom } from '@/lib/types';

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Now';
  if (hours < 24) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function ChatRoomItem({ room }: { room: ChatRoom }) {
  const isGroup = room.type === 'group';
  const color = getAvatarColor(room.id);

  return (
    <Pressable
      style={({ pressed }) => [styles.chatItem, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: room.id } })}
    >
      <View style={[styles.avatar, { backgroundColor: color + '20' }]}>
        {isGroup ? (
          <Ionicons name="people" size={22} color={color} />
        ) : (
          <Text style={[styles.avatarText, { color }]}>{getInitials(room.name)}</Text>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{room.name}</Text>
          <Text style={[styles.chatTime, room.unreadCount > 0 && styles.chatTimeUnread]}>
            {formatTime(room.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text style={[styles.chatMessage, room.unreadCount > 0 && styles.chatMessageUnread]} numberOfLines={1}>
            {room.lastMessage}
          </Text>
          {room.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{room.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { chatRooms, isLoading } = useApp();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const directChats = chatRooms.filter(r => r.type === 'direct');
  const groupChats = chatRooms.filter(r => r.type === 'group');

  const sections = [
    ...(groupChats.length > 0 ? [{ type: 'header' as const, title: 'Group Chats' }] : []),
    ...groupChats.map(r => ({ type: 'room' as const, room: r })),
    ...(directChats.length > 0 ? [{ type: 'header' as const, title: 'Direct Messages' }] : []),
    ...directChats.map(r => ({ type: 'room' as const, room: r })),
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: topInset + 12 }]}>
        <Text style={styles.screenTitle}>Chat</Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => item.type === 'header' ? `header_${index}` : (item as any).room.id}
        contentContainerStyle={{ paddingBottom: 100 + bottomInset, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sections.length > 0}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
            );
          }
          return <ChatRoomItem room={(item as any).room} />;
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>Start chatting with your neighbors</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerArea: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: Colors.background },
  screenTitle: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.text },
  sectionHeader: { paddingTop: 20, paddingBottom: 8 },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.divider },
  pressed: { opacity: 0.7 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'DMSans_700Bold', fontSize: 18 },
  chatContent: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: Colors.text, flex: 1, marginRight: 8 },
  chatTime: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary },
  chatTimeUnread: { color: Colors.accent },
  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, flex: 1, marginRight: 8 },
  chatMessageUnread: { fontFamily: 'DMSans_500Medium', color: Colors.text },
  unreadBadge: { backgroundColor: Colors.accent, minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.surface },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 8 },
  emptyTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: Colors.text },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary },
});

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';
import * as Storage from '@/lib/storage';
import { Message, ChatRoom } from '@/lib/types';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function MessageBubble({ message, isGroup }: { message: Message; isGroup: boolean }) {
  const color = getAvatarColor(message.senderName);

  if (message.isMe) {
    return (
      <View style={styles.myMessageRow}>
        <View style={styles.myBubble}>
          <Text style={styles.myMessageText}>{message.text}</Text>
          <Text style={styles.myTimeText}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherMessageRow}>
      {isGroup && (
        <View style={[styles.smallAvatar, { backgroundColor: color + '20' }]}>
          <Text style={[styles.smallAvatarText, { color }]}>{getInitials(message.senderName)}</Text>
        </View>
      )}
      <View style={styles.otherBubble}>
        {isGroup && <Text style={[styles.senderName, { color }]}>{message.senderName}</Text>}
        <Text style={styles.otherMessageText}>{message.text}</Text>
        <Text style={styles.otherTimeText}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function ChatConversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { chatRooms, profile, refreshChatRooms } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    const foundRoom = chatRooms.find(r => r.id === id);
    if (foundRoom) setRoom(foundRoom);
    loadMessages();
  }, [id, chatRooms]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const msgs = await Storage.getMessages(id);
    setMessages(msgs);
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !id || !profile) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = inputText.trim();
    setInputText('');

    await Storage.sendMessage(id, text, profile.name);
    await loadMessages();
    await refreshChatRooms();
  };

  const isGroup = room?.type === 'group';
  const reversedMessages = [...messages].reverse();

  return (
    <>
      <Stack.Screen options={{ title: room?.name || 'Chat' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={reversedMessages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} isGroup={isGroup} />}
          contentContainerStyle={[styles.messageList, { paddingBottom: 8 }]}
          showsVerticalScrollIndicator={false}
          inverted
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-outline" size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyChatText}>Start a conversation</Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottomInset, 8) }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={500}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
                pressed && !!inputText.trim() && styles.pressed,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="arrow-up" size={20} color={Colors.surface} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messageList: { paddingHorizontal: 16, paddingTop: 12 },
  myMessageRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  myBubble: { backgroundColor: Colors.primary, borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '78%' },
  myMessageText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.surface, lineHeight: 21 },
  myTimeText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'right' as const },
  otherMessageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6, gap: 8 },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { fontFamily: 'DMSans_700Bold', fontSize: 10 },
  otherBubble: { backgroundColor: Colors.surface, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '78%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  senderName: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, marginBottom: 2 },
  otherMessageText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.text, lineHeight: 21 },
  otherTimeText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textTertiary, marginTop: 4 },
  inputContainer: { backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: Colors.divider, paddingTop: 8, paddingHorizontal: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  textInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 16, backgroundColor: Colors.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, maxHeight: 100, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.3 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8, transform: [{ scaleY: -1 }] },
  emptyChatText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.textTertiary },
});

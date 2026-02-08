import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';
import * as Storage from '@/lib/storage';
import { Announcement } from '@/lib/types';

function getCategoryMeta(category: string) {
  switch (category) {
    case 'maintenance': return { icon: 'construct' as const, color: Colors.warning, bg: Colors.warningLight, label: 'Maintenance' };
    case 'event': return { icon: 'calendar' as const, color: Colors.info, bg: Colors.infoLight, label: 'Event' };
    case 'emergency': return { icon: 'alert-circle' as const, color: Colors.error, bg: Colors.errorLight, label: 'Emergency' };
    default: return { icon: 'information-circle' as const, color: Colors.primary, bg: '#F0F4F8', label: 'General' };
  }
}

export default function AnnouncementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { announcements, refreshAnnouncements } = useApp();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      setAnnouncement(ann);
      if (!ann.isRead) {
        Storage.markAnnouncementRead(ann.id).then(() => refreshAnnouncements());
      }
    }
  }, [id, announcements]);

  if (!announcement) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const meta = getCategoryMeta(announcement.category);
  const date = new Date(announcement.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <Stack.Screen options={{ title: meta.label }} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={16} color={meta.color} />
            <Text style={[styles.categoryText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          <Text style={styles.title}>{announcement.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{announcement.author}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.body}>{announcement.body}</Text>

          <View style={styles.timeCard}>
            <Ionicons name="calendar-outline" size={18} color={Colors.accent} />
            <View>
              <Text style={styles.timeCardLabel}>Posted</Text>
              <Text style={styles.timeCardValue}>{formattedDate} at {formattedTime}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: Colors.textSecondary },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, gap: 6, marginBottom: 16 },
  categoryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  title: { fontFamily: 'DMSans_700Bold', fontSize: 26, color: Colors.text, lineHeight: 34, marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textTertiary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textTertiary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 20 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: Colors.text, lineHeight: 26 },
  timeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentLight + '40', borderRadius: 14, padding: 16, gap: 14, marginTop: 28 },
  timeCardLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary },
  timeCardValue: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.text, marginTop: 2 },
});

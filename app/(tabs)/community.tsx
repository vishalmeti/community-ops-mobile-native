import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCategoryMeta(category: string) {
  switch (category) {
    case 'maintenance': return { icon: 'construct-outline' as const, color: Colors.warning, bg: Colors.warningLight, label: 'Maintenance' };
    case 'event': return { icon: 'calendar-outline' as const, color: Colors.info, bg: Colors.infoLight, label: 'Event' };
    case 'emergency': return { icon: 'alert-circle-outline' as const, color: Colors.error, bg: Colors.errorLight, label: 'Emergency' };
    default: return { icon: 'information-circle-outline' as const, color: Colors.primary, bg: '#F0F4F8', label: 'General' };
  }
}

function getStatusMeta(status: string) {
  switch (status) {
    case 'open': return { color: Colors.warning, label: 'Open' };
    case 'in_progress': return { color: Colors.info, label: 'In Progress' };
    case 'resolved': return { color: Colors.success, label: 'Resolved' };
    default: return { color: Colors.textTertiary, label: status };
  }
}

function getPriorityMeta(priority: string) {
  switch (priority) {
    case 'high': return { color: Colors.error, label: 'High' };
    case 'medium': return { color: Colors.warning, label: 'Medium' };
    default: return { color: Colors.success, label: 'Low' };
  }
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'announcements' | 'complaints'>('announcements');
  const { announcements, complaints, refreshAnnouncements, refreshComplaints } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await (activeTab === 'announcements' ? refreshAnnouncements() : refreshComplaints());
    setRefreshing(false);
  };

  const switchTab = (tab: 'announcements' | 'complaints') => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: topInset + 12 }]}>
        <Text style={styles.screenTitle}>Community</Text>
        <View style={styles.segmentControl}>
          <Pressable
            style={[styles.segment, activeTab === 'announcements' && styles.segmentActive]}
            onPress={() => switchTab('announcements')}
          >
            <Text style={[styles.segmentText, activeTab === 'announcements' && styles.segmentTextActive]}>Announcements</Text>
          </Pressable>
          <Pressable
            style={[styles.segment, activeTab === 'complaints' && styles.segmentActive]}
            onPress={() => switchTab('complaints')}
          >
            <Text style={[styles.segmentText, activeTab === 'complaints' && styles.segmentTextActive]}>Complaints</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {activeTab === 'announcements' ? (
          announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Announcements</Text>
              <Text style={styles.emptyText}>Community updates will appear here</Text>
            </View>
          ) : (
            announcements.map((ann) => {
              const meta = getCategoryMeta(ann.category);
              return (
                <Pressable
                  key={ann.id}
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                  onPress={() => router.push({ pathname: '/announcement/[id]', params: { id: ann.id } })}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={14} color={meta.color} />
                      <Text style={[styles.categoryText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      {!ann.isRead && <View style={styles.unreadDot} />}
                      <Text style={styles.timeText}>{formatDate(ann.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{ann.title}</Text>
                  <Text style={styles.cardBody} numberOfLines={2}>{ann.body}</Text>
                  <Text style={styles.authorText}>{ann.author}</Text>
                </Pressable>
              );
            })
          )
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              onPress={() => router.push('/complaint/new')}
            >
              <Feather name="plus" size={18} color={Colors.surface} />
              <Text style={styles.addButtonText}>Report an Issue</Text>
            </Pressable>
            {complaints.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Complaints</Text>
                <Text style={styles.emptyText}>Everything looks good!</Text>
              </View>
            ) : (
              complaints.map((comp) => {
                const status = getStatusMeta(comp.status);
                const priority = getPriorityMeta(comp.priority);
                return (
                  <View key={comp.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priority.color + '18' }]}>
                        <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{comp.title}</Text>
                    <Text style={styles.cardBody} numberOfLines={2}>{comp.description}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.categoryLabel}>{comp.category.charAt(0).toUpperCase() + comp.category.slice(1)}</Text>
                      <Text style={styles.timeText}>{formatDate(comp.createdAt)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerArea: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.background },
  screenTitle: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.text, marginBottom: 16 },
  segmentControl: { flexDirection: 'row', backgroundColor: Colors.border + '60', borderRadius: 12, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  segmentText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.textSecondary },
  segmentTextActive: { color: Colors.text, fontFamily: 'DMSans_600SemiBold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  categoryText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  timeText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary },
  cardTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: Colors.text, marginBottom: 6 },
  cardBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  authorText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary, marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  categoryLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, gap: 8, marginBottom: 16 },
  addButtonText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.surface },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: Colors.text },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary },
});

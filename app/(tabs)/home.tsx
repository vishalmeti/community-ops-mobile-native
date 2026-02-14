import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

function getCategoryIcon(category: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } {
  switch (category) {
    case 'maintenance': return { name: 'construct-outline', color: Colors.warning, bg: Colors.warningLight };
    case 'event': return { name: 'calendar-outline', color: Colors.info, bg: Colors.infoLight };
    case 'emergency': return { name: 'alert-circle-outline', color: Colors.error, bg: Colors.errorLight };
    default: return { name: 'information-circle-outline', color: Colors.primary, bg: '#F0F4F8' };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return Colors.warning;
    case 'in_progress': return Colors.info;
    case 'resolved': return Colors.success;
    default: return Colors.textTertiary;
  }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, announcements, complaints, guests, totalUnreadChats, unreadAnnouncementCount, refreshAll, isLoading } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const activeComplaints = complaints.filter(c => c.status !== 'resolved').length;
  const todayGuests = guests.filter(g => {
    const d = new Date(g.checkInTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const recentAnnouncements = announcements.slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading || !profile) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonLarge} />
          <View style={styles.skeletonMedium} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16, paddingBottom: 100 + bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{profile.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.apartmentBadge}>
            <Ionicons name="location-outline" size={14} color={Colors.accent} />
            <Text style={styles.apartmentText}>Apt {profile.apartmentNumber}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/community')}>
            <View style={[styles.statIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="megaphone-outline" size={20} color={Colors.info} />
            </View>
            <Text style={styles.statNumber}>{unreadAnnouncementCount}</Text>
            <Text style={styles.statLabel}>New Updates</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/community')}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="construct-outline" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statNumber}>{activeComplaints}</Text>
            <Text style={styles.statLabel}>Active Issues</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/guests')}>
            <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="people-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statNumber}>{todayGuests}</Text>
            <Text style={styles.statLabel}>Guests Today</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/chat')}>
            <View style={[styles.statIcon, { backgroundColor: '#F5F0FF' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statNumber}>{totalUnreadChats}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </Pressable>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => router.push('/complaint/new')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.errorLight }]}>
                <Feather name="alert-triangle" size={18} color={Colors.error} />
              </View>
              <Text style={styles.actionText}>Report Issue</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => router.push('/guest/new')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
                <Feather name="user-plus" size={18} color={Colors.success} />
              </View>
              <Text style={styles.actionText}>Add Guest</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => router.push('/(tabs)/chat')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.infoLight }]}>
                <Feather name="message-circle" size={18} color={Colors.info} />
              </View>
              <Text style={styles.actionText}>Chat</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <Pressable onPress={() => router.push('/(tabs)/community')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {recentAnnouncements.map((ann) => {
            const icon = getCategoryIcon(ann.category);
            return (
              <Pressable
                key={ann.id}
                style={({ pressed }) => [styles.announcementCard, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/announcement/[id]', params: { id: ann.id } })}
              >
                <View style={[styles.annIcon, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={18} color={icon.color} />
                </View>
                <View style={styles.annContent}>
                  <View style={styles.annTitleRow}>
                    <Text style={styles.annTitle} numberOfLines={1}>{ann.title}</Text>
                    {!ann.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.annBody} numberOfLines={2}>{ann.body}</Text>
                  <Text style={styles.annTime}>{formatDate(ann.createdAt)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {complaints.filter(c => c.status !== 'resolved').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Complaints</Text>
              <Pressable onPress={() => router.push('/(tabs)/community')}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {complaints.filter(c => c.status !== 'resolved').slice(0, 2).map((comp) => (
              <View key={comp.id} style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle} numberOfLines={1}>{comp.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(comp.status) + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(comp.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(comp.status) }]}>
                      {comp.status === 'in_progress' ? 'In Progress' : 'Open'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.complaintDesc} numberOfLines={1}>{comp.description}</Text>
                <Text style={styles.complaintTime}>{formatDate(comp.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buildingInfo}>
          <View style={styles.buildingIcon}>
            <Ionicons name="business-outline" size={20} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.buildingName}>{profile.buildingName}</Text>
            <Text style={styles.buildingDetail}>Floor {profile.floor} | Apartment {profile.apartmentNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  skeletonLarge: { width: 200, height: 24, borderRadius: 8, backgroundColor: Colors.skeleton },
  skeletonMedium: { width: 150, height: 16, borderRadius: 6, backgroundColor: Colors.skeleton },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.textSecondary },
  userName: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.text, marginTop: 2 },
  apartmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentLight + '60', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, marginTop: 4 },
  apartmentText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.accentDark },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNumber: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textTertiary, marginTop: 2, textAlign: 'center' },
  quickActions: { marginBottom: 28 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionButton: { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: Colors.text },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: Colors.text },
  seeAll: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.accent },
  announcementCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1, gap: 12 },
  annIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  annContent: { flex: 1 },
  annTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  annTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  annBody: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  annTime: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary, marginTop: 6 },
  complaintCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  complaintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  complaintTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.text, flex: 1, marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  complaintDesc: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  complaintTime: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary, marginTop: 6 },
  buildingInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentLight + '40', borderRadius: 16, padding: 16, gap: 14, marginBottom: 20 },
  buildingIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  buildingName: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.text },
  buildingDetail: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});

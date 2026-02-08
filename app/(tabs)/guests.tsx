import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, RefreshControl, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';
import * as Storage from '@/lib/storage';
import { GuestVisit } from '@/lib/types';

function formatDateTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getStatusMeta(status: string) {
  switch (status) {
    case 'expected': return { color: Colors.info, bg: Colors.infoLight, label: 'Expected', icon: 'time-outline' as const };
    case 'checked_in': return { color: Colors.success, bg: Colors.successLight, label: 'Checked In', icon: 'checkmark-circle-outline' as const };
    case 'checked_out': return { color: Colors.textTertiary, bg: '#F1F5F9', label: 'Checked Out', icon: 'exit-outline' as const };
    default: return { color: Colors.textTertiary, bg: '#F1F5F9', label: status, icon: 'help-outline' as const };
  }
}

function GuestCard({ guest, onStatusChange }: { guest: GuestVisit; onStatusChange: () => void }) {
  const status = getStatusMeta(guest.status);

  const handleAction = async (newStatus: GuestVisit['status']) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Storage.updateGuestStatus(guest.id, newStatus);
    onStatusChange();
  };

  return (
    <View style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <View style={[styles.guestAvatar, { backgroundColor: status.bg }]}>
          <Ionicons name="person-outline" size={22} color={status.color} />
        </View>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{guest.guestName}</Text>
          <Text style={styles.guestPurpose}>{guest.purpose}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} />
          <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.guestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.detailText}>{formatDateTime(guest.checkInTime)}</Text>
        </View>
        {!!guest.vehicleNumber && (
          <View style={styles.detailRow}>
            <Ionicons name="car-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>{guest.vehicleNumber}</Text>
          </View>
        )}
        {!!guest.checkOutTime && (
          <View style={styles.detailRow}>
            <Ionicons name="exit-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>Left: {formatDateTime(guest.checkOutTime)}</Text>
          </View>
        )}
      </View>

      {guest.status !== 'checked_out' && (
        <View style={styles.actionRow}>
          {guest.status === 'expected' && (
            <Pressable
              style={({ pressed }) => [styles.guestAction, styles.checkInAction, pressed && styles.pressed]}
              onPress={() => handleAction('checked_in')}
            >
              <Ionicons name="checkmark" size={16} color={Colors.surface} />
              <Text style={styles.checkInText}>Check In</Text>
            </Pressable>
          )}
          {guest.status === 'checked_in' && (
            <Pressable
              style={({ pressed }) => [styles.guestAction, styles.checkOutAction, pressed && styles.pressed]}
              onPress={() => handleAction('checked_out')}
            >
              <Ionicons name="exit-outline" size={16} color={Colors.primary} />
              <Text style={styles.checkOutText}>Check Out</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function GuestsScreen() {
  const insets = useSafeAreaInsets();
  const { guests, refreshGuests } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'history'>('all');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGuests();
    setRefreshing(false);
  };

  const filteredGuests = guests.filter(g => {
    if (filter === 'active') return g.status !== 'checked_out';
    if (filter === 'history') return g.status === 'checked_out';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Guests</Text>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => router.push('/guest/new')}
          >
            <Feather name="plus" size={20} color={Colors.surface} />
          </Pressable>
        </View>
        <View style={styles.filterRow}>
          {(['all', 'active', 'history'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setFilter(f);
              }}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {filteredGuests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Guests</Text>
            <Text style={styles.emptyText}>
              {filter === 'active' ? 'No active guests right now' : filter === 'history' ? 'No guest history yet' : 'Tap + to add a guest visit'}
            </Text>
          </View>
        ) : (
          filteredGuests.map(guest => (
            <GuestCard key={guest.id} guest={guest} onStatusChange={refreshGuests} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerArea: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.surface },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  guestCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  guestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  guestInfo: { flex: 1 },
  guestName: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: Colors.text },
  guestPurpose: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusChipText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  guestDetails: { marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: Colors.divider, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  actionRow: { marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: Colors.divider, flexDirection: 'row', gap: 10 },
  guestAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  checkInAction: { backgroundColor: Colors.success },
  checkOutAction: { backgroundColor: Colors.border },
  checkInText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.surface },
  checkOutText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.primary },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 8 },
  emptyTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: Colors.text },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary },
});

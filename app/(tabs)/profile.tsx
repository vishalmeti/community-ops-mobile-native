import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/context';
import * as Storage from '@/lib/storage';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  if (!profile) return null;

  const startEditing = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Storage.updateProfile({ name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() });
    await refreshProfile();
    setIsEditing(false);
  };

  const memberSince = new Date(profile.moveInDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 12, paddingBottom: 100 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Pressable onPress={isEditing ? saveProfile : startEditing}>
            <Feather name={isEditing ? "check" : "edit-2"} size={20} color={isEditing ? Colors.success : Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{getInitials(profile.name)}</Text>
          </View>
          {isEditing ? (
            <View style={styles.editFields}>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor={Colors.textTertiary}
              />
              <TextInput
                style={styles.editInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Phone"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRole}>Resident</Text>
            </>
          )}
        </View>

        {!isEditing && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Contact Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: Colors.infoLight }]}>
                    <Ionicons name="mail-outline" size={16} color={Colors.info} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: Colors.successLight }]}>
                    <Ionicons name="call-outline" size={16} color={Colors.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Apartment Details</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: Colors.accentLight }]}>
                    <Ionicons name="business-outline" size={16} color={Colors.accentDark} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Building</Text>
                    <Text style={styles.infoValue}>{profile.buildingName}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: Colors.warningLight }]}>
                    <Ionicons name="layers-outline" size={16} color={Colors.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Floor / Apartment</Text>
                    <Text style={styles.infoValue}>Floor {profile.floor} | Apt {profile.apartmentNumber}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: '#F5F0FF' }]}>
                    <Ionicons name="calendar-outline" size={16} color="#7C3AED" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{memberSince}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Settings</Text>
              <View style={styles.infoCard}>
                <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: '#F1F5F9' }]}>
                      <Ionicons name="notifications-outline" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.settingText}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </View>
                </Pressable>
                <View style={styles.infoDivider} />
                <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: '#F1F5F9' }]}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.settingText}>Privacy</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </View>
                </Pressable>
                <View style={styles.infoDivider} />
                <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: '#F1F5F9' }]}>
                      <Ionicons name="help-circle-outline" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.settingText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </View>
                </Pressable>
              </View>
            </View>

            <Text style={styles.versionText}>Haven v1.0.0</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.text },
  profileCard: { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 28, paddingHorizontal: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarLargeText: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: Colors.accentDark },
  profileName: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: Colors.text },
  profileRole: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  editFields: { width: '100%', gap: 12, marginTop: 8 },
  editInput: { fontFamily: 'DMSans_400Regular', fontSize: 16, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  infoSection: { marginBottom: 24 },
  sectionLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 10, paddingLeft: 4 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary },
  infoValue: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: Colors.text, marginTop: 2 },
  infoDivider: { height: 0.5, backgroundColor: Colors.divider, marginLeft: 66 },
  settingRow: {},
  settingText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: Colors.text, flex: 1 },
  pressed: { opacity: 0.7 },
  versionText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textTertiary, textAlign: 'center', marginTop: 8, marginBottom: 20 },
});

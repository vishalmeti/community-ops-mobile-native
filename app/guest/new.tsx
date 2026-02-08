import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import * as Storage from '@/lib/storage';
import { useApp } from '@/lib/context';
import { GuestVisit } from '@/lib/types';

export default function NewGuestScreen() {
  const { refreshGuests } = useApp();
  const [guestName, setGuestName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = guestName.trim().length > 0 && purpose.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const guest: GuestVisit = {
      id: 'guest_' + Date.now().toString() + Math.random().toString(36).substr(2, 9),
      guestName: guestName.trim(),
      purpose: purpose.trim(),
      vehicleNumber: vehicleNumber.trim(),
      checkInTime: new Date().toISOString(),
      checkOutTime: '',
      status: 'expected',
    };

    await Storage.addGuestVisit(guest);
    await refreshGuests();
    router.back();
  };

  const purposeSuggestions = ['Family visit', 'Friend visit', 'Delivery', 'Maintenance', 'Business meeting'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Guest</Text>
        <Text style={styles.headerSubtitle}>Register an expected or arriving guest</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Guest Name</Text>
        <TextInput
          style={styles.input}
          value={guestName}
          onChangeText={setGuestName}
          placeholder="Full name of the guest"
          placeholderTextColor={Colors.textTertiary}
        />

        <Text style={styles.label}>Purpose of Visit</Text>
        <TextInput
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Reason for visit"
          placeholderTextColor={Colors.textTertiary}
        />
        <View style={styles.suggestions}>
          {purposeSuggestions.map(s => (
            <Pressable
              key={s}
              style={[styles.suggestionChip, purpose === s && styles.suggestionChipActive]}
              onPress={() => setPurpose(s)}
            >
              <Text style={[styles.suggestionText, purpose === s && styles.suggestionTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Vehicle Number (Optional)</Text>
        <TextInput
          style={styles.input}
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholder="e.g., ABC-1234"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="characters"
        />

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Ionicons name="person-add-outline" size={18} color={Colors.surface} />
          <Text style={styles.submitText}>{submitting ? 'Adding...' : 'Add Guest'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  headerTitle: { fontFamily: 'DMSans_700Bold', fontSize: 24, color: Colors.text },
  headerSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: { fontFamily: 'DMSans_400Regular', fontSize: 16, backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  suggestionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  suggestionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  suggestionText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  suggestionTextActive: { color: Colors.surface },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 32 },
  submitButtonDisabled: { opacity: 0.4 },
  submitText: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: Colors.surface },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

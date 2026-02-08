import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import * as Storage from '@/lib/storage';
import { useApp } from '@/lib/context';
import { Complaint } from '@/lib/types';

const categories = [
  { value: 'plumbing', label: 'Plumbing', icon: 'water-outline' as const },
  { value: 'electrical', label: 'Electrical', icon: 'flash-outline' as const },
  { value: 'noise', label: 'Noise', icon: 'volume-high-outline' as const },
  { value: 'cleanliness', label: 'Cleanliness', icon: 'sparkles-outline' as const },
  { value: 'parking', label: 'Parking', icon: 'car-outline' as const },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

const priorities = [
  { value: 'low', label: 'Low', color: Colors.success },
  { value: 'medium', label: 'Medium', color: Colors.warning },
  { value: 'high', label: 'High', color: Colors.error },
];

export default function NewComplaintScreen() {
  const { refreshComplaints } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && category.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const complaint: Complaint = {
      id: 'comp_' + Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      category: category as Complaint['category'],
      status: 'open',
      priority: priority as Complaint['priority'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await Storage.addComplaint(complaint);
    await refreshComplaints();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <Text style={styles.headerSubtitle}>We'll get back to you as soon as possible</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Brief description of the issue"
          placeholderTextColor={Colors.textTertiary}
          maxLength={100}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <Pressable
              key={cat.value}
              style={[styles.categoryItem, category === cat.value && styles.categoryItemActive]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setCategory(cat.value);
              }}
            >
              <Ionicons
                name={cat.icon}
                size={20}
                color={category === cat.value ? Colors.surface : Colors.textSecondary}
              />
              <Text style={[styles.categoryItemText, category === cat.value && styles.categoryItemTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {priorities.map(p => (
            <Pressable
              key={p.value}
              style={[
                styles.priorityItem,
                priority === p.value && { backgroundColor: p.color + '18', borderColor: p.color },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setPriority(p.value);
              }}
            >
              <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
              <Text style={[styles.priorityText, priority === p.value && { color: p.color }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Provide details about the issue..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
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
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
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
  textArea: { height: 120, paddingTop: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  categoryItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryItemText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.textSecondary },
  categoryItemTextActive: { color: Colors.surface },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.textSecondary },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  submitButtonDisabled: { opacity: 0.4 },
  submitText: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: Colors.surface },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

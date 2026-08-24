import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useAuth } from '@clerk/expo';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com';

export default function ManualEventScreen() {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastResult, setLastResult] = useState<{ fileName: string; icsContent: string } | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const validate = (): string | null => {
    if (!title.trim()) return 'Please enter an event title.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return 'Date must be in YYYY-MM-DD format.';
    if (time.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time.trim())) return 'Time must be HH:MM (24-hour).';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Check your input', error);
      return;
    }

    setIsSaving(true);
    setLastResult(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');

      const response = await fetch(`${SERVER_URL}/api/manual-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          date: date.trim(),
          time: time.trim(),
          description: description.trim(),
          timezone,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create event');

      setLastResult({ fileName: data.fileName, icsContent: data.icsContent });
      Alert.alert('Event created', `${title.trim()} was added to your events.`);
      setTitle('');
      setDate('');
      setTime('');
      setDescription('');
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'An error occurred while creating the event.');
    } finally {
      setIsSaving(false);
    }
  };

  const shareIcs = async () => {
    if (!lastResult) return;
    try {
      const file = new File(Paths.cache, lastResult.fileName);
      file.write(lastResult.icsContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Share calendar file',
        });
      }
    } catch (err: any) {
      Alert.alert('Share failed', err.message || 'Could not share the calendar file.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create Event</Text>
        <Text style={styles.subheading}>
          Manually add an event and export it as a calendar file — no subscription needed.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Soccer practice"
            placeholderTextColor="#666666"
          />

          <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-09-01"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Time (HH:MM, optional)</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="15:30"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Any extra details…"
            placeholderTextColor="#666666"
            multiline
          />

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Create Event</Text>
              </>
            )}
          </Pressable>

          {lastResult && (
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={shareIcs}>
              <Ionicons name="share-social-outline" size={18} color="#efefef" />
              <Text style={styles.secondaryButtonText}>Export / Share .ics File</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subheading: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 18,
    color: '#888888',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cccccc',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#161616',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#ffffff',
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#c23326',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: '#222222',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#efefef',
    fontSize: 14,
    fontWeight: '600',
  },
});

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { apiRequest, SERVER_URL } from '@/lib/api';

const RED = '#c23326';
const BACKGROUND = '#121212';
const CARD = '#1a1a1a';
const BORDER = '#2a2a2a';
const MUTED = '#888888';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function SettingsScreen() {
  const { getToken, signOut, isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [form, setForm] = useState<ProfileForm>({ firstName: '', lastName: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.primaryEmailAddress?.emailAddress || '',
      phone: user.primaryPhoneNumber?.phoneNumber || '',
    });
  }, [user]);

  const fetchPlan = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    setIsLoadingPlan(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const data = await apiRequest<{ isPremium: boolean }>('/api/user/premium-status', token);
      setIsPremium(data.isPremium === true);
    } catch {
      setIsPremium(false);
    } finally {
      setIsLoadingPlan(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      void fetchPlan();
    }, [fetchPlan]),
  );

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    if (!form.email.trim()) {
      Alert.alert('Check your input', 'Please enter an email address.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      await apiRequest('/api/settings', token, {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });
      Alert.alert('Saved', 'Your profile settings were updated.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subheading}>Manage your account settings and preferences.</Text>

      <View style={[styles.card, styles.profileHeader]}>
        {user?.imageUrl ? <Image source={{ uri: user.imageUrl }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPlaceholder]}><Ionicons name="person" size={25} color={MUTED} /></View>}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{isUserLoaded ? user?.fullName || form.email || 'User' : 'Loading…'}</Text>
          <Text style={styles.profileEmail}>{form.email}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}><Ionicons name="person-outline" size={19} color="#efefef" /><Text style={styles.cardTitle}>Profile Information</Text></View>
        <Text style={styles.cardDescription}>Update your personal information and contact details.</Text>
        <View style={styles.inputRow}>
          <View style={styles.halfInput}><Field label="First Name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} placeholder="John" /></View>
          <View style={styles.halfInput}><Field label="Last Name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} placeholder="Doe" /></View>
        </View>
        <Field label="Email Address" value={form.email} onChangeText={(value) => updateField('email', value)} placeholder="john@example.com" keyboardType="email-address" />
        <Field label="Phone Number" value={form.phone} onChangeText={(value) => updateField('phone', value)} placeholder="+1 (555) 123-4567" keyboardType="phone-pad" />
        <Pressable style={styles.primaryButton} disabled={isSaving} onPress={() => void saveSettings()}>{isSaving ? <ActivityIndicator size="small" color="#ffffff" /> : <><Ionicons name="save-outline" size={17} color="#ffffff" /><Text style={styles.primaryButtonText}>Save Changes</Text></>}</Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.planRow}><View style={styles.cardTitleRow}><Ionicons name="ribbon-outline" size={20} color="#d97706" /><Text style={styles.cardTitle}>Manage Subscription</Text></View>{isLoadingPlan ? <ActivityIndicator size="small" color={RED} /> : <Text style={[styles.planValue, isPremium && styles.premiumValue]}>{isPremium ? 'Premium' : 'Free'}</Text>}</View>
        <Text style={styles.cardDescription}>AI image and PDF extraction requires Premium. Manage your plan on the web app.</Text>
        <View style={styles.planActions}>
          <Pressable style={styles.secondaryButton} onPress={() => void Linking.openURL(`${SERVER_URL}/dashboard/settings#subscription`)}><Ionicons name="open-outline" size={16} color="#efefef" /><Text style={styles.secondaryButtonText}>Manage Subscription</Text></Pressable>
          <Pressable style={styles.refreshButton} onPress={() => void fetchPlan()}><Ionicons name="refresh-outline" size={16} color={MUTED} /><Text style={styles.refreshText}>Refresh</Text></Pressable>
        </View>
      </View>

      <Pressable style={styles.signOutButton} onPress={confirmSignOut}><Ionicons name="log-out-outline" size={18} color="#ef4444" /><Text style={styles.signOutText}>Sign Out</Text></Pressable>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#666666" keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  content: { padding: 20, paddingBottom: 40 },
  heading: { color: '#ffffff', fontSize: 25, fontWeight: '800' },
  subheading: { color: MUTED, fontSize: 13, marginTop: 5, marginBottom: 18 },
  card: { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 14 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 54, height: 54, borderRadius: 15, marginRight: 12 },
  avatarPlaceholder: { backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  profileEmail: { color: MUTED, fontSize: 12, marginTop: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  cardDescription: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 6 },
  inputRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  field: { marginTop: 13 },
  fieldLabel: { color: '#dddddd', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#161616', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 9, color: '#ffffff', paddingHorizontal: 11, paddingVertical: Platform.OS === 'ios' ? 11 : 8, fontSize: 13 },
  primaryButton: { minHeight: 44, backgroundColor: RED, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: 16 },
  primaryButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planValue: { color: '#d97706', fontSize: 13, fontWeight: '800' },
  premiumValue: { color: '#22c55e' },
  planActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  secondaryButton: { flex: 1, height: 42, backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  secondaryButtonText: { color: '#efefef', fontSize: 12, fontWeight: '700' },
  refreshButton: { height: 42, paddingHorizontal: 12, borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  refreshText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  signOutButton: { height: 50, backgroundColor: CARD, borderColor: '#7f1d1d', borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 2 },
  signOutText: { color: '#ef4444', fontSize: 14, fontWeight: '800' },
});

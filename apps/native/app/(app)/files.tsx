import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { apiRequest, SERVER_URL, type UserFile } from '@/lib/api';

const RED = '#c23326';
const BACKGROUND = '#121212';
const CARD = '#1a1a1a';
const BORDER = '#2a2a2a';
const MUTED = '#888888';

type ShareTarget = { fileId: string; type: 'email' | 'sms' } | null;

export default function FilesScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareTarget>(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(async (showLoader = false) => {
    if (!isLoaded || !isSignedIn) return;
    if (showLoader) setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const [filesData, premiumData] = await Promise.all([
        apiRequest<{ files: UserFile[] }>('/api/user/files', token),
        apiRequest<{ isPremium: boolean }>('/api/user/premium-status', token),
      ]);
      setFiles(filesData.files || []);
      setIsPremium(premiumData.isPremium === true);
    } catch {
      Alert.alert('Could not load files', 'Please try again in a moment.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      void fetchData(true);
    }, [fetchData]),
  );

  useEffect(() => {
    if (!user) return;
    setEmail((current) => current || user.primaryEmailAddress?.emailAddress || '');
    setPhoneNumber((current) => current || user.primaryPhoneNumber?.phoneNumber || '');
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchData(false);
  };

  const openFile = async (file: UserFile) => {
    try {
      if (await Linking.canOpenURL(file.icsUrl)) await Linking.openURL(file.icsUrl);
      else Alert.alert('Cannot Open', 'No app found to handle calendar files.');
    } catch {
      Alert.alert('Error', 'Could not open the calendar file.');
    }
  };

  const startShare = (fileId: string, type: 'email' | 'sms') => {
    setShareTarget({ fileId, type });
    if (type === 'email') setEmail((current) => current || user?.primaryEmailAddress?.emailAddress || '');
    else setPhoneNumber((current) => current || user?.primaryPhoneNumber?.phoneNumber || '');
  };

  const sendShare = async () => {
    if (!shareTarget) return;
    const destination = shareTarget.type === 'email' ? email.trim() : phoneNumber.trim();
    if (!destination) {
      Alert.alert('Missing Details', shareTarget.type === 'email' ? 'Please enter an email address.' : 'Please enter a phone number.');
      return;
    }

    setIsSending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      await apiRequest('/api/share', token, {
        method: 'POST',
        body: JSON.stringify({ uploadId: shareTarget.fileId, type: shareTarget.type, destination }),
      });
      Alert.alert(shareTarget.type === 'email' ? 'Email Sent' : 'SMS Sent', `Calendar file sent to ${destination}.`);
      setShareTarget(null);
    } catch (error) {
      Alert.alert('Sharing Failed', error instanceof Error ? error.message : 'Could not share the calendar file.');
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: UserFile }) => {
    const targetIsEmail = shareTarget?.fileId === item.id && shareTarget.type === 'email';
    const targetIsSms = shareTarget?.fileId === item.id && shareTarget.type === 'sms';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}><Ionicons name="calendar-outline" size={20} color="#22c55e" /></View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
            <Text style={styles.fileMeta} numberOfLines={1}>From: {item.originalFileName}</Text>
            <Text style={styles.fileMeta}>{item.eventCount} event{item.eventCount === 1 ? '' : 's'} • {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {!!item.events?.length && (
          <View style={styles.eventsBox}>
            <Text style={styles.eventsTitle}><Ionicons name="calendar-outline" size={14} color="#dddddd" /> Extracted Events ({item.events.length})</Text>
            {item.events.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.eventMeta} numberOfLines={1}>
                  {new Date(event.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {event.location ? ` • ${event.location}` : ''}
                </Text>
              </View>
            ))}
            {item.events.length > 3 && <Text style={styles.moreEvents}>+{item.events.length - 3} more events</Text>}
          </View>
        )}

        <Pressable style={styles.downloadButton} onPress={() => void openFile(item)}>
          <Ionicons name="download-outline" size={17} color="#efefef" />
          <Text style={styles.buttonText}>Download / Add to Calendar</Text>
        </Pressable>

        {isPremium ? (
          <View style={styles.shareActions}>
            <Pressable style={styles.secondaryButton} onPress={() => startShare(item.id, 'email')}><Ionicons name="mail-outline" size={16} color="#efefef" /><Text style={styles.buttonText}>Email</Text></Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => startShare(item.id, 'sms')}><Ionicons name="chatbubble-outline" size={16} color="#efefef" /><Text style={styles.buttonText}>SMS</Text></Pressable>
          </View>
        ) : (
          <View style={styles.upgradeBox}><Text style={styles.upgradeText}>Upgrade to Premium for Email & SMS sharing.</Text><Pressable onPress={() => void Linking.openURL(`${SERVER_URL}/dashboard/settings#subscription`)}><Text style={styles.upgradeLink}>Manage subscription</Text></Pressable></View>
        )}

        {(targetIsEmail || targetIsSms) && (
          <View style={styles.shareForm}>
            <Text style={styles.formTitle}>{targetIsEmail ? 'Email address' : 'Phone number'}</Text>
            <TextInput
              style={styles.input}
              value={targetIsEmail ? email : phoneNumber}
              onChangeText={targetIsEmail ? setEmail : setPhoneNumber}
              placeholder={targetIsEmail ? 'you@example.com' : '+1 (555) 123-4567'}
              placeholderTextColor="#666666"
              keyboardType={targetIsEmail ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
            <View style={styles.formActions}>
              <Pressable style={styles.smallPrimaryButton} disabled={isSending} onPress={() => void sendShare()}>{isSending ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryText}>Send</Text>}</Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setShareTarget(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) return <View style={styles.centered}><ActivityIndicator color={RED} /><Text style={styles.loadingText}>Loading files…</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={RED} colors={[RED]} />}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.heading}>Files</Text><Text style={styles.subheading}>Download, share, and manage your calendar files.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="document-text-outline" size={36} color="#444444" /><Text style={styles.emptyTitle}>No ICS files yet</Text><Text style={styles.emptyText}>Upload images or PDFs from the Home tab to extract calendar events and generate files.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  centered: { flex: 1, backgroundColor: BACKGROUND, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: MUTED, fontSize: 13 },
  listContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  header: { marginBottom: 16 },
  heading: { color: '#ffffff', fontSize: 25, fontWeight: '800' },
  subheading: { color: MUTED, fontSize: 13, marginTop: 5 },
  card: { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#12301e', alignItems: 'center', justifyContent: 'center' },
  fileInfo: { flex: 1 },
  fileName: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  fileMeta: { color: '#666666', fontSize: 10, marginTop: 3 },
  eventsBox: { marginTop: 13 },
  eventsTitle: { color: '#dddddd', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  eventRow: { backgroundColor: '#222222', borderRadius: 8, padding: 8, marginBottom: 5 },
  eventTitle: { color: '#eeeeee', fontSize: 11, fontWeight: '700' },
  eventMeta: { color: '#888888', fontSize: 10, marginTop: 3 },
  moreEvents: { color: MUTED, fontSize: 10, textAlign: 'center', marginTop: 3 },
  downloadButton: { height: 42, backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  buttonText: { color: '#efefef', fontSize: 12, fontWeight: '700' },
  shareActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryButton: { flex: 1, height: 38, backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  upgradeBox: { alignItems: 'center', marginTop: 12 },
  upgradeText: { color: MUTED, fontSize: 11, textAlign: 'center' },
  upgradeLink: { color: RED, fontSize: 11, fontWeight: '800', marginTop: 5 },
  shareForm: { backgroundColor: '#222222', borderColor: '#333333', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 10 },
  formTitle: { color: '#dddddd', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#161616', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 8, color: '#ffffff', paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallPrimaryButton: { flex: 1, minHeight: 36, backgroundColor: RED, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  cancelButton: { flex: 1, minHeight: 36, borderColor: '#444444', borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: 35, gap: 9 },
  emptyTitle: { color: '#dddddd', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#666666', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});

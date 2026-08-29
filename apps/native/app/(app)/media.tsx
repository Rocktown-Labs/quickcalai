import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { apiRequest, type MediaUpload, type UploadStatus } from '@/lib/api';

const RED = '#c23326';
const BACKGROUND = '#121212';
const CARD = '#1a1a1a';
const BORDER = '#2a2a2a';
const MUTED = '#888888';

export default function MediaScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [uploads, setUploads] = useState<MediaUpload[]>([]);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMedia = useCallback(async (showLoader = false) => {
    if (!isLoaded || !isSignedIn) return;
    if (showLoader) setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const data = await apiRequest<{ uploads: MediaUpload[] }>('/api/user/media', token);
      setUploads(data.uploads || []);
    } catch {
      Alert.alert('Could not load media', 'Please try again in a moment.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      void fetchMedia(true);
    }, [fetchMedia]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchMedia(false);
  };

  const toggleSelection = (id: string) => {
    setSelectedUploads((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedUploads((current) => current.size === uploads.length ? new Set() : new Set(uploads.map((upload) => upload.id)));
  };

  const deleteUploads = async (ids: string[]) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      await Promise.all(ids.map((id) => apiRequest(`/api/user/media/${id}`, token, { method: 'DELETE' })));
      setUploads((current) => current.filter((upload) => !ids.includes(upload.id)));
      setSelectedUploads(new Set());
    } catch (error) {
      Alert.alert('Delete failed', error instanceof Error ? error.message : 'Could not delete the selected files.');
    }
  };

  const confirmDelete = (ids: string[]) => {
    const count = ids.length;
    Alert.alert(
      count === 1 ? 'Delete media file?' : `Delete ${count} media files?`,
      'This removes the uploaded media from your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteUploads(ids) },
      ],
    );
  };

  const openMedia = async (upload: MediaUpload) => {
    if (upload.status !== 'completed') return;
    try {
      if (await Linking.canOpenURL(upload.storageUrl)) await Linking.openURL(upload.storageUrl);
      else Alert.alert('Cannot Open', 'No application found to open this media file.');
    } catch {
      Alert.alert('Error', 'Could not open the media file.');
    }
  };

  const renderStatus = (status: UploadStatus) => (
    <View style={[styles.statusPill, status === 'completed' ? styles.successPill : status === 'failed' ? styles.errorPill : styles.pendingPill]}>
      <Text style={[styles.statusText, status === 'completed' ? styles.successText : status === 'failed' ? styles.errorText : styles.pendingText]}>{status.replace('_', ' ')}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: MediaUpload }) => {
    const isImage = item.fileType.startsWith('image/');
    return (
      <View style={[styles.card, selectedUploads.has(item.id) && styles.selectedCard]}>
        <View style={styles.cardHeader}>
          <Pressable style={[styles.checkbox, selectedUploads.has(item.id) && styles.checkedBox]} onPress={() => toggleSelection(item.id)}>
            {selectedUploads.has(item.id) && <Ionicons name="checkmark" size={15} color="#ffffff" />}
          </Pressable>
          <View style={styles.fileTypeIcon}>
            <Ionicons name={isImage ? 'image-outline' : 'document-text-outline'} size={19} color={isImage ? '#60a5fa' : '#ef4444'} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
            <Text style={styles.fileMeta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          {renderStatus(item.status)}
        </View>

        {isImage && <Image source={{ uri: item.storageUrl }} style={styles.preview} resizeMode="cover" />}
        {item.failureReason && <Text style={styles.failureText}>{item.failureReason}</Text>}

        <View style={styles.cardActions}>
          <Pressable style={[styles.actionButton, item.status !== 'completed' && styles.disabledButton]} disabled={item.status !== 'completed'} onPress={() => void openMedia(item)}>
            <Ionicons name="download-outline" size={16} color={item.status === 'completed' ? '#efefef' : '#555555'} />
            <Text style={[styles.actionText, item.status !== 'completed' && styles.disabledText]}>Open</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => confirmDelete([item.id])}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator color={RED} /><Text style={styles.loadingText}>Loading media…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={uploads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={RED} colors={[RED]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View><Text style={styles.heading}>Media Gallery</Text><Text style={styles.subheading}>Browse your uploaded images and PDFs.</Text></View>
              {uploads.length > 0 && <Pressable style={styles.selectAllButton} onPress={toggleSelectAll}><Text style={styles.selectAllText}>{selectedUploads.size === uploads.length ? 'Clear all' : 'Select all'}</Text></Pressable>}
            </View>
            {selectedUploads.size > 0 && <Pressable style={styles.bulkDeleteButton} onPress={() => confirmDelete(Array.from(selectedUploads))}><Ionicons name="trash-outline" size={16} color="#ef4444" /><Text style={styles.deleteText}>Delete selected ({selectedUploads.size})</Text></Pressable>}
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="images-outline" size={36} color="#444444" /><Text style={styles.emptyTitle}>No media files yet</Text><Text style={styles.emptyText}>Upload images or PDFs from the Home tab to extract calendar events.</Text></View>}
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
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  heading: { color: '#ffffff', fontSize: 25, fontWeight: '800' },
  subheading: { color: MUTED, fontSize: 13, marginTop: 5 },
  selectAllButton: { paddingVertical: 7, paddingHorizontal: 9 },
  selectAllText: { color: RED, fontSize: 12, fontWeight: '800' },
  bulkDeleteButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, borderColor: '#7f1d1d', borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  card: { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 16, padding: 13, marginBottom: 12 },
  selectedCard: { borderColor: RED },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkbox: { width: 22, height: 22, borderColor: '#555555', borderWidth: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkedBox: { backgroundColor: RED, borderColor: RED },
  fileTypeIcon: { width: 35, height: 35, borderRadius: 9, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center' },
  fileInfo: { flex: 1, marginRight: 4 },
  fileName: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  fileMeta: { color: '#666666', fontSize: 10, marginTop: 3 },
  preview: { width: '100%', height: 160, borderRadius: 10, marginTop: 12, backgroundColor: '#222222' },
  failureText: { color: '#aaaaaa', fontSize: 11, lineHeight: 16, marginTop: 10 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, height: 38, borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  disabledButton: { borderColor: '#292929' },
  actionText: { color: '#efefef', fontSize: 12, fontWeight: '700' },
  disabledText: { color: '#555555' },
  deleteButton: { flex: 1, height: 38, borderColor: '#5f2020', borderWidth: 1, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  deleteText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  statusPill: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4 },
  successPill: { backgroundColor: '#12301e' },
  errorPill: { backgroundColor: '#3b1714' },
  pendingPill: { backgroundColor: '#332812' },
  statusText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  successText: { color: '#22c55e' },
  errorText: { color: '#ef4444' },
  pendingText: { color: '#f59e0b' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, paddingTop: 90, gap: 9 },
  emptyTitle: { color: '#dddddd', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#666666', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});

import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com';

type UserFile = {
  id: string;
  fileName: string;
  originalFileName: string;
  icsUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
};

export default function FilesScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchFiles = async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/user/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const data = await response.json();
      setFiles(data.files || []);
    } catch {
      // Fail silently — list stays as-is (empty on first load).
    }
  };

  // Load once on first focus (native tabs render all screens eagerly),
  // then refresh via pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
        fetchFiles();
      }
    }, [hasLoadedOnce, isLoaded, isSignedIn]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFiles().finally(() => setIsRefreshing(false));
  };

  const openFile = async (file: UserFile) => {
    try {
      const supported = await Linking.canOpenURL(file.icsUrl);
      if (supported) {
        await Linking.openURL(file.icsUrl);
      } else {
        Alert.alert('Cannot Open', 'No app found to handle calendar files.');
      }
    } catch {
      Alert.alert('Error', 'Could not open the calendar file.');
    }
  };

  const renderItem = ({ item }: { item: UserFile }) => (
    <TouchableOpacity style={styles.card} onPress={() => openFile(item)} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name="document-text" size={18} color="#c23326" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.cardMeta}>
          {item.eventCount} event{item.eventCount === 1 ? '' : 's'} •{' '}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="download-outline" size={18} color="#777777" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Files</Text>
            <Text style={styles.subheading}>
              Calendar files generated from your uploads.
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isRefreshing ? (
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={32} color="#444444" />
              <Text style={styles.emptyText}>
                No calendar files yet. Upload a schedule on the Home tab to generate one.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#c23326"
            colors={['#c23326']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subheading: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: '#888888',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderColor: '#222222',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#222222',
    borderColor: '#333333',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardMeta: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 18,
  },
});

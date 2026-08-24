import React from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Account</Text>

      {/* Profile card */}
      <View style={[styles.card, styles.profileCardRow]}>
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#888888" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {isLoaded ? user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User' : 'Loading…'}
          </Text>
          <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      {/* Plan */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="ribbon-outline" size={20} color="#d97706" />
            <Text style={styles.rowText}>Plan</Text>
          </View>
          <Text style={styles.rowValue}>Free</Text>
        </View>
        <Text style={styles.hint}>
          AI image extraction requires a Premium subscription. Manage billing on the web app.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`${SERVER_URL}/dashboard`)}
        >
          <Ionicons name="open-outline" size={16} color="#efefef" />
          <Text style={styles.secondaryButtonText}>Open Web Dashboard</Text>
        </Pressable>
      </View>

      {/* Sign out */}
      <Pressable
        style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.dangerButtonText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  profileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d97706',
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#888888',
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: '#222222',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dangerButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    borderRadius: 20,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: '#efefef',
    fontSize: 13,
    fontWeight: '600',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import {
  apiRequest,
  SERVER_URL,
  type DashboardStatsResponse,
  type UploadStatus,
} from '@/lib/api';

const RED = '#c23326';
const BACKGROUND = '#121212';
const CARD = '#1a1a1a';
const SUBTLE_CARD = '#161616';
const BORDER = '#2a2a2a';
const MUTED = '#888888';

const PROCESSING_STEPS = [
  { id: 'analyzing', label: 'Analyzing image', icon: 'image-outline' },
  { id: 'detecting', label: 'Detecting dates & times', icon: 'sparkles-outline' },
  { id: 'extracting', label: 'Extracting event details', icon: 'flash-outline' },
  { id: 'formatting', label: 'Formatting calendar data', icon: 'checkmark-circle-outline' },
] as const;

type WorkflowStatusResponse = {
  status: UploadStatus;
  result: {
    uploadId: string;
    eventCount: number;
    status: UploadStatus;
    icsUrl?: string;
    shareToken?: string;
  } | null;
  eventCount: number;
  failureReason: string | null;
  uploadId: string;
};

type SelectedFile = {
  uri: string;
  name: string;
  type: string;
};

type ManualEvent = {
  title: string;
  date: string;
  time: string;
  description: string;
};

export default function DashboardScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [stats, setStats] = useState<DashboardStatsResponse>({
    totalUploads: 0,
    totalEvents: 0,
    completedUploads: 0,
    recentUploads: [],
    isPremium: false,
    hasDataError: false,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [processingFile, setProcessingFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [manualEvent, setManualEvent] = useState<ManualEvent>({
    title: '',
    date: '',
    time: '',
    description: '',
  });
  const [lastManualResult, setLastManualResult] = useState<{ fileName: string; icsContent: string } | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSmsing, setIsSmsing] = useState(false);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  }, []);

  const fetchStats = useCallback(async (showLoader = true) => {
    if (!isLoaded || !isSignedIn) return;

    if (showLoader) setIsLoadingStats(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');

      const data = await apiRequest<DashboardStatsResponse>('/api/user/dashboard-stats', token);
      setStats({
        totalUploads: data.totalUploads ?? 0,
        totalEvents: data.totalEvents ?? 0,
        completedUploads: data.completedUploads ?? 0,
        recentUploads: data.recentUploads ?? [],
        isPremium: data.isPremium === true,
        hasDataError: data.hasDataError === true,
      });
    } catch {
      // Keep the last successful values. Pull-to-refresh can retry without
      // interrupting the upload flow.
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (user) {
      setDeliveryEmail((current) => current || user.primaryEmailAddress?.emailAddress || '');
      setDeliveryPhone((current) => current || user.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [user]);

  useEffect(() => stopPolling, [stopPolling]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchStats(false);
  };

  const startPollingStatus = useCallback((runId: string) => {
    stopPolling();
    setActiveStepIndex(0);

    stepIntervalRef.current = setInterval(() => {
      setActiveStepIndex((current) =>
        current < PROCESSING_STEPS.length - 1 ? current + 1 : current,
      );
    }, 3000);

    pollingIntervalRef.current = setInterval(() => {
      void (async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const data = await apiRequest<WorkflowStatusResponse>(
            `/api/workflow/status/${runId}`,
            token,
          );

          if (!['completed', 'failed', 'no_events'].includes(data.status)) return;

          stopPolling();
          setUploadStatus(data.status);
          setEventCount(data.eventCount || 0);
          setUploadId(data.uploadId || null);
          setFailureReason(data.failureReason || null);

          if (data.status === 'completed') {
            setActiveStepIndex(PROCESSING_STEPS.length);
            setIcsUrl(data.result?.icsUrl || null);
            setShareToken(data.result?.shareToken || null);
            Alert.alert(
              'Done!',
              `Extracted ${data.eventCount || 0} event${data.eventCount === 1 ? '' : 's'} successfully.`,
            );
          } else if (data.status === 'no_events') {
            Alert.alert(
              'No Events Found',
              'The document looked valid, but no calendar events were detected.',
            );
          } else {
            Alert.alert('Processing Failed', data.failureReason || 'AI extraction failed.');
          }

          void fetchStats(false);
        } catch {
          // A transient polling failure should not discard the active run.
        }
      })();
    }, 2000);
  }, [fetchStats, getToken, stopPolling]);

  const startUpload = async (file: SelectedFile) => {
    if (!stats.isPremium) {
      Alert.alert(
        'Premium Feature',
        'AI calendar extraction is a premium feature. Upgrade from Account settings on the web application.',
      );
      return;
    }

    setProcessingFile(file);
    setIsUploading(true);
    setUploadStatus('pending');
    setActiveStepIndex(0);
    setFailureReason(null);
    setIcsUrl(null);
    setShareToken(null);
    setUploadId(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);

      const data = await apiRequest<{ runId: string }>('/api/upload', token, {
        method: 'POST',
        body: formData,
      });

      setIsUploading(false);
      setUploadStatus('processing');
      startPollingStatus(data.runId);
    } catch (error) {
      setIsUploading(false);
      setUploadStatus('failed');
      setFailureReason(error instanceof Error ? error.message : 'Failed to upload file.');
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'An error occurred during file upload.',
      );
    }
  };

  const pickImage = async (useCamera: boolean) => {
    if (!stats.isPremium) {
      Alert.alert(
        'Premium Feature',
        'AI calendar extraction is a premium feature. Upgrade from Account settings on the web application.',
      );
      return;
    }

    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Camera access is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
      }

      const asset = result.canceled ? undefined : result.assets?.[0];
      if (!asset) return;

      await startUpload({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop() || 'photo.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
    } catch (error) {
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Could not select the image.');
    }
  };

  const pickDocument = async () => {
    if (!stats.isPremium) {
      Alert.alert(
        'Premium Feature',
        'AI calendar extraction is a premium feature. Upgrade from Account settings on the web application.',
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      const asset = result.canceled ? undefined : result.assets?.[0];
      if (!asset) return;

      await startUpload({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || (asset.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      });
    } catch (error) {
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Could not select the file.');
    }
  };

  const handleReset = () => {
    stopPolling();
    setProcessingFile(null);
    setUploadStatus(null);
    setActiveStepIndex(0);
    setEventCount(0);
    setIcsUrl(null);
    setShareToken(null);
    setUploadId(null);
    setFailureReason(null);
    setShowDeliveryForm(false);
  };

  const openCalendarFile = async () => {
    if (!icsUrl) {
      Alert.alert('Not Ready', 'The calendar file is not ready yet.');
      return;
    }

    try {
      if (await Linking.canOpenURL(icsUrl)) {
        await Linking.openURL(icsUrl);
      } else {
        Alert.alert('Cannot Open', 'No application found to handle calendar files.');
      }
    } catch {
      Alert.alert('Error', 'Could not open the calendar file.');
    }
  };

  const getShareUrl = () => (shareToken ? `${process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com'}/s/${shareToken}` : null);

  const copyShareLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) {
      Alert.alert('Not Ready', 'The share link is not ready yet.');
      return;
    }
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied', 'Share link copied to your clipboard.');
  };

  const shareCalendar = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) {
      Alert.alert('Not Ready', 'The share link is not ready yet.');
      return;
    }

    try {
      await Share.share({
        message: `Check out my calendar events: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Share Failed', 'Could not share the calendar link.');
    }
  };

  const handleEmailFile = async () => {
    if (!uploadId) {
      Alert.alert('Not Ready', 'Upload ID not found. Please try again.');
      return;
    }
    if (!deliveryEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter an email address.');
      return;
    }

    setIsEmailing(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      await apiRequest('/api/share', token, {
        method: 'POST',
        body: JSON.stringify({ uploadId, type: 'email', destination: deliveryEmail.trim() }),
      });
      Alert.alert('Email Sent', `Calendar events emailed to ${deliveryEmail.trim()}.`);
    } catch (error) {
      Alert.alert('Failed to Email', error instanceof Error ? error.message : 'Could not send email.');
    } finally {
      setIsEmailing(false);
    }
  };

  const handleSmsFile = async () => {
    if (!uploadId) {
      Alert.alert('Not Ready', 'Upload ID not found. Please try again.');
      return;
    }
    if (!deliveryPhone.trim()) {
      Alert.alert('Missing Phone Number', 'Please enter a phone number.');
      return;
    }

    setIsSmsing(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      await apiRequest('/api/share', token, {
        method: 'POST',
        body: JSON.stringify({ uploadId, type: 'sms', destination: deliveryPhone.trim() }),
      });
      Alert.alert('SMS Sent', `Calendar link sent to ${deliveryPhone.trim()}.`);
    } catch (error) {
      Alert.alert('Failed to Send SMS', error instanceof Error ? error.message : 'Could not send SMS.');
    } finally {
      setIsSmsing(false);
    }
  };

  const handleManualEventSubmit = async () => {
    if (!manualEvent.title.trim() || !manualEvent.date.trim()) {
      Alert.alert('Check your input', 'Please enter an event title and date.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(manualEvent.date.trim())) {
      Alert.alert('Check your input', 'Date must be in YYYY-MM-DD format.');
      return;
    }
    if (manualEvent.time.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(manualEvent.time.trim())) {
      Alert.alert('Check your input', 'Time must be in HH:MM 24-hour format.');
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const data = await apiRequest<{ fileName: string; icsContent: string }>('/api/manual-event', token, {
        method: 'POST',
        body: JSON.stringify({
          ...manualEvent,
          title: manualEvent.title.trim(),
          date: manualEvent.date.trim(),
          time: manualEvent.time.trim(),
          description: manualEvent.description.trim(),
          timezone,
        }),
      });
      setLastManualResult({ fileName: data.fileName, icsContent: data.icsContent });
      Alert.alert('Event Created', `${data.fileName} is ready to export.`);
      setManualEvent({ title: '', date: '', time: '', description: '' });
    } catch (error) {
      Alert.alert('Failed to Create Event', error instanceof Error ? error.message : 'Could not create event.');
    }
  };

  const shareManualFile = async () => {
    if (!lastManualResult) return;
    try {
      const file = new File(Paths.cache, lastManualResult.fileName);
      file.write(lastManualResult.icsContent);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Share calendar file',
        });
      } else {
        Alert.alert('Export Unavailable', 'This device cannot open the calendar share sheet.');
      }
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Could not export the calendar file.');
    }
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={RED} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderStatus = (status: UploadStatus) => (
    <View style={[styles.statusPill, status === 'completed' ? styles.successPill : status === 'failed' ? styles.errorPill : styles.pendingPill]}>
      <Text style={[styles.statusText, status === 'completed' ? styles.successText : status === 'failed' ? styles.errorText : styles.pendingText]}>
        {status.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );

  const isProcessing = isUploading || uploadStatus === 'pending' || uploadStatus === 'processing';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={RED} colors={[RED]} />}
      >
        <View style={styles.header}>
          <View style={styles.brandMark}><Ionicons name="calendar" size={18} color="#ffffff" /></View>
          <Text style={styles.brand}>QuickCal<Text style={styles.brandAccent}>AI</Text></Text>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.heading}>Welcome back, {user?.firstName || 'User'}! 👋</Text>
          <Text style={styles.subheading}>Ready to extract calendar events from your images?</Text>
        </View>

        {stats.hasDataError && (
          <View style={styles.notice}><Text style={styles.noticeText}>Stats are temporarily unavailable, but you can still create events and upload files.</Text></View>
        )}

        {isLoadingStats ? (
          <ActivityIndicator color={RED} style={styles.statsLoader} />
        ) : (
          <View style={styles.statsRow}>
            {renderStatCard('Total Uploads', stats.totalUploads, `${stats.completedUploads} completed`, 'document-text-outline')}
            {renderStatCard('Events Extracted', stats.totalEvents, 'Calendar events', 'calendar-outline')}
            {renderStatCard('Success Rate', `${stats.totalUploads > 0 ? Math.round((stats.completedUploads / stats.totalUploads) * 100) : 0}%`, 'Processing rate', 'checkmark-circle-outline')}
          </View>
        )}

        <View style={styles.uploaderCard}>
          {uploadStatus === null && (
            <>
              <View style={styles.uploaderTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeading}>Calendar Extraction</Text>
                  <Text style={styles.cardDescription}>Upload an image or PDF with dates and times to extract events instantly.</Text>
                </View>
                <View style={styles.planPill}>
                  <Ionicons name={stats.isPremium ? 'ribbon-outline' : 'lock-closed-outline'} size={12} color={stats.isPremium ? '#f59e0b' : MUTED} />
                  <Text style={styles.planText}>{stats.isPremium ? 'PREMIUM' : 'FREE'}</Text>
                </View>
              </View>

              <View style={styles.segmentedControl}>
                <Pressable style={[styles.segment, activeTab === 'ai' && styles.activeSegment]} onPress={() => setActiveTab('ai')}>
                  <Ionicons name="flash-outline" size={16} color={activeTab === 'ai' ? '#ffffff' : MUTED} />
                  <Text style={[styles.segmentText, activeTab === 'ai' && styles.activeSegmentText]}>AI Upload</Text>
                </Pressable>
                <Pressable style={[styles.segment, activeTab === 'manual' && styles.activeSegment]} onPress={() => setActiveTab('manual')}>
                  <Ionicons name="create-outline" size={16} color={activeTab === 'manual' ? '#ffffff' : MUTED} />
                  <Text style={[styles.segmentText, activeTab === 'manual' && styles.activeSegmentText]}>Manual</Text>
                </Pressable>
              </View>

              {activeTab === 'ai' ? (
                stats.isPremium ? (
                  <View>
                    <Text style={styles.helperText}>Take a photo, choose an image, or upload a PDF.</Text>
                    <View style={styles.actionRow}>
                      <ActionButton icon="camera-outline" label="Take Photo" onPress={() => void pickImage(true)} primary />
                      <ActionButton icon="images-outline" label="Gallery" onPress={() => void pickImage(false)} />
                    </View>
                    <Pressable style={styles.documentButton} onPress={() => void pickDocument()}>
                      <Ionicons name="document-attach-outline" size={18} color="#efefef" />
                      <Text style={styles.secondaryButtonText}>Choose Image or PDF</Text>
                    </Pressable>
                    <Text style={styles.limitText}>Supports JPEG, PNG, WebP, and PDF up to 10MB.</Text>
                  </View>
                ) : (
                  <View style={styles.premiumBox}>
                    <Ionicons name="ribbon-outline" size={30} color="#d97706" />
                    <Text style={styles.premiumTitle}>Unlock AI Extraction</Text>
                    <Text style={styles.premiumDescription}>Upgrade to Premium in Account settings on the web app to process images and PDFs.</Text>
                    <Pressable style={styles.upgradeButton} onPress={() => void Linking.openURL(`${SERVER_URL}/dashboard/settings#subscription`)}>
                      <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
                    </Pressable>
                  </View>
                )
              ) : (
                <View>
                  <View style={styles.timezoneNotice}>
                    <Ionicons name="globe-outline" size={18} color={RED} />
                    <Text style={styles.timezoneText}>Events will be created in <Text style={styles.timezoneValue}>{timezone}</Text></Text>
                  </View>
                  <Field label="Event Title *" value={manualEvent.title} onChangeText={(value) => setManualEvent((current) => ({ ...current, title: value }))} placeholder="Meeting with John" />
                  <View style={styles.inputRow}>
                    <View style={styles.halfInput}><Field label="Date *" value={manualEvent.date} onChangeText={(value) => setManualEvent((current) => ({ ...current, date: value }))} placeholder="2026-09-01" keyboardType="numbers-and-punctuation" /></View>
                    <View style={styles.halfInput}><Field label="Time (optional)" value={manualEvent.time} onChangeText={(value) => setManualEvent((current) => ({ ...current, time: value }))} placeholder="15:30" keyboardType="numbers-and-punctuation" /></View>
                  </View>
                  <Field label="Description" value={manualEvent.description} onChangeText={(value) => setManualEvent((current) => ({ ...current, description: value }))} placeholder="Event details..." multiline />
                  <Pressable style={styles.primaryButton} onPress={() => void handleManualEventSubmit()}>
                    <Ionicons name="calendar-outline" size={18} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Create Calendar Event</Text>
                  </Pressable>
                  {lastManualResult && (
                    <Pressable style={styles.secondaryActionFull} onPress={() => void shareManualFile()}>
                      <Ionicons name="share-social-outline" size={17} color="#efefef" />
                      <Text style={styles.secondaryButtonText}>Export / Share .ics File</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}

          {isProcessing && processingFile && (
            <View>
              <Text style={styles.cardHeading}>AI extracts details instantly</Text>
              <View style={styles.fileRow}>
                <View style={styles.fileIcon}><Ionicons name="document-text-outline" size={20} color="#ffffff" /></View>
                <View style={styles.fileInfo}><Text style={styles.fileName} numberOfLines={1}>{processingFile.name}</Text><Text style={styles.fileMeta}>{isUploading ? 'Uploading securely...' : 'Processing with AI...'}</Text></View>
                <ActivityIndicator size="small" color={RED} />
              </View>
              <View style={styles.processingBanner}><Ionicons name="flash" size={16} color="#ffffff" /><Text style={styles.processingBannerText}>AI Processing in Progress</Text></View>
              {PROCESSING_STEPS.map((step, index) => {
                const complete = index < activeStepIndex;
                const current = index === activeStepIndex;
                return (
                  <View key={step.id} style={[styles.stepRow, current && styles.currentStep]}>
                    <View style={[styles.stepIcon, complete ? styles.completeStep : current ? styles.currentStepIcon : styles.waitingStep]}>
                      <Ionicons name={complete ? 'checkmark' : step.icon} size={16} color={complete || current ? '#ffffff' : MUTED} />
                    </View>
                    <Text style={[styles.stepLabel, !complete && !current && styles.waitingStepLabel]}>{step.label}</Text>
                    {current && <ActivityIndicator size="small" color={RED} />}
                    {complete && <Text style={styles.completeLabel}>Complete</Text>}
                  </View>
                );
              })}
            </View>
          )}

          {uploadStatus === 'completed' && (
            <View>
              <View style={styles.successBanner}><Ionicons name="checkmark-circle" size={26} color="#22c55e" /><View><Text style={styles.successTitle}>Processing Complete!</Text><Text style={styles.successSubtitle}>{eventCount} event{eventCount === 1 ? '' : 's'} ready to download</Text></View></View>
              <Pressable style={styles.primaryButton} onPress={() => void openCalendarFile()}><Ionicons name="download-outline" size={18} color="#ffffff" /><Text style={styles.primaryButtonText}>Download / Add to Calendar</Text></Pressable>
              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryAction} onPress={() => void copyShareLink()}><Ionicons name="copy-outline" size={17} color="#efefef" /><Text style={styles.secondaryButtonText}>Copy Link</Text></Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => void shareCalendar()}><Ionicons name="share-social-outline" size={17} color="#efefef" /><Text style={styles.secondaryButtonText}>Share Link</Text></Pressable>
              </View>
              <Pressable style={styles.secondaryActionFull} onPress={() => setShowDeliveryForm((current) => !current)}><Ionicons name="mail-outline" size={17} color="#efefef" /><Text style={styles.secondaryButtonText}>{showDeliveryForm ? 'Hide Delivery Options' : 'Email or SMS'}</Text></Pressable>
              {showDeliveryForm && (
                <View style={styles.deliveryBox}>
                  <Field label="Email" value={deliveryEmail} onChangeText={setDeliveryEmail} placeholder="you@example.com" keyboardType="email-address" />
                  <Pressable style={styles.smallPrimaryButton} disabled={isEmailing} onPress={() => void handleEmailFile()}>{isEmailing ? <ActivityIndicator size="small" color="#ffffff" /> : <><Ionicons name="mail-outline" size={15} color="#ffffff" /><Text style={styles.primaryButtonText}>Send Email</Text></>}</Pressable>
                  <Field label="Phone Number" value={deliveryPhone} onChangeText={setDeliveryPhone} placeholder="+1 (555) 123-4567" keyboardType="phone-pad" />
                  <Pressable style={styles.smallPrimaryButton} disabled={isSmsing} onPress={() => void handleSmsFile()}>{isSmsing ? <ActivityIndicator size="small" color="#ffffff" /> : <><Ionicons name="chatbubble-outline" size={15} color="#ffffff" /><Text style={styles.primaryButtonText}>Send SMS</Text></>}</Pressable>
                </View>
              )}
              <Pressable style={styles.resetButton} onPress={handleReset}><Text style={styles.resetText}>Upload another file</Text></Pressable>
            </View>
          )}

          {(uploadStatus === 'failed' || uploadStatus === 'no_events') && processingFile && (
            <View style={styles.failureBox}>
              <Ionicons name={uploadStatus === 'no_events' ? 'alert-circle-outline' : 'warning-outline'} size={32} color={uploadStatus === 'no_events' ? RED : '#ef4444'} />
              <Text style={styles.cardHeading}>{uploadStatus === 'no_events' ? 'No calendar events found' : 'Processing failed'}</Text>
              <Text style={styles.failureText}>{failureReason || (uploadStatus === 'no_events' ? 'That file did not contain dates or times that could be turned into events.' : 'QuickCalAI could not finish processing this upload.')}</Text>
              <Pressable style={styles.primaryButton} onPress={handleReset}><Ionicons name="refresh-outline" size={17} color="#ffffff" /><Text style={styles.primaryButtonText}>Try another file</Text></Pressable>
            </View>
          )}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>Recent Activity</Text>
          {stats.recentUploads.length === 0 ? (
            <View style={styles.emptyBox}><Ionicons name="document-outline" size={28} color="#444444" /><Text style={styles.emptyText}>No recent activity. Upload a schedule to get started.</Text></View>
          ) : (
            stats.recentUploads.map((item) => (
              <View key={item.id} style={styles.recentRow}>
                <View style={styles.recentIcon}><Ionicons name="document-text-outline" size={17} color={RED} /></View>
                <View style={styles.recentInfo}><Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text><Text style={styles.fileMeta}>{item.eventCount} event{item.eventCount === 1 ? '' : 's'} • {new Date(item.createdAt).toLocaleDateString()}</Text></View>
                {renderStatus(item.status)}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ActionButton({ icon, label, onPress, primary = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable style={[styles.actionButton, primary ? styles.primaryButton : styles.secondaryAction]} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#ffffff" />
      <Text style={primary ? styles.primaryButtonText : styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numbers-and-punctuation' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.textArea]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#666666" multiline={multiline} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  brand: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  brandAccent: { color: RED },
  welcome: { marginBottom: 20 },
  heading: { color: '#ffffff', fontSize: 25, fontWeight: '800' },
  subheading: { color: MUTED, fontSize: 14, marginTop: 6 },
  notice: { backgroundColor: '#3b2a12', borderColor: '#76521c', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  noticeText: { color: '#f7d99a', fontSize: 12, lineHeight: 17 },
  statsLoader: { marginVertical: 30 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, minHeight: 108, backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 16, padding: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#ffffff', fontSize: 21, fontWeight: '800', marginTop: 5 },
  statTitle: { color: '#dddddd', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  statSubtitle: { color: '#666666', fontSize: 9, textAlign: 'center', marginTop: 2 },
  uploaderCard: { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 22, padding: 16 },
  uploaderTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  cardHeading: { color: '#ffffff', fontSize: 19, fontWeight: '800' },
  cardDescription: { color: MUTED, fontSize: 13, lineHeight: 18, marginTop: 5, paddingRight: 8 },
  planPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderColor: BORDER, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  planText: { color: MUTED, fontSize: 9, fontWeight: '800' },
  segmentedControl: { flexDirection: 'row', backgroundColor: SUBTLE_CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 11, padding: 3, marginBottom: 16 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 8 },
  activeSegment: { backgroundColor: RED },
  segmentText: { color: MUTED, fontSize: 13, fontWeight: '700' },
  activeSegmentText: { color: '#ffffff' },
  helperText: { color: MUTED, fontSize: 13, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11 },
  primaryButton: { minHeight: 46, backgroundColor: RED, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, marginTop: 12 },
  primaryButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  secondaryAction: { backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1 },
  secondaryButtonText: { color: '#efefef', fontSize: 13, fontWeight: '700' },
  documentButton: { minHeight: 44, borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 11, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  limitText: { color: '#666666', fontSize: 11, textAlign: 'center', marginTop: 12 },
  premiumBox: { backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 14, padding: 18, alignItems: 'center' },
  premiumTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800', marginTop: 8 },
  premiumDescription: { color: MUTED, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 5 },
  upgradeButton: { backgroundColor: '#d97706', borderRadius: 9, paddingHorizontal: 15, paddingVertical: 9, marginTop: 13 },
  upgradeButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  timezoneNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3b1714', borderColor: '#64251f', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 4 },
  timezoneText: { color: '#efefef', fontSize: 12, flex: 1 },
  timezoneValue: { color: '#f06a5b', fontWeight: '800' },
  field: { marginTop: 13 },
  fieldLabel: { color: '#dddddd', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  input: { backgroundColor: SUBTLE_CARD, borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 11 : 8, color: '#ffffff', fontSize: 14 },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
  fileRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222222', borderColor: '#333333', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 14 },
  fileIcon: { width: 40, height: 40, borderRadius: 9, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  fileInfo: { flex: 1, marginRight: 8 },
  fileName: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  fileMeta: { color: '#666666', fontSize: 10, marginTop: 3 },
  processingBanner: { backgroundColor: RED, borderRadius: 11, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginVertical: 14 },
  processingBannerText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  stepRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 9, marginBottom: 3 },
  currentStep: { backgroundColor: '#3b1714', borderColor: '#64251f', borderWidth: 1 },
  stepIcon: { width: 31, height: 31, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  completeStep: { backgroundColor: '#22c55e' },
  currentStepIcon: { backgroundColor: RED },
  waitingStep: { backgroundColor: '#222222' },
  stepLabel: { color: '#efefef', fontSize: 13, flex: 1 },
  waitingStepLabel: { color: '#666666' },
  completeLabel: { color: '#22c55e', fontSize: 10, fontWeight: '800' },
  successBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12301e', borderColor: '#1d6b38', borderWidth: 1, borderRadius: 12, padding: 14, gap: 10, marginBottom: 4 },
  successTitle: { color: '#22c55e', fontSize: 14, fontWeight: '800' },
  successSubtitle: { color: '#efefef', fontSize: 12, marginTop: 3 },
  secondaryActionFull: { height: 46, backgroundColor: '#222222', borderColor: '#3a3a3a', borderWidth: 1, borderRadius: 11, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deliveryBox: { backgroundColor: '#222222', borderColor: '#333333', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  smallPrimaryButton: { minHeight: 40, backgroundColor: RED, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 9 },
  resetButton: { alignItems: 'center', paddingVertical: 14 },
  resetText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  failureBox: { alignItems: 'center', paddingVertical: 8 },
  failureText: { color: MUTED, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  recentSection: { marginTop: 25 },
  sectionHeading: { color: '#ffffff', fontSize: 19, fontWeight: '800', marginBottom: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: SUBTLE_CARD, borderColor: '#252525', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 },
  recentIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  recentInfo: { flex: 1, marginRight: 7 },
  statusPill: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4 },
  successPill: { backgroundColor: '#12301e' },
  errorPill: { backgroundColor: '#3b1714' },
  pendingPill: { backgroundColor: '#332812' },
  statusText: { fontSize: 8, fontWeight: '900' },
  successText: { color: '#22c55e' },
  errorText: { color: '#ef4444' },
  pendingText: { color: '#f59e0b' },
  emptyBox: { backgroundColor: SUBTLE_CARD, borderColor: '#252525', borderWidth: 1, borderRadius: 14, padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { color: '#666666', fontSize: 12, textAlign: 'center' },
});

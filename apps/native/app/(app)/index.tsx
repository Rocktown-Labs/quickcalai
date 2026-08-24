import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image, 
  Linking, 
  Share, 
  TextInput,
  RefreshControl,
  Platform
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com';

const PROCESSING_STEPS = [
  { id: 'analyzing', label: 'Analyzing image', icon: 'image-outline' },
  { id: 'detecting', label: 'Detecting dates & times', icon: 'sparkles-outline' },
  { id: 'extracting', label: 'Extracting event details', icon: 'flash-outline' },
  { id: 'formatting', label: 'Formatting calendar data', icon: 'checkmark-circle-outline' },
];

type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'no_events';

type RecentUpload = {
  id: string;
  fileName: string;
  status: UploadStatus;
  createdAt: string;
  eventCount: number;
};

export default function DashboardScreen() {
  const { signOut, getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalEvents: 0,
    completedUploads: 0,
    isPremium: false,
  });
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Upload & Active Processing States
  const [processingFile, setProcessingFile] = useState<{ uri: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  
  // Delivery State
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSmsing, setIsSmsing] = useState(false);

  const pollingIntervalRef = useRef<any>(null);
  const stepIntervalRef = useRef<any>(null);

  const fetchStats = async (showLoader = true) => {
    // Don't fetch until Clerk has resolved and the user is actually signed in
    if (!isLoaded || !isSignedIn) return;
    if (showLoader) setIsLoadingStats(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No auth token available');
      }
      const response = await fetch(`${SERVER_URL}/api/user/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats({
        totalUploads: data.totalUploads,
        totalEvents: data.totalEvents,
        completedUploads: data.completedUploads,
        isPremium: data.isPremium,
      });
      setRecentUploads(data.recentUploads || []);
      
      // Auto-fill delivery info from user profile if available
      if (user) {
        setDeliveryEmail(user.primaryEmailAddress?.emailAddress || '');
        setDeliveryPhone(user.primaryPhoneNumber?.phoneNumber || '');
      }
    } catch {
      // Fail silently — stats stay at their zero defaults until a
      // pull-to-refresh or completed upload refreshes them.
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats(false);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  };

  // Start polling Clerk workflow status
  const startPollingStatus = (runId: string) => {
    stopPolling();
    
    // Simulate steps progress over time
    setActiveStepIndex(0);
    stepIntervalRef.current = setInterval(() => {
      setActiveStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    // Poll the backend endpoint
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${SERVER_URL}/api/workflow/status/${runId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const status: UploadStatus = data.status;

        if (status === 'completed' || status === 'failed' || status === 'no_events') {
          stopPolling();
          setUploadStatus(status);
          setEventCount(data.eventCount || 0);
          setUploadId(data.uploadId);
          
          if (status === 'completed') {
            setActiveStepIndex(PROCESSING_STEPS.length);
            setIcsUrl(data.result?.icsUrl || null);
            setShareToken(data.result?.shareToken || null);
            Alert.alert('Done!', `Extracted ${data.eventCount} events successfully.`);
            fetchStats(false);
          } else if (status === 'no_events') {
            Alert.alert('No Events Found', 'The document looked valid, but no calendar events were detected.');
            fetchStats(false);
          } else if (status === 'failed') {
            setFailureReason(data.failureReason || 'An error occurred during workflow execution.');
            Alert.alert('Processing Failed', data.failureReason || 'AI extraction failed.');
            fetchStats(false);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  // Handle Photo Picker
  const pickImage = async (useCamera: boolean) => {
    if (!stats.isPremium) {
      Alert.alert(
        'Premium Feature', 
        'AI calendar extraction is a premium feature. Please upgrade your subscription on the web application.'
      );
      return;
    }

    try {
      let result;
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

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.fileName || uri.split('/').pop() || 'photo.jpg';
        
        setProcessingFile({ uri, name });
        setIsUploading(true);
        setUploadStatus('pending');
        setFailureReason(null);
        setIcsUrl(null);
        setShareToken(null);
        
        // 1. Prepare FormData
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name,
          type: asset.mimeType || 'image/jpeg',
        });

        // 2. Upload to Next.js API
        const token = await getToken();
        const uploadResponse = await fetch(`${SERVER_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(data.error || 'Failed to start processing');
        }

        setIsUploading(false);
        setUploadStatus('processing');
        startPollingStatus(data.runId);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadStatus('failed');
      setFailureReason(error.message || 'Failed to connect to the server.');
      Alert.alert('Upload Failed', error.message || 'An error occurred during file upload.');
    }
  };

  const handleReset = () => {
    stopPolling();
    setProcessingFile(null);
    setUploadStatus(null);
    setEventCount(0);
    setIcsUrl(null);
    setShareToken(null);
    setUploadId(null);
    setFailureReason(null);
    setShowDeliveryForm(false);
  };

  const openCalendarFile = async () => {
    if (icsUrl) {
      const supported = await Linking.canOpenURL(icsUrl);
      if (supported) {
        await Linking.openURL(icsUrl);
      } else {
        Alert.alert('Cannot Open', 'No application found to handle calendar file URLs.');
      }
    }
  };

  const shareCalendar = async () => {
    if (!shareToken) return;
    const shareUrl = `${SERVER_URL}/s/${shareToken}`;
    try {
      await Share.share({
        message: `Check out my calendar events: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEmailFile = async () => {
    if (!uploadId || !deliveryEmail.trim()) return;
    setIsEmailing(true);
    try {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uploadId,
          type: 'email',
          destination: deliveryEmail.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to email file');

      Alert.alert('Email Sent', `Calendar events emailed successfully to ${deliveryEmail}`);
    } catch (error: any) {
      Alert.alert('Failed to Email', error.message || 'An error occurred.');
    } finally {
      setIsEmailing(false);
    }
  };

  const handleSmsFile = async () => {
    if (!uploadId || !deliveryPhone.trim()) return;
    setIsSmsing(true);
    try {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uploadId,
          type: 'sms',
          destination: deliveryPhone.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send SMS');

      Alert.alert('SMS Sent', `SMS delivery link sent successfully to ${deliveryPhone}`);
    } catch (error: any) {
      Alert.alert('Failed to Send SMS', error.message || 'An error occurred.');
    } finally {
      setIsSmsing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  // Render Stats Card Helper
  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: string) => (
    <View className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl items-center justify-center min-h-[100px]">
      <Ionicons name={icon as any} size={24} color="#c23326" className="mb-2" />
      <Text className="text-white text-xl font-bold">{value}</Text>
      <Text className="text-[#888888] text-xs font-semibold mt-1 text-center">{title}</Text>
      <Text className="text-[#555555] text-[10px] text-center mt-0.5">{subtitle}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-[#222222] flex-row justify-between items-center bg-[#161616]">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-[#c23326] rounded-lg items-center justify-center mr-2 shadow-md shadow-[#c23326]/20">
            <Ionicons name="calendar" size={16} color="#ffffff" />
          </View>
          <Text className="text-white text-lg font-bold">
            QuickCal<Text className="text-[#c23326]">AI</Text>
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSignOut}
          className="w-8 h-8 bg-[#212121] rounded-lg items-center justify-center border border-[#333333] active:bg-[#333333]"
        >
          <Ionicons name="log-out-outline" size={18} color="#efefef" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor="#c23326"
            colors={['#c23326']}
          />
        }
      >
        {/* Welcome */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold">
            Welcome back, {user?.firstName || 'User'}! 👋
          </Text>
          <Text className="text-[#888888] text-sm mt-1">
            Extract schedule events easily with Gemini AI.
          </Text>
        </View>

        {/* Stats Row */}
        {!isLoadingStats && (
          <View className="flex-row gap-3 mb-6">
            {renderStatCard('Total Uploads', stats.totalUploads, `${stats.completedUploads} completed`, 'document-text-outline')}
            {renderStatCard('Events Extracted', stats.totalEvents, 'Calendar events', 'sparkles-outline')}
            {renderStatCard('Success Rate', `${stats.totalUploads > 0 ? Math.round((stats.completedUploads / stats.totalUploads) * 100) : 0}%`, 'Processing rate', 'checkmark-circle-outline')}
          </View>
        )}

        {/* --- UPLOADER COMPONENT --- */}
        <View className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-3xl mb-6 shadow-xl">
          {/* 1. INITIAL STATE */}
          {uploadStatus === null && (
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">AI Calendar Extraction</Text>
                {stats.isPremium ? (
                  <View className="bg-gradient-to-r from-amber-500 to-orange-600 bg-amber-600 px-2.5 py-0.5 rounded-full flex-row items-center">
                    <Ionicons name="ribbon-outline" size={10} color="#ffffff" className="mr-1" />
                    <Text className="text-white text-[9px] font-black">PREMIUM</Text>
                  </View>
                ) : (
                  <View className="bg-[#222] border border-[#333] px-2 py-0.5 rounded-full">
                    <Text className="text-[#888] text-[9px] font-bold">FREE PLAN</Text>
                  </View>
                )}
              </View>
              
              <Text className="text-[#888888] text-sm mb-6 leading-relaxed">
                Take a photo of a flyer, sports schedule, or syllabus, or upload an image to convert it into a calendar file.
              </Text>

              {stats.isPremium ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => pickImage(true)}
                    className="flex-1 bg-[#c23326] h-12 rounded-xl flex-row items-center justify-center shadow-md shadow-[#c23326]/30 active:opacity-95"
                  >
                    <Ionicons name="camera-outline" size={18} color="#ffffff" className="mr-2" />
                    <Text className="text-white text-sm font-bold">Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => pickImage(false)}
                    className="flex-1 bg-[#222222] border border-[#333333] h-12 rounded-xl flex-row items-center justify-center active:bg-[#333333]"
                  >
                    <Ionicons name="images-outline" size={18} color="#efefef" className="mr-2" />
                    <Text className="text-[#efefef] text-sm font-bold">From Gallery</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-[#222] border border-[#333] p-4 rounded-xl items-center">
                  <Ionicons name="ribbon-outline" size={32} color="#d97706" className="mb-2" />
                  <Text className="text-white text-sm font-bold">Unlock AI Extraction</Text>
                  <Text className="text-[#888] text-xs text-center mt-1 mb-4">
                    Upgrade to Premium on our web application settings page to start uploading documents.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Premium settings', 'Please visit settings in the web app to manage your billing.')}
                    className="bg-[#d97706] px-4 py-2 rounded-lg active:opacity-90"
                  >
                    <Text className="text-white text-xs font-bold">Learn More</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* 2. UPLOADING / PROCESSING STATE */}
          {(isUploading || uploadStatus === 'pending' || uploadStatus === 'processing') && processingFile && (
            <View>
              <Text className="text-white text-lg font-bold mb-4">AI extracts details instantly</Text>
              
              {/* File details card */}
              <View className="bg-[#222] border border-[#333] p-3 rounded-xl flex-row items-center mb-4">
                <View className="w-10 h-10 bg-[#c23326] rounded-lg items-center justify-center mr-3">
                  <Ionicons name="image-outline" size={20} color="#ffffff" />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-white text-xs font-bold" numberOfLines={1}>
                    {processingFile.name}
                  </Text>
                  <Text className="text-[#888] text-[10px] mt-0.5">
                    {isUploading ? 'Uploading securely...' : 'Processing with AI...'}
                  </Text>
                </View>
                <ActivityIndicator size="small" color="#c23326" />
              </View>

              {/* Red progress banner */}
              <View className="bg-[#c23326] p-3 rounded-xl flex-row items-center justify-center mb-5">
                <Ionicons name="flash" size={14} color="#ffffff" className="mr-1.5 animate-pulse" />
                <Text className="text-white text-xs font-black">AI Processing in Progress</Text>
              </View>

              {/* Progress Steps Checklist */}
              <View className="space-y-2">
                {PROCESSING_STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <View 
                      key={step.id}
                      className={`flex-row items-center p-3 rounded-xl border ${isCurrent ? 'bg-[#c23326]/10 border-[#c23326]/20' : 'border-transparent'}`}
                    >
                      <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${isDone ? 'bg-[#22c55e]' : isCurrent ? 'bg-[#c23326]' : 'bg-[#222]'}`}>
                        {isDone ? (
                          <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                        ) : (
                          <Ionicons name={step.icon as any} size={16} color={isCurrent ? '#ffffff' : '#888888'} />
                        )}
                      </View>
                      <Text className={`text-sm flex-1 ${isCurrent ? 'text-white font-bold' : isDone ? 'text-[#efefef]' : 'text-[#666666]'}`}>
                        {step.label}
                      </Text>
                      {isCurrent && <ActivityIndicator size="small" color="#c23326" />}
                      {isDone && <Text className="text-[#22c55e] text-xs font-bold">✓ Complete</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 3. COMPLETED STATE */}
          {uploadStatus === 'completed' && (
            <View>
              <Text className="text-white text-lg font-bold mb-4">Export options</Text>

              {/* Success Banner */}
              <View className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-4 rounded-xl flex-row items-center mb-6">
                <View className="w-10 h-10 bg-[#22c55e] rounded-lg items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#22c55e] text-sm font-bold">Processing Complete!</Text>
                  <Text className="text-white text-xs mt-0.5">{eventCount} events ready</Text>
                </View>
              </View>

              {/* Action Buttons Grid */}
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={openCalendarFile}
                  disabled={!icsUrl}
                  className="bg-[#c23326] h-12 rounded-xl flex-row items-center justify-center shadow-lg shadow-[#c23326]/20 active:opacity-90"
                >
                  <Ionicons name="download-outline" size={18} color="#ffffff" className="mr-2" />
                  <Text className="text-white text-sm font-bold">Download / Add to Calendar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shareCalendar}
                  disabled={!shareToken}
                  className="bg-[#222222] border border-[#333333] h-12 rounded-xl flex-row items-center justify-center active:bg-[#333333]"
                >
                  <Ionicons name="share-social-outline" size={18} color="#efefef" className="mr-2" />
                  <Text className="text-[#efefef] text-sm font-bold">Share Calendar Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowDeliveryForm(!showDeliveryForm)}
                  className="bg-[#222222] border border-[#333333] h-12 rounded-xl flex-row items-center justify-center active:bg-[#333333]"
                >
                  <Ionicons name="mail-outline" size={18} color="#efefef" className="mr-2" />
                  <Text className="text-[#efefef] text-sm font-bold">
                    {showDeliveryForm ? 'Hide Delivery Options' : 'Email or SMS to Friend'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Delivery Form */}
              {showDeliveryForm && (
                <View className="bg-[#222] border border-[#333] p-4 rounded-xl mt-4 space-y-4">
                  {/* Email Section */}
                  <View>
                    <Text className="text-white text-xs font-bold mb-1.5">Email Address</Text>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={deliveryEmail}
                        onChangeText={setDeliveryEmail}
                        placeholder="friend@example.com"
                        placeholderTextColor="#666666"
                        autoCapitalize="none"
                        className="flex-1 bg-[#161616] border border-[#333] text-white px-3 py-2 rounded-lg text-sm"
                      />
                      <TouchableOpacity
                        onPress={handleEmailFile}
                        disabled={isEmailing || !deliveryEmail}
                        className="bg-[#c23326] px-4 rounded-lg flex-row items-center justify-center disabled:opacity-50 h-10"
                      >
                        {isEmailing ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-xs font-bold">Email</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* SMS Section */}
                  <View>
                    <Text className="text-white text-xs font-bold mb-1.5">Phone Number</Text>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={deliveryPhone}
                        onChangeText={setDeliveryPhone}
                        placeholder="+1 (555) 123-4567"
                        placeholderTextColor="#666666"
                        keyboardType="phone-pad"
                        className="flex-1 bg-[#161616] border border-[#333] text-white px-3 py-2 rounded-lg text-sm"
                      />
                      <TouchableOpacity
                        onPress={handleSmsFile}
                        disabled={isSmsing || !deliveryPhone}
                        className="bg-[#c23326] px-4 rounded-lg flex-row items-center justify-center disabled:opacity-50 h-10"
                      >
                        {isSmsing ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-xs font-bold">SMS</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Reset / Done Button */}
              <TouchableOpacity
                onPress={handleReset}
                className="mt-6 align-self-center py-2 px-6 bg-[#222] border border-[#333] rounded-full"
              >
                <Text className="text-[#888888] text-xs font-bold text-center">Upload another document</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 4. FAILED / NO_EVENTS STATE */}
          {(uploadStatus === 'failed' || uploadStatus === 'no_events') && (
            <View className="items-center py-4">
              <View className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons 
                  name={uploadStatus === 'no_events' ? 'alert-circle-outline' : 'warning-outline'} 
                  size={28} 
                  color="#ef4444" 
                />
              </View>
              
              <Text className="text-white text-lg font-bold text-center">
                {uploadStatus === 'no_events' ? 'No events found' : 'Extraction failed'}
              </Text>
              
              <Text className="text-[#888] text-xs text-center mt-2 mb-6 max-w-[250px] leading-relaxed">
                {uploadStatus === 'no_events' 
                  ? 'QuickCalAI checked your image, but could not detect any scheduling dates or times.'
                  : failureReason || 'We encountered an error processing your upload.'}
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleReset}
                  className="bg-[#c23326] px-5 py-2.5 rounded-xl shadow-md active:opacity-90"
                >
                  <Text className="text-white text-xs font-bold">Try Another File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReset}
                  className="bg-[#222] border border-[#333] px-5 py-2.5 rounded-xl active:bg-[#333]"
                >
                  <Text className="text-[#888] text-xs font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* --- RECENT ACTIVITY --- */}
        <View className="mb-10">
          <Text className="text-white text-lg font-bold mb-4">Recent Activity</Text>

          {isLoadingStats ? (
            <ActivityIndicator size="small" color="#c23326" className="py-6" />
          ) : recentUploads.length > 0 ? (
            <View className="space-y-3">
              {recentUploads.map((item) => (
                <View 
                  key={item.id}
                  className="bg-[#161616] border border-[#222] p-4 rounded-2xl flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-9 h-9 bg-[#222] border border-[#333] rounded-lg items-center justify-center mr-3">
                      <Ionicons name="document-text" size={16} color="#c23326" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xs font-bold" numberOfLines={1}>
                        {item.fileName}
                      </Text>
                      <Text className="text-[#555] text-[9px] mt-0.5">
                        {item.eventCount} events • {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View 
                      className={`px-2.5 py-0.5 rounded-full mr-2 ${
                        item.status === 'completed' 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : item.status === 'processing' 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : item.status === 'failed' 
                          ? 'bg-red-500/10 border border-red-500/20' 
                          : 'bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      <Text 
                        className={`text-[9px] font-black uppercase ${
                          item.status === 'completed' 
                            ? 'text-green-500' 
                            : item.status === 'processing' 
                            ? 'text-blue-500' 
                            : item.status === 'failed' 
                            ? 'text-red-500' 
                            : 'text-amber-500'
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-[#161616] border border-[#222] p-6 rounded-2xl items-center">
              <Ionicons name="document-outline" size={28} color="#444" className="mb-2" />
              <Text className="text-[#555] text-xs">No recent activity. Upload a schedule to get started!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

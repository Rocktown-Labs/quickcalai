import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      // Send the verification code to the user's email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(app)');
      } else {
        console.warn('Sign up status incomplete:', completeSignUp.status);
        Alert.alert('Authentication Incomplete', 'Sign up was not completed successfully.');
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.errors?.[0]?.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#121212]"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 justify-center px-6 py-12">
            <View className="items-center mb-10">
              <View className="w-16 h-16 bg-[#c23326]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#c23326]/30">
                <Ionicons name="mail-unread-outline" size={32} color="#c23326" />
              </View>
              <Text className="text-white text-3xl font-bold tracking-tight">
                Verify Email
              </Text>
              <Text className="text-[#888888] text-sm mt-2 text-center max-w-[280px]">
                We have sent a verification code to {email}. Please enter it below.
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-[#efefef] text-sm font-semibold mb-2 ml-1">Verification Code</Text>
                <View className="flex-row items-center bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 h-12">
                  <Ionicons name="key-outline" size={20} color="#888888" className="mr-3" />
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#666666"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    className="flex-1 text-white text-base h-full ml-2"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={isLoading}
                className="bg-[#c23326] h-12 rounded-xl flex items-center justify-center mt-6 shadow-lg shadow-[#c23326]/20 active:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-bold">Verify & Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => setPendingVerification(false)} 
              className="mt-6 align-self-center"
            >
              <Text className="text-[#888888] text-sm text-center">Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo / Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-[#c23326] rounded-2xl flex items-center justify-center shadow-lg shadow-[#c23326]/30 mb-4">
              <Ionicons name="calendar" size={32} color="#ffffff" />
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight">
              Create Account
            </Text>
            <Text className="text-[#888888] text-sm mt-1 text-center max-w-[250px]">
              Join QuickCalAI to instantly extract calendar events
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-[#efefef] text-sm font-semibold mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 h-12">
                <Ionicons name="mail-outline" size={20} color="#888888" className="mr-3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#666666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-base h-full ml-2"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-[#efefef] text-sm font-semibold mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 h-12">
                <Ionicons name="lock-closed-outline" size={20} color="#888888" className="mr-3" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-base h-full ml-2"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888888" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isLoading}
              className="bg-[#c23326] h-12 rounded-xl flex items-center justify-center mt-6 shadow-lg shadow-[#c23326]/20 active:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-[#888888] text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text className="text-[#c23326] text-sm font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

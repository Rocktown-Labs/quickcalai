import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email.trim(),
        password,
      });
      
      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(app)');
      } else {
        console.warn('Sign in status incomplete:', completeSignIn.status);
        Alert.alert('Authentication Incomplete', 'Further steps are required to complete sign-in.');
      }
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.errors?.[0]?.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

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
              QuickCal<Text className="text-[#c23326]">AI</Text>
            </Text>
            <Text className="text-[#888888] text-sm mt-1 text-center max-w-[250px]">
              Extract dates and events from your images instantly
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
                  placeholder="Enter your password"
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
              onPress={handleSignIn}
              disabled={isLoading}
              className="bg-[#c23326] h-12 rounded-xl flex items-center justify-center mt-6 shadow-lg shadow-[#c23326]/20 active:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-[#888888] text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text className="text-[#c23326] text-sm font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

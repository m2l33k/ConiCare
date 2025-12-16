import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { styled } from 'nativewind';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Placeholder logic for routing based on role
    // In a real app, this would come from Supabase Auth state
    if (email.includes('child')) {
      router.replace('/(child)/game-arena');
    } else {
      router.replace('/(mother)/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-medical-100 rounded-full justify-center items-center mb-4">
          <Text className="text-4xl">🧠</Text>
        </View>
        <Text className="text-3xl font-bold text-medical-900">MindBloom</Text>
        <Text className="text-gray-500 mt-2">Cognitive Health Ecosystem</Text>
      </View>

      <View className="w-full max-w-sm space-y-4">
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          className="bg-white"
          outlineColor="#e2e8f0"
          activeOutlineColor="#0ea5e9"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          className="bg-white"
          outlineColor="#e2e8f0"
          activeOutlineColor="#0ea5e9"
        />
        
        <Button 
          mode="contained" 
          onPress={handleLogin}
          className="bg-medical-500 py-1 mt-4 rounded-lg"
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        >
          Sign In
        </Button>
      </View>

      <TouchableOpacity className="mt-6">
        <Text className="text-medical-600 font-medium">Create a new account</Text>
      </TouchableOpacity>
    </View>
  );
}

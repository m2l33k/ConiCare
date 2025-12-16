import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function GameArenaScreen() {
  const [showExitModal, setShowExitModal] = useState(false);
  const [pin, setPin] = useState('');

  const handleExit = () => {
    if (pin === '1234') { // Hardcoded for demo
      setShowExitModal(false);
      router.replace('/(mother)/(tabs)');
    } else {
      Alert.alert('Try Again', 'Wrong PIN code!');
      setPin('');
    }
  };

  const playVoiceInstruction = async () => {
    // Placeholder for audio logic
    console.log('Playing audio: "Choose a game to play!"');
  };

  return (
    <View className="flex-1 bg-purple-500">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center p-6 pt-12">
        <View className="flex-row items-center bg-white/20 rounded-full px-4 py-2">
          <MaterialCommunityIcons name="star" size={30} color="#facc15" />
          <Text className="text-white font-bold text-2xl ml-2">1,250</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setShowExitModal(true)}
          className="bg-red-500 p-3 rounded-full border-4 border-white"
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-white text-4xl font-bold mb-8 text-center shadow-lg">
          Let's Play! 🎮
        </Text>

        <View className="flex-row flex-wrap justify-center gap-6">
          {/* Game 1: Memory Match */}
          <TouchableOpacity className="w-40 h-40 bg-yellow-400 rounded-3xl items-center justify-center shadow-lg border-b-8 border-yellow-600 active:border-b-0 active:mt-2">
            <MaterialCommunityIcons name="cards" size={60} color="#fff" />
            <Text className="text-yellow-900 font-bold text-xl mt-2">Memory</Text>
          </TouchableOpacity>

          {/* Game 2: Logic Puzzle */}
          <TouchableOpacity className="w-40 h-40 bg-blue-400 rounded-3xl items-center justify-center shadow-lg border-b-8 border-blue-600 active:border-b-0 active:mt-2">
            <MaterialCommunityIcons name="puzzle" size={60} color="#fff" />
            <Text className="text-blue-900 font-bold text-xl mt-2">Logic</Text>
          </TouchableOpacity>

          {/* Game 3: Focus */}
          <TouchableOpacity className="w-40 h-40 bg-green-400 rounded-3xl items-center justify-center shadow-lg border-b-8 border-green-600 active:border-b-0 active:mt-2">
            <MaterialCommunityIcons name="target" size={60} color="#fff" />
            <Text className="text-green-900 font-bold text-xl mt-2">Focus</Text>
          </TouchableOpacity>

          {/* Game 4: Story Time */}
          <TouchableOpacity className="w-40 h-40 bg-pink-400 rounded-3xl items-center justify-center shadow-lg border-b-8 border-pink-600 active:border-b-0 active:mt-2">
            <MaterialCommunityIcons name="book-open-page-variant" size={60} color="#fff" />
            <Text className="text-pink-900 font-bold text-xl mt-2">Story</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={playVoiceInstruction}
          className="mt-10 bg-white/20 p-4 rounded-full"
        >
          <MaterialCommunityIcons name="volume-high" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Exit PIN Modal */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
            <Text className="text-xl font-bold text-gray-800 mb-4">Parent Gate 🔒</Text>
            <Text className="text-gray-500 mb-4">Enter PIN to exit Child Mode</Text>
            
            <TextInput
              className="bg-gray-100 w-full p-4 rounded-xl text-center text-2xl font-bold tracking-widest mb-6"
              keyboardType="number-pad"
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              placeholder="0000"
            />

            <View className="flex-row gap-4 w-full">
              <TouchableOpacity 
                onPress={() => { setShowExitModal(false); setPin(''); }}
                className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleExit}
                className="flex-1 bg-red-500 p-4 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

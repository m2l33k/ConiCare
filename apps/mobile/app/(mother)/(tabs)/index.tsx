import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Card, Button, Avatar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';

export default function MotherHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-medical-50">
      {/* Header */}
      <View className="flex-row justify-between items-center p-6 bg-white shadow-sm">
        <View className="flex-row items-center space-x-3">
          <Avatar.Image size={40} source={{ uri: 'https://i.pravatar.cc/150?img=5' }} />
          <View>
            <Text className="text-gray-500 text-xs">Welcome back,</Text>
            <Text className="text-medical-900 font-bold text-lg">Sarah Jenkins</Text>
          </View>
        </View>
        <IconButton icon="bell-outline" iconColor="#0ea5e9" size={24} />
      </View>

      {/* Child Profile Card */}
      <View className="p-4">
        <Card className="bg-white mb-6 elevation-2">
          <Card.Content className="flex-row items-center space-x-4">
            <Avatar.Image size={60} source={{ uri: 'https://i.pravatar.cc/150?img=12' }} />
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">Leo</Text>
              <Text className="text-gray-500">Age 6 • Autism Spectrum</Text>
              <View className="flex-row mt-2 space-x-2">
                <View className="bg-green-100 px-2 py-1 rounded">
                  <Text className="text-green-700 text-xs font-medium">Status: Active</Text>
                </View>
              </View>
            </View>
          </Card.Content>
          <Card.Actions className="justify-end border-t border-gray-100 mt-2">
            <Button 
              textColor="#0ea5e9" 
              onPress={() => router.push('/(child)/game-arena')}
            >
              Switch to Child Mode
            </Button>
          </Card.Actions>
        </Card>

        <Text className="text-lg font-bold text-gray-800 mb-3">Daily Actions</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Action 1: New Assessment */}
          <Card className="w-[48%] mb-4 bg-white" onPress={() => console.log('New Assessment')}>
            <Card.Content className="items-center py-6">
              <View className="bg-blue-100 p-3 rounded-full mb-3">
                <IconButton icon="camera" iconColor="#0ea5e9" size={24} className="m-0" />
              </View>
              <Text className="font-bold text-center text-gray-800">New Scan</Text>
              <Text className="text-xs text-gray-500 text-center mt-1">Record video for AI</Text>
            </Card.Content>
          </Card>

          {/* Action 2: View Progress */}
          <Card className="w-[48%] mb-4 bg-white" onPress={() => router.push('/(mother)/(tabs)/reports')}>
            <Card.Content className="items-center py-6">
              <View className="bg-purple-100 p-3 rounded-full mb-3">
                <IconButton icon="chart-bar" iconColor="#a855f7" size={24} className="m-0" />
              </View>
              <Text className="font-bold text-center text-gray-800">Progress</Text>
              <Text className="text-xs text-gray-500 text-center mt-1">Check game scores</Text>
            </Card.Content>
          </Card>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Upcoming Appointments</Text>
        
        <Card className="bg-white mb-4">
          <Card.Content className="flex-row items-center">
            <View className="bg-orange-100 rounded-lg px-3 py-2 items-center mr-4">
              <Text className="text-orange-700 font-bold text-lg">18</Text>
              <Text className="text-orange-700 text-xs">DEC</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Dr. Emily Chen</Text>
              <Text className="text-gray-500 text-sm">Child Psychologist • 10:00 AM</Text>
            </View>
            <IconButton icon="video" iconColor="#0ea5e9" size={24} />
          </Card.Content>
        </Card>

      </View>
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CHANNELS } from '../../constants/config';

export default function ForumScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-4">
        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-2">Forum</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Connect with your chapter
        </Text>

        <FlatList
          data={CHANNELS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Channel', { channelId: item.id, channelName: item.name })}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row items-center border border-slate-100 dark:border-slate-700"
              activeOpacity={0.85}
            >
              <View className="w-12 h-12 rounded-2xl bg-deca-blue-50 dark:bg-deca-blue-900/30 items-center justify-center mr-4">
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-slate-900 dark:text-white font-semibold text-base">
                    {item.name}
                  </Text>
                  {item.isAnnouncement && (
                    <View className="ml-2 bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
                      <Text className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                        Officers only
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {item.description}
                </Text>
              </View>
              <Text className="text-slate-400 text-lg">›</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}

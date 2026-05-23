import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Announcement } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface Props {
  announcement: Announcement;
  onPress?: () => void;
}

export default function AnnouncementCard({ announcement, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 shadow-sm"
      activeOpacity={0.85}
    >
      <View className="flex-row items-center mb-2">
        {announcement.isPinned && (
          <View className="bg-deca-blue-100 dark:bg-deca-blue-900 rounded-full px-2 py-0.5 mr-2">
            <Text className="text-deca-blue-600 dark:text-deca-blue-300 text-xs font-medium">Pinned</Text>
          </View>
        )}
        <Text className="text-slate-400 dark:text-slate-500 text-xs ml-auto">
          {formatRelativeTime(announcement.createdAt)}
        </Text>
      </View>
      <Text className="text-slate-900 dark:text-white font-semibold text-base mb-1">
        {announcement.title}
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5" numberOfLines={2}>
        {announcement.content}
      </Text>
    </TouchableOpacity>
  );
}

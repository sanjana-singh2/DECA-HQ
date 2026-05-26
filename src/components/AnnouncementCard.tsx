import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Announcement } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface Props { announcement: Announcement; onPress?: () => void; }

export default function AnnouncementCard({ announcement, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {announcement.isPinned && (
          <View style={{ backgroundColor: '#E3E2F5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 }}>
            <Text style={{ color: '#756FC9', fontSize: 11, fontWeight: '500' }}>Pinned</Text>
          </View>
        )}
        <Text style={{ color: '#C4BEB8', fontSize: 11, marginLeft: 'auto' }}>
          {formatRelativeTime(announcement.createdAt)}
        </Text>
      </View>
      <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14, marginBottom: 4 }}>
        {announcement.title}
      </Text>
      <Text style={{ color: '#A09A94', fontSize: 13, lineHeight: 19 }} numberOfLines={2}>
        {announcement.content}
      </Text>
    </TouchableOpacity>
  );
}

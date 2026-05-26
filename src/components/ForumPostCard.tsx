import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ForumPost } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface Props {
  post: ForumPost;
  authorName: string;
  onPress?: () => void;
}

export default function ForumPostCard({ post, authorName, onPress }: Props) {
  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((sum, users) => sum + users.length, 0)
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ backgroundColor: '#FDFAF5', borderRadius: 18, padding: 16, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ color: '#756FC9', fontSize: 14, fontWeight: '700' }}>
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13 }}>{authorName}</Text>
          <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 1 }}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#C4BEB8" />
      </View>

      <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 21, marginBottom: 12 }} numberOfLines={4}>
        {post.content}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EDE8DF', gap: 12 }}>
        {totalReactions > 0 ? (
          <Text style={{ color: '#A09A94', fontSize: 12 }}>{totalReactions} reactions</Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="message-square" size={12} color="#A09A94" />
          <Text style={{ color: '#A09A94', fontSize: 12 }}>{post.commentCount ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

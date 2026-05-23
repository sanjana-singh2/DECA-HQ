import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ForumPost } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface Props {
  post: ForumPost;
  authorName: string;
  onPress?: () => void;
}

const REACTIONS = ['👍', '❤️', '🔥', '🎉'];

export default function ForumPostCard({ post, authorName, onPress }: Props) {
  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((sum, users) => sum + users.length, 0)
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 shadow-sm"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-deca-blue-100 dark:bg-deca-blue-900 items-center justify-center mr-3">
          <Text className="text-deca-blue-600 dark:text-deca-blue-300 text-sm font-bold">
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-white font-semibold text-sm">
            {authorName}
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs">
            {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text className="text-slate-700 dark:text-slate-300 text-sm leading-5 mb-3" numberOfLines={4}>
        {post.content}
      </Text>

      <View className="flex-row items-center pt-2 border-t border-slate-100 dark:border-slate-700">
        {totalReactions > 0 && (
          <Text className="text-slate-500 dark:text-slate-400 text-xs mr-3">
            {totalReactions} reactions
          </Text>
        )}
        <Text className="text-slate-500 dark:text-slate-400 text-xs">
          💬 {post.commentCount ?? 0} comments
        </Text>
      </View>
    </TouchableOpacity>
  );
}

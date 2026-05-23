import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getChannelPosts, createPost, deletePost } from '../../services/forumService';
import { ForumPost } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { CHANNELS } from '../../constants/config';

type RouteParams = { channelId: string; channelName: string };

export default function ChannelScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { channelId } = route.params;
  const { user, isOfficer } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const channel = CHANNELS.find(c => c.id === channelId);
  const isAnnouncementChannel = channel?.isAnnouncement ?? false;
  const canPost = !isAnnouncementChannel || isOfficer;

  const load = async () => {
    const data = await getChannelPosts(channelId);
    setPosts(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [channelId]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    try {
      await createPost({ authorId: user.uid, channelId, content: text.trim() });
      setText('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePost(postId);
          await load();
        },
      },
    ]);
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isOwn = item.authorId === user?.uid;
    const canDelete = isOwn || isOfficer;
    return (
      <View className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 rounded-full bg-deca-blue-100 dark:bg-deca-blue-900 items-center justify-center mr-2">
            <Text className="text-deca-blue-600 dark:text-deca-blue-300 text-sm font-bold">
              {item.authorId.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-semibold text-sm">Member</Text>
            <Text className="text-slate-400 text-xs">{formatRelativeTime(item.createdAt)}</Text>
          </View>
          {canDelete && (
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text className="text-slate-400 text-xs">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-slate-700 dark:text-slate-300 text-sm leading-5">{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-slate-900"
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1a56db" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text style={{ fontSize: 36 }} className="mb-3">💬</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                No posts yet. Be the first to share!
              </Text>
            </View>
          }
          inverted={posts.length > 0}
        />
      )}

      {canPost && (
        <View className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-row items-end gap-3">
          <TextInput
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-sm max-h-24"
            placeholder="Write a message..."
            placeholderTextColor="#94a3b8"
            multiline
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={handlePost}
            disabled={!text.trim() || posting}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              text.trim() ? 'bg-deca-blue-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            {posting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-base">↑</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

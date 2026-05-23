import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ForumPost, Comment } from '../../types';
import { getPostComments, addComment } from '../../services/forumService';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

type RouteParams = { postId: string };

export default function PostDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { postId } = route.params;
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const data = await getPostComments(postId);
    setComments(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [postId]);

  const handleComment = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    try {
      await addComment({ postId, authorId: user.uid, content: text.trim() });
      setText('');
      await load();
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-slate-900"
      keyboardVerticalOffset={90}
    >
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-slate-900 dark:text-white font-semibold text-base mb-4">
          Comments ({comments.length})
        </Text>

        {loading ? (
          <ActivityIndicator color="#1a56db" />
        ) : comments.length === 0 ? (
          <Text className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
            No comments yet. Be the first to reply!
          </Text>
        ) : (
          comments.map(comment => (
            <View key={comment.id} className="mb-4">
              <View className="flex-row items-center mb-1">
                <View className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-2">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold">
                    {comment.authorId.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs">
                  {formatRelativeTime(comment.createdAt)}
                </Text>
              </View>
              <View className="ml-9 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <Text className="text-slate-700 dark:text-slate-300 text-sm">{comment.content}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-row items-end gap-3">
        <TextInput
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-sm max-h-20"
          placeholder="Add a comment..."
          placeholderTextColor="#94a3b8"
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          onPress={handleComment}
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
    </KeyboardAvoidingView>
  );
}

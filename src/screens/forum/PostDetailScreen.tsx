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
import { Feather } from '@expo/vector-icons';
import { Comment } from '../../types';
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

  useEffect(() => { load().finally(() => setLoading(false)); }, [postId]);

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
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#A09A94', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
          Comments · {comments.length}
        </Text>

        {loading ? (
          <ActivityIndicator color="#756FC9" />
        ) : comments.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Feather name="message-circle" size={32} color="#C4BEB8" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
              No comments yet.{'\n'}Be the first to reply!
            </Text>
          </View>
        ) : (
          comments.map(comment => (
            <View key={comment.id} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ color: '#756FC9', fontSize: 12, fontWeight: '700' }}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 12 }}>{comment.authorName}</Text>
                <Text style={{ color: '#A09A94', fontSize: 12, marginLeft: 8 }}>{formatRelativeTime(comment.createdAt)}</Text>
              </View>
              <View style={{ marginLeft: 40, backgroundColor: '#FDFAF5', borderRadius: 14, padding: 14 }}>
                <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 21 }}>{comment.content}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#EDE8DF',
        backgroundColor: '#F5F0E8',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
      }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#FDFAF5',
            borderWidth: 1,
            borderColor: '#EDE8DF',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: '#1A1612',
            fontSize: 14,
            maxHeight: 80,
          }}
          placeholder="Add a comment…"
          placeholderTextColor="#C4BEB8"
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={!text.trim() || posting}
          activeOpacity={0.85}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: text.trim() ? '#756FC9' : '#EDE8DF',
          }}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FDFAF5" />
          ) : (
            <Feather name="send" size={16} color="#FDFAF5" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

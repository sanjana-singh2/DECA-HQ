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
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Comment, ForumPost } from '../../types';
import {
  getPostById,
  getPostComments,
  addComment,
  deleteComment,
  addReaction,
  removeReaction,
} from '../../services/forumService';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

type RouteParams = { postId: string };

const REACTION_EMOJI = ['👍', '❤️', '🎉'];

export default function PostDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { postId } = route.params;
  const { user, isOfficer } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const [postData, commentsData] = await Promise.all([
      getPostById(postId),
      getPostComments(postId),
    ]);
    setPost(postData);
    setComments(commentsData);
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

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteComment(commentId, postId);
          await load();
        },
      },
    ]);
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || !post) return;
    const reactedUsers = post.reactions?.[emoji] ?? [];
    const hasReacted = reactedUsers.includes(user.uid);
    if (hasReacted) {
      await removeReaction(post.id, emoji, user.uid);
    } else {
      await addReaction(post.id, emoji, user.uid);
    }
    const updated = await getPostById(postId);
    setPost(updated);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <ActivityIndicator color="#756FC9" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {post ? (
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ color: '#756FC9', fontSize: 14, fontWeight: '700' }}>
                  {post.authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13 }}>{post.authorName}</Text>
                <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 1 }}>{formatRelativeTime(post.createdAt)}</Text>
              </View>
            </View>
            <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 21, marginBottom: 12 }}>{post.content}</Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {REACTION_EMOJI.map(emoji => {
                const reactedUsers = post.reactions?.[emoji] ?? [];
                const active = user ? reactedUsers.includes(user.uid) : false;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => toggleReaction(emoji)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 14,
                      backgroundColor: active ? '#E3E2F5' : '#F5F0E8',
                      borderWidth: 1,
                      borderColor: active ? '#756FC9' : '#EDE8DF',
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{emoji}</Text>
                    {reactedUsers.length > 0 && (
                      <Text style={{ marginLeft: 4, fontSize: 11, color: active ? '#756FC9' : '#A09A94', fontWeight: '600' }}>
                        {reactedUsers.length}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        <Text style={{ color: '#A09A94', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
          Comments · {comments.length}
        </Text>

        {comments.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Feather name="message-circle" size={32} color="#C4BEB8" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
              No comments yet.{'\n'}Be the first to reply!
            </Text>
          </View>
        ) : (
          comments.map(comment => {
            const canDelete = comment.authorId === user?.uid || isOfficer;
            return (
              <View key={comment.id} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Text style={{ color: '#756FC9', fontSize: 12, fontWeight: '700' }}>
                      {comment.authorName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 12 }}>{comment.authorName}</Text>
                  <Text style={{ color: '#A09A94', fontSize: 12, marginLeft: 8 }}>{formatRelativeTime(comment.createdAt)}</Text>
                  {canDelete ? (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)} activeOpacity={0.7} hitSlop={8} style={{ marginLeft: 'auto' }}>
                      <Text style={{ color: '#C4BEB8', fontSize: 11 }}>Delete</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={{ marginLeft: 40, backgroundColor: '#FDFAF5', borderRadius: 14, padding: 14 }}>
                  <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 21 }}>{comment.content}</Text>
                </View>
              </View>
            );
          })
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

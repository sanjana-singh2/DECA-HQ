import React, { useEffect, useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
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

  useEffect(() => { load().finally(() => setLoading(false)); }, [channelId]);

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
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePost(postId); await load(); } },
    ]);
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isOwn = item.authorId === user?.uid;
    const canDelete = isOwn || isOfficer;
    const initial = item.authorName.charAt(0).toUpperCase();
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDE8DF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ color: '#756FC9', fontSize: 14, fontWeight: '700' }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13 }}>{item.authorName}</Text>
            <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 1 }}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          {canDelete ? (
            <TouchableOpacity onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
              <Text style={{ color: '#C4BEB8', fontSize: 12 }}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 21, marginLeft: 44 }}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#756FC9" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          style={{ backgroundColor: '#FDFAF5' }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 56 }}>
              <Feather name="message-circle" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                No posts yet.{'\n'}Be the first to share!
              </Text>
            </View>
          }
          inverted={posts.length > 0}
        />
      )}

      {canPost ? (
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Platform.OS === 'ios' ? 0 : 12,
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
              maxHeight: 96,
            }}
            placeholder="Write a message…"
            placeholderTextColor="#C4BEB8"
            multiline
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={handlePost}
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
      ) : null}
    </KeyboardAvoidingView>
  );
}

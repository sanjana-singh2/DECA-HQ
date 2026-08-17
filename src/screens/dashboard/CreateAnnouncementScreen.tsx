import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAnnouncementSchema, CreateAnnouncementFormData } from '../../utils/validators';
import { createAnnouncement } from '../../services/announcementsService';
import { notifyUsers } from '../../services/notificationsService';
import { useAuth } from '../../hooks/useAuth';
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

export default function CreateAnnouncementScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: { isPinned: false },
  });

  const onSubmit = async (data: CreateAnnouncementFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await createAnnouncement({ ...data, authorId: user.uid });
      notifyUsers({ broadcast: true, title: `📢 ${data.title}`, body: data.content });
      Alert.alert('Posted!', 'Your announcement is now visible to the chapter.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={INPUT}
                placeholder="e.g. Chapter Meeting Moved to Friday"
                placeholderTextColor="#C4BEB8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.title.message}</Text>}
        </View>

        {/* Content */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Announcement</Text>
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[INPUT, { minHeight: 120, textAlignVertical: 'top' }]}
                placeholder="Write your announcement…"
                placeholderTextColor="#C4BEB8"
                multiline
                numberOfLines={5}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.content && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.content.message}</Text>}
        </View>

        {/* Pin toggle */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#FDFAF5', borderRadius: 14, borderWidth: 1, borderColor: '#EDE8DF',
          paddingHorizontal: 16, paddingVertical: 14, marginBottom: 28,
        }}>
          <View>
            <Text style={{ color: '#1A1612', fontSize: 14, fontWeight: '500' }}>Pin to top</Text>
            <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 2 }}>Pinned announcements show first</Text>
          </View>
          <Controller
            control={control}
            name="isPinned"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange}
                trackColor={{ false: '#EDE8DF', true: '#756FC9' }} thumbColor="#FDFAF5" />
            )}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          activeOpacity={0.85}
          style={{ backgroundColor: '#756FC9', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#FDFAF5" />
          ) : (
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Post Announcement</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

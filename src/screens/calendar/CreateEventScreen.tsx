import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, CreateEventFormData } from '../../utils/validators';
import { createEvent } from '../../services/eventsService';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { EventType } from '../../types';
import { EventTypeColors } from '../../constants/colors';

const EVENT_TYPES: EventType[] = ['meeting', 'competition', 'social', 'deadline'];
const TYPE_ICONS: Record<EventType, keyof typeof Feather.glyphMap> = {
  meeting:     'clipboard',
  competition: 'award',
  social:      'smile',
  deadline:    'alert-circle',
};

const LABEL = { color: '#A09A94', fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 8 };
const INPUT = { backgroundColor: '#FDFAF5', borderWidth: 1, borderColor: '#EDE8DF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#1A1612', fontSize: 14 };

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType>('meeting');

  const { control, handleSubmit, formState: { errors } } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      type: 'meeting',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await createEvent({
        ...data,
        type: selectedType,
        createdBy: user.uid,
        description: data.description ?? '',
        location: data.location ?? '',
      });
      Alert.alert('Success', 'Event created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

        {/* Event Type */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>Event Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {EVENT_TYPES.map(type => {
              const accent = EventTypeColors[type];
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? accent : '#EDE8DF',
                    backgroundColor: active ? accent + '18' : '#FDFAF5',
                  }}
                >
                  <Feather name={TYPE_ICONS[type]} size={14} color={active ? accent : '#6B6560'} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: '500', textTransform: 'capitalize', color: active ? accent : '#6B6560' }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={INPUT}
                placeholder="e.g. Chapter Meeting"
                placeholderTextColor="#C4BEB8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.title.message}</Text>}
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[INPUT, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Add details about this event…"
                placeholderTextColor="#C4BEB8"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        {/* Location */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={INPUT}
                placeholder="e.g. Room 204 or Zoom"
                placeholderTextColor="#C4BEB8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        {/* Date picker note */}
        <View style={{ backgroundColor: '#F0EFF9', borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <Text style={{ color: '#756FC9', fontSize: 12 }}>
            ℹ️ Date/time fields are pre-filled with defaults. Integrate a date picker for full control.
          </Text>
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
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Create Event</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

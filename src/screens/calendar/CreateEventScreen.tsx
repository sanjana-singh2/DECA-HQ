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
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, CreateEventFormData } from '../../utils/validators';
import { createEvent } from '../../services/eventsService';
import { useAuth } from '../../hooks/useAuth';
import { EventType } from '../../types';
import { EventTypeColors } from '../../constants/colors';

const EVENT_TYPES: EventType[] = ['meeting', 'competition', 'social', 'deadline'];
const TYPE_ICONS: Record<EventType, string> = {
  meeting: '📋',
  competition: '🏆',
  social: '🎉',
  deadline: '⏰',
};

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
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" keyboardShouldPersistTaps="handled">
      <View className="px-6 py-6">
        {/* Event Type */}
        <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
          Event Type
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {EVENT_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                selectedType === type
                  ? 'border-deca-blue-600 bg-deca-blue-50 dark:bg-deca-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className="mr-1.5">{TYPE_ICONS[type]}</Text>
              <Text
                className={`text-sm font-medium capitalize ${
                  selectedType === type
                    ? 'text-deca-blue-600 dark:text-deca-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="e.g. Chapter Meeting"
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title.message}</Text>}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="Add details about this event..."
                placeholderTextColor="#94a3b8"
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
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="e.g. Room 204 or Zoom"
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        {/* Note about dates */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
          <Text className="text-blue-600 dark:text-blue-400 text-xs">
            ℹ️ Date/time picker integration requires a native date picker library. Set startTime and endTime programmatically or integrate @react-native-community/datetimepicker.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-deca-blue-600 rounded-xl py-4 items-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { createEventSchema, CreateEventFormData } from '../../utils/validators';
import { createEvent, getEventById, updateEvent } from '../../services/eventsService';
import { notifyUsers } from '../../services/notificationsService';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { EventType } from '../../types';
import { EventTypeColors } from '../../constants/colors';
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

const EVENT_TYPES: EventType[] = ['meeting', 'competition', 'social', 'deadline'];
const TYPE_ICONS: Record<EventType, keyof typeof Feather.glyphMap> = {
  meeting:     'clipboard',
  competition: 'award',
  social:      'smile',
  deadline:    'alert-circle',
};

type ActivePicker = 'startTime' | 'endTime' | null;
type RouteParams = { eventId?: string };

export default function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const eventId = route.params?.eventId;
  const isEditMode = !!eventId;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEditMode);
  const [selectedType, setSelectedType] = useState<EventType>('meeting');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      type: 'meeting',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId).then(event => {
      if (!event) return;
      setSelectedType(event.type);
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        type: event.type,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      });
    }).finally(() => setLoadingEvent(false));
  }, [eventId]);

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      if (isEditMode && eventId) {
        await updateEvent(eventId, {
          title: data.title,
          description: data.description ?? '',
          location: data.location ?? '',
          type: selectedType,
          startTime: data.startTime.toISOString(),
          endTime: data.endTime.toISOString(),
        });
        Alert.alert('Success', 'Event updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await createEvent({
          ...data,
          type: selectedType,
          createdBy: user.uid,
          description: data.description ?? '',
          location: data.location ?? '',
        });
        notifyUsers({ broadcast: true, title: 'New Event', body: data.title });
        Alert.alert('Success', 'Event created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvent) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <ActivityIndicator color="#6495ED" />
      </SafeAreaView>
    );
  }

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

        {/* Start / End time */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={LABEL}>Starts</Text>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setActivePicker('startTime')}
                    activeOpacity={0.8}
                    style={[INPUT, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  >
                    <Text style={{ color: '#1A1612', fontSize: 13 }}>{format(value, 'MMM d, h:mm a')}</Text>
                    <Feather name="calendar" size={16} color="#A09A94" />
                  </TouchableOpacity>
                  {activePicker === 'startTime' && (
                    <>
                      <DateTimePicker
                        value={value}
                        mode="datetime"
                        display="default"
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          setActivePicker(Platform.OS === 'ios' ? 'startTime' : null);
                          if (event.type === 'set' && selectedDate) onChange(selectedDate);
                          if (event.type === 'dismissed') setActivePicker(null);
                        }}
                      />
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity onPress={() => setActivePicker(null)} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                          <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
              )}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={LABEL}>Ends</Text>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setActivePicker('endTime')}
                    activeOpacity={0.8}
                    style={[INPUT, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  >
                    <Text style={{ color: '#1A1612', fontSize: 13 }}>{format(value, 'MMM d, h:mm a')}</Text>
                    <Feather name="calendar" size={16} color="#A09A94" />
                  </TouchableOpacity>
                  {activePicker === 'endTime' && (
                    <>
                      <DateTimePicker
                        value={value}
                        mode="datetime"
                        display="default"
                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                          setActivePicker(Platform.OS === 'ios' ? 'endTime' : null);
                          if (event.type === 'set' && selectedDate) onChange(selectedDate);
                          if (event.type === 'dismissed') setActivePicker(null);
                        }}
                      />
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity onPress={() => setActivePicker(null)} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                          <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
              )}
            />
          </View>
        </View>
        {errors.endTime && (
          <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: -16, marginBottom: 20 }}>{errors.endTime.message}</Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          activeOpacity={0.85}
          style={{ backgroundColor: '#6495ED', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#FDFAF5" />
          ) : (
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>
              {isEditMode ? 'Save Changes' : 'Create Event'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

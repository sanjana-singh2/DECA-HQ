import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Event } from '../../types';
import { getEventById, rsvpEvent, unrsvpEvent, deleteEvent } from '../../services/eventsService';
import { generateQRPayload } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';
import { formatEventTime } from '../../utils/formatters';
import { EventTypeColors } from '../../constants/colors';
import QRCode from 'react-native-qrcode-svg';

type RouteParams = { eventId: string };

export default function EventDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { user, isOfficer } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const { eventId } = route.params;

  useEffect(() => {
    getEventById(eventId)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [eventId]);

  const hasRsvped = event?.rsvpList?.includes(user?.uid ?? '');

  const toggleRSVP = async () => {
    if (!user || !event) return;
    if (hasRsvped) {
      await unrsvpEvent(event.id, user.uid);
    } else {
      await rsvpEvent(event.id, user.uid);
    }
    const updated = await getEventById(eventId);
    setEvent(updated);
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator color="#1a56db" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Text className="text-slate-500">Event not found.</Text>
      </View>
    );
  }

  const accentColor = EventTypeColors[event.type];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900">
      {/* Hero */}
      <View className="h-2 w-full" style={{ backgroundColor: accentColor }} />
      <View className="px-6 pt-6 pb-4">
        <View
          className="self-start rounded-full px-3 py-1 mb-3"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <Text style={{ color: accentColor }} className="text-xs font-medium capitalize">
            {event.type}
          </Text>
        </View>
        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
          {event.title}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm">
          🕒 {formatEventTime(event.startTime, event.endTime)}
        </Text>
        {event.location && (
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            📍 {event.location}
          </Text>
        )}
      </View>

      {/* Description */}
      {event.description && (
        <View className="px-6 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <Text className="text-slate-900 dark:text-white font-semibold mb-2">About</Text>
          <Text className="text-slate-600 dark:text-slate-400 text-sm leading-6">
            {event.description}
          </Text>
        </View>
      )}

      {/* RSVP Count */}
      {event.rsvpList && event.rsvpList.length > 0 && (
        <View className="px-6 pb-4">
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            👥 {event.rsvpList.length} attending
          </Text>
        </View>
      )}

      {/* QR Code (officer only) */}
      {isOfficer && (
        <View className="px-6 pb-4">
          <TouchableOpacity
            onPress={() => setShowQR(v => !v)}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 items-center border border-slate-100 dark:border-slate-700"
          >
            <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1">
              {showQR ? 'Hide' : 'Show'} Attendance QR Code
            </Text>
          </TouchableOpacity>
          {showQR && (
            <View className="items-center mt-4 p-4 bg-white rounded-xl border border-slate-100 dark:border-slate-700">
              <QRCode
                value={generateQRPayload(event.id)}
                size={200}
                color="#0f172a"
                backgroundColor="white"
              />
              <Text className="text-slate-400 text-xs mt-3">
                Members scan this to mark attendance
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="px-6 pb-10 gap-3">
        <TouchableOpacity
          onPress={toggleRSVP}
          className={`rounded-xl py-4 items-center ${
            hasRsvped
              ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              : 'bg-deca-blue-600'
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              hasRsvped ? 'text-slate-700 dark:text-slate-300' : 'text-white'
            }`}
          >
            {hasRsvped ? '✓ RSVP\'d — Remove' : 'RSVP for this event'}
          </Text>
        </TouchableOpacity>

        {isOfficer && (
          <TouchableOpacity
            onPress={handleDelete}
            className="rounded-xl py-4 items-center border border-red-200 dark:border-red-800"
          >
            <Text className="text-red-500 font-semibold text-base">Delete Event</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

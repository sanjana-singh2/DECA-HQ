import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Event } from '../../types';
import { getEventById, rsvpEvent, unrsvpEvent, deleteEvent } from '../../services/eventsService';
import { generateQRPayload, getEventAttendees, EventAttendee } from '../../services/attendanceService';
import { scheduleAndPersistEventReminder, cancelPersistedEventReminder } from '../../services/notificationsService';
import { useAuth } from '../../hooks/useAuth';
import { formatEventTime, formatTimestampWithTime } from '../../utils/formatters';
import { EventTypeColors, GradientHero } from '../../constants/colors';
import QRCode from 'react-native-qrcode-svg';

type RouteParams = { eventId: string };

export default function EventDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { user, isOfficer } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  const { eventId } = route.params;

  useEffect(() => {
    getEventById(eventId).then(setEvent).finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (!isOfficer) return;
    getEventAttendees(eventId).then(setAttendees);
  }, [eventId, isOfficer]);

  const hasRsvped = event?.rsvpList?.includes(user?.uid ?? '');

  const toggleRSVP = async () => {
    if (!user || !event) return;
    if (hasRsvped) {
      await unrsvpEvent(event.id, user.uid);
      await cancelPersistedEventReminder(event.id);
    } else {
      await rsvpEvent(event.id, user.uid);
      await scheduleAndPersistEventReminder(event.id, event.title, new Date(event.startTime));
    }
    const updated = await getEventById(eventId);
    setEvent(updated);
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEvent(eventId); navigation.goBack(); } },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <ActivityIndicator color="#6495ED" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <Text style={{ color: '#A09A94', fontSize: 14 }}>Event not found.</Text>
      </View>
    );
  }

  const accentColor = EventTypeColors[event.type];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      {/* Gradient hero strip */}
      <LinearGradient
        colors={GradientHero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36 }}
      >
        <View style={{ alignSelf: 'flex-start', backgroundColor: accentColor + '30', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 }}>
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{event.type}</Text>
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612', marginBottom: 10 }}>
          {event.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: event.location ? 4 : 0 }}>
          <Feather name="clock" size={13} color="#6B6560" />
          <Text style={{ color: '#6B6560', fontSize: 13 }}>{formatEventTime(event.startTime, event.endTime)}</Text>
        </View>
        {event.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="map-pin" size={13} color="#6B6560" />
            <Text style={{ color: '#6B6560', fontSize: 13 }}>{event.location}</Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -16 }}>

        {/* About */}
        {event.description ? (
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <Text style={{ color: '#A09A94', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>About</Text>
            <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 22 }}>{event.description}</Text>
          </View>
        ) : null}

        {/* RSVP count */}
        {event.rsvpList && event.rsvpList.length > 0 ? (
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="users" size={16} color="#1A1612" style={{ marginRight: 10 }} />
            <Text style={{ color: '#1A1612', fontSize: 14, fontWeight: '500' }}>{event.rsvpList.length} attending</Text>
          </View>
        ) : null}

        {/* QR Code (officers only) */}
        {isOfficer ? (
          <View style={{ marginBottom: 14 }}>
            <TouchableOpacity
              onPress={() => setShowQR(v => !v)}
              activeOpacity={0.85}
              style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, alignItems: 'center' }}
            >
              <Text style={{ color: '#6495ED', fontWeight: '600', fontSize: 14 }}>
                {showQR ? 'Hide' : 'Show'} Attendance QR Code
              </Text>
            </TouchableOpacity>
            {showQR ? (
              <View style={{ alignItems: 'center', marginTop: 14, backgroundColor: '#FDFAF5', borderRadius: 20, padding: 24 }}>
                <QRCode value={generateQRPayload(event.id)} size={200} color="#1A1612" backgroundColor="#FDFAF5" />
                <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 12 }}>Members scan to mark attendance</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Attendees (officers only) */}
        {isOfficer ? (
          <View style={{ marginBottom: 14 }}>
            <TouchableOpacity
              onPress={() => setShowAttendees(v => !v)}
              activeOpacity={0.85}
              style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center' }}
            >
              <Feather name="check-circle" size={16} color="#6FAF8A" style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: '#1A1612', fontSize: 14, fontWeight: '500' }}>
                {attendees.length} checked in
              </Text>
              <Feather name={showAttendees ? 'chevron-up' : 'chevron-down'} size={16} color="#A09A94" />
            </TouchableOpacity>
            {showAttendees ? (
              <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginTop: 8 }}>
                {attendees.length === 0 ? (
                  <Text style={{ color: '#A09A94', fontSize: 13 }}>No one has checked in yet.</Text>
                ) : (
                  attendees.map(a => (
                    <View key={a.userId} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                      <Text style={{ flex: 1, color: '#1A1612', fontSize: 13, fontWeight: '500' }}>{a.fullName}</Text>
                      <Text style={{ color: '#A09A94', fontSize: 11 }}>{formatTimestampWithTime(a.timestamp)}</Text>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* RSVP action */}
        <TouchableOpacity
          onPress={toggleRSVP}
          activeOpacity={0.85}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 10,
            backgroundColor: hasRsvped ? '#FDFAF5' : '#6495ED',
            borderWidth: hasRsvped ? 1 : 0,
            borderColor: '#EDE8DF',
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 15, color: hasRsvped ? '#6B6560' : '#FDFAF5' }}>
            {hasRsvped ? '✓ RSVP\'d — Remove' : 'RSVP for this event'}
          </Text>
        </TouchableOpacity>

        {/* Edit / Delete (officers only) */}
        {isOfficer ? (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEvent', { eventId })}
              activeOpacity={0.85}
              style={{ flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FDFAF5', borderWidth: 1, borderColor: '#EDE8DF' }}
            >
              <Text style={{ color: '#6B6560', fontWeight: '600', fontSize: 15 }}>Edit Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.85}
              style={{ flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
            >
              <Text style={{ color: '#C96F6F', fontWeight: '600', fontSize: 15 }}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

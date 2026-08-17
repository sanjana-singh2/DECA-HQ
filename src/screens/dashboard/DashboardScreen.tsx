import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useUpcomingEvents } from '../../hooks/useEvents';
import { Feather } from '@expo/vector-icons';
import AnnouncementCard from '../../components/AnnouncementCard';
import EventPreviewCard from '../../components/EventPreviewCard';
import QuickActionButton from '../../components/QuickActionButton';
import { getAnnouncements } from '../../services/announcementsService';
import { Announcement } from '../../types';
import { GradientHero } from '../../constants/colors';

export default function DashboardScreen() {
  const { user, isOfficer } = useAuth();
  const { events, loading: eventsLoading, error: eventsError } = useUpcomingEvents(3);
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    const data = await getAnnouncements(3);
    setAnnouncements(data);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const QUICK = [
    { icon: 'calendar'    as const, label: 'Calendar',   color: '#6495ED', onPress: () => navigation.navigate('Calendar') },
    { icon: 'check-circle'as const, label: 'Attendance', color: '#6FAF8A', onPress: () => navigation.navigate('Attendance') },
    { icon: 'award'       as const, label: 'Credits',    color: '#C9946F', onPress: () => navigation.navigate('VolunteerHours') },
    { icon: 'trending-up' as const, label: 'Scores',     color: '#C96F9A', onPress: () => navigation.navigate('Scores') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6495ED" />}
      >
        {/* Gradient hero header */}
        <LinearGradient
          colors={GradientHero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#6495ED', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>DECA HQ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#6495ED', fontWeight: '700', fontSize: 14 }}>
                  {user?.fullName?.charAt(0) ?? '?'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612', lineHeight: 34 }}>
            {greeting()},{'\n'}{user?.fullName?.split(' ')[0] ?? 'Member'}.
          </Text>
          <Text style={{ color: '#6495ED', fontSize: 12, marginTop: 6, textTransform: 'capitalize', letterSpacing: 0.5 }}>
            {user?.role}
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -24 }}>
          {/* Stat cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Meetings', value: user?.attendanceCount ?? 0 },
              { label: 'Credits',  value: user?.volunteerHours ?? 0 },
            ].map(s => (
              <View key={s.label} style={{ flex: 1, backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18 }}>
                <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 32, color: '#1A1612' }}>{s.value}</Text>
                <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 20, marginBottom: 24 }}>
            <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 16, letterSpacing: 0.2 }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {QUICK.map(q => (
                <QuickActionButton key={q.label} icon={q.icon} label={q.label} color={q.color} onPress={q.onPress} />
              ))}
            </View>
          </View>

          {/* Announcements */}
          {announcements.length > 0 || isOfficer ? (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, letterSpacing: 0.2 }}>
                  Announcements
                </Text>
                {isOfficer ? (
                  <TouchableOpacity onPress={() => navigation.navigate('CreateAnnouncement')}>
                    <Text style={{ color: '#6495ED', fontSize: 12, fontWeight: '500' }}>+ New</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {announcements.map(a => <AnnouncementCard key={a.id} announcement={a} />)}
            </View>
          ) : null}

          {/* Upcoming Events */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, letterSpacing: 0.2 }}>
                Upcoming Events
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                <Text style={{ color: '#6495ED', fontSize: 12, fontWeight: '500' }}>See all</Text>
              </TouchableOpacity>
            </View>

            {eventsLoading ? (
              <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#A09A94', fontSize: 13 }}>Loading events…</Text>
              </View>
            ) : eventsError ? (
              <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 32, alignItems: 'center' }}>
                <Feather name="alert-circle" size={28} color="#C96F6F" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                  Could not load events.{'\n'}Pull to refresh and try again.
                </Text>
              </View>
            ) : events.length === 0 ? (
              <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 32, alignItems: 'center' }}>
                <Feather name="inbox" size={28} color="#C4BEB8" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                  No upcoming events.{'\n'}Check back soon!
                </Text>
              </View>
            ) : (
              events.map(event => (
                <EventPreviewCard key={event.id} event={event}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

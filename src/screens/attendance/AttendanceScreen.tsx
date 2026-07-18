import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getUserAttendanceHistory } from '../../services/attendanceService';
import { getEventById, getUpcomingEvents as fetchUpcoming } from '../../services/eventsService';
import { Attendance, Event } from '../../types';
import AttendanceCard from '../../components/AttendanceCard';
import { GradientHero } from '../../constants/colors';

export default function AttendanceScreen() {
  const { user, isOfficer } = useAuth();
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<Array<{ attendance: Attendance; event: Event | null }>>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const [records, upcoming] = await Promise.all([
      getUserAttendanceHistory(user.uid),
      fetchUpcoming(10),
    ]);
    const withEvents = await Promise.all(
      records.map(async a => ({ attendance: a, event: await getEventById(a.eventId) }))
    );
    setHistory(withEvents);
    setUpcomingEvents(upcoming);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#756FC9" />}>

        <LinearGradient colors={GradientHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612', marginBottom: 4 }}>Attendance</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 52, color: '#1A1612', lineHeight: 56 }}>{user?.attendanceCount ?? 0}</Text>
            <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500', marginLeft: 10, marginBottom: 8 }}>meetings attended</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          {upcomingEvents.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 12, letterSpacing: 0.2 }}>Scan Attendance</Text>
              {upcomingEvents.map(event => (
                <TouchableOpacity key={event.id}
                  onPress={() => navigation.navigate('QRScanner', { eventId: event.id })}
                  style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Feather name="camera" size={18} color="#756FC9" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14 }}>{event.title}</Text>
                    <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 2 }}>Tap to scan QR code</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#C4BEB8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 12, letterSpacing: 0.2 }}>Attendance History</Text>

          {loading ? (
            <ActivityIndicator color="#756FC9" style={{ marginTop: 24 }} />
          ) : history.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Feather name="clipboard" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                No attendance records yet.{'\n'}Scan a QR code at your next meeting!
              </Text>
            </View>
          ) : (
            history.map(({ attendance, event }) => (
              <AttendanceCard key={attendance.id} attendance={attendance} eventTitle={event?.title ?? 'Unknown Event'} />
            ))
          )}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

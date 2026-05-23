import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getUserAttendanceHistory } from '../../services/attendanceService';
import { getEventById } from '../../services/eventsService';
import { getUpcomingEvents } from '../../services/eventsService';
import { Attendance, Event } from '../../types';
import AttendanceCard from '../../components/AttendanceCard';

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
      getUpcomingEvents(10),
    ]);

    const withEvents = await Promise.all(
      records.map(async a => ({
        attendance: a,
        event: await getEventById(a.eventId),
      }))
    );

    setHistory(withEvents);
    setUpcomingEvents(upcoming);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-4 pt-4">
          <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-6">
            Attendance
          </Text>

          {/* Stats */}
          <View className="bg-deca-blue-600 rounded-2xl p-5 mb-6">
            <Text className="text-blue-100 text-sm mb-1">Total Meetings Attended</Text>
            <Text className="text-white text-4xl font-bold">{user?.attendanceCount ?? 0}</Text>
            <Text className="text-blue-200 text-xs mt-2">
              Keep it up — attendance matters for DECA!
            </Text>
          </View>

          {/* Scan QR for upcoming events */}
          {upcomingEvents.length > 0 && (
            <View className="mb-6">
              <Text className="text-slate-900 dark:text-white font-semibold text-base mb-3">
                Scan Attendance
              </Text>
              {upcomingEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => navigation.navigate('QRScanner', { eventId: event.id })}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 flex-row items-center"
                >
                  <Text style={{ fontSize: 20 }} className="mr-3">📷</Text>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-semibold text-sm">
                      {event.title}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">
                      Tap to scan QR code
                    </Text>
                  </View>
                  <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* History */}
          <Text className="text-slate-900 dark:text-white font-semibold text-base mb-3">
            Attendance History
          </Text>

          {loading ? (
            <ActivityIndicator color="#1a56db" className="mt-4" />
          ) : history.length === 0 ? (
            <View className="items-center py-10">
              <Text style={{ fontSize: 40 }} className="mb-3">📋</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                No attendance records yet.{'\n'}Scan a QR code at your next meeting!
              </Text>
            </View>
          ) : (
            history.map(({ attendance, event }) => (
              <AttendanceCard
                key={attendance.id}
                attendance={attendance}
                eventTitle={event?.title ?? 'Unknown Event'}
              />
            ))
          )}

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

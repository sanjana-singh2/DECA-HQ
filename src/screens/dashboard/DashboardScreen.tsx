import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useUpcomingEvents } from '../../hooks/useEvents';
import AnnouncementCard from '../../components/AnnouncementCard';
import EventPreviewCard from '../../components/EventPreviewCard';
import QuickActionButton from '../../components/QuickActionButton';
import StatsCard from '../../components/StatsCard';
import { supabase } from '../../services/supabase';
import { Announcement } from '../../types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { events, loading: eventsLoading } = useUpcomingEvents(3);
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setAnnouncements(
        data.map(row => ({
          id: row.id,
          title: row.title,
          content: row.content,
          authorId: row.author_id,
          createdAt: row.created_at,
          isPinned: row.is_pinned,
        }))
      );
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="bg-deca-blue-600 px-6 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-blue-100 text-sm">DECA HQ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
                <Text className="text-white font-bold text-sm">
                  {user?.fullName?.charAt(0) ?? '?'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'Member'}! 👋
          </Text>
          <Text className="text-blue-100 text-sm mt-1 capitalize">{user?.role}</Text>
        </View>

        <View className="px-4 -mt-4">
          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <StatsCard
              label="Meetings Attended"
              value={user?.attendanceCount ?? 0}
              icon="📋"
              color="#1a56db"
            />
            <StatsCard
              label="Volunteer Hours"
              value={user?.volunteerHours ?? 0}
              icon="🌟"
              color="#10b981"
            />
          </View>

          {/* Quick Actions */}
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white font-semibold text-base mb-4">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <QuickActionButton
                icon="📅"
                label="Calendar"
                onPress={() => navigation.navigate('Calendar')}
                color="#1a56db"
              />
              <QuickActionButton
                icon="✅"
                label="Attendance"
                onPress={() => navigation.navigate('Attendance')}
                color="#10b981"
              />
              <QuickActionButton
                icon="⏱️"
                label="Hours"
                onPress={() => navigation.navigate('VolunteerHours')}
                color="#f59e0b"
              />
              <QuickActionButton
                icon="📊"
                label="Scores"
                onPress={() => navigation.navigate('Scores')}
                color="#7c3aed"
              />
            </View>
          </View>

          {/* Announcements */}
          {announcements.length > 0 && (
            <View className="mb-6">
              <Text className="text-slate-900 dark:text-white font-semibold text-base mb-3">
                📢 Announcements
              </Text>
              {announcements.map(a => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </View>
          )}

          {/* Upcoming Events */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-900 dark:text-white font-semibold text-base">
                📅 Upcoming Events
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm">
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {eventsLoading ? (
              <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 items-center">
                <Text className="text-slate-400 text-sm">Loading events...</Text>
              </View>
            ) : events.length === 0 ? (
              <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 items-center border border-slate-100 dark:border-slate-700">
                <Text style={{ fontSize: 28 }} className="mb-2">📭</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                  No upcoming events. Check back soon!
                </Text>
              </View>
            ) : (
              events.map(event => (
                <EventPreviewCard
                  key={event.id}
                  event={event}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

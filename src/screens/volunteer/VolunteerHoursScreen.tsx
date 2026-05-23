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
import { getUserVolunteerHours } from '../../services/volunteerService';
import { VolunteerHour } from '../../types';
import { formatTimestamp } from '../../utils/formatters';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  approved: { label: 'Approved', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20' },
};

function HourCard({ item }: { item: VolunteerHour }) {
  const config = STATUS_CONFIG[item.status];
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-slate-900 dark:text-white font-semibold text-sm mb-0.5">
            {item.title}
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs">
            {formatTimestamp(item.submittedAt)}
          </Text>
        </View>
        <View className={`rounded-full px-3 py-1 ${config.bg}`}>
          <Text style={{ color: config.color }} className="text-xs font-medium">
            {config.label}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Text style={{ fontSize: 16 }}>⏱️</Text>
        <Text className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
          {item.hours} {item.hours === 1 ? 'hour' : 'hours'}
        </Text>
      </View>
    </View>
  );
}

export default function VolunteerHoursScreen() {
  const { user, isOfficer } = useAuth();
  const navigation = useNavigation<any>();
  const [hours, setHours] = useState<VolunteerHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const data = await getUserVolunteerHours(user.uid);
    setHours(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const approvedHours = hours
    .filter(h => h.status === 'approved')
    .reduce((sum, h) => sum + h.hours, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              Volunteer Hours
            </Text>
            {isOfficer && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ApprovalQueue')}
                className="border border-deca-blue-600 rounded-xl px-3 py-1.5"
              >
                <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-medium">
                  Review Queue
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Summary */}
          <View className="bg-emerald-500 rounded-2xl p-5 mb-6">
            <Text className="text-emerald-50 text-sm mb-1">Total Approved Hours</Text>
            <Text className="text-white text-4xl font-bold">{approvedHours}</Text>
            <Text className="text-emerald-100 text-xs mt-2">
              {hours.filter(h => h.status === 'pending').length} pending review
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SubmitHours')}
            className="bg-deca-blue-600 rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-white font-semibold text-base">+ Submit Volunteer Hours</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color="#1a56db" />
          ) : hours.length === 0 ? (
            <View className="items-center py-10">
              <Text style={{ fontSize: 40 }} className="mb-3">🌟</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                No volunteer hours yet.{'\n'}Submit your first entry!
              </Text>
            </View>
          ) : (
            hours.map(h => <HourCard key={h.id} item={h} />)
          )}

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

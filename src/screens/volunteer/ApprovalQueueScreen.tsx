import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getPendingApprovals, approveVolunteerHours, rejectVolunteerHours } from '../../services/volunteerService';
import { VolunteerHour } from '../../types';
import { formatTimestamp } from '../../utils/formatters';

export default function ApprovalQueueScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<VolunteerHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    const data = await getPendingApprovals();
    setItems(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const approve = async (item: VolunteerHour) => {
    if (!user) return;
    setProcessing(item.id);
    try {
      await approveVolunteerHours(item.id, item.userId, item.hours, user.uid);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (item: VolunteerHour) => {
    if (!user) return;
    Alert.alert('Reject Submission', 'Are you sure you want to reject this submission?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setProcessing(item.id);
          await rejectVolunteerHours(item.id, user.uid);
          await load();
          setProcessing(null);
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="px-4 py-4">
        <Text className="text-slate-900 dark:text-white text-xl font-bold mb-6">
          Pending Approvals ({items.length})
        </Text>

        {loading ? (
          <ActivityIndicator color="#1a56db" />
        ) : items.length === 0 ? (
          <View className="items-center py-12">
            <Text style={{ fontSize: 40 }} className="mb-3">✅</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
              All caught up! No pending submissions.
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700"
            >
              <Text className="text-slate-900 dark:text-white font-semibold text-base mb-1">
                {item.title}
              </Text>
              {item.description && (
                <Text className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                  {item.description}
                </Text>
              )}
              <View className="flex-row items-center mb-3">
                <Text className="text-slate-700 dark:text-slate-300 font-semibold mr-4">
                  ⏱️ {item.hours} hrs
                </Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs">
                  {formatTimestamp(item.submittedAt)}
                </Text>
              </View>

              {item.proofUrl && (
                <Image
                  source={{ uri: item.proofUrl }}
                  className="w-full h-40 rounded-xl mb-4"
                  resizeMode="cover"
                />
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => approve(item)}
                  disabled={processing === item.id}
                  className="flex-1 bg-emerald-500 rounded-xl py-3 items-center"
                >
                  {processing === item.id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-semibold text-sm">Approve</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reject(item)}
                  disabled={processing === item.id}
                  className="flex-1 border border-red-200 dark:border-red-800 rounded-xl py-3 items-center"
                >
                  <Text className="text-red-500 font-semibold text-sm">Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-6" />
      </View>
    </ScrollView>
  );
}

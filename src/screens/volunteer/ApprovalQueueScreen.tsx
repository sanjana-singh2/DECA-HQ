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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getPendingApprovals, approveVolunteerHours, rejectVolunteerHours } from '../../services/volunteerService';
import { notifyUsers } from '../../services/notificationsService';
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

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const approve = async (item: VolunteerHour) => {
    if (!user) return;
    setProcessing(item.id);
    try {
      await approveVolunteerHours(item.id, item.userId, item.hours, user.uid);
      notifyUsers({
        userIds: [item.userId],
        title: 'Credits Approved',
        body: `"${item.title}" (${item.hours} credits) was approved.`,
      });
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
          notifyUsers({
            userIds: [item.userId],
            title: 'Credits Rejected',
            body: `"${item.title}" was not approved. Check with an officer for details.`,
          });
          await load();
          setProcessing(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#756FC9" />}
      >
        <Text style={{ color: '#A09A94', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
          Pending · {items.length}
        </Text>

        {loading ? (
          <ActivityIndicator color="#756FC9" style={{ marginTop: 32 }} />
        ) : items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56 }}>
            <Feather name="check-circle" size={40} color="#6FAF8A" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
              All caught up!{'\n'}No pending submissions.
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View
              key={item.id}
              style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 14 }}
            >
              <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 15, marginBottom: 4 }}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={{ color: '#6B6560', fontSize: 13, marginBottom: 10 }}>
                  {item.description}
                </Text>
              ) : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ backgroundColor: '#E3E2F5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 12 }}>
                  <Text style={{ color: '#756FC9', fontSize: 12, fontWeight: '600' }}>⭐ {item.hours} credits</Text>
                </View>
                <Text style={{ color: '#A09A94', fontSize: 12 }}>{formatTimestamp(item.submittedAt)}</Text>
              </View>

              {item.proofUrl ? (
                <Image
                  source={{ uri: item.proofUrl }}
                  style={{ width: '100%', height: 160, borderRadius: 14, marginBottom: 14 }}
                  resizeMode="cover"
                />
              ) : null}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => approve(item)}
                  disabled={processing === item.id}
                  activeOpacity={0.85}
                  style={{ flex: 1, backgroundColor: '#6FAF8A', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                >
                  {processing === item.id ? (
                    <ActivityIndicator color="#FDFAF5" size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Feather name="check" size={14} color="#FDFAF5" />
                      <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 13 }}>Approve</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => reject(item)}
                  disabled={processing === item.id}
                  activeOpacity={0.85}
                  style={{ flex: 1, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="x" size={14} color="#C96F6F" />
                    <Text style={{ color: '#C96F6F', fontWeight: '600', fontSize: 13 }}>Reject</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getUserVolunteerHours } from '../../services/volunteerService';
import { VolunteerHour } from '../../types';
import { formatTimestamp } from '../../utils/formatters';
import { GradientHero } from '../../constants/colors';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#C9946F', bg: '#FEF3C7' },
  approved: { label: 'Approved', color: '#6FAF8A', bg: '#D1FAE5' },
  rejected: { label: 'Rejected', color: '#C96F6F', bg: '#FEF2F2' },
};

function CreditCard({ item }: { item: VolunteerHour }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <View style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14, marginBottom: 2 }}>{item.title}</Text>
          <Text style={{ color: '#C4BEB8', fontSize: 11 }}>{formatTimestamp(item.submittedAt)}</Text>
        </View>
        <View style={{ backgroundColor: cfg.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '600' }}>{cfg.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Feather name="award" size={14} color="#C9946F" />
        <Text style={{ color: '#6B6560', fontWeight: '600', fontSize: 13, marginLeft: 6 }}>
          1 credit
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

  const load = async () => { if (!user) return; const data = await getUserVolunteerHours(user.uid); setHours(data); };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const approvedCredits = hours.filter(h => h.status === 'approved').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6495ED" />}>

        <LinearGradient colors={GradientHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612' }}>Credits</Text>
            {isOfficer && (
              <TouchableOpacity onPress={() => navigation.navigate('ApprovalQueue')}
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ color: '#6495ED', fontWeight: '600', fontSize: 13 }}>Review</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 52, color: '#1A1612', lineHeight: 56 }}>{approvedCredits}</Text>
            <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '500', marginLeft: 10, marginBottom: 8 }}>credits approved</Text>
          </View>
          {hours.filter(h => h.status === 'pending').length > 0 && (
            <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 6 }}>
              {hours.filter(h => h.status === 'pending').length} pending review
            </Text>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          <TouchableOpacity onPress={() => navigation.navigate('SubmitHours')}
            style={{ backgroundColor: '#6495ED', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>+ Submit Credits</Text>
          </TouchableOpacity>

          <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 12, letterSpacing: 0.2 }}>Your Credits</Text>

          {loading ? (
            <ActivityIndicator color="#6495ED" style={{ marginTop: 24 }} />
          ) : hours.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Feather name="award" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                No credits yet.{'\n'}Submit your first entry!
              </Text>
            </View>
          ) : hours.map(h => <CreditCard key={h.id} item={h} />)}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

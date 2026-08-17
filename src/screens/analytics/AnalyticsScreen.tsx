import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getChapterStats, ChapterStats } from '../../services/analyticsService';
import { GradientHero } from '../../constants/colors';

const SECTION_LABEL = { color: '#A09A94', fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 16 };

function BarRow({ label, value, max, color, displayValue }: {
  label: string; value: number; max: number; color: string; displayValue: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: '#1A1612', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: '#A09A94', fontSize: 12 }}>{displayValue}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: '#EDE8DF', overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<ChapterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getChapterStats();
    setStats(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const maxGradeCount = Math.max(1, ...(stats?.membersByGrade.map(g => g.count) ?? [1]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6495ED" />}
      >
        <LinearGradient colors={GradientHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612' }}>Analytics</Text>
        </LinearGradient>

        {loading || !stats ? (
          <ActivityIndicator color="#6495ED" style={{ marginTop: 32 }} />
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: -24 }}>
            {/* Stat tiles */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Members', value: stats.totalMembers },
                { label: 'Meetings Attended', value: stats.totalMeetingsAttended },
                { label: 'Credits Logged', value: stats.totalCreditsLogged },
              ].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: '#FDFAF5', borderRadius: 20, padding: 14 }}>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#1A1612' }}>{s.value}</Text>
                  <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 4 }}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Members by grade */}
            <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <Text style={SECTION_LABEL}>Members by Grade</Text>
              {[9, 10, 11, 12].map(grade => {
                const count = stats.membersByGrade.find(g => g.grade === grade)?.count ?? 0;
                return (
                  <BarRow key={grade} label={`${grade}th Grade`} value={count} max={maxGradeCount}
                    color="#6495ED" displayValue={String(count)} />
                );
              })}
            </View>

            {/* Average score by category */}
            <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <Text style={SECTION_LABEL}>Avg. Competition Score by Category</Text>
              {stats.avgScoreByCategory.length === 0 ? (
                <Text style={{ color: '#A09A94', fontSize: 13 }}>No competition scores logged yet.</Text>
              ) : (
                stats.avgScoreByCategory.map(c => (
                  <BarRow key={c.category} label={c.category} value={c.average} max={100}
                    color="#C96F9A" displayValue={c.average.toFixed(1)} />
                ))
              )}
            </View>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getUserScores, groupScoresByCategory, calculateAverage } from '../../services/scoresService';
import { Score } from '../../types';
import { formatTimestamp } from '../../utils/formatters';
import { GradientHero } from '../../constants/colors';

export default function ScoresScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { if (!user) return; const data = await getUserScores(user.uid); setScores(data); };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const grouped = groupScoresByCategory(scores);
  const avgScore = calculateAverage(scores);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#756FC9" />}>

        <LinearGradient colors={GradientHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612' }}>My Scores</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddScore')}
              style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: '#756FC9', fontWeight: '600', fontSize: 13 }}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {scores.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 52, color: '#1A1612', lineHeight: 56 }}>{avgScore.toFixed(1)}</Text>
              <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500', marginLeft: 10, marginBottom: 8 }}>avg score</Text>
            </View>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          {loading ? (
            <ActivityIndicator color="#756FC9" style={{ marginTop: 32 }} />
          ) : scores.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Feather name="bar-chart-2" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
                No scores recorded yet.{'\n'}Add your first score to track progress!
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddScore')}
                style={{ marginTop: 20, backgroundColor: '#756FC9', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28 }}>
                <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 14 }}>+ Add Score</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.entries(grouped).map(([category, catScores]) => (
              <View key={category} style={{ marginBottom: 20 }}>
                <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 10, letterSpacing: 0.2 }}>{category}</Text>
                {(catScores as Score[]).map(score => (
                  <View key={score.id} style={{ backgroundColor: '#FDFAF5', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14 }}>{score.eventCategory}</Text>
                      <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 2 }}>{formatTimestamp(score.date)}</Text>
                      {score.notes ? <Text style={{ color: '#C4BEB8', fontSize: 11, marginTop: 2 }}>{score.notes}</Text> : null}
                    </View>
                    <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#756FC9' }}>{score.score}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

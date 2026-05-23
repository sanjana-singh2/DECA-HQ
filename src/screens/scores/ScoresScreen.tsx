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
import { getUserScores, groupScoresByCategory, calculateAverage } from '../../services/scoresService';
import { Score } from '../../types';
import { formatTimestamp } from '../../utils/formatters';

export default function ScoresScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const data = await getUserScores(user.uid);
    setScores(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const grouped = groupScoresByCategory(scores);
  const avgScore = calculateAverage(scores);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">My Scores</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddScore')}
              className="bg-deca-blue-600 rounded-xl px-4 py-2"
            >
              <Text className="text-white font-medium text-sm">+ Add Score</Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          {scores.length > 0 && (
            <View className="bg-violet-600 rounded-2xl p-5 mb-6">
              <Text className="text-violet-100 text-sm mb-1">Average Score</Text>
              <Text className="text-white text-4xl font-bold">{avgScore.toFixed(1)}</Text>
              <Text className="text-violet-200 text-xs mt-2">
                Across {scores.length} recorded score{scores.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color="#1a56db" />
          ) : scores.length === 0 ? (
            <View className="items-center py-10">
              <Text style={{ fontSize: 40 }} className="mb-3">📊</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                No scores recorded yet.{'\n'}Add your first score to track progress!
              </Text>
            </View>
          ) : (
            Object.entries(grouped).map(([category, catScores]) => (
              <View key={category} className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-slate-900 dark:text-white font-semibold text-base">
                    {category}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    Avg: {calculateAverage(catScores).toFixed(1)}
                  </Text>
                </View>
                {catScores.map(score => (
                  <View
                    key={score.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center border border-slate-100 dark:border-slate-700"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <View
                          className={`rounded-full px-2 py-0.5 mr-2 ${
                            score.scoreType === 'competition'
                              ? 'bg-violet-100 dark:bg-violet-900/30'
                              : 'bg-slate-100 dark:bg-slate-700'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              score.scoreType === 'competition'
                                ? 'text-violet-600 dark:text-violet-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {score.scoreType === 'competition' ? '🏆 Competition' : '📝 Practice'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs">
                        {formatTimestamp(score.date)}
                      </Text>
                    </View>
                    <Text className="text-slate-900 dark:text-white text-2xl font-bold">
                      {score.score}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

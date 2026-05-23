import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addScoreSchema, AddScoreFormData } from '../../utils/validators';
import { addScore } from '../../services/scoresService';
import { useAuth } from '../../hooks/useAuth';
import { DECA_EVENT_CATEGORIES } from '../../constants/config';
import { ScoreType } from '../../types';

export default function AddScoreScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scoreType, setScoreType] = useState<ScoreType>('practice');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<AddScoreFormData>({
    resolver: zodResolver(addScoreSchema),
    defaultValues: { scoreType: 'practice' },
  });

  const onSubmit = async (data: AddScoreFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await addScore({ ...data, userId: user.uid, scoreType });
      Alert.alert('Score Added!', 'Your score has been recorded.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" keyboardShouldPersistTaps="handled">
      <View className="px-6 py-6">
        {/* Score Type */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Score Type
          </Text>
          <View className="flex-row gap-3">
            {(['practice', 'competition'] as ScoreType[]).map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setScoreType(type)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  scoreType === type
                    ? 'bg-deca-blue-600 border-deca-blue-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <Text className={`font-medium text-sm capitalize ${scoreType === type ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {type === 'competition' ? '🏆 ' : '📝 '}{type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            DECA Event Category *
          </Text>
          <ScrollView
            className="max-h-40 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
            nestedScrollEnabled
          >
            {DECA_EVENT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setValue('eventCategory', cat);
                }}
                className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 ${
                  selectedCategory === cat ? 'bg-deca-blue-50 dark:bg-deca-blue-900/20' : ''
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === cat
                      ? 'text-deca-blue-600 dark:text-deca-blue-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.eventCategory && (
            <Text className="text-red-500 text-xs mt-1">{errors.eventCategory.message}</Text>
          )}
        </View>

        {/* Score */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Score (0–100) *
          </Text>
          <Controller
            control={control}
            name="score"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-2xl font-bold text-center"
                placeholder="85"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={v => onChange(parseFloat(v) || 0)}
                value={value?.toString()}
              />
            )}
          />
          {errors.score && <Text className="text-red-500 text-xs mt-1">{errors.score.message}</Text>}
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Notes (optional)
          </Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="Any notes about this score..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-deca-blue-600 rounded-xl py-4 items-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Score</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

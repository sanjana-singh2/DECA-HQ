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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addScoreSchema, AddScoreFormData } from '../../utils/validators';
import { addScore } from '../../services/scoresService';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { DECA_EVENT_CATEGORIES } from '../../constants/config';
import { ScoreType } from '../../types';

const LABEL = { color: '#A09A94', fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 8 };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

        {/* Score Type Toggle */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>Score Type</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['practice', 'competition'] as ScoreType[]).map(type => {
              const active = scoreType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setScoreType(type)}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: active ? '#756FC9' : '#FDFAF5',
                    borderWidth: 1,
                    borderColor: active ? '#756FC9' : '#EDE8DF',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name={type === 'competition' ? 'award' : 'edit-3'} size={14} color={active ? '#FDFAF5' : '#6B6560'} />
                    <Text style={{ fontWeight: '600', fontSize: 13, textTransform: 'capitalize', color: active ? '#FDFAF5' : '#6B6560' }}>{type}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* DECA Event Category */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>DECA Event Category</Text>
          <ScrollView
            style={{ maxHeight: 160, backgroundColor: '#FDFAF5', borderRadius: 14, borderWidth: 1, borderColor: '#EDE8DF' }}
            nestedScrollEnabled
          >
            {DECA_EVENT_CATEGORIES.map((cat, idx) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setValue('eventCategory', cat); }}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderBottomWidth: idx < DECA_EVENT_CATEGORIES.length - 1 ? 1 : 0,
                    borderBottomColor: '#EDE8DF',
                    backgroundColor: active ? '#F0EFF9' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 13, color: active ? '#756FC9' : '#1A1612', fontWeight: active ? '600' : '400' }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.eventCategory ? <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.eventCategory.message}</Text> : null}
        </View>

        {/* Score */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>Score (0–100)</Text>
          <Controller
            control={control}
            name="score"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  backgroundColor: '#FDFAF5',
                  borderWidth: 1,
                  borderColor: '#EDE8DF',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: '#1A1612',
                  fontSize: 32,
                  fontFamily: 'DMSerifDisplay_400Regular',
                  textAlign: 'center',
                }}
                placeholder="85"
                placeholderTextColor="#C4BEB8"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={v => onChange(parseFloat(v) || 0)}
                value={value?.toString()}
              />
            )}
          />
          {errors.score ? <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.score.message}</Text> : null}
        </View>

        {/* Notes */}
        <View style={{ marginBottom: 28 }}>
          <Text style={LABEL}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  backgroundColor: '#FDFAF5',
                  borderWidth: 1,
                  borderColor: '#EDE8DF',
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: '#1A1612',
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Any notes about this score…"
                placeholderTextColor="#C4BEB8"
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
          activeOpacity={0.85}
          style={{ backgroundColor: '#756FC9', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#FDFAF5" />
          ) : (
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Save Score</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

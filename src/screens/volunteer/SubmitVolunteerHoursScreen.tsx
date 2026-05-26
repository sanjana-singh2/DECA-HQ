import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { submitVolunteerSchema, SubmitVolunteerFormData } from '../../utils/validators';
import { submitVolunteerHours, uploadProofImage } from '../../services/volunteerService';
import { useAuth } from '../../hooks/useAuth';

const LABEL = { color: '#A09A94', fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 8 };
const INPUT = { backgroundColor: '#FDFAF5', borderWidth: 1, borderColor: '#EDE8DF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#1A1612', fontSize: 14 };

export default function SubmitVolunteerHoursScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<SubmitVolunteerFormData>({
    resolver: zodResolver(submitVolunteerSchema),
    defaultValues: { hours: 1 },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProofUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: SubmitVolunteerFormData) => {
    if (!user) return;
    if (!proofUri) {
      Alert.alert('Proof Required', 'Please attach a photo as proof of your community work.');
      return;
    }
    setLoading(true);
    try {
      const proofUrl = await uploadProofImage(proofUri, user.uid);
      await submitVolunteerHours({ ...data, userId: user.uid, proofUrl });
      Alert.alert('Submitted!', 'Your credits have been submitted for review.', [
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

        {/* Activity Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Activity Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={INPUT}
                placeholder="e.g. Food Bank Volunteering"
                placeholderTextColor="#C4BEB8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.title.message}</Text>}
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[INPUT, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Briefly describe what you did…"
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

        {/* Hours */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Credits (hours)</Text>
          <Controller
            control={control}
            name="hours"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[INPUT, { fontSize: 22, fontWeight: '600', textAlign: 'center' }]}
                placeholder="2"
                placeholderTextColor="#C4BEB8"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={v => onChange(parseFloat(v) || 0)}
                value={value?.toString()}
              />
            )}
          />
          {errors.hours && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.hours.message}</Text>}
        </View>

        {/* Proof Photo */}
        <View style={{ marginBottom: 28 }}>
          <Text style={LABEL}>Proof Photo</Text>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            style={{
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#C9C7EB',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              backgroundColor: '#F0EFF9',
            }}
          >
            {proofUri ? (
              <Image source={{ uri: proofUri }} style={{ width: '100%', height: 160, borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <>
                <Feather name="camera" size={32} color="#756FC9" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
                  Tap to upload a photo
                </Text>
                <Text style={{ color: '#A09A94', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                  Screenshot, sign-in sheet, etc.
                </Text>
              </>
            )}
          </TouchableOpacity>
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
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Submit for Review</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

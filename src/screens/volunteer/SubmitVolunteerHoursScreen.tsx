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
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { submitVolunteerSchema, SubmitVolunteerFormData } from '../../utils/validators';
import { submitVolunteerHours, uploadProofImage } from '../../services/volunteerService';
import { useAuth } from '../../hooks/useAuth';

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
      Alert.alert('Proof Required', 'Please attach a photo as proof of your volunteer work.');
      return;
    }
    setLoading(true);
    try {
      const proofUrl = await uploadProofImage(proofUri, user.uid);
      await submitVolunteerHours({ ...data, userId: user.uid, proofUrl });
      Alert.alert('Submitted!', 'Your volunteer hours have been submitted for review.', [
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
        {/* Title */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Activity Title *
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="e.g. Food Bank Volunteering"
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title.message}</Text>}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Description
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="Briefly describe what you did..."
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

        {/* Hours */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Hours *
          </Text>
          <Controller
            control={control}
            name="hours"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="2"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={v => onChange(parseFloat(v) || 0)}
                value={value?.toString()}
              />
            )}
          />
          {errors.hours && <Text className="text-red-500 text-xs mt-1">{errors.hours.message}</Text>}
        </View>

        {/* Proof Upload */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Proof Photo *
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 items-center"
          >
            {proofUri ? (
              <Image source={{ uri: proofUri }} className="w-full h-40 rounded-xl" resizeMode="cover" />
            ) : (
              <>
                <Text style={{ fontSize: 32 }} className="mb-2">📷</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                  Tap to upload a photo as proof{'\n'}(screenshot, sign-in sheet, etc.)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-deca-blue-600 rounded-xl py-4 items-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Submit for Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

export default function SubmitVolunteerHoursScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<SubmitVolunteerFormData>({
    resolver: zodResolver(submitVolunteerSchema),
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

        <View style={{ backgroundColor: '#F2F5FA', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="info" size={16} color="#6495ED" />
          <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '500', flex: 1 }}>
            Each submission is worth 1 credit.
          </Text>
        </View>

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

        {/* Proof Photo */}
        <View style={{ marginBottom: 28 }}>
          <Text style={LABEL}>Proof Photo</Text>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            style={{
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#CAD9F4',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              backgroundColor: '#F2F5FA',
            }}
          >
            {proofUri ? (
              <Image source={{ uri: proofUri }} style={{ width: '100%', height: 160, borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <>
                <Feather name="camera" size={32} color="#6495ED" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
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
          style={{ backgroundColor: '#6495ED', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
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

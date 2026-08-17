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
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { uploadResourceSchema, UploadResourceFormData } from '../../utils/validators';
import { uploadResourceFile, createResource, getResourceFileIcon } from '../../services/resourcesService';
import { useAuth } from '../../hooks/useAuth';
import { RESOURCE_CATEGORIES } from '../../constants/config';
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

type PickedFile = { uri: string; name: string; mimeType: string };

export default function UploadResourceScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<UploadResourceFormData>({
    resolver: zodResolver(uploadResourceSchema),
    defaultValues: { category: '' },
  });

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream' });
    }
  };

  const onSubmit = async (data: UploadResourceFormData) => {
    if (!user) return;
    if (!file) {
      Alert.alert('File Required', 'Please attach a file to upload.');
      return;
    }
    setLoading(true);
    try {
      const fileUrl = await uploadResourceFile(file.uri, file.name, file.mimeType);
      const fileType = file.name.split('.').pop()?.toLowerCase() ?? '';
      await createResource({
        title: data.title,
        description: data.description ?? '',
        category: data.category,
        fileUrl,
        fileType,
        uploadedBy: user.uid,
      });
      Alert.alert('Uploaded!', 'The resource is now available in the library.', [
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

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={LABEL}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={INPUT}
                placeholder="e.g. Business Law Study Guide"
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
                placeholder="What's in this resource?"
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

        {/* Category */}
        <View style={{ marginBottom: 24 }}>
          <Text style={LABEL}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {RESOURCE_CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setValue('category', cat, { shouldValidate: true }); }}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? '#6495ED' : '#EDE8DF',
                    backgroundColor: active ? '#F2F5FA' : '#FDFAF5',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '500', color: active ? '#6495ED' : '#6B6560' }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category && <Text style={{ color: '#C96F6F', fontSize: 12, marginTop: 6 }}>{errors.category.message}</Text>}
        </View>

        {/* File */}
        <View style={{ marginBottom: 28 }}>
          <Text style={LABEL}>File</Text>
          <TouchableOpacity
            onPress={pickFile}
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
            {file ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name={getResourceFileIcon(file.name)} size={22} color="#6495ED" style={{ marginRight: 10 }} />
                <Text style={{ color: '#1A1612', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{file.name}</Text>
              </View>
            ) : (
              <>
                <Feather name="upload" size={28} color="#6495ED" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
                  Tap to choose a file
                </Text>
                <Text style={{ color: '#A09A94', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                  PDF, Word, or PowerPoint
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
            <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Upload Resource</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Resource } from '../../types';
import { getResourceById, deleteResource } from '../../services/resourcesService';
import { formatTimestamp } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

type RouteParams = { resourceId: string };

export default function ResourceDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { isOfficer } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResourceById(route.params.resourceId)
      .then(setResource)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = () => {
    if (resource?.fileUrl) Linking.openURL(resource.fileUrl);
  };

  const handleDelete = () => {
    Alert.alert('Delete Resource', 'This will permanently delete the file.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!resource) return;
          await deleteResource(resource);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator color="#1a56db" />
      </View>
    );
  }

  if (!resource) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Text className="text-slate-500">Resource not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-6 py-6">
        <View className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl items-center justify-center mb-6 self-start">
          <Text style={{ fontSize: 36 }}>📄</Text>
        </View>

        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
          {resource.title}
        </Text>

        <View className="bg-deca-blue-50 dark:bg-deca-blue-900/20 self-start rounded-full px-3 py-1 mb-4">
          <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm">
            {resource.category}
          </Text>
        </View>

        {resource.description && (
          <Text className="text-slate-600 dark:text-slate-400 text-sm leading-6 mb-6">
            {resource.description}
          </Text>
        )}

        <View className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
          <Text className="text-slate-500 dark:text-slate-400 text-xs">
            Uploaded {formatTimestamp(resource.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleOpen}
          className="bg-deca-blue-600 rounded-xl py-4 items-center mb-4"
        >
          <Text className="text-white font-semibold text-base">Open File</Text>
        </TouchableOpacity>

        {isOfficer && (
          <TouchableOpacity
            onPress={handleDelete}
            className="rounded-xl py-4 items-center border border-red-200 dark:border-red-800"
          >
            <Text className="text-red-500 font-semibold text-base">Delete Resource</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

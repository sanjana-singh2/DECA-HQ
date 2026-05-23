import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getAllResources, filterResources } from '../../services/resourcesService';
import { Resource } from '../../types';
import { RESOURCE_CATEGORIES } from '../../constants/config';
import { useAuth } from '../../hooks/useAuth';

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  ppt: '📊',
  pptx: '📊',
  default: '📁',
};

function ResourceCard({ resource, onPress }: { resource: Resource; onPress: () => void }) {
  const ext = resource.fileUrl.split('.').pop()?.toLowerCase() ?? 'default';
  const icon = FILE_ICONS[ext] ?? FILE_ICONS.default;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 flex-row items-center"
    >
      <View className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl items-center justify-center mr-4">
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-white font-semibold text-sm mb-0.5" numberOfLines={1}>
          {resource.title}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1" numberOfLines={1}>
          {resource.description}
        </Text>
        <View className="bg-deca-blue-50 dark:bg-deca-blue-900/20 self-start rounded-full px-2 py-0.5">
          <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-xs">{resource.category}</Text>
        </View>
      </View>
      <Text className="text-slate-400 ml-2">›</Text>
    </TouchableOpacity>
  );
}

export default function ResourceLibraryScreen() {
  const navigation = useNavigation<any>();
  const { isOfficer } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = async () => {
    const data = await getAllResources();
    setResources(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = filterResources(
    selectedCategory ? resources.filter(r => r.category === selectedCategory) : resources,
    search
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 dark:text-white text-2xl font-bold">Resources</Text>
        </View>

        {/* Search */}
        <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-row items-center px-4 py-3 mb-4">
          <Text className="text-slate-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-slate-900 dark:text-white text-sm"
            placeholder="Search resources..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`mr-2 px-4 py-1.5 rounded-full border ${
              !selectedCategory
                ? 'bg-deca-blue-600 border-deca-blue-600'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <Text className={`text-sm font-medium ${!selectedCategory ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              All
            </Text>
          </TouchableOpacity>
          {RESOURCE_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                selectedCategory === cat
                  ? 'bg-deca-blue-600 border-deca-blue-600'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <Text className={`text-sm font-medium ${selectedCategory === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color="#1a56db" className="mt-8" />
        ) : filtered.length === 0 ? (
          <View className="items-center mt-12">
            <Text style={{ fontSize: 40 }} className="mb-3">📚</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
              {search ? 'No resources match your search.' : 'No resources yet. Officers can upload files.'}
            </Text>
          </View>
        ) : (
          filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              onPress={() => navigation.navigate('ResourceDetail', { resourceId: r.id })}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

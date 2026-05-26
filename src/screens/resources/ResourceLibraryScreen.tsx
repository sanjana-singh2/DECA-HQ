import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getAllResources, filterResources } from '../../services/resourcesService';
import { Resource } from '../../types';
import { RESOURCE_CATEGORIES } from '../../constants/config';

type FeatherIconName = keyof typeof Feather.glyphMap;
const FILE_ICONS: Record<string, FeatherIconName> = {
  pdf: 'file-text', doc: 'file-text', docx: 'file-text',
  ppt: 'bar-chart-2', pptx: 'bar-chart-2', default: 'file',
};

function ResourceCard({ resource, onPress }: { resource: Resource; onPress: () => void }) {
  const ext = resource.fileUrl.split('.').pop()?.toLowerCase() ?? 'default';
  const iconName: FeatherIconName = FILE_ICONS[ext] ?? FILE_ICONS.default;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 48, height: 48, backgroundColor: '#E3E2F5', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Feather name={iconName} size={20} color="#756FC9" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 3 }} numberOfLines={1}>{resource.title}</Text>
        <Text style={{ color: '#A09A94', fontSize: 12, marginBottom: 4 }} numberOfLines={1}>{resource.description}</Text>
        <View style={{ backgroundColor: '#E3E2F5', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ color: '#756FC9', fontSize: 11, fontWeight: '500' }}>{resource.category}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color="#C4BEB8" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
}

export default function ResourceLibraryScreen() {
  const navigation = useNavigation<any>();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = async () => { const data = await getAllResources(); setResources(data); };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const filtered = filterResources(selectedCategory ? resources.filter(r => r.category === selectedCategory) : resources, search);

  const pill = (label: string, active: boolean, onPress: () => void) => (
    <TouchableOpacity key={label} onPress={onPress}
      style={{ marginRight: 8, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? '#756FC9' : '#FDFAF5', borderWidth: 1, borderColor: active ? '#756FC9' : '#EDE8DF' }}>
      <Text style={{ fontSize: 12, fontWeight: '500', color: active ? '#FDFAF5' : '#6B6560' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 30, color: '#1A1612', marginBottom: 16 }}>Resources</Text>

        <View style={{ backgroundColor: '#FDFAF5', borderColor: '#EDE8DF', borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14 }}>
          <Feather name="search" size={15} color="#C4BEB8" style={{ marginRight: 10 }} />
          <TextInput style={{ flex: 1, color: '#1A1612', fontSize: 14 }} placeholder="Search resources…"
            placeholderTextColor="#C4BEB8" value={search} onChangeText={setSearch} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {pill('All', !selectedCategory, () => setSelectedCategory(null))}
          {RESOURCE_CATEGORIES.map(cat => pill(cat, selectedCategory === cat, () => setSelectedCategory(selectedCategory === cat ? null : cat)))}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#756FC9" />}>
        {loading ? (
          <ActivityIndicator color="#756FC9" style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Feather name="book-open" size={40} color="#C4BEB8" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
              {search ? 'No resources match your search.' : 'No resources yet. Officers can upload files.'}
            </Text>
          </View>
        ) : filtered.map(r => <ResourceCard key={r.id} resource={r} onPress={() => navigation.navigate('ResourceDetail', { resourceId: r.id })} />)}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

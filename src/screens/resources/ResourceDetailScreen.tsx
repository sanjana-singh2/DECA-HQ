import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Resource } from '../../types';
import { getResourceById, deleteResource, getResourceFileIcon } from '../../services/resourcesService';
import { formatTimestamp } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { GradientHero } from '../../constants/colors';

type RouteParams = { resourceId: string };

export default function ResourceDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { isOfficer } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResourceById(route.params.resourceId).then(setResource).finally(() => setLoading(false));
  }, []);

  const handleOpen = () => { if (resource?.fileUrl) Linking.openURL(resource.fileUrl); };
  const handleDelete = () => {
    Alert.alert('Delete Resource', 'This will permanently delete the file.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { if (!resource) return; await deleteResource(resource); navigation.goBack(); } },
    ]);
  };

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}><ActivityIndicator color="#756FC9" /></View>;
  if (!resource) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}><Text style={{ color: '#A09A94', fontSize: 14 }}>Resource not found.</Text></View>;

  const iconName = getResourceFileIcon(resource.fileUrl);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <LinearGradient colors={GradientHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36, alignItems: 'flex-start' }}>
        <View style={{ width: 72, height: 72, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Feather name={iconName} size={30} color="#756FC9" />
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#1A1612', marginBottom: 8 }}>{resource.title}</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ color: '#756FC9', fontSize: 12, fontWeight: '600' }}>{resource.category}</Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -16 }}>
        {resource.description ? (
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <Text style={{ color: '#A09A94', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>About</Text>
            <Text style={{ color: '#1A1612', fontSize: 14, lineHeight: 22 }}>{resource.description}</Text>
          </View>
        ) : null}

        <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="calendar" size={15} color="#A09A94" style={{ marginRight: 10 }} />
          <Text style={{ color: '#A09A94', fontSize: 13 }}>Uploaded {formatTimestamp(resource.createdAt)}</Text>
        </View>

        <TouchableOpacity onPress={handleOpen} activeOpacity={0.85}
          style={{ backgroundColor: '#756FC9', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Feather name="external-link" size={16} color="#FDFAF5" />
          <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Open File</Text>
        </TouchableOpacity>

        {isOfficer ? (
          <TouchableOpacity onPress={handleDelete} activeOpacity={0.85}
            style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <Feather name="trash-2" size={16} color="#C96F6F" />
            <Text style={{ color: '#C96F6F', fontWeight: '600', fontSize: 15 }}>Delete Resource</Text>
          </TouchableOpacity>
        ) : null}
        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { CHANNELS } from '../../constants/config';

export default function ForumScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 30, color: '#1A1612', marginBottom: 4 }}>Forum</Text>
        <Text style={{ color: '#A09A94', fontSize: 13, marginBottom: 24 }}>Connect with your chapter</Text>

        <FlatList
          data={CHANNELS}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Channel', { channelId: item.id, channelName: item.name })}
              activeOpacity={0.85}
              style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#DFE7F6', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Feather name={item.icon as any} size={20} color="#6495ED" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
                  {item.isAnnouncement && (
                    <View style={{ marginLeft: 8, backgroundColor: '#FEF3C7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: '#C9946F', fontSize: 11, fontWeight: '500' }}>Officers only</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: '#A09A94', fontSize: 12 }}>{item.description}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#C4BEB8" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

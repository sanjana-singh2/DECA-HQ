import React from 'react';
import { View, Text } from 'react-native';

interface Props { label: string; value: string | number; icon: string; color?: string; }

export default function StatsCard({ label, value, icon, color = '#756FC9' }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, color: '#1A1612' }}>{value}</Text>
      <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

export default function QuickActionButton({ icon, label, onPress, color = '#6495ED' }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={{ color: '#6B6560', fontSize: 11, fontWeight: '500', textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );
}

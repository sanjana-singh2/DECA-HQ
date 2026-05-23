import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface Props {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

export default function QuickActionButton({ icon, label, onPress, color = '#1a56db' }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="items-center flex-1"
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: color + '15' }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text className="text-slate-600 dark:text-slate-400 text-xs text-center font-medium">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

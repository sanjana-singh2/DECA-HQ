import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatsCard({ label, value, icon, color = '#1a56db' }: Props) {
  return (
    <View
      className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: color + '18' }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text className="text-slate-900 dark:text-white font-bold text-2xl">{value}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

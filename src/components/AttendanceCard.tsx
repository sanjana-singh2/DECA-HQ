import React from 'react';
import { View, Text } from 'react-native';
import { Attendance } from '../types';
import { formatTimestampWithTime } from '../utils/formatters';

interface Props {
  attendance: Attendance;
  eventTitle: string;
}

export default function AttendanceCard({ attendance, eventTitle }: Props) {
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 flex-row items-center border border-slate-100 dark:border-slate-700">
      <View className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 items-center justify-center mr-4">
        <Text style={{ fontSize: 18 }}>✅</Text>
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-white font-semibold text-sm mb-0.5">
          {eventTitle}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-xs">
          {formatTimestampWithTime(attendance.timestamp)}
        </Text>
      </View>
      <View className="bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">
        <Text className="text-slate-500 dark:text-slate-400 text-xs capitalize">
          {attendance.method}
        </Text>
      </View>
    </View>
  );
}

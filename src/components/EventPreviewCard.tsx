import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Event } from '../types';
import { formatEventDay, formatEventTime } from '../utils/formatters';
import { EventTypeColors } from '../constants/colors';

interface Props {
  event: Event;
  onPress?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  competition: 'Competition',
  social: 'Social',
  deadline: 'Deadline',
};

export default function EventPreviewCard({ event, onPress }: Props) {
  const accentColor = EventTypeColors[event.type];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 shadow-sm flex-row"
      activeOpacity={0.85}
    >
      <View
        className="w-1 rounded-full mr-4"
        style={{ backgroundColor: accentColor }}
      />
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <View
            className="rounded-full px-2 py-0.5 mr-2"
            style={{ backgroundColor: accentColor + '20' }}
          >
            <Text style={{ color: accentColor }} className="text-xs font-medium">
              {TYPE_LABELS[event.type]}
            </Text>
          </View>
        </View>
        <Text className="text-slate-900 dark:text-white font-semibold text-base mb-1">
          {event.title}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-xs">
          📅 {formatEventDay(event.startTime)}
        </Text>
        {event.location ? (
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            📍 {event.location}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Event } from '../types';
import { formatEventDay } from '../utils/formatters';
import { EventTypeColors } from '../constants/colors';

interface Props { event: Event; onPress?: () => void; }

const TYPE_LABELS: Record<string, string> = {
  meeting: 'Meeting', competition: 'Competition', social: 'Social', deadline: 'Deadline',
};

export default function EventPreviewCard({ event, onPress }: Props) {
  const accent = EventTypeColors[event.type] ?? '#756FC9';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row' }}>
      <View style={{ width: 3, borderRadius: 2, backgroundColor: accent, marginRight: 14 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ backgroundColor: accent + '20', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: accent, fontSize: 11, fontWeight: '500' }}>{TYPE_LABELS[event.type]}</Text>
          </View>
        </View>
        <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 14, marginBottom: 6 }}>{event.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: event.location ? 3 : 0 }}>
          <Feather name="calendar" size={11} color="#A09A94" />
          <Text style={{ color: '#A09A94', fontSize: 12 }}>{formatEventDay(event.startTime)}</Text>
        </View>
        {event.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="map-pin" size={11} color="#A09A94" />
            <Text style={{ color: '#A09A94', fontSize: 12 }}>{event.location}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

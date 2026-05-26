import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Attendance } from '../types';
import { formatTimestampWithTime } from '../utils/formatters';

interface Props {
  attendance: Attendance;
  eventTitle: string;
}

export default function AttendanceCard({ attendance, eventTitle }: Props) {
  const icon = attendance.method === 'qr' ? 'camera' : 'edit-2';
  return (
    <View style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Feather name={icon} size={18} color="#756FC9" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 13, marginBottom: 3 }} numberOfLines={1}>
          {eventTitle}
        </Text>
        <Text style={{ color: '#A09A94', fontSize: 12 }}>
          {formatTimestampWithTime(attendance.timestamp)}
        </Text>
      </View>
      <View style={{ backgroundColor: '#E3E2F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
        <Text style={{ color: '#756FC9', fontSize: 11, fontWeight: '500', textTransform: 'capitalize' }}>
          {attendance.method}
        </Text>
      </View>
    </View>
  );
}

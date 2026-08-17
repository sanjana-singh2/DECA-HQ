import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import EventPreviewCard from '../../components/EventPreviewCard';
import { EventTypeColors } from '../../constants/colors';
import { Feather } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

const TYPE_FILTERS = ['All', 'meeting', 'competition', 'social', 'deadline'] as const;
type Filter = typeof TYPE_FILTERS[number];

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const { isOfficer } = useAuth();
  const { events, loading } = useEvents();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<Filter>('All');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnDay = (day: Date) => events.filter(e => isSameDay(new Date(e.startTime), day));
  const filteredEvents = events.filter(e =>
    isSameMonth(new Date(e.startTime), currentMonth) && (filter === 'All' || e.type === filter)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 30, color: '#1A1612' }}>Calendar</Text>
          {isOfficer && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEvent')}
              style={{ backgroundColor: '#6495ED', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}
            >
              <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 13 }}>+ Event</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Month nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ padding: 8 }}>
            <Feather name="chevron-left" size={22} color="#6495ED" />
          </TouchableOpacity>
          <Text style={{ color: '#1A1612', fontWeight: '600', fontSize: 15 }}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ padding: 8 }}>
            <Feather name="chevron-right" size={22} color="#6495ED" />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#C4BEB8', fontSize: 11, fontWeight: '600' }}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <View key={`e${i}`} style={{ width: `${100/7}%` }} />
          ))}
          {days.map(day => {
            const dots = eventsOnDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                style={{ width: `${100/7}%`, alignItems: 'center', paddingVertical: 4 }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSelected ? '#6495ED' : 'transparent',
                  borderWidth: isToday && !isSelected ? 1.5 : 0,
                  borderColor: '#6495ED',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? '#FDFAF5' : isToday ? '#6495ED' : '#1A1612' }}>
                    {format(day, 'd')}
                  </Text>
                </View>
                {dots.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 2, justifyContent: 'center' }}>
                    {dots.slice(0, 3).map((e, i) => (
                      <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: EventTypeColors[e.type] }} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {TYPE_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                marginRight: 8, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
                backgroundColor: filter === f ? '#6495ED' : '#FDFAF5',
                borderWidth: 1, borderColor: filter === f ? '#6495ED' : '#EDE8DF',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', textTransform: 'capitalize', color: filter === f ? '#FDFAF5' : '#6B6560' }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events list */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} color="#6495ED" />
        ) : filteredEvents.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Feather name="calendar" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>No events this month</Text>
          </View>
        ) : (
          filteredEvents.map(event => (
            <EventPreviewCard key={event.id} event={event}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

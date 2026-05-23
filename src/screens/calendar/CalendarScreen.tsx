import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import EventPreviewCard from '../../components/EventPreviewCard';
import { EventTypeColors } from '../../constants/colors';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { Event } from '../../types';

const TYPE_FILTERS = ['All', 'meeting', 'competition', 'social', 'deadline'] as const;
type Filter = typeof TYPE_FILTERS[number];

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const { isOfficer } = useAuth();
  const { events, loading, refetch } = useEvents();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<Filter>('All');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.startTime), day));

  const filteredEvents = events.filter(e => {
    const inMonth = isSameMonth(new Date(e.startTime), currentMonth);
    const matchesFilter = filter === 'All' || e.type === filter;
    return inMonth && matchesFilter;
  });

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 dark:text-white text-2xl font-bold">Calendar</Text>
          {isOfficer && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEvent')}
              className="bg-deca-blue-600 rounded-xl px-4 py-2"
            >
              <Text className="text-white font-medium text-sm">+ Event</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Month Navigator */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={prevMonth} className="p-2">
            <Text className="text-deca-blue-600 text-xl">‹</Text>
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-semibold text-base">
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={nextMonth} className="p-2">
            <Text className="text-deca-blue-600 text-xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View className="flex-row mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <View key={i} className="flex-1 items-center">
              <Text className="text-slate-400 text-xs font-medium">{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap mb-4">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <View key={`empty-${i}`} style={{ width: `${100 / 7}%` }} />
          ))}
          {days.map(day => {
            const dayEvents = eventsOnDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                style={{ width: `${100 / 7}%` }}
                className="items-center py-1"
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isSelected ? 'bg-deca-blue-600' : isToday ? 'border border-deca-blue-600' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-deca-blue-600 dark:text-deca-blue-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                {dayEvents.length > 0 && (
                  <View className="flex-row mt-0.5 gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <View
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EventTypeColors[e.type] }}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {TYPE_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                filter === f
                  ? 'bg-deca-blue-600 border-deca-blue-600'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  filter === f ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator className="mt-8" color="#1a56db" />
        ) : filteredEvents.length === 0 ? (
          <View className="items-center mt-12">
            <Text style={{ fontSize: 40 }} className="mb-3">📭</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
              No events this month
            </Text>
          </View>
        ) : (
          filteredEvents.map(event => (
            <EventPreviewCard
              key={event.id}
              event={event}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

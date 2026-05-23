import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { formatGrade, formatRoleLabel } from '../../utils/formatters';
import { RoleColors } from '../../constants/colors';

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center py-3.5 border-b border-slate-100 dark:border-slate-800"
    >
      <Text style={{ fontSize: 18 }} className="w-8">{icon}</Text>
      <Text className="flex-1 text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</Text>
      {value && <Text className="text-slate-400 dark:text-slate-500 text-sm mr-2">{value}</Text>}
      {rightElement}
      {onPress && !rightElement && (
        <Text className="text-slate-400 text-base">›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const { isDark, setMode, mode } = useTheme();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const roleColor = user?.role ? RoleColors[user.role] : '#64748b';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 bg-white dark:bg-slate-800 mb-4">
          <View className="w-20 h-20 rounded-full bg-deca-blue-600 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {user?.fullName?.charAt(0) ?? '?'}
            </Text>
          </View>
          <Text className="text-slate-900 dark:text-white text-xl font-bold mb-1">
            {user?.fullName ?? 'Loading...'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mb-3">
            {user?.email}
          </Text>
          <View
            className="rounded-full px-4 py-1.5"
            style={{ backgroundColor: roleColor + '20' }}
          >
            <Text style={{ color: roleColor }} className="text-sm font-semibold">
              {user?.role ? formatRoleLabel(user.role) : '—'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 mb-4 gap-3">
          <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center border border-slate-100 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              {user?.attendanceCount ?? 0}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">Meetings</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center border border-slate-100 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              {user?.volunteerHours ?? 0}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">Vol. Hours</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center border border-slate-100 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              {user?.grade ?? '—'}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">Grade</Text>
          </View>
        </View>

        {/* Settings */}
        <View className="bg-white dark:bg-slate-800 mx-4 rounded-2xl px-4 mb-4 border border-slate-100 dark:border-slate-700">
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium pt-4 pb-2 uppercase tracking-wider">
            Preferences
          </Text>
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={v => setMode(v ? 'dark' : 'light')}
                trackColor={{ false: '#e2e8f0', true: '#1a56db' }}
                thumbColor={isDark ? '#ffffff' : '#f1f5f9'}
              />
            }
          />
          <SettingRow icon="🔔" label="Notifications" onPress={() => {}} />
        </View>

        <View className="bg-white dark:bg-slate-800 mx-4 rounded-2xl px-4 mb-4 border border-slate-100 dark:border-slate-700">
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium pt-4 pb-2 uppercase tracking-wider">
            Account
          </Text>
          <SettingRow icon="✉️" label="Email" value={user?.email ?? ''} />
          <SettingRow icon="🎓" label="Grade" value={user?.grade ? `${user.grade}th` : '—'} />
          <SettingRow icon="🏅" label="Role" value={user?.role ? formatRoleLabel(user.role) : '—'} />
        </View>

        <View className="px-4 mb-8">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl py-4 items-center"
          >
            <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 dark:text-slate-600 text-xs text-center mt-4">
            DECA HQ v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

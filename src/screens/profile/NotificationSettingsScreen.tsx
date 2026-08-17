import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotificationPermissionStatus,
  registerForPushNotifications,
  savePushToken,
  clearPushToken,
} from '../../services/notificationsService';

export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'granted' | 'denied' | 'undetermined' | null>(null);
  const [checking, setChecking] = useState(true);
  const [updating, setUpdating] = useState(false);

  const refreshStatus = useCallback(async () => {
    setChecking(true);
    const current = await getNotificationPermissionStatus();
    setStatus(current);
    setChecking(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  const handleToggle = async (enabled: boolean) => {
    if (!user) return;
    setUpdating(true);
    try {
      if (enabled) {
        const token = await registerForPushNotifications();
        if (token) {
          await savePushToken(user.uid, token);
        }
        await refreshStatus();
        if (!token) {
          Linking.openSettings();
        }
      } else {
        await clearPushToken(user.uid);
        setStatus('denied');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Feather name="bell" size={16} color="#756FC9" />
            </View>
            <Text style={{ flex: 1, color: '#1A1612', fontSize: 15, fontWeight: '600' }}>Push Notifications</Text>
            {checking || updating ? (
              <ActivityIndicator size="small" color="#756FC9" />
            ) : (
              <Switch
                value={status === 'granted'}
                onValueChange={handleToggle}
                trackColor={{ false: '#EDE8DF', true: '#756FC9' }}
                thumbColor="#FDFAF5"
              />
            )}
          </View>
          <Text style={{ color: '#A09A94', fontSize: 12, marginTop: 10, lineHeight: 18 }}>
            Get reminders for upcoming events and meetings, plus announcements from your chapter officers.
          </Text>
        </View>

        {status === 'denied' ? (
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={{ marginTop: 12, backgroundColor: '#F0EFF9', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center' }}
          >
            <Feather name="settings" size={14} color="#756FC9" style={{ marginRight: 8 }} />
            <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500', flex: 1 }}>
              Notifications are blocked at the system level. Open Settings to allow them.
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

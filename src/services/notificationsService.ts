import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync();

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a56db',
    });
  }

  return token.data;
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  await supabase.from('users').update({ push_token: token }).eq('id', userId);
}

export async function scheduleEventReminder(
  eventTitle: string,
  eventDate: Date,
  minutesBefore = 60
): Promise<string> {
  const triggerDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Upcoming Event',
      body: `${eventTitle} starts in ${minutesBefore} minutes`,
      data: { type: 'event_reminder' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

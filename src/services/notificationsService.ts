import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      lightColor: '#756FC9',
    });
  }

  return token.data;
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  await supabase.from('users').update({ push_token: token }).eq('id', userId);
}

export async function clearPushToken(userId: string): Promise<void> {
  await supabase.from('users').update({ push_token: null }).eq('id', userId);
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Registers this device for push and persists the token; failures (simulator,
// permission denied, no physical device) are swallowed so auth never breaks.
export async function syncPushToken(userId: string): Promise<void> {
  try {
    const token = await registerForPushNotifications();
    if (token) {
      await savePushToken(userId, token);
    }
  } catch (error) {
    console.warn('Push notification registration failed:', error);
  }
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

const reminderKey = (eventId: string) => `event_reminder:${eventId}`;

// Schedules a local "starting soon" reminder for an event a user RSVP'd to,
// and remembers the notification id so unrsvp-ing can cancel it. No-ops if
// the reminder time has already passed (e.g. RSVPing last-minute).
export async function scheduleAndPersistEventReminder(
  eventId: string,
  eventTitle: string,
  eventStart: Date,
  minutesBefore = 60
): Promise<void> {
  if (eventStart.getTime() - minutesBefore * 60 * 1000 <= Date.now()) return;
  try {
    const notificationId = await scheduleEventReminder(eventTitle, eventStart, minutesBefore);
    await AsyncStorage.setItem(reminderKey(eventId), notificationId);
  } catch (error) {
    console.warn('Failed to schedule event reminder:', error);
  }
}

export async function cancelPersistedEventReminder(eventId: string): Promise<void> {
  const notificationId = await AsyncStorage.getItem(reminderKey(eventId));
  if (!notificationId) return;
  await cancelNotification(notificationId);
  await AsyncStorage.removeItem(reminderKey(eventId));
}

// Relays a push notification through the `send-push` Edge Function (which
// enforces officer/advisor-only sending server-side). Best-effort: a failure
// here (function not deployed, no network, no recipients with a token)
// should never block the create/approve flow that triggered it.
export async function notifyUsers(params: {
  userIds?: string[];
  broadcast?: boolean;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', { body: params });
  } catch (error) {
    console.warn('Push notification delivery failed:', error);
  }
}

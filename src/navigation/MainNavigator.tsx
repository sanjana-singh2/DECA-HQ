import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { MainTabParamList } from '../types';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import EventDetailScreen from '../screens/calendar/EventDetailScreen';
import CreateEventScreen from '../screens/calendar/CreateEventScreen';
import ForumScreen from '../screens/forum/ForumScreen';
import ChannelScreen from '../screens/forum/ChannelScreen';
import PostDetailScreen from '../screens/forum/PostDetailScreen';
import ResourceLibraryScreen from '../screens/resources/ResourceLibraryScreen';
import ResourceDetailScreen from '../screens/resources/ResourceDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import QRScannerScreen from '../screens/attendance/QRScannerScreen';
import VolunteerHoursScreen from '../screens/volunteer/VolunteerHoursScreen';
import SubmitVolunteerHoursScreen from '../screens/volunteer/SubmitVolunteerHoursScreen';
import ApprovalQueueScreen from '../screens/volunteer/ApprovalQueueScreen';
import ScoresScreen from '../screens/scores/ScoresScreen';
import AddScoreScreen from '../screens/scores/AddScoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code', headerShown: false }} />
      <Stack.Screen name="VolunteerHours" component={VolunteerHoursScreen} options={{ title: 'Credits' }} />
      <Stack.Screen name="SubmitHours" component={SubmitVolunteerHoursScreen} options={{ title: 'Submit Credits' }} />
      <Stack.Screen name="ApprovalQueue" component={ApprovalQueueScreen} options={{ title: 'Approval Queue' }} />
      <Stack.Screen name="Scores" component={ScoresScreen} options={{ title: 'My Scores' }} />
      <Stack.Screen name="AddScore" component={AddScoreScreen} options={{ title: 'Add Score' }} />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'New Event' }} />
    </Stack.Navigator>
  );
}

function ForumStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="ForumMain" component={ForumScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Channel" component={ChannelScreen} options={({ route }: any) => ({ title: route.params.channelName })} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
    </Stack.Navigator>
  );
}

function ResourceStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="ResourceLibrary" component={ResourceLibraryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: 'Resource' }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Home:      'home',
  Calendar:  'calendar',
  Forum:     'message-circle',
  Resources: 'book-open',
  Profile:   'user',
};

const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => (
  <Feather name={TAB_ICONS[name]} size={22} color={color} />
);

export default function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => <TabIcon name={route.name} focused={focused} color={color} />,
        tabBarActiveTintColor: colors.tab.active,
        tabBarInactiveTintColor: colors.tab.inactive,
        tabBarStyle: {
          backgroundColor: colors.tab.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_500Medium',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Forum" component={ForumStack} />
      <Tab.Screen name="Resources" component={ResourceStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

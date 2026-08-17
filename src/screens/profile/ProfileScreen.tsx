import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { formatRoleLabel } from '../../utils/formatters';

type FeatherName = keyof typeof Feather.glyphMap;

function Row({ icon, label, value, onPress, rightEl }: {
  icon: FeatherName; label: string; value?: string; onPress?: () => void; rightEl?: React.ReactNode;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDE8DF' }}>
      <Feather name={icon} size={16} color="#A09A94" style={{ width: 28 }} />
      <Text style={{ flex: 1, color: '#1A1612', fontSize: 14, fontWeight: '500' }}>{label}</Text>
      {value ? <Text style={{ color: '#A09A94', fontSize: 13, marginRight: 8 }}>{value}</Text> : null}
      {rightEl}
      {onPress && !rightEl ? <Feather name="chevron-right" size={18} color="#C4BEB8" /> : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, isLoading, isAdvisor } = useAuth();
  const { isDark, setMode } = useTheme();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 28, backgroundColor: '#FDFAF5', marginBottom: 16 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 32, color: '#756FC9' }}>
              {user?.fullName?.charAt(0) ?? '?'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: '#1A1612', marginBottom: 4 }}>
            {user?.fullName ?? '—'}
          </Text>
          <Text style={{ color: '#A09A94', fontSize: 13, marginBottom: 12 }}>{user?.email}</Text>
          <View style={{ backgroundColor: '#E3E2F5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ color: '#756FC9', fontSize: 12, fontWeight: '600' }}>
              {user?.role ? formatRoleLabel(user.role) : '—'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Meetings', value: user?.attendanceCount ?? 0 },
            { label: 'Credits',  value: user?.volunteerHours  ?? 0 },
            { label: 'Grade',    value: user?.grade ?? '—' },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: '#FDFAF5', borderRadius: 16, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#1A1612' }}>{s.value}</Text>
              <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <View style={{ backgroundColor: '#FDFAF5', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={{ color: '#C4BEB8', fontSize: 11, fontWeight: '600', paddingTop: 14, paddingBottom: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Preferences</Text>
          <Row icon="moon" label="Dark Mode" rightEl={
            <Switch value={isDark} onValueChange={v => setMode(v ? 'dark' : 'light')}
              trackColor={{ false: '#EDE8DF', true: '#756FC9' }} thumbColor="#FDFAF5" />
          } />
          <Row icon="bell" label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} />
        </View>

        {/* Chapter (advisor only) */}
        {isAdvisor ? (
          <View style={{ backgroundColor: '#FDFAF5', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: '#C4BEB8', fontSize: 11, fontWeight: '600', paddingTop: 14, paddingBottom: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Chapter</Text>
            <Row icon="bar-chart-2" label="Analytics" onPress={() => navigation.navigate('Analytics')} />
            <Row icon="key" label="Invite Codes" onPress={() => navigation.navigate('ManageInviteCodes')} />
          </View>
        ) : null}

        {/* Role upgrade (member/officer only — advisors are already top rank) */}
        {!isAdvisor ? (
          <View style={{ backgroundColor: '#FDFAF5', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: '#C4BEB8', fontSize: 11, fontWeight: '600', paddingTop: 14, paddingBottom: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Access</Text>
            <Row icon="unlock" label="Redeem Invite Code" onPress={() => navigation.navigate('RedeemInviteCode')} />
          </View>
        ) : null}

        {/* Account */}
        <View style={{ backgroundColor: '#FDFAF5', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ color: '#C4BEB8', fontSize: 11, fontWeight: '600', paddingTop: 14, paddingBottom: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Account</Text>
          <Row icon="mail"   label="Email" value={user?.email ?? ''} />
          <Row icon="book"   label="Grade" value={user?.grade ? `${user.grade}th` : '—'} />
          <Row icon="shield" label="Role"  value={user?.role ? formatRoleLabel(user.role) : '—'} />
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <TouchableOpacity onPress={handleLogout} disabled={isLoading}
            style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Feather name="log-out" size={16} color="#C96F6F" />
            <Text style={{ color: '#C96F6F', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={{ color: '#C4BEB8', fontSize: 11, textAlign: 'center', marginTop: 16 }}>DECA HQ · est. 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { redeemInviteCode } from '../../services/inviteCodeService';
import { useAuth } from '../../hooks/useAuth';
import { formatRoleLabel } from '../../utils/formatters';
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

export default function RedeemInviteCodeScreen() {
  const navigation = useNavigation();
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const grantedRole = await redeemInviteCode(code);
      await refreshProfile();
      Alert.alert(
        'Access Granted',
        `You're now a${grantedRole === 'advisor' ? 'n' : ''} ${formatRoleLabel(grantedRole)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Couldn’t Redeem Code', e.message ?? 'That code isn’t valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <View style={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3E2F5', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Feather name="unlock" size={26} color="#756FC9" />
          </View>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: '#1A1612', marginBottom: 6, textAlign: 'center' }}>
            Have an invite code?
          </Text>
          <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
            Officers and advisors get access through a code from an advisor — not by picking it themselves.
          </Text>
        </View>

        <Text style={LABEL}>Invite Code</Text>
        <TextInput
          style={[INPUT, { fontSize: 16, fontWeight: '600', textAlign: 'center', letterSpacing: 1 }]}
          placeholder="DECA-XXXXXX"
          placeholderTextColor="#C4BEB8"
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity
          onPress={handleRedeem}
          disabled={loading || !code.trim()}
          activeOpacity={0.85}
          style={{
            marginTop: 20,
            backgroundColor: code.trim() ? '#756FC9' : '#EDE8DF',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          {loading ? <ActivityIndicator color="#FDFAF5" /> : <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Redeem Code</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

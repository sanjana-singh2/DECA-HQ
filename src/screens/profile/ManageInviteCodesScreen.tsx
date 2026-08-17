import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  getInviteCodes,
  createInviteCode,
  revokeInviteCode,
  InviteCode,
} from '../../services/inviteCodeService';
import { useAuth } from '../../hooks/useAuth';
import { formatTimestamp } from '../../utils/formatters';
import { UserRole } from '../../types';
import { FormLabel as LABEL, FormInput as INPUT } from '../../constants/formStyles';

const ROLES: Extract<UserRole, 'officer' | 'advisor'>[] = ['officer', 'advisor'];

export default function ManageInviteCodesScreen() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState<Extract<UserRole, 'officer' | 'advisor'>>('officer');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresInDays, setExpiresInDays] = useState('');

  const load = async () => {
    const data = await getInviteCodes();
    setCodes(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!user) return;
    const parsedMaxUses = parseInt(maxUses, 10);
    if (!parsedMaxUses || parsedMaxUses < 1) {
      Alert.alert('Invalid', 'Max uses must be at least 1.');
      return;
    }
    const parsedExpiry = expiresInDays.trim() ? parseInt(expiresInDays, 10) : undefined;
    setCreating(true);
    try {
      const code = await createInviteCode({
        role,
        createdBy: user.uid,
        maxUses: parsedMaxUses,
        expiresInDays: parsedExpiry,
      });
      setShowForm(false);
      setMaxUses('1');
      setExpiresInDays('');
      await load();
      Alert.alert(
        'Code Created',
        `${code.code}\n\nShare this with the person you're granting ${code.role} access to.`,
        [
          { text: 'Share', onPress: () => Share.share({ message: `Your DECA HQ invite code: ${code.code}` }) },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (id: string) => {
    Alert.alert('Revoke Code', 'This code will no longer be redeemable.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => { await revokeInviteCode(id); await load(); } },
    ]);
  };

  const statusOf = (code: InviteCode) => {
    if (code.revoked) return { label: 'Revoked', color: '#C96F6F' };
    if (code.useCount >= code.maxUses) return { label: 'Used up', color: '#A09A94' };
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) return { label: 'Expired', color: '#C9946F' };
    return { label: 'Active', color: '#6FAF8A' };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F0E8' }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

        <TouchableOpacity
          onPress={() => setShowForm(v => !v)}
          activeOpacity={0.85}
          style={{ backgroundColor: '#6495ED', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: showForm ? 16 : 24 }}
        >
          <Feather name={showForm ? 'x' : 'plus'} size={16} color="#FDFAF5" />
          <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 14 }}>
            {showForm ? 'Cancel' : 'New Invite Code'}
          </Text>
        </TouchableOpacity>

        {showForm ? (
          <View style={{ backgroundColor: '#FDFAF5', borderRadius: 20, padding: 18, marginBottom: 24 }}>
            <Text style={LABEL}>Grants Role</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {ROLES.map(r => {
                const active = role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                      backgroundColor: active ? '#6495ED' : '#F5F0E8',
                      borderWidth: 1, borderColor: active ? '#6495ED' : '#EDE8DF',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', textTransform: 'capitalize', color: active ? '#FDFAF5' : '#6B6560' }}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={LABEL}>Max Uses</Text>
                <TextInput
                  style={INPUT}
                  keyboardType="number-pad"
                  value={maxUses}
                  onChangeText={setMaxUses}
                  placeholder="1"
                  placeholderTextColor="#C4BEB8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={LABEL}>Expires In (days)</Text>
                <TextInput
                  style={INPUT}
                  keyboardType="number-pad"
                  value={expiresInDays}
                  onChangeText={setExpiresInDays}
                  placeholder="Never"
                  placeholderTextColor="#C4BEB8"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating}
              activeOpacity={0.85}
              style={{ backgroundColor: '#1A1612', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              {creating ? <ActivityIndicator color="#FDFAF5" /> : <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 14 }}>Generate Code</Text>}
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color="#6495ED" style={{ marginTop: 32 }} />
        ) : codes.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Feather name="key" size={36} color="#C4BEB8" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center' }}>
              No invite codes yet.{'\n'}Create one to promote a member.
            </Text>
          </View>
        ) : (
          codes.map(code => {
            const status = statusOf(code);
            const canRevoke = !code.revoked && code.useCount < code.maxUses;
            return (
              <View key={code.id} style={{ backgroundColor: '#FDFAF5', borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#1A1612', fontWeight: '700', fontSize: 15, flex: 1, letterSpacing: 0.5 }}>{code.code}</Text>
                  <View style={{ backgroundColor: status.color + '25', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ color: status.color, fontSize: 11, fontWeight: '600' }}>{status.label}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: canRevoke ? 12 : 0 }}>
                  <Text style={{ color: '#A09A94', fontSize: 12, textTransform: 'capitalize' }}>Grants {code.role}</Text>
                  <Text style={{ color: '#A09A94', fontSize: 12 }}>{code.useCount}/{code.maxUses} used</Text>
                  <Text style={{ color: '#A09A94', fontSize: 12 }}>
                    {code.expiresAt ? `Expires ${formatTimestamp(code.expiresAt)}` : 'No expiry'}
                  </Text>
                </View>
                {canRevoke ? (
                  <TouchableOpacity onPress={() => handleRevoke(code.id)} activeOpacity={0.7}>
                    <Text style={{ color: '#C96F6F', fontSize: 12, fontWeight: '500' }}>Revoke</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

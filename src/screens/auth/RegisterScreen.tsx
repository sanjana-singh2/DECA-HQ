import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../types';
import { registerSchema, RegisterFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { redeemInviteCode } from '../../services/inviteCodeService';
import { GradientHero } from '../../constants/colors';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
const GRADES = [9, 10, 11, 12];

const label = (t: string) => (
  <Text style={{ color: '#6B6560', fontSize: 12, fontWeight: '500', marginBottom: 6, letterSpacing: 0.4 }}>
    {t}
  </Text>
);

const inputStyle = {
  backgroundColor: '#FDFAF5', borderColor: '#EDE8DF', borderWidth: 1,
  borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#1A1612', fontSize: 15,
};

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register, refreshProfile, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: { grade: 10 },
    });

  const onSubmit = async (data: RegisterFormData) => {
    const success = await register(data);
    if (success && data.inviteCode?.trim()) {
      try {
        await redeemInviteCode(data.inviteCode);
        await refreshProfile();
      } catch {
        // Account was created fine either way — they can redeem the code
        // later from Profile once signed in (e.g. if email confirmation
        // delayed session creation, or the code was mistyped).
      }
    }
  };

  const selectedGrade = watch('grade');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Slim gradient header */}
        <LinearGradient
          colors={GradientHero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ height: 120 }}
        />

        <View style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }} className="px-6 pt-6">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
            <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500' }}>← Back to sign in</Text>
          </TouchableOpacity>

          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 30, color: '#1A1612', marginBottom: 4 }}>
            Create your account
          </Text>
          <Text style={{ color: '#A09A94', fontSize: 13, marginBottom: 24 }}>
            Join your chapter on DECA HQ
          </Text>

          {error ? (
            <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <Text style={{ color: '#C96F6F', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={{ marginBottom: 16 }}>
            {label('FULL NAME')}
            <Controller control={control} name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={inputStyle} placeholder="Alex Johnson" placeholderTextColor="#C4BEB8"
                  autoCapitalize="words" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.fullName ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.fullName.message}</Text> : null}
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            {label('EMAIL')}
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={inputStyle} placeholder="you@school.edu" placeholderTextColor="#C4BEB8"
                  keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.email ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.email.message}</Text> : null}
          </View>

          {/* Grade */}
          <View style={{ marginBottom: 16 }}>
            {label('GRADE')}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {GRADES.map(g => {
                const sel = selectedGrade === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setValue('grade', g)}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                      backgroundColor: sel ? '#756FC9' : '#FDFAF5',
                      borderWidth: 1, borderColor: sel ? '#756FC9' : '#EDE8DF',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: sel ? '#FDFAF5' : '#6B6560' }}>
                      {g}th
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 16 }}>
            {label('PASSWORD')}
            <View>
              <Controller control={control} name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={{ ...inputStyle, paddingRight: 60 }} placeholder="8+ characters"
                    placeholderTextColor="#C4BEB8" secureTextEntry={!showPassword}
                    onBlur={onBlur} onChangeText={onChange} value={value} />
                )} />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Text style={{ color: '#A09A94', fontSize: 12, fontWeight: '500' }}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.password.message}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 32 }}>
            {label('CONFIRM PASSWORD')}
            <Controller control={control} name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={inputStyle} placeholder="Repeat your password"
                  placeholderTextColor="#C4BEB8" secureTextEntry={!showPassword}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.confirmPassword ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.confirmPassword.message}</Text> : null}
          </View>

          {/* Invite Code (optional) */}
          <View style={{ marginBottom: 32 }}>
            {label('INVITE CODE (OPTIONAL)')}
            <Controller control={control} name="inviteCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={inputStyle} placeholder="Got an officer/advisor code? Enter it here"
                  placeholderTextColor="#C4BEB8" autoCapitalize="characters" autoCorrect={false}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            <Text style={{ color: '#A09A94', fontSize: 11, marginTop: 6 }}>
              Everyone starts as a member — officers and advisors get access from a code, not by choosing it.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ backgroundColor: '#756FC9', borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: isLoading ? 0.7 : 1, marginBottom: 20 }}
          >
            {isLoading
              ? <ActivityIndicator color="#FDFAF5" />
              : <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Create Account</Text>
            }
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#A09A94', fontSize: 13 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '600' }}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

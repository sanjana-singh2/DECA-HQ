import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword, isLoading, error } = useAuth();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } =
    useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const success = await forgotPassword(data.email);
    if (success) setSent(true);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F0E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#DFE7F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Feather name="mail" size={28} color="#6495ED" />
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#1A1612', marginBottom: 10, textAlign: 'center' }}>
          Check your inbox
        </Text>
        <Text style={{ color: '#A09A94', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
          We sent a password reset link to your email. It may take a minute to arrive.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#6495ED', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' }}
        >
          <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }} className="px-6 py-12">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 32 }}>
            <Text style={{ color: '#6495ED', fontSize: 13, fontWeight: '500' }}>← Back to sign in</Text>
          </TouchableOpacity>

          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 30, color: '#1A1612', marginBottom: 6 }}>
            Reset your password
          </Text>
          <Text style={{ color: '#A09A94', fontSize: 14, lineHeight: 22, marginBottom: 32 }}>
            Enter your email and we&apos;ll send you a reset link.
          </Text>

          {error ? (
            <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <Text style={{ color: '#C96F6F', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#6B6560', fontSize: 12, fontWeight: '500', marginBottom: 6, letterSpacing: 0.4 }}>
              EMAIL ADDRESS
            </Text>
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{ backgroundColor: '#FDFAF5', borderColor: '#EDE8DF', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#1A1612', fontSize: 15 }}
                  placeholder="you@school.edu"
                  placeholderTextColor="#C4BEB8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )} />
            {errors.email ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.email.message}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ backgroundColor: '#6495ED', borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading
              ? <ActivityIndicator color="#FDFAF5" />
              : <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Send Reset Link</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

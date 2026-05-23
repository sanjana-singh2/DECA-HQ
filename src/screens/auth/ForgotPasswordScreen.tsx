import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword, isLoading, error } = useAuth();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const success = await forgotPassword(data.email);
    if (success) setSent(true);
  };

  if (sent) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 px-6 pt-20 items-center">
        <Text style={{ fontSize: 48 }} className="mb-4">📧</Text>
        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-3 text-center">
          Check your email
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-base text-center mb-8">
          We've sent a password reset link to your email address.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-deca-blue-600 rounded-xl py-4 px-8"
        >
          <Text className="text-white font-semibold text-base">Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-slate-900"
    >
      <View className="flex-1 px-6 pt-16 pb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-slate-900 dark:text-white text-3xl font-bold mb-2">Reset password</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-base mb-8">
          Enter your email and we'll send a reset link.
        </Text>

        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <Text className="text-red-600 dark:text-red-400 text-sm">{error}</Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                placeholder="you@school.edu"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="bg-deca-blue-600 rounded-xl py-4 items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

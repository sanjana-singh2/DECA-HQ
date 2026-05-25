import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const success = await forgotPassword(data.email);
    if (success) setSent(true);
  };

  if (sent) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center px-6">
        <View style={{ maxWidth: 360, width: '100%', alignItems: 'center' }}>
          <View className="w-16 h-16 bg-deca-blue-50 dark:bg-deca-blue-900/30 rounded-full items-center justify-center mb-5">
            <Text style={{ fontSize: 30 }}>📩</Text>
          </View>
          <Text className="text-slate-900 dark:text-white text-xl font-bold mb-2 text-center">
            Check your inbox
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8 leading-5">
            We sent a password reset link to your email. It may take a minute to arrive.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-deca-blue-600 rounded-xl py-4 px-10 items-center w-full"
          >
            <Text className="text-white font-semibold text-base">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="px-6 py-12 w-full"
          style={{ maxWidth: 440, alignSelf: 'center' }}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8"
          >
            <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-medium">
              ← Back to sign in
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-1">
              Reset your password
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5">
              Enter your email and we'll send you a reset link.
            </Text>
          </View>

          {/* Error banner */}
          {error ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3.5 mb-5">
              <Text className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-6">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Email address
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-base"
                  placeholder="you@school.edu"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </Text>
            ) : null}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-deca-blue-600 rounded-xl py-4 items-center"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

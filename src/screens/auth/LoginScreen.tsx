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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../types';
import { loginSchema, LoginFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

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
          {/* Brand mark */}
          <View className="items-center mb-10">
            <View className="w-14 h-14 bg-deca-blue-600 rounded-2xl items-center justify-center mb-4">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: 1.5,
                }}
              >
                HQ
              </Text>
            </View>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
              DECA HQ
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Sign in to your chapter
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
          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Email
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

          {/* Password */}
          <View className="mb-1">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Password
            </Text>
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-base pr-16"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                className="absolute right-4 top-0 bottom-0 justify-center"
              >
                <Text className="text-slate-400 text-sm font-medium">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </Text>
            ) : null}
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            className="self-end mb-6 mt-2"
          >
            <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign in button */}
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
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <Text className="text-slate-400 text-xs px-3">or</Text>
            <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </View>

          {/* Register link */}
          <View className="flex-row justify-center">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              New to DECA HQ?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-semibold">
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

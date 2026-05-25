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
import { registerSchema, RegisterFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const GRADES = [9, 10, 11, 12];

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { grade: 10, role: 'member' },
  });

  const selectedGrade = watch('grade');

  const onSubmit = async (data: RegisterFormData) => {
    await register(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="px-6 w-full"
          style={{ maxWidth: 440, alignSelf: 'center' }}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8 flex-row items-center"
          >
            <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-medium">
              ← Back to sign in
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-1">
              Create your account
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              Join your chapter on DECA HQ
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

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Full Name
            </Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-base"
                  placeholder="Alex Johnson"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.fullName ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </Text>
            ) : null}
          </View>

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

          {/* Grade */}
          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Grade
            </Text>
            <View className="flex-row gap-2">
              {GRADES.map(g => {
                const selected = selectedGrade === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setValue('grade', g)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      selected
                        ? 'bg-deca-blue-600 border-deca-blue-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected
                          ? 'text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {g}th
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Password */}
          <View className="mb-4">
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
                    placeholder="8+ characters"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
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

          {/* Confirm Password */}
          <View className="mb-8">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Confirm Password
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-base"
                  placeholder="Repeat your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign in link */}
          <View className="flex-row justify-center mt-5">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-deca-blue-600 dark:text-deca-blue-400 text-sm font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

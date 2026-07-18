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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../types';
import { loginSchema, LoginFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { GradientHero } from '../../constants/colors';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero gradient */}
        <LinearGradient
          colors={GradientHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 240 }}
        />

        {/* Form area */}
        <View style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }}
          className="px-6 pt-8 pb-12 flex-1">

          {/* Wordmark */}
          <View className="mb-8">
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, color: '#1A1612' }}>
              DECA HQ
            </Text>
            <Text style={{ color: '#A09A94', fontSize: 13, marginTop: 4 }}>
              Sign in to your chapter
            </Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }}
              className="rounded-xl p-3.5 mb-5">
              <Text style={{ color: '#C96F6F', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-4">
            <Text style={{ color: '#6B6560', fontSize: 12, fontWeight: '500', marginBottom: 6, letterSpacing: 0.4 }}>
              EMAIL
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
              )}
            />
            {errors.email ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.email.message}</Text> : null}
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text style={{ color: '#6B6560', fontSize: 12, fontWeight: '500', marginBottom: 6, letterSpacing: 0.4 }}>
              PASSWORD
            </Text>
            <View>
              <Controller control={control} name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{ backgroundColor: '#FDFAF5', borderColor: '#EDE8DF', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 60, color: '#1A1612', fontSize: 15 }}
                    placeholder="••••••••"
                    placeholderTextColor="#C4BEB8"
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
                style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Text style={{ color: '#A09A94', fontSize: 12, fontWeight: '500' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={{ color: '#C96F6F', fontSize: 11, marginTop: 4 }}>{errors.password.message}</Text> : null}
          </View>

          {/* Forgot */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginBottom: 28, marginTop: 8 }}
          >
            <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '500' }}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign in */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ backgroundColor: '#756FC9', borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading
              ? <ActivityIndicator color="#FDFAF5" />
              : <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 15 }}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#EDE8DF' }} />
            <Text style={{ color: '#C4BEB8', fontSize: 12, paddingHorizontal: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#EDE8DF' }} />
          </View>

          {/* Register */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#A09A94', fontSize: 13 }}>New to DECA HQ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#756FC9', fontSize: 13, fontWeight: '600' }}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { recordAttendance, parseQRPayload } from '../../services/attendanceService';

type RouteParams = { eventId: string };

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { eventId } = route.params;

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || processing || !user) return;
    setScanned(true);
    setProcessing(true);

    const payload = parseQRPayload(data);
    if (!payload || payload.eventId !== eventId) {
      Alert.alert('Invalid QR Code', 'This QR code is not for this event.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
      setProcessing(false);
      return;
    }

    const ageMs = Date.now() - payload.timestamp;
    if (ageMs > 24 * 60 * 60 * 1000) {
      Alert.alert('Expired QR Code', 'This QR code has expired.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setProcessing(false);
      return;
    }

    try {
      await recordAttendance({ userId: user.uid, eventId, method: 'qr' });
      Alert.alert('✅ Attendance Recorded!', 'Your attendance has been marked.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      if (e.message === 'Attendance already recorded for this event') {
        Alert.alert('Already Marked', 'Your attendance was already recorded for this event.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', e.message, [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 px-6">
        <Text style={{ fontSize: 48 }} className="mb-4">📷</Text>
        <Text className="text-slate-900 dark:text-white text-xl font-bold mb-3 text-center">
          Camera Access Needed
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
          Please allow camera access in your device settings to scan attendance QR codes.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-deca-blue-600 rounded-xl py-4 px-8"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View className="flex-1 items-center justify-center">
        <View className="w-64 h-64 border-2 border-white rounded-2xl" />
        <Text className="text-white text-sm mt-4 font-medium">
          {processing ? 'Processing...' : 'Point camera at QR code'}
        </Text>
      </View>

      {/* Cancel */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/20 rounded-full px-6 py-3"
        >
          <Text className="text-white font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

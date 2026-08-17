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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <Text style={{ color: '#6B6560', fontSize: 14 }}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 44, marginBottom: 16 }}>📷</Text>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: '#1A1612', marginBottom: 10, textAlign: 'center' }}>
          Camera Access Needed
        </Text>
        <Text style={{ color: '#A09A94', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          Please allow camera access in your device settings to scan attendance QR codes.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={{ backgroundColor: '#756FC9', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 256, height: 256, borderWidth: 2, borderColor: '#FDFAF5', borderRadius: 20 }} />
        <Text style={{ color: '#FDFAF5', fontSize: 13, marginTop: 16, fontWeight: '500' }}>
          {processing ? 'Processing…' : 'Point camera at QR code'}
        </Text>
      </View>

      {/* Cancel */}
      <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={{ backgroundColor: 'rgba(253,250,245,0.2)', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 }}
        >
          <Text style={{ color: '#FDFAF5', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

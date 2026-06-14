import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { CAPTURE_MODES } from '@/src/constants/modes';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useCapture } from '@/src/state/CaptureContext';
import type { CaptureMode } from '@/src/types';

const VALID_MODES: readonly string[] = ['back', 'board', 'battery'];

function resolveMode(value: string | undefined): CaptureMode {
  return VALID_MODES.includes(value ?? '') ? (value as CaptureMode) : 'back';
}

export default function CaptureScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = resolveMode(modeParam);
  const config = CAPTURE_MODES[mode];

  const router = useRouter();
  const { setCapturedImage, setResult } = useCapture();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const goToResult = (image: { base64: string; mimeType: string; uri: string }) => {
    setResult(null);
    setCapturedImage({ ...image, mode });
    router.push('/result');
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) {
        Alert.alert('Capture failed', 'Could not capture a photo. Please try again.');
        return;
      }
      goToResult({ base64: photo.base64, mimeType: 'image/jpeg', uri: photo.uri });
    } catch (err) {
      Alert.alert('Capture failed', err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libraryPermission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Selection failed', 'Could not read the selected image.');
      return;
    }

    goToResult({ base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg', uri: asset.uri });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: config.title }} />

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>{config.instructions}</Text>
        <Text style={styles.tip}>{config.tip}</Text>
      </View>

      <View style={styles.cameraWrap}>
        {permission === null ? (
          <ActivityIndicator color={colors.primary} />
        ) : permission.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        ) : (
          <View style={styles.permissionBox}>
            <Ionicons name="camera-outline" size={36} color={colors.textMuted} />
            <Text style={styles.permissionText}>
              {permission.canAskAgain === false
                ? 'Camera permission was denied. You can still choose a photo from your gallery, or enable camera access in system settings.'
                : 'Camera access is needed to take a photo directly.'}
            </Text>
            {permission.canAskAgain !== false && (
              <PrimaryButton label="Grant Camera Permission" onPress={requestPermission} variant="outline" />
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {permission?.granted && (
          <PrimaryButton
            label="Take Photo"
            onPress={handleTakePhoto}
            loading={isCapturing}
            icon="camera"
            style={styles.actionButton}
          />
        )}
        <PrimaryButton
          label="Choose from Gallery"
          onPress={handlePickImage}
          variant="secondary"
          icon="images-outline"
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  instructions: {
    marginBottom: spacing.md,
  },
  instructionsText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tip: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  cameraWrap: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  permissionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  permissionText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});

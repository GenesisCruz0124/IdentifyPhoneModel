import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CaptureProvider } from '@/src/state/CaptureContext';
import { colors } from '@/src/constants/theme';

export default function RootLayout() {
  return (
    <CaptureProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'PhoneID PH' }} />
        <Stack.Screen name="capture" options={{ title: 'Capture' }} />
        <Stack.Screen name="result" options={{ title: 'Result' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </CaptureProvider>
  );
}

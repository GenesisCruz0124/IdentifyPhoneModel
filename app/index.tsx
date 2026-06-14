import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ModeCard } from '@/src/components/ModeCard';
import { CAPTURE_MODES, CAPTURE_MODE_ORDER } from '@/src/constants/modes';
import { colors, spacing } from '@/src/constants/theme';
import type { CaptureMode } from '@/src/types';

export default function HomeScreen() {
  const router = useRouter();

  const handleSelectMode = (mode: CaptureMode) => {
    router.push({ pathname: '/capture', params: { mode } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'PhoneID PH',
          headerRight: () => (
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.text}
              onPress={() => router.push('/settings')}
              style={styles.settingsIcon}
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>Identify a phone</Text>
          <Text style={styles.subheading}>
            Pick what you're photographing. PhoneID PH reads printed model codes and labels first for the most
            accurate match, then looks up matching repair parts.
          </Text>
        </View>

        {CAPTURE_MODE_ORDER.map((mode) => (
          <ModeCard key={mode} config={CAPTURE_MODES[mode]} onPress={() => handleSelectMode(mode)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  settingsIcon: {
    marginRight: spacing.md,
  },
});

import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { clearApiKey, getApiKey, setApiKey } from '@/src/services/apiKeyStore';
import { colors, radius, spacing } from '@/src/constants/theme';

export default function SettingsScreen() {
  const [apiKey, setApiKeyInput] = useState('');
  const [savedKeyPresent, setSavedKeyPresent] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getApiKey();
      if (stored) {
        setApiKeyInput(stored);
        setSavedKeyPresent(true);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Alert.alert('Missing key', 'Paste your Anthropic API key first.');
      return;
    }
    setSaving(true);
    try {
      await setApiKey(trimmed);
      setSavedKeyPresent(true);
      Alert.alert('Saved', 'Your API key has been saved on this device.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert('Remove API key', 'Are you sure you want to remove the saved API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setApiKeyInput('');
          setSavedKeyPresent(false);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Anthropic API Key</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showKey}
              editable={!loading}
            />
            <Pressable onPress={() => setShowKey((prev) => !prev)} style={styles.eyeButton}>
              <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.noticeBox}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              Your API key is stored locally on this device using encrypted secure storage. It is sent only
              directly to Anthropic's API when identifying a phone, never to any other server.
            </Text>
          </View>

          <PrimaryButton
            label="Save API Key"
            onPress={handleSave}
            loading={saving}
            icon="save-outline"
            style={styles.button}
          />

          {savedKeyPresent && (
            <PrimaryButton
              label="Remove Saved Key"
              onPress={handleClear}
              variant="danger"
              icon="trash-outline"
              style={styles.button}
            />
          )}

          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Where do I get an API key?</Text>
            <Text style={styles.helpText}>
              Create a key from the Anthropic Console (console.anthropic.com) under "API Keys", then paste it
              above. Usage is billed by Anthropic based on the number of images you identify.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noticeText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    marginBottom: spacing.md,
  },
  helpBox: {
    marginTop: spacing.lg,
  },
  helpTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ConfidenceBadge } from '@/src/components/ConfidenceBadge';
import { InfoRow } from '@/src/components/InfoRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SectionCard } from '@/src/components/SectionCard';
import { getApiKey } from '@/src/services/apiKeyStore';
import { IdentificationError, identifyPhone } from '@/src/services/identify';
import { findBatteryPart, findLcdPart } from '@/src/services/partsLookup';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useCapture } from '@/src/state/CaptureContext';
import type { BatteryPartEntry, IdentificationResult, ModelPartEntry } from '@/src/types';

type Status = 'loading' | 'error' | 'success';

function lcdQuery(result: IdentificationResult, part: ModelPartEntry | null): string {
  return part?.lcdPartNumber ?? `${result.brand} ${result.model} LCD`.trim();
}

function batteryQuery(result: IdentificationResult, part: BatteryPartEntry | null): string {
  return part?.batteryPartNumber ?? `${result.brand} ${result.model} battery`.trim();
}

export default function ResultScreen() {
  const router = useRouter();
  const { capturedImage, result, setResult } = useCapture();
  const [status, setStatus] = useState<Status>(result ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [lcdPart, setLcdPart] = useState<ModelPartEntry | null>(null);
  const [batteryPart, setBatteryPart] = useState<BatteryPartEntry | null>(null);

  const runIdentification = useCallback(async () => {
    if (!capturedImage) return;
    setStatus('loading');
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new IdentificationError('no_api_key', 'No Gemini API key is set. Add one in Settings.');
      }
      const identification = await identifyPhone(capturedImage.base64, capturedImage.mimeType, apiKey);
      setResult(identification);
      setLcdPart(findLcdPart(identification));
      setBatteryPart(findBatteryPart(identification));
      setStatus('success');
    } catch (err) {
      if (err instanceof IdentificationError) {
        setErrorMessage(err.message);
        setErrorCode(err.code);
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error.');
        setErrorCode(null);
      }
      setStatus('error');
    }
  }, [capturedImage, setResult]);

  useEffect(() => {
    if (!capturedImage) {
      router.replace('/');
      return;
    }
    if (result) {
      setLcdPart(findLcdPart(result));
      setBatteryPart(findBatteryPart(result));
      setStatus('success');
      return;
    }
    runIdentification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSearch = (platform: 'shopee' | 'lazada', query: string) => {
    const encoded = encodeURIComponent(query.trim());
    const url =
      platform === 'shopee'
        ? `https://shopee.ph/search?keyword=${encoded}`
        : `https://www.lazada.com.ph/catalog/?q=${encoded}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', `Unable to open ${platform === 'shopee' ? 'Shopee' : 'Lazada'}.`);
    });
  };

  if (!capturedImage) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: capturedImage.uri }} style={styles.preview} resizeMode="cover" />

        {status === 'loading' && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Identifying phone…</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.centerBox}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            {errorCode === 'no_api_key' ? (
              <PrimaryButton label="Open Settings" onPress={() => router.push('/settings')} icon="key-outline" />
            ) : (
              <PrimaryButton label="Try Again" onPress={runIdentification} icon="refresh" />
            )}
          </View>
        )}

        {status === 'success' && result && (
          <>
            <SectionCard title="Identification">
              <Text style={styles.modelName}>
                {result.brand} {result.model}
              </Text>
              {!!result.modelCode && <Text style={styles.modelCode}>{result.modelCode}</Text>}
              <View style={styles.badgeRow}>
                <ConfidenceBadge confidence={result.confidence} />
              </View>
              {!!result.evidence && <Text style={styles.evidence}>{result.evidence}</Text>}
            </SectionCard>

            <SectionCard title="Specs">
              <InfoRow label="Display" value={result.specs.display} />
              <InfoRow label="Battery" value={result.specs.battery_mah ? `${result.specs.battery_mah} mAh` : ''} />
              <InfoRow label="Release year" value={result.specs.year} />
            </SectionCard>

            <SectionCard title="LCD / Display Part">
              <InfoRow label="Part reference" value={lcdPart?.lcdPartNumber} fallback="Not in local database — search by model" />
              <View style={styles.searchRow}>
                <PrimaryButton
                  label="Search on Shopee"
                  onPress={() => openSearch('shopee', lcdQuery(result, lcdPart))}
                  variant="secondary"
                  style={styles.searchButton}
                />
                <PrimaryButton
                  label="Search on Lazada"
                  onPress={() => openSearch('lazada', lcdQuery(result, lcdPart))}
                  variant="secondary"
                  style={styles.searchButton}
                />
              </View>
            </SectionCard>

            <SectionCard title="Battery">
              <InfoRow label="Battery model" value={batteryPart?.batteryModel} fallback="Not in local database — search by model" />
              <InfoRow label="Part reference" value={batteryPart?.batteryPartNumber} fallback="Not in local database — search by model" />
              <View style={styles.searchRow}>
                <PrimaryButton
                  label="Search on Shopee"
                  onPress={() => openSearch('shopee', batteryQuery(result, batteryPart))}
                  variant="secondary"
                  style={styles.searchButton}
                />
                <PrimaryButton
                  label="Search on Lazada"
                  onPress={() => openSearch('lazada', batteryQuery(result, batteryPart))}
                  variant="secondary"
                  style={styles.searchButton}
                />
              </View>
            </SectionCard>

            <PrimaryButton
              label="Identify Another Phone"
              onPress={() => router.replace('/')}
              variant="outline"
              icon="home-outline"
            />
          </>
        )}
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
    paddingBottom: spacing.xl,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modelName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  modelCode: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    marginBottom: spacing.sm,
  },
  evidence: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  searchButton: {
    flex: 1,
  },
});

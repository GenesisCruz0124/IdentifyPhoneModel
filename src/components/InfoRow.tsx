import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/src/constants/theme';

interface InfoRowProps {
  label: string;
  value?: string;
  fallback?: string;
}

export function InfoRow({ label, value, fallback = 'Not available' }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value && value.trim().length > 0 ? value : fallback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1.4,
    textAlign: 'right',
  },
});

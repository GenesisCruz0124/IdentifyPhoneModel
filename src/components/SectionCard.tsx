import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/src/constants/theme';
import type { PropsWithChildren } from 'react';

interface SectionCardProps {
  title: string;
}

export function SectionCard({ title, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});

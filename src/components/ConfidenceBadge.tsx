import { StyleSheet, Text, View } from 'react-native';
import { confidenceColors, radius, spacing } from '@/src/constants/theme';
import type { Confidence } from '@/src/types';

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const color = confidenceColors[confidence];

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}26` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{confidence.toUpperCase()} CONFIDENCE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

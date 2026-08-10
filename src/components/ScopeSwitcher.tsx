import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { InsightScope } from '../types/insight';
import { colors } from '../theme/tokens';

export const INSIGHT_SCOPES: InsightScope[] = ['global', 'china', 'us', 'japan'];

const LABELS: Record<InsightScope, string> = {
  global: 'WORLD',
  china: 'CHINA',
  us: 'US',
  japan: 'JAPAN',
};

type Props = {
  activeScope: InsightScope;
  onChangeScope: (scope: InsightScope) => void;
};

export function ScopeSwitcher({ activeScope, onChangeScope }: Props) {
  return (
    <View style={styles.row}>
      {INSIGHT_SCOPES.map((scope) => {
        const active = scope === activeScope;
        return (
          <Pressable
            key={scope}
            onPress={() => onChangeScope(scope)}
            style={[styles.item, active && styles.itemActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {LABELS[scope]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  item: {
    borderColor: colors.gray300,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  text: {
    color: colors.gray600,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  textActive: {
    color: colors.white,
  },
});

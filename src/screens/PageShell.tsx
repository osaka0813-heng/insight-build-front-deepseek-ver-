import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  height: number;
  tone?: 'paper' | 'ink';
};

export function PageShell({ children, height, tone = 'paper' }: Props) {
  return (
    <View
      style={[
        styles.page,
        { height },
        tone === 'ink' ? styles.ink : styles.paper,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingBottom: spacing.pageBottom,
    paddingHorizontal: spacing.pageX,
    paddingTop: spacing.pageTop,
    width: '100%',
  },
  paper: {
    backgroundColor: colors.paper,
  },
  ink: {
    backgroundColor: colors.ink,
  },
});

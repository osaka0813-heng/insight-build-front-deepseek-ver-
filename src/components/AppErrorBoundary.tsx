import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../theme/tokens';

type State = {
  failed: boolean;
  message?: string;
};

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { failed: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      failed: true,
      message:
        error instanceof Error
          ? error.message
          : 'The app encountered an unexpected error.',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('[Insight] Unhandled render error:', error);
  }

  private reset = () => {
    this.setState({ failed: false, message: undefined });
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>INSIGHT · RECOVERY</Text>
          <Text style={styles.title}>内容暂时无法显示</Text>
          <Text style={styles.body}>
            已保留设备中的最近可用内容。请重新进入；如果问题持续，再刷新远程内容。
          </Text>
          {this.state.message ? (
            <Text style={styles.error}>{this.state.message}</Text>
          ) : null}
          <Pressable onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>重新进入</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.gray500,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 42,
    marginTop: spacing.md,
  },
  body: {
    color: colors.gray700,
    fontSize: 14,
    lineHeight: 23,
    marginTop: spacing.md,
  },
  error: {
    borderLeftColor: colors.ink,
    borderLeftWidth: 2,
    color: colors.gray600,
    fontSize: 11,
    lineHeight: 18,
    marginTop: spacing.lg,
    paddingLeft: spacing.md,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '900',
  },
});

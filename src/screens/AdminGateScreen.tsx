import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyAdminAccess } from '../engine/adminClient';
import {
  appendEditorialLog,
  loadAdminSession,
  saveAdminSession,
} from '../engine/editorialStorage';
import { colors, spacing } from '../theme/tokens';

type Props = {
  onBack: () => void;
  onVerified: () => void;
};

export function AdminGateScreen({ onBack, onVerified }: Props) {
  const [adminToken, setAdminToken] = useState('');
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadAdminSession()
      .then((session) => {
        if (session) {
          onVerified();
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [onVerified]);

  const verify = async () => {
    setChecking(true);
    setError(undefined);
    try {
      const session = await verifyAdminAccess(adminToken);
      await saveAdminSession(session);
      await appendEditorialLog({
        stage: 'admin',
        level: 'info',
        message: 'Admin console access verified.',
      });
      onVerified();
    } catch (verifyError) {
      const message =
        verifyError instanceof Error
          ? verifyError.message
          : '管理员验证失败。';
      setError(message);
      await appendEditorialLog({
        stage: 'admin',
        level: 'error',
        message,
      });
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.eyebrow}>ADMIN ACCESS</Text>
        <Text style={styles.title}>编辑台验证</Text>
        <Text style={styles.subtitle}>
          这是内部内容生产入口。验证成功后，本设备保持登录 10 分钟。
        </Text>
      </View>

      <View style={styles.content}>
        {checking ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.ink} />
            <Text style={styles.loadingText}>正在验证设备状态…</Text>
          </View>
        ) : (
          <>
            <TextInput
              value={adminToken}
              onChangeText={setAdminToken}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="管理员访问码"
              placeholderTextColor={colors.gray500}
              style={styles.input}
              onSubmitEditing={() => void verify()}
            />
            <Pressable
              onPress={() => void verify()}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>进入 AI 编辑台</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.note}>
              访问码只发送到你的后端验证，不写入 GitHub，也不会保存在设备中。
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.paper, flex: 1 },
  header: {
    borderBottomColor: colors.gray300,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  back: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  eyebrow: {
    color: colors.gray500,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: spacing.xl,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.gray600,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  content: { padding: spacing.xl },
  input: {
    borderColor: colors.gray300,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.ink,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  note: {
    color: colors.gray500,
    fontSize: 11,
    lineHeight: 18,
    marginTop: spacing.lg,
  },
  error: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: spacing.md,
  },
  loading: { alignItems: 'center', paddingTop: spacing.xl },
  loadingText: {
    color: colors.gray600,
    fontSize: 12,
    marginTop: spacing.md,
  },
});

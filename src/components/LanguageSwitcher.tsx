import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import type { LanguageCode } from '../types/insight';
import { colors, spacing, type } from '../theme/tokens';

const options: Array<{
  code: LanguageCode;
  shortLabel: string;
  nativeLabel: string;
}> = [
  { code: 'en', shortLabel: 'EN', nativeLabel: 'English' },
  { code: 'zh', shortLabel: '中', nativeLabel: '简体中文' },
  { code: 'ja', shortLabel: '日', nativeLabel: '日本語' },
];

type Props = {
  inverse?: boolean;
};

export function LanguageSwitcher({ inverse = false }: Props) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);

  const current =
    options.find((option) => option.code === language) ?? options[0]!;

  const selectLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityHint="Opens the language selection menu"
        accessibilityLabel={`${t('language')}: ${current.nativeLabel}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          inverse ? styles.triggerInverse : styles.triggerDefault,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            inverse ? styles.triggerTextInverse : styles.triggerTextDefault,
          ]}
        >
          {current.shortLabel}
        </Text>
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.chevron,
            inverse ? styles.triggerTextInverse : styles.triggerTextDefault,
          ]}
        >
          ▾
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <SafeAreaView style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close language menu"
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.menuPosition}>
            <View
              accessibilityLabel={t('language')}
              accessibilityRole="menu"
              style={styles.menu}
            >
              <Text style={styles.menuTitle}>{t('language')}</Text>

              {options.map((option) => {
                const active = option.code === language;

                return (
                  <Pressable
                    accessibilityRole="menuitem"
                    key={option.code}
                    onPress={() => selectLanguage(option.code)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      active && styles.menuItemActive,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <View style={styles.languageTextGroup}>
                      <Text
                        style={[
                          styles.shortLabel,
                          active && styles.activeText,
                        ]}
                      >
                        {option.shortLabel}
                      </Text>
                      <Text
                        style={[
                          styles.nativeLabel,
                          active && styles.activeText,
                        ]}
                      >
                        {option.nativeLabel}
                      </Text>
                    </View>

                    <Text style={[styles.check, active && styles.checkActive]}>
                      {active ? '✓' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 34,
    justifyContent: 'center',
    minWidth: 52,
    paddingHorizontal: 12,
  },
  triggerDefault: {
    backgroundColor: 'rgba(244,244,240,0.94)',
    borderColor: colors.gray300,
  },
  triggerInverse: {
    backgroundColor: 'rgba(17,17,17,0.9)',
    borderColor: colors.gray600,
  },
  pressed: {
    opacity: 0.72,
  },
  triggerText: {
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  triggerTextDefault: {
    color: colors.ink,
  },
  triggerTextInverse: {
    color: colors.white,
  },
  chevron: {
    fontSize: 9,
    marginLeft: 6,
    marginTop: -1,
  },
  modalRoot: {
    backgroundColor: 'rgba(17,17,17,0.18)',
    flex: 1,
  },
  menuPosition: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  menu: {
    backgroundColor: colors.paperElevated,
    borderColor: colors.gray300,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 210,
    overflow: 'hidden',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  menuTitle: {
    color: colors.gray500,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    paddingTop: 10,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  menuItemActive: {
    backgroundColor: colors.ink,
  },
  menuItemPressed: {
    opacity: 0.72,
  },
  languageTextGroup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  shortLabel: {
    color: colors.gray500,
    fontSize: type.micro,
    fontWeight: '800',
    marginRight: 14,
    width: 24,
  },
  nativeLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  activeText: {
    color: colors.white,
  },
  check: {
    color: 'transparent',
    fontSize: 15,
    fontWeight: '800',
  },
  checkActive: {
    color: colors.white,
  },
});

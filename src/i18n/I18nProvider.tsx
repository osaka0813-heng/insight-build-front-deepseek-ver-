import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { LanguageCode } from '../types/insight';
import { languageLabels, translations, type TranslationKey } from './translations';

const STORAGE_KEY = '@insight/language';
const LANGUAGE_ORDER: LanguageCode[] = ['en', 'zh', 'ja'];

type I18nValue = {
  language: LanguageCode;
  label: string;
  setLanguage: (language: LanguageCode) => void;
  cycleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: React.PropsWithChildren) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'en' || stored === 'zh' || stored === 'ja') {
          setLanguageState(stored);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const cycleLanguage = useCallback(() => {
    const index = LANGUAGE_ORDER.indexOf(language);
    setLanguage(LANGUAGE_ORDER[(index + 1) % LANGUAGE_ORDER.length] ?? 'en');
  }, [language, setLanguage]);

  const value = useMemo<I18nValue>(() => ({
    language,
    label: languageLabels[language],
    setLanguage,
    cycleLanguage,
    t: (key) => translations[language][key],
  }), [cycleLanguage, language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider.');
  return value;
}

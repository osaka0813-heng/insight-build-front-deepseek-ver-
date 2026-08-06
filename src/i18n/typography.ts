import type { LanguageCode } from '../types/insight';

export function languageTypography(language: LanguageCode) {
  if (language === 'en') {
    return {
      displaySize: 42,
      heroSize: 40,
      titleSize: 29,
      displayLetterSpacing: -1.8,
      heroLetterSpacing: -1.5,
      lineHeightMultiplier: 1.13,
    };
  }

  if (language === 'ja') {
    return {
      displaySize: 37,
      heroSize: 35,
      titleSize: 27,
      displayLetterSpacing: 0,
      heroLetterSpacing: 0,
      lineHeightMultiplier: 1.32,
    };
  }

  return {
    displaySize: 39,
    heroSize: 37,
    titleSize: 28,
    displayLetterSpacing: 0,
    heroLetterSpacing: 0,
    lineHeightMultiplier: 1.28,
  };
}

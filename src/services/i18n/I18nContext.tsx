import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LanguageCode, TranslationDictionary } from './types';
import { SUPPORTED_LANGUAGES } from './types';
import { enTranslations } from './translations/en';
import { teTranslations } from './translations/te';
import { taTranslations } from './translations/ta';
import { hiTranslations } from './translations/hi';

const translationsMap: Record<LanguageCode, TranslationDictionary> = {
  en: enTranslations,
  te: teTranslations,
  ta: taTranslations,
  hi: hiTranslations
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const I18N_STORAGE_KEY = 'somnithos_selected_language';

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: enTranslations,
  supportedLanguages: SUPPORTED_LANGUAGES
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY) as LanguageCode | null;
      if (stored && ['en', 'te', 'ta', 'hi'].includes(stored)) {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(I18N_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Storage error fallback
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translationsMap[language] || enTranslations;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  return useContext(I18nContext);
};

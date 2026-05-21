/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Locale } from 'date-fns';
import { bs } from 'date-fns/locale/bs';
import { de } from 'date-fns/locale/de';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';
import { fr } from 'date-fns/locale/fr';
import { hi } from 'date-fns/locale/hi';
import { hu } from 'date-fns/locale/hu';
import { it } from 'date-fns/locale/it';
import { ja } from 'date-fns/locale/ja';
import { nl } from 'date-fns/locale/nl';
import { pl } from 'date-fns/locale/pl';
import { pt } from 'date-fns/locale/pt';
import { ro } from 'date-fns/locale/ro';
import { ru } from 'date-fns/locale/ru';
import { sl } from 'date-fns/locale/sl';
import { th } from 'date-fns/locale/th';
import { tr } from 'date-fns/locale/tr';
import { vi } from 'date-fns/locale/vi';
import { zhCN } from 'date-fns/locale/zh-CN';
import type { TFunction } from 'i18next';
import { useEffect, useSyncExternalStore } from 'react';

export type SupportedLocaleCode =
  | 'bs'
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ky'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sl'
  | 'th'
  | 'tr'
  | 'vi'
  | 'zh_CN';

export type LocaleDescriptor = {
  key: string;
  nativeName: string;
  defaultValue: string;
  value: SupportedLocaleCode;
  dateFnsLocale?: Locale;
  tinymceLocale?: string;
};

export type LocaleSelectItem = {
  label: string;
  value: SupportedLocaleCode;
};

const FALLBACK_SUPPORTED_LOCALES: SupportedLocaleCode[] = ['en'];

export const LOCALE_REGISTRY: Record<SupportedLocaleCode, LocaleDescriptor> = {
  zh_CN: {
    key: 'locale.label_chinese',
    nativeName: '中文 (中国)',
    defaultValue: 'Chinese - {{value}}',
    value: 'zh_CN',
    dateFnsLocale: zhCN,
    tinymceLocale: 'zh-Hans',
  },
  nl: {
    key: 'locale.label_dutch',
    nativeName: 'Nederlands',
    defaultValue: 'Dutch - {{value}}',
    value: 'nl',
    dateFnsLocale: nl,
  },
  en: {
    key: 'locale.label_english',
    nativeName: 'English',
    defaultValue: 'English - {{value}}',
    value: 'en',
    dateFnsLocale: enUS,
  },
  de: {
    key: 'locale.label_german',
    nativeName: 'Deutsch',
    defaultValue: 'German - {{value}}',
    value: 'de',
    dateFnsLocale: de,
  },
  hi: {
    key: 'locale.label_hindi',
    nativeName: 'हिंदी',
    defaultValue: 'Hindi - {{value}}',
    value: 'hi',
    dateFnsLocale: hi,
  },
  hu: {
    key: 'locale.label_hungarian',
    nativeName: 'Magyar',
    defaultValue: 'Hungarian - {{value}}',
    value: 'hu',
    dateFnsLocale: hu,
    tinymceLocale: 'hu_HU',
  },
  id: {
    key: 'locale.label_indonesian',
    nativeName: 'Bahasa Indonesia',
    defaultValue: 'Indonesian - {{value}}',
    value: 'id',
  },
  it: {
    key: 'locale.label_italian',
    nativeName: 'italiano',
    defaultValue: 'Italian - {{value}}',
    value: 'it',
    dateFnsLocale: it,
  },
  ja: {
    key: 'locale.label_japanese',
    nativeName: '日本語',
    defaultValue: 'Japanese - {{value}}',
    value: 'ja',
    dateFnsLocale: ja,
  },
  ky: {
    key: 'locale.label_kyrgyz',
    nativeName: 'Кыргызча',
    defaultValue: 'Kyrgyz - {{value}}',
    value: 'ky',
  },
  pt: {
    key: 'locale.label_portuguese',
    nativeName: 'português',
    defaultValue: 'Portuguese - {{value}}',
    value: 'pt',
    dateFnsLocale: pt,
    tinymceLocale: 'pt_BR',
  },
  pl: {
    key: 'locale.label_polish',
    nativeName: 'polski',
    defaultValue: 'Polish - {{value}}',
    value: 'pl',
    dateFnsLocale: pl,
  },
  ro: {
    key: 'locale.label_romanian',
    nativeName: 'română',
    defaultValue: 'Romanian - {{value}}',
    value: 'ro',
    dateFnsLocale: ro,
  },
  ru: {
    key: 'locale.label_russian',
    nativeName: 'русский',
    defaultValue: 'Russian - {{value}}',
    value: 'ru',
    dateFnsLocale: ru,
  },
  es: {
    key: 'locale.label_spanish',
    nativeName: 'español',
    defaultValue: 'Spanish - {{value}}',
    value: 'es',
    dateFnsLocale: es,
  },
  th: {
    key: 'locale.label_thai',
    nativeName: 'ไทย',
    defaultValue: 'Thai - {{value}}',
    value: 'th',
    dateFnsLocale: th,
    tinymceLocale: 'th_TH',
  },
  tr: {
    key: 'locale.label_turkish',
    nativeName: 'Türkçe',
    defaultValue: 'Turkish - {{value}}',
    value: 'tr',
    dateFnsLocale: tr,
  },
  fr: {
    key: 'locale.label_french',
    nativeName: 'français',
    defaultValue: 'French - {{value}}',
    value: 'fr',
    dateFnsLocale: fr,
    tinymceLocale: 'fr_FR',
  },
  vi: {
    key: 'locale.label_vietnamese',
    nativeName: 'Tiếng Việt',
    defaultValue: 'Vietnamese - {{value}}',
    value: 'vi',
    dateFnsLocale: vi,
  },
  bs: {
    key: 'locale.label_bosnian',
    nativeName: 'Bosanski',
    defaultValue: 'Bosnian - {{value}}',
    value: 'bs',
    dateFnsLocale: bs,
  },
  sl: {
    key: 'locale.label_slovenian',
    nativeName: 'Slovenščina',
    defaultValue: 'Slovenian - {{value}}',
    value: 'sl',
    dateFnsLocale: sl,
    tinymceLocale: 'sl_SI',
  },
} as const;

export const SUPPORTED_LOCALES = LOCALE_REGISTRY;

let supportedLocaleCodes: SupportedLocaleCode[] = FALLBACK_SUPPORTED_LOCALES;
let manifestLoad: Promise<SupportedLocaleCode[]> | undefined;
const subscribers = new Set<() => void>();

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

const isKnownLocaleCode = (value: unknown): value is SupportedLocaleCode =>
  typeof value === 'string' && value in LOCALE_REGISTRY;

const normalizeSupportedLocales = (manifest: unknown): SupportedLocaleCode[] => {
  if (!Array.isArray(manifest)) return FALLBACK_SUPPORTED_LOCALES;

  const knownCodes = manifest.filter(isKnownLocaleCode);
  return knownCodes.length > 0 ? Array.from(new Set(knownCodes)) : FALLBACK_SUPPORTED_LOCALES;
};

const notifySubscribers = (): void => {
  subscribers.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
};

const getSupportedLocaleCodes = (): SupportedLocaleCode[] => supportedLocaleCodes;

export const loadSupportedLocales = async (): Promise<SupportedLocaleCode[]> => {
  manifestLoad ??= fetch(`${BASE_PATH}i18n/supported-locales.json`)
    .then((response) => {
      if (!response.ok) return FALLBACK_SUPPORTED_LOCALES;
      return response.json();
    })
    .then(normalizeSupportedLocales)
    .catch(() => FALLBACK_SUPPORTED_LOCALES)
    .then((codes) => {
      supportedLocaleCodes = codes;
      notifySubscribers();
      return codes;
    });

  return manifestLoad;
};

export const createLocaleSelectItem = (
  descriptor: LocaleDescriptor,
  t: TFunction,
): LocaleSelectItem => ({
  label: t(descriptor.key, {
    value: descriptor.nativeName,
    defaultValue: descriptor.defaultValue,
  }),
  value: descriptor.value,
});

export const sortLocaleSelectItems = <T extends { label: string; value: string }>(items: T[]): T[] =>
  items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const labelOrder = collator.compare(left.item.label, right.item.label);
      if (labelOrder !== 0) return labelOrder;
      return left.index - right.index;
    })
    .map(({ item }) => item);

export const localeList = (t: TFunction): LocaleSelectItem[] =>
  sortLocaleSelectItems(
    getSupportedLocaleCodes().map((code) => createLocaleSelectItem(LOCALE_REGISTRY[code], t)),
  );

export const useLocaleList = (t: TFunction): LocaleSelectItem[] => {
  useEffect(() => {
    void loadSupportedLocales();
  }, []);

  useSyncExternalStore(subscribe, getSupportedLocaleCodes, getSupportedLocaleCodes);

  return localeList(t);
};


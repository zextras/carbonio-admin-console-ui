/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
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

type LocaleDescriptor = {
  name: string;
  value: string;
  dateFnsLocale?: Locale;
  tinymceLocale?: string;
};

export const SUPPORTED_LOCALES: Record<string, LocaleDescriptor> = {
  zh_CN: {
    name: '中文 (中国)',
    value: 'zh_CN',
    dateFnsLocale: zhCN,
    tinymceLocale: 'zh-Hans',
  },
  nl: {
    name: 'Nederlands',
    value: 'nl',
    dateFnsLocale: nl,
  },
  en: {
    name: 'English',
    value: 'en',
    dateFnsLocale: enUS,
  },
  de: {
    name: 'Deutsch',
    value: 'de',
    dateFnsLocale: de,
  },
  hi: {
    name: 'हिंदी',
    value: 'hi',
    dateFnsLocale: hi,
  },
  hu: {
    name: 'Magyar',
    value: 'hu',
    dateFnsLocale: hu,
    tinymceLocale: 'hu_HU',
  },
  it: {
    name: 'italiano',
    value: 'it',
    dateFnsLocale: it,
  },
  ja: {
    name: '日本語',
    value: 'ja',
    dateFnsLocale: ja,
  },
  pt: {
    name: 'português',
    value: 'pt',
    dateFnsLocale: pt,
    tinymceLocale: 'pt_BR',
  },
  pl: {
    name: 'polski',
    value: 'pl',
    dateFnsLocale: pl,
  },
  ro: {
    name: 'română',
    value: 'ro',
    dateFnsLocale: ro,
  },
  ru: {
    name: 'русский',
    value: 'ru',
    dateFnsLocale: ru,
  },
  es: {
    name: 'español',
    value: 'es',
    dateFnsLocale: es,
  },
  th: {
    name: 'ไทย',
    value: 'th',
    dateFnsLocale: th,
    tinymceLocale: 'th_TH',
  },
  tr: {
    name: 'Türkçe',
    value: 'tr',
    dateFnsLocale: tr,
  },
  fr: {
    name: 'français',
    value: 'fr',
    dateFnsLocale: fr,
    tinymceLocale: 'fr_FR',
  },
  vi: {
    name: 'Tiếng Việt',
    value: 'vi',
    dateFnsLocale: vi,
  },
  bs: {
    name: 'Bosanski',
    value: 'bs',
    dateFnsLocale: bs,
  },
  sl: {
    name: 'Slovenščina',
    value: 'sl',
    dateFnsLocale: sl,
    tinymceLocale: 'sl_SI',
  },
} as const;

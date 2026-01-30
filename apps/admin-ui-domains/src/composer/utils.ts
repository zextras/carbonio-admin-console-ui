/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Locale } from 'date-fns';

type LocaleDescriptor = {
  name: string;
  value: string;
  loadDateFnsLocale?: () => Promise<Locale>;
  tinymceLocale?: string;
};

const dfnsLocale = (name: string) => (): Promise<Locale> =>
  import(`date-fns/locale/${name}`).then((m) => m.default ?? m[Object.keys(m)[0]]);

export const SUPPORTED_LOCALES: Record<string, LocaleDescriptor> = {
  zh_CN: {
    name: '中文 (中国)',
    value: 'zh_CN',
    loadDateFnsLocale: dfnsLocale('zh-CN'),
    tinymceLocale: 'zh-Hans',
  },
  nl: {
    name: 'Nederlands',
    value: 'nl',
    loadDateFnsLocale: dfnsLocale('nl'),
  },
  en: {
    name: 'English',
    value: 'en',
    loadDateFnsLocale: dfnsLocale('en-US'),
  },
  de: {
    name: 'Deutsch',
    value: 'de',
    loadDateFnsLocale: dfnsLocale('de'),
  },
  hi: {
    name: 'हिंदी',
    value: 'hi',
    loadDateFnsLocale: dfnsLocale('hi'),
  },
  hu: {
    name: 'Magyar',
    value: 'hu',
    loadDateFnsLocale: dfnsLocale('hu'),
    tinymceLocale: 'hu_HU',
  },
  it: {
    name: 'italiano',
    value: 'it',
    loadDateFnsLocale: dfnsLocale('it'),
  },
  ja: {
    name: '日本語',
    value: 'ja',
    loadDateFnsLocale: dfnsLocale('ja'),
  },
  pt: {
    name: 'português',
    value: 'pt',
    loadDateFnsLocale: dfnsLocale('pt'),
    tinymceLocale: 'pt_BR',
  },
  pl: {
    name: 'polski',
    value: 'pl',
    loadDateFnsLocale: dfnsLocale('pl'),
  },
  ro: {
    name: 'română',
    value: 'ro',
    loadDateFnsLocale: dfnsLocale('ro'),
  },
  ru: {
    name: 'русский',
    value: 'ru',
    loadDateFnsLocale: dfnsLocale('ru'),
  },
  es: {
    name: 'español',
    value: 'es',
    loadDateFnsLocale: dfnsLocale('es'),
  },
  th: {
    name: 'ไทย',
    value: 'th',
    loadDateFnsLocale: dfnsLocale('th'),
    tinymceLocale: 'th_TH',
  },
  tr: {
    name: 'Türkçe',
    value: 'tr',
    loadDateFnsLocale: dfnsLocale('tr'),
  },
  fr: {
    name: 'français',
    value: 'fr',
    loadDateFnsLocale: dfnsLocale('fr'),
    tinymceLocale: 'fr_FR',
  },
  vi: {
    name: 'Tiếng Việt',
    value: 'vi',
    loadDateFnsLocale: dfnsLocale('vi'),
  },
  ky: {
    name: 'Кыргызча',
    value: 'ky',
    // No date-fns locale available
  },
  bs: {
    name: 'Bosanski',
    value: 'bs',
    loadDateFnsLocale: dfnsLocale('bs'),
  },
  sl: {
    name: 'Slovenščina',
    value: 'sl',
    loadDateFnsLocale: dfnsLocale('sl'),
    tinymceLocale: 'sl_SI',
  },
} as const;

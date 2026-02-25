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

export const getFontSizesOptions = (): string[] => [
  '8pt',
  '9pt',
  '10pt',
  '11pt',
  '12pt',
  '13pt',
  '14pt',
  '16pt',
  '18pt',
  '24pt',
  '36pt',
  '48pt',
];
export function generateToolbarConfig(inline: boolean): string | false {
  if (inline) {
    return false;
  }

  return [
    // Font and style controls
    'fontfamily fontsize styles forecolor backcolor',
    // Text formatting
    'bold italic underline strikethrough removeformat',
    // Alignment and direction
    'alignleft aligncenter alignright alignjustify ltr rtl',
    // Lists and indentation
    'bullist numlist outdent indent',
    // Insert elements
    'link table insertfile image imageSelector',
    // View and blocks
    'visualblocks code',
  ].join(' | ');
}
export function generateQuickBarsConfig(inline: boolean): {
  quickbars_insert_toolbar: string;
  quickbars_selection_toolbar: string;
} {
  return {
    quickbars_insert_toolbar: inline ? 'bullist numlist' : '',
    quickbars_selection_toolbar: inline
      ? 'bold italic underline | forecolor backcolor | removeformat | link'
      : 'link',
  };
}
export const getFonts = (): { label: string; value: string }[] => [
  {
    label: 'Andale Mono',
    value: 'andale mono, times',
  },
  {
    label: 'Arial',
    value: 'arial, helvetica, sans-serif',
  },
  {
    label: 'Arial Black',
    value: 'arial black, avant garde',
  },
  {
    label: 'Book Antiqua',
    value: 'book antiqua, palatino',
  },
  {
    label: 'Comic Sans MS',
    value: 'comic sans ms, sans-serif',
  },
  {
    label: 'Courier New',
    value: 'courier new, courier',
  },
  {
    label: 'Georgia',
    value: 'georgia, palatino',
  },
  {
    label: 'Helvetica',
    value: 'helvetica',
  },
  {
    label: 'Impact',
    value: 'impact, chicago',
  },
  {
    label: 'Symbol',
    value: 'symbol',
  },
  {
    label: 'Tahoma',
    value: 'tahoma, arial, helvetica, sans-serif',
  },
  {
    label: 'Terminal',
    value: 'terminal, monaco',
  },
  {
    label: 'Times New Roman',
    value: 'times new roman, times',
  },
  {
    label: 'Trebuchet MS',
    value: 'trebuchet ms, geneva',
  },
  {
    label: 'Verdana',
    value: 'verdana, geneva',
  },
  {
    label: 'Webdings',
    value: 'webdings',
  },
  {
    label: 'Wingdings',
    value: 'wingdings, zapf dingbats',
  },
];

export const DEFAULT_FONT_SIZE_FORMATS =
  '8pt 9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt';

/**
 * Default plugins for TinyMCE editor
 */
export const DEFAULT_PLUGINS = [
  'advlist',
  'autolink',
  'lists',
  'link',
  'image',
  'charmap',
  'preview',
  'anchor',
  'searchreplace',
  'code',
  'fullscreen',
  'insertdatetime',
  'media',
  'table',
  'code',
  'help',
  'quickbars',
  'directionality',
  'autoresize',
  'visualblocks',
];

/**
 * Default style formats for TinyMCE editor
 */
export const DEFAULT_STYLE_FORMATS = [
  {
    title: 'Headers',
    items: [
      { title: 'h1', block: 'h1' },
      { title: 'h2', block: 'h2' },
      { title: 'h3', block: 'h3' },
      { title: 'h4', block: 'h4' },
      { title: 'h5', block: 'h5' },
      { title: 'h6', block: 'h6' },
    ],
  },
  {
    title: 'Blocks',
    items: [
      { title: 'p', block: 'p' },
      { title: 'div', block: 'div' },
      { title: 'pre', block: 'pre' },
    ],
  },
  {
    title: 'Containers',
    items: [
      { title: 'section', block: 'section', wrapper: true, merge_siblings: false },
      { title: 'article', block: 'article', wrapper: true, merge_siblings: false },
      { title: 'blockquote', block: 'blockquote', wrapper: true },
      { title: 'hgroup', block: 'hgroup', wrapper: true },
      { title: 'aside', block: 'aside', wrapper: true },
      { title: 'figure', block: 'figure', wrapper: true },
    ],
  },
];

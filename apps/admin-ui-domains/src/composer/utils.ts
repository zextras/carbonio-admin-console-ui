/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export { SUPPORTED_LOCALES } from '@zextras/ui-i18n';

export function generateToolbarConfig(): string | false {
  return [
    'fontfamily fontsize styles forecolor backcolor',
    'bold italic underline strikethrough removeformat',
    'alignleft aligncenter alignright alignjustify ltr rtl',
    'bullist numlist outdent indent',
    'link table insertfile image imageSelector',
    'visualblocks code',
  ].join(' | ');
}

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

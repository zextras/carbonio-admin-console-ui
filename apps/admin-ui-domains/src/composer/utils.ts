/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Locale } from 'date-fns';

type LocaleDescriptor = {
	name: string;
	value: string;
	// Import of the date-fns translation file
	dateFnsLocale: { key?: string; localeImportPath: () => Promise<Locale> } | undefined;
	/*
	 * Name of the tinymce translation file if different from the value field.
	 * See https://www.tiny.cloud/docs/tinymce/6/ui-localization/
	 * and https://www.tiny.cloud/get-tiny/language-packages/
	 */
	tinymceLocale?: string;
};

export const SUPPORTED_LOCALES: Record<string, LocaleDescriptor> = {
	zh_CN: {
		name: '中文 (中国)',
		value: 'zh_CN',
		dateFnsLocale: {
			key: 'zh-CN',
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "zh-CN" */ import('date-fns/locale/zh-CN').then(
					(mod) => (mod as unknown as Record<string, Locale>).zhCN ?? mod.default ?? (mod as unknown as Locale)
				)
		},
		tinymceLocale: 'zh-Hans'
	},
	nl: {
		name: 'Nederlands',
		value: 'nl',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "nl" */ import('date-fns/locale/nl').then(
					(mod) => (mod as unknown as Record<string, Locale>).nl ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	en: {
		name: 'English',
		value: 'en',
		dateFnsLocale: {
			key: 'en-US',
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "en-US" */ import('date-fns/locale/en-US').then(
					(mod) => (mod as unknown as Record<string, Locale>).enUS ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	de: {
		name: 'Deutsch',
		value: 'de',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "de" */ import('date-fns/locale/de').then(
					(mod) => (mod as unknown as Record<string, Locale>).de ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	hi: {
		name: 'हिंदी',
		value: 'hi',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "hi" */ import('date-fns/locale/hi').then(
					(mod) => (mod as unknown as Record<string, Locale>).hi ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	hu: {
		name: 'Magyar',
		value: 'hu',
		tinymceLocale: 'hu_HU',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "hu" */ import('date-fns/locale/hu').then(
					(mod) => (mod as unknown as Record<string, Locale>).hu ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	it: {
		name: 'italiano',
		value: 'it',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "it" */ import('date-fns/locale/it').then(
					(mod) => (mod as unknown as Record<string, Locale>).it ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	ja: {
		name: '日本語',
		value: 'ja',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ja" */ import('date-fns/locale/ja').then(
					(mod) => (mod as unknown as Record<string, Locale>).ja ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},

	pt: {
		name: 'português',
		value: 'pt',
		tinymceLocale: 'pt_BR',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "pt" */ import('date-fns/locale/pt').then(
					(mod) => (mod as unknown as Record<string, Locale>).pt ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	pl: {
		name: 'polski',
		value: 'pl',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "pl" */ import('date-fns/locale/pl').then(
					(mod) => (mod as unknown as Record<string, Locale>).pl ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},

	ro: {
		name: 'română',
		value: 'ro',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ro" */ import('date-fns/locale/ro').then(
					(mod) => (mod as unknown as Record<string, Locale>).ro ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	ru: {
		name: 'русский',
		value: 'ru',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ru" */ import('date-fns/locale/ru').then(
					(mod) => (mod as unknown as Record<string, Locale>).ru ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	es: {
		name: 'español',
		value: 'es',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "es" */ import('date-fns/locale/es').then(
					(mod) => (mod as unknown as Record<string, Locale>).es ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	th: {
		name: 'ไทย',
		value: 'th',
		tinymceLocale: 'th_TH',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "th" */ import('date-fns/locale/th').then(
					(mod) => (mod as unknown as Record<string, Locale>).th ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	tr: {
		name: 'Türkçe',
		value: 'tr',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "tr" */ import('date-fns/locale/tr').then(
					(mod) => (mod as unknown as Record<string, Locale>).tr ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	fr: {
		name: 'français',
		value: 'fr',
		tinymceLocale: 'fr_FR',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "fr" */ import('date-fns/locale/fr').then(
					(mod) => (mod as unknown as Record<string, Locale>).fr ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	vi: {
		name: 'Tiếng Việt',
		value: 'vi',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "vi" */ import('date-fns/locale/vi').then(
					(mod) => (mod as unknown as Record<string, Locale>).vi ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	ky: {
		name: 'Кыргызча',
		value: 'ky',
		dateFnsLocale: undefined
	},
	bs: {
		name: 'Bosanski',
		value: 'bs',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "bs" */ import('date-fns/locale/bs').then(
					(mod) => (mod as unknown as Record<string, Locale>).bs ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	},
	sl: {
		name: 'Slovenščina',
		value: 'sl',
		tinymceLocale: 'sl_SI',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "sl" */ import('date-fns/locale/sl').then(
					(mod) => (mod as unknown as Record<string, Locale>).sl ?? mod.default ?? (mod as unknown as Locale)
				)
		}
	}
} as const;

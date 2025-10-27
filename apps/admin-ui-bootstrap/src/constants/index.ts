/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DynamicThemeFix } from 'darkreader';
import type { Locale } from 'date-fns';

export const SHELL_APP_ID = 'carbonio-admin-ui';
export const SEARCH_APP_ID = 'search';
export const ACTION_TYPES = {
	CONVERSATION: 'conversation',
	CONVERSATION_lIST: 'conversation_list',
	MESSAGE: 'message',
	MESSAGE_lIST: 'message_list',
	CONTACT: 'contact',
	CONTACT_lIST: 'contact_list',
	INVITE: 'invite',
	INVITE_lIST: 'invite_list',
	APPOINTMENT: 'appointment',
	APPOINTMENT_lIST: 'appointment_list',
	FOLDER: 'folder',
	FOLDER_lIST: 'folder_list',
	CALENDAR: 'calendar',
	CALENDAR_lIST: 'calendar_list',
	NEW: 'new'
};

export const darkReaderDynamicThemeFixes: DynamicThemeFix = {
	ignoreImageAnalysis: ['.no-dr-invert *'],
	invert: [],
	css: `
		.tox, .force-white-bg, .tox-swatches-menu, .tox .tox-edit-area__iframe {
			background-color: #fff !important;
			background: #fff !important;
		}
	`,
	ignoreInlineStyle: ['.tox-menu *'],
	disableStyleSheetsProxy: false
};

export const BASENAME = `/carbonioAdmin`;

export const EMAIL_VALIDATION_REGEX =
	/(^|\s)([\p{L}\p{N}._%+-]+@(?:[\p{L}\p{N}.-]+\.[\p{L}\p{N}]{2,}|\[[^\]\s<>]+\]))/gu;

export const CARBONIO_HELP_ADMIN_URL = 'https://docs.zextras.com/carbonio-ce/html/management.html';
export const CARBONIO_HELP_ADVANCED_URL =
	'https://docs.zextras.com/carbonio/html/administration.html';

export const DARK_READER_VALUES = ['auto', 'enabled', 'disabled'] as const;
export const LOGIN_V3_CONFIG_PATH = '/zx/login/v3/config';
export const DARK_READER_PROP_KEY = 'zappDarkreaderMode';
export const CARBONIO_LOGO_URL = 'https://www.zextras.com';
export const LOCAL_STORAGE_LAST_PRIMARY_KEY = 'config';
export const SCALING_OPTIONS = [
	{ value: 75, label: 'xs' },
	{ value: 87.5, label: 's' },
	{ value: 100, label: 'm' },
	{ value: 112.5, label: 'l' },
	{ value: 125, label: 'xl' }
] as const;
export const BASE_FONT_SIZE = 100;
export const SCALING_LIMIT = {
	WIDTH: 1400,
	HEIGHT: 900,
	DPR: 2 // device pixel ratio
} as const;
export const SEND_FEEDBACK_URL =
	'https://docs.zextras.com/carbonio/html/general.html#seeking-help-on-product';
export const FORUM_URL = 'https://community.zextras.com/forum/';
export const OPEN_TICKET_URL = 'https://helpdesk.zextras.com/hc/en-us';
export const CONFIG = 'config';
export const CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE = 'carbonioAdminDocumentationUrl';
export const CARBONIO_CE_ADMIN_DOCUMENTATION_URL =
	'https://docs.zextras.com/carbonio-ce/html/index.html';
export const CONTENT = '_content';
export const TRUE = 'TRUE';

export type LocaleDescriptor = {
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
					({ zhCN }) => zhCN
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
					({ nl }) => nl
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
					({ enUS }) => enUS
				)
		}
	},
	de: {
		name: 'Deutsch',
		value: 'de',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "de" */ import('date-fns/locale/de').then(
					({ de }) => de
				)
		}
	},
	hi: {
		name: 'हिंदी',
		value: 'hi',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "hi" */ import('date-fns/locale/hi').then(
					({ hi }) => hi
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
					({ hu }) => hu
				)
		}
	},
	it: {
		name: 'italiano',
		value: 'it',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "it" */ import('date-fns/locale/it').then(
					({ it }) => it
				)
		}
	},
	ja: {
		name: '日本語',
		value: 'ja',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ja" */ import('date-fns/locale/ja').then(
					({ ja }) => ja
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
					({ pt }) => pt
				)
		}
	},
	pl: {
		name: 'polski',
		value: 'pl',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "pl" */ import('date-fns/locale/pl').then(
					({ pl }) => pl
				)
		}
	},

	ro: {
		name: 'română',
		value: 'ro',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ro" */ import('date-fns/locale/ro').then(
					({ ro }) => ro
				)
		}
	},
	ru: {
		name: 'русский',
		value: 'ru',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "ru" */ import('date-fns/locale/ru').then(
					({ ru }) => ru
				)
		}
	},
	es: {
		name: 'español',
		value: 'es',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "es" */ import('date-fns/locale/es').then(
					({ es }) => es
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
					({ th }) => th
				)
		}
	},
	tr: {
		name: 'Türkçe',
		value: 'tr',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "tr" */ import('date-fns/locale/tr').then(
					({ tr }) => tr
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
					({ fr }) => fr
				)
		}
	},
	vi: {
		name: 'Tiếng Việt',
		value: 'vi',
		dateFnsLocale: {
			localeImportPath: () =>
				/* webpackMode: "lazy", webpackChunkName: "vi" */ import('date-fns/locale/vi').then(
					({ vi }) => vi
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
					({ bs }) => bs
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
					({ sl }) => sl
				)
		}
	}
} as const;

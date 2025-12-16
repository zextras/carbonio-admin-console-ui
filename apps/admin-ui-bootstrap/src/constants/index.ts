/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

export const BASENAME = `/carbonioAdmin`;

export const CARBONIO_HELP_ADMIN_URL = 'https://docs.zextras.com/carbonio-ce/html/management.html';
export const CARBONIO_HELP_ADVANCED_URL =
	'https://docs.zextras.com/carbonio/html/administration.html';

export const LOGIN_V3_CONFIG_PATH = '/zx/login/v3/config';
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
export const ZIMBRA_ADMIN_URN = 'urn:zimbraAdmin';

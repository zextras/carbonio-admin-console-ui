/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidHexColor } from '../../../utility/utils';

const optionalString = z.string().optional();

const optionalHexColor = z
	.string()
	.refine((v) => !v || isValidHexColor(v), {
		message: 'domain.validation.invalid_hex_color'
	})
	.optional();

export const themeSchema = z.object({
	carbonioWebUiDarkMode: z.union([z.boolean(), z.string()]).optional(),
	carbonioWebUiLoginLogo: optionalString,
	carbonioWebUiDarkLoginLogo: optionalString,
	carbonioWebUiLoginBackground: optionalString,
	carbonioWebUiDarkLoginBackground: optionalString,
	carbonioWebUiAppLogo: optionalString,
	carbonioWebUiDarkAppLogo: optionalString,
	carbonioWebUiFavicon: optionalString,
	carbonioWebUiTitle: optionalString,
	carbonioWebUiDescription: optionalString,
	carbonioAdminUiLoginLogo: optionalString,
	carbonioAdminUiDarkLoginLogo: optionalString,
	carbonioAdminUiAppLogo: optionalString,
	carbonioAdminUiDarkAppLogo: optionalString,
	carbonioAdminUiBackground: optionalString,
	carbonioAdminUiDarkBackground: optionalString,
	carbonioAdminUiFavicon: optionalString,
	carbonioAdminUiTitle: optionalString,
	carbonioAdminUiDescription: optionalString,
	carbonioLogoUrl: optionalString,
	carbonioWebUiPrimaryColor: optionalHexColor,
	carbonioWebUiDarkPrimaryColor: optionalHexColor,
	carbonioWebUILoginURL: optionalString,
	carbonioWebUILogoutURL: optionalString,
	carbonioAdminUILoginURL: optionalString,
	carbonioAdminUILogoutURL: optionalString,
	carbonioAdminDocumentationUrl: optionalString
});

export type ThemeFormValues = z.infer<typeof themeSchema>;

export const THEME_DEFAULTS: ThemeFormValues = {};

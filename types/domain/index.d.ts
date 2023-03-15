/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../attribute';

export type Domain = {
	id?: string;
	name?: string;
	a?: Array<Attribute>;
};

export interface ICertificateContent {
	fileName: string;
	content: string;
}

export type themeConfigStore = {
	carbonioWebUiDarkMode?: boolean;
	carbonioWebUiLoginLogo?: string;
	carbonioWebUiDarkLoginLogo?: string;
	carbonioWebUiLoginBackground?: string;
	carbonioWebUiDarkLoginBackground?: string;
	carbonioWebUiAppLogo?: string;
	carbonioWebUiDarkAppLogo?: string;
	carbonioWebUiFavicon?: string;
	carbonioWebUiTitle?: string;
	carbonioWebUiDescription?: string;
	carbonioAdminUiLoginLogo?: string;
	carbonioAdminUiDarkLoginLogo?: string;
	carbonioAdminUiAppLogo?: string;
	carbonioAdminUiDarkAppLogo?: string;
	carbonioAdminUiBackground?: string;
	carbonioAdminUiDarkBackground?: string;
	carbonioAdminUiFavicon?: string;
	carbonioAdminUiTitle?: string;
	carbonioAdminUiDescription?: string;
	carbonioLogoUrl?: string;
};

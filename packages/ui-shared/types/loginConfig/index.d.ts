/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type LoginConfigStore = {
	carbonioWebUiDarkMode?: boolean;
	carbonioAdminUiAppLogo?: string;
	carbonioAdminUiDarkAppLogo?: string;
	carbonioAdminUiTitle?: string;
	carbonioAdminUiFavicon?: string;
	carbonioLogoURL?: string;
	carbonioWebUiPrimaryColor?: string;
	carbonioWebUiDarkPrimaryColor?: string;
	carbonioAdminUiLogoutURL?: string;
	carbonioWebUiFavicon?: string;
	featureFlags: { enforceSubscriptionRequirements: boolean } | null;
};

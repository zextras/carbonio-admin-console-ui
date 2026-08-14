/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidLdapBaseUrl } from '../../../utility/utils';

export const authenticationSchema = z.object({
	zimbraAuthMech: z.string().optional(),
	zimbraPasswordChangeListener: z.string(),
	zimbraAuthFallbackToLocal: z.boolean(),
	zimbraAuthLdapURL: z.string().refine(
		(v) => v === '' || isValidLdapBaseUrl(v),
		{ message: 'domain.validation.invalid_ldap_url' }
	),
	zimbraAuthLdapSearchBindDn: z.string(),
	zimbraAuthLdapSearchBindPassword: z.string(),
	zimbraAuthLdapStartTlsEnabled: z.boolean(),
	zimbraAuthLdapSearchFilter: z.string(),
	zimbraAuthLdapSearchBase: z.string(),
	zimbraFeatureResetPasswordStatus: z.boolean(),
	zimbraId: z.string()
});

export type AuthenticationFormValues = z.infer<typeof authenticationSchema>;

export const AUTHENTICATION_DEFAULTS: AuthenticationFormValues = {
	zimbraAuthMech: '',
	zimbraPasswordChangeListener: '',
	zimbraAuthFallbackToLocal: false,
	zimbraAuthLdapURL: '',
	zimbraAuthLdapSearchBindDn: '',
	zimbraAuthLdapSearchBindPassword: '',
	zimbraAuthLdapStartTlsEnabled: false,
	zimbraAuthLdapSearchFilter: '',
	zimbraAuthLdapSearchBase: '',
	zimbraFeatureResetPasswordStatus: false,
	zimbraId: ''
};

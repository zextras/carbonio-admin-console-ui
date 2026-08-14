/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

const pollingUnitSchema = z.enum(['d', 'h', 'm', 's']);

const pollingIntervalSchema = z.object({
	value: z.string(),
	unit: pollingUnitSchema
});

export const galSettingsSchema = z.object({
	zimbraId: z.string(),
	galMode: z.enum(['zimbra', 'ldap', 'both']),
	maxResults: z.string(),
	ldapPageSize: z.string(),
	ldapUrl: z.string(),
	ldapStartTlsEnabled: z.boolean(),
	ldapSearchBase: z.string(),
	ldapFilter: z.string(),
	ldapBindDn: z.string(),
	ldapBindPassword: z.string(),
	ldapAuthMech: z.enum(['none', 'simple']),
	galPollingInterval: pollingIntervalSchema,
	galAccountId: z.string()
});

export type GalSettingsFormValues = z.infer<typeof galSettingsSchema>;

export const GAL_SETTINGS_DEFAULTS: GalSettingsFormValues = {
	zimbraId: '',
	galMode: 'zimbra',
	maxResults: '',
	ldapPageSize: '',
	ldapUrl: '',
	ldapStartTlsEnabled: false,
	ldapSearchBase: '',
	ldapFilter: '',
	ldapBindDn: '',
	ldapBindPassword: '',
	ldapAuthMech: 'none',
	galPollingInterval: { value: '1', unit: 'm' },
	galAccountId: ''
};

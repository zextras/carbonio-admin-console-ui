/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

export const disclaimerSchema = z.object({
	zimbraDomainMandatoryMailSignatureEnabled: z.boolean(),
	zimbraAmavisDomainDisclaimerText: z.string(),
	zimbraAmavisDomainDisclaimerHTML: z.string()
});

export type DisclaimerFormValues = z.infer<typeof disclaimerSchema>;

export const DISCLAIMER_DEFAULTS: DisclaimerFormValues = {
	zimbraDomainMandatoryMailSignatureEnabled: false,
	zimbraAmavisDomainDisclaimerText: '',
	zimbraAmavisDomainDisclaimerHTML: ''
};

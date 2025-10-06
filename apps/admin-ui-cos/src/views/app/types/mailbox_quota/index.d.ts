/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MailBoxQuota = {
	name: string;
	mailsQuota: string;
	mailsQuotaUsed: string;
	mailsQuotaUsedPercentage: string;
	filesQuota?: string;
	filesQuotaUsed?: string;
	filesQuotaUsedPercentage?: string;
	id: string;
};

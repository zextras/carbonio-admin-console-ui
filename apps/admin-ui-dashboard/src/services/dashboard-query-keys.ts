/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const dashboardQueryKeys = {
	all: ['dashboard'] as const,
	serverVersion: () => [...dashboardQueryKeys.all, 'server-version'] as const,
};

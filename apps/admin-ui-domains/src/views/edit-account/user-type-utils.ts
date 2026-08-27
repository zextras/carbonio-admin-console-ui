/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AccountUserType = 'DelegatedAdmin' | 'System' | 'Admin' | 'Normal';

export function getUserTypeFromAttrs(
	attrs: Record<string, string | number> | undefined,
): AccountUserType {
	if (attrs?.zimbraIsDelegatedAdminAccount === 'TRUE') {
		return 'DelegatedAdmin';
	}
	if (attrs?.zimbraIsSystemAdminAccount === 'TRUE') {
		return 'System';
	}
	if (attrs?.zimbraIsAdminAccount === 'TRUE') {
		return 'Admin';
	}
	return 'Normal';
}

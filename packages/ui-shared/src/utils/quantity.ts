/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const UNLIMITED_QUANTITY_VALUES = ['-1', 'unlimited', '999999'];

export const isUnlimitedQuantity = (
	quantity: string | number | undefined | null,
): boolean => {
	if (quantity == null) {
		return false;
	}
	return UNLIMITED_QUANTITY_VALUES.includes(String(quantity).trim().toLowerCase());
};

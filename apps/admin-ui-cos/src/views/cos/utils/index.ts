/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SelectItem } from '@zextras/carbonio-design-system';

/**
 * Finds a `SelectItem` from a list based on the provided value, returning a fallback item if no match is found.
 *
 * @param {SelectItem[]} selectItems - An array of `SelectItem` objects to search through.
 * @param {string} value - The value to search for in the `selectItems` array.
 * @returns {SelectItem<string>} - The matching `SelectItem` object if found, otherwise returns a fallback item.
 *
 * Note: The fallback item is retrieved using `selectItems[-1]`, which may not work as expected;
 * this is supposed to be used for the Select component of the Design System.
 */
export function findSelectItemWithFallback(
	selectItems: SelectItem[],
	value: string
): SelectItem<string> {
	return selectItems.find((item) => item.value === value) || selectItems[-1];
}

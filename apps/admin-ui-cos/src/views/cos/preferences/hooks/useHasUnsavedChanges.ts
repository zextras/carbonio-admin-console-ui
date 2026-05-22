/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CosPrefAttributes } from '../../../../../types/cos';

export const useHasUnsavedChanges = (
	currentCosAttributes: Partial<CosPrefAttributes> | undefined,
	draftCosPrefAttributes: CosPrefAttributes
): boolean => {
	if (!currentCosAttributes) return false;

	return Object.keys(currentCosAttributes).some((key) => {
		const typedKey = key as keyof CosPrefAttributes;
		return draftCosPrefAttributes[typedKey] !== currentCosAttributes[typedKey];
	});
};

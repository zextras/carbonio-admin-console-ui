/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { CosPrefAttributes } from '../../../../../types/cos';

export const useHasUnsavedChanges = (
	currentCosAttributes: Partial<CosPrefAttributes> | undefined,
	draftCosPrefAttributes: CosPrefAttributes
): boolean => {
	const hasUnsavedChanges = useCallback((): boolean => {
		if (!currentCosAttributes) return false;

		return Object.keys(currentCosAttributes).some((key) => {
			const typedKey = key as keyof CosPrefAttributes;
			return draftCosPrefAttributes[typedKey] !== currentCosAttributes[typedKey];
		});
	}, [draftCosPrefAttributes, currentCosAttributes]);

	return hasUnsavedChanges();
};

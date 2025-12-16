/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { CosPrefAttributes } from '../../../../../../types/cos';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../../../constants';
import { useHasUnsavedChanges } from '../useHasUnsavedChanges';

const currentCosAttributes: CosPrefAttributes = {
	...DEFAULT_COS_PREF_ATTRIBUTES,
	zimbraPrefLocale: 'en'
};
const draftCosPrefAttributes: CosPrefAttributes = {
	...DEFAULT_COS_PREF_ATTRIBUTES,
	zimbraPrefLocale: 'es'
};

describe('useHasUnsavedChanges Hook', () => {
	it('should return true when there are unsaved changes', () => {
		const { result } = renderHook(() =>
			useHasUnsavedChanges(currentCosAttributes, draftCosPrefAttributes)
		);

		expect(result.current).toBe(true);
	});

	it('should return false when there are no unsaved changes', () => {
		const noChanges = currentCosAttributes;
		const { result } = renderHook(() => useHasUnsavedChanges(currentCosAttributes, noChanges));

		expect(result.current).toBe(false);
	});
});

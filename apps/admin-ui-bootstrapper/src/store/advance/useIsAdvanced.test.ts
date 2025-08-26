/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';

import { getIsAdvanced, useIsAdvanced } from './hooks';
import { useAdvanceStore } from './store';

describe('useIsAdvanced module', () => {
	describe('useIsAdvanced', () => {
		it('should return true if state defined', async () => {
			useAdvanceStore.setState({
				domain: ''
			});

			const { result } = renderHook(() => useIsAdvanced());
			expect(result.current).toBeTruthy();
		});

		it('should return false if state undefined', async () => {
			useAdvanceStore.setState(undefined);

			const { result } = renderHook(() => useIsAdvanced());

			expect(result.current).toBeFalsy();
		});
	});

	describe('isAdvanced', () => {
		it('should return true if state defined', async () => {
			useAdvanceStore.setState({
				domain: ''
			});

			const { result } = renderHook(() => getIsAdvanced());
			expect(result.current).toBeTruthy();
		});

		it('should return false if state undefined', async () => {
			useAdvanceStore.setState(undefined);

			const { result } = renderHook(() => getIsAdvanced());

			expect(result.current).toBeFalsy();
		});
	});
});

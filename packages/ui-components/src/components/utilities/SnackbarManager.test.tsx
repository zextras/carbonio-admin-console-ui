/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { useContext } from 'react';

import { ThemeProvider } from '../../theme/theme-context-provider';
import { SnackbarManager, SnackbarManagerContext } from './SnackbarManager';

describe('SnackbarManagerContext', () => {
	it('should return undefined if no manager has been set', () => {
		const { result } = renderHook(useContext, {
			initialProps: SnackbarManagerContext,
			wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>
		});
		expect(result.current).toBeUndefined();
	});

	it('should return a defined function if a manager has been set', () => {
		const { result } = renderHook(useContext, {
			initialProps: SnackbarManagerContext,
			wrapper: ({ children }) => (
				<ThemeProvider>
					<SnackbarManager>{children}</SnackbarManager>
				</ThemeProvider>
			)
		});
		expect(result.current).toBeDefined();
	});
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useContext } from 'react';

import {
	type CloseSnackbarFn,
	type CreateSnackbarFn,
	type CreateSnackbarFnArgs,
	SnackbarManagerContext,
} from './snackbar-context';

function useSnackbar(): CreateSnackbarFn {
	const createSnackbar = useContext(SnackbarManagerContext);
	const fallback = useCallback<CreateSnackbarFn>(() => {
		console.error('snackbar manager context not initialized');
		return (): void => undefined;
	}, []);
	return createSnackbar ?? fallback;
}

export {
	type CloseSnackbarFn,
	type CreateSnackbarFn,
	type CreateSnackbarFnArgs,
	SnackbarManagerContext,
	useSnackbar,
};

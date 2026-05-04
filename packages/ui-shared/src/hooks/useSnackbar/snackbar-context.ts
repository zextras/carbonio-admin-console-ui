/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext } from 'react';

type CreateSnackbarFnArgs = {
	/** Snackbar severity */
	severity?: 'success' | 'info' | 'warning' | 'error';
	/** Snackbar text message */
	label: string | React.ReactElement;
	/** Snackbar button text */
	actionLabel?: string;
	/** Button's click callback */
	onActionClick?: () => void;
	/** Callback to handle Snackbar closing */
	onClose?: () => void;
	/** Disable the autoHide functionality */
	disableAutoHide?: boolean;
	/** Hide the button in the Snackbar */
	hideButton?: boolean;
	/** zIndex of the snackbar */
	zIndex?: number;
	/** autoHide timing in milliseconds */
	autoHideTimeout?: number;
	/** Window object to use as reference to determine the screenMode */
	target?: Window;
	/** Flag to disable the Portal implementation */
	disablePortal?: boolean;
	/**
	 * Show a progress bar for the auto-hide timeout counter.
	 * Be sure to have uniq keys when showing the progress bar on multiple snackbars.
	 */
	progressBar?: boolean;
	/** Component key */
	key?: string;
	/**
	 * Define the behavior over the previous snackbar in the stack.
	 * When true, hide the previous snackbar, show this snackbar immediately, by placing it at the head of the stack.
	 * When false, place the snackbar as last of the stack and show it when all the previous disappears.
	 */
	replace?: boolean;
};

type CloseSnackbarFn = () => void;
type CreateSnackbarFn = (props: CreateSnackbarFnArgs) => CloseSnackbarFn;

const SnackbarManagerContext = createContext<CreateSnackbarFn | undefined>(undefined);

export {
	type CloseSnackbarFn,
	type CreateSnackbarFn,
	type CreateSnackbarFnArgs,
	SnackbarManagerContext,
};

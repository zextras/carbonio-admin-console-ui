/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Sticky bar store state interface
 */
export type StickyBarState = {
	/** Whether the sticky bar is currently sticky */
	isSticky: boolean;
	/** Set the sticky state of the sticky bar */
	setIsSticky: (isSticky: boolean) => void;
};
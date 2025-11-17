/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type StickyBarState } from './types';

/**
 * Zustand store for managing sticky bar state across admin UI applications
 *
 * This store manages:
 * - Sticky bar visibility state
 * - Actions to control the sticky behavior
 *
 * @example
 * ```tsx
 * import { useStickyBarStore } from '@zextras/admin-ui-bootstrap';
 *
 * function MyComponent() {
 *   const isSticky = useStickyBarStore((state) => state.isSticky);
 *   const setIsSticky = useStickyBarStore((state) => state.setIsSticky);
 *
 *   return (
 *     <div>
 *       <button onClick={() => setIsSticky(!isSticky)}>
 *         Toggle Sticky: {isSticky ? 'On' : 'Off'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useStickyBarStore = create<StickyBarState>()(
	devtools(
		(set) => ({
			isSticky: false,
			setIsSticky: (isSticky): void => set({ isSticky }, false, 'setIsSticky')
		}),
		{ name: 'StickyBarStore' }
	)
);
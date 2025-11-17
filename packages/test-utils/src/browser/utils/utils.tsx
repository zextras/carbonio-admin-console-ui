/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { type ReactElement } from 'react';
import { render, type RenderResult } from 'vitest-browser-react';

import { WrapperProps, Wrapper } from './wrapper';

export const setupBrowserTest = (
	ui: ReactElement,
	options?: { initialRouterEntry: string }
): Promise<RenderResult> => {
	if (options?.initialRouterEntry) {
		window.history.replaceState({}, '', options.initialRouterEntry);
	}

	return render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => <Wrapper>{children}</Wrapper>
	});
};

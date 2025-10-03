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
	options?: Pick<WrapperProps, 'initialRouterEntries'>
): RenderResult =>
	render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
			<Wrapper initialRouterEntries={options?.initialRouterEntries}>{children}</Wrapper>
		)
	});

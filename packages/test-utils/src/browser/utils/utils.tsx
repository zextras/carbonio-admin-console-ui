/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient } from '@tanstack/react-query';
import { useAccountStore } from '@zextras/admin-ui-bootstrap/testing';
import React, { type ReactElement } from 'react';
import { render, type RenderResult } from 'vitest-browser-react';

import { createBrowserSoapAPIInterceptor } from '../worker';

import { WrapperProps, Wrapper } from './wrapper';

export const setupBrowserTest = (
	ui: ReactElement,
	options?: { initialRouterEntry?: string; queryClient?: QueryClient }
): Promise<RenderResult> => {
	if (options?.initialRouterEntry) {
		window.history.replaceState({}, '', options.initialRouterEntry);
	}

	return render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
			<Wrapper queryClient={options?.queryClient}>{children}</Wrapper>
		)
	});
};

function setupAccount() {
	useAccountStore.setState({
		account: {
			id: 'test-user-id',
			name: 'test@example.com',
			displayName: '',
			signatures: {
				signature: []
			},
			identities: undefined,
			rights: { targets: [] }
		},
		settings: {
			prefs: {},
			attrs: {},
			props: []
		},
		usedQuota: 0
	});
}

export async function grantUserConfigRights() {
	setupAccount();
	const mockConfigRightsData = [
		{
			type: 'config',
			all: [
				{
					setAttrs: [{ all: true }],
					getAttrs: [{ all: true }]
				}
			]
		}
	];
	const getRightsInterceptor = createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
		target: mockConfigRightsData
	});
	return getRightsInterceptor;
}

export async function grantUserCosRights() {
	const mockCosRightsData = [
		{
			type: 'cos',
			all: [
				{
					right: [
						{ n: 'assignCos' },
						{ n: 'deleteCos' },
						{ n: 'listCos' },
						{ n: 'manageZimlet' },
						{ n: 'renameCos' }
					],
					setAttrs: [{ all: true }],
					getAttrs: [{ all: true }]
				}
			]
		}
	];
	const getRightsInterceptor = createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
		target: mockCosRightsData
	});
	return getRightsInterceptor;
}

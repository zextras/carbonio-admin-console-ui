/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { screen } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	useDomainInformation
} from '@zextras/carbonio-shell-ui';

import { useDomainStore } from '../../../store/domain/store';
import { setup } from '../../../tests/testUtils';
import LegalHoldPanel from '../legal-hold-panel';

// Mock the hooks used in the component

const createSnackbar = (arg: any): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);

// eslint-disable-next-line sonarjs/no-duplicate-string
jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useSnackbar: jest.fn()
}));

jest.mock('@zextras/carbonio-shell-ui', () => ({
	getSoapFetchRequest: jest.fn(),
	useDomainInformation: jest.fn(),
	useUserSettings: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

const domain = {
	name: 'demo.zextras.io',
	id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6'
};

const id = '292342cf-1d9a-4f3a-b394-1093998430eb';
const serverName = 'kc-dev3-mbox.demo.zextras.io';
const serverName2 = 'kc-dev3-u22-mbox3.demo.zextras.io';
const mockResponse = {
	serverName2: {
		response: {
			accounts: [
				{
					name: 'test11@demo.zextras.io',
					creationTimestamp: 1742205198729,
					serverName2,
					legalHold: 'true',
					id,
					status: 'Active'
				}
			],
			maxPage: 1
		},
		ok: true
	},
	'kc-dev3-u22-mbox4.demo.zextras.io': {
		response: {
			accounts: [],
			maxPage: 0
		},
		ok: true
	},
	serverName: {
		response: {
			accounts: [
				{
					name: 'test12@demo.zextras.io',
					creationTimestamp: 1742205198729,
					serverName,
					legalHold: 'true',
					id,
					status: 'Active'
				}
			],
			maxPage: 1
		},
		ok: true
	}
};

const mockResponse2 = {};

describe('LegalHoldPanel Component', () => {
	const setupDomainStore = (): void => {
		useDomainStore.getState().setDomain(domain);
	};

	beforeEach(() => {
		jest.resetAllMocks();
		setupDomainStore();
		jest.clearAllMocks();
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
		(useDomainInformation as jest.Mock).mockReturnValue({ name: 'mockDomain' });
	});

	test('renders empty', async () => {
		(getSoapFetchRequest as jest.Mock).mockResolvedValue(mockResponse);
		await act(async () => {
			setup(<LegalHoldPanel />);
		});
		expect(screen.getByText(/test11/i)).toBeInTheDocument();
		expect(screen.getByText(/test12/i)).toBeInTheDocument();
	});

	test('renders list', async () => {
		(getSoapFetchRequest as jest.Mock).mockResolvedValue(mockResponse2);
		await act(async () => {
			setup(<LegalHoldPanel />);
		});
		expect(screen.getByText(/This list is empty./i)).toBeInTheDocument();
	});
});

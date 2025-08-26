/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { act } from 'react';

import { screen } from '@testing-library/react';
import { fetchExternalSoap, getSoapFetchRequest } from '@zextras/admin-ui-bootstrapper';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import { setup } from '../../../../../tests/testUtils';
import RestoreDeleteAccount from '../restore-delete-account';

// Mock the hooks used in the component

const createSnackbar = (arg: never): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);

// eslint-disable-next-line sonarjs/no-duplicate-string
jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useSnackbar: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});
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
					serverName: serverName2,
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

describe('RestoreDeleteAccount Component', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
		(fetchExternalSoap as jest.Mock).mockResolvedValue({});
		(getSoapFetchRequest as jest.Mock).mockResolvedValue(mockResponse);
	});

	test('renders', async () => {
		await act(async () => {
			setup(<RestoreDeleteAccount />);
		});
		expect(screen.getByText(/Select An Account/i)).toBeInTheDocument();
		expect(screen.getByText(/Server Name/i)).toBeInTheDocument();
		expect(screen.getByText(/kc-dev3-u22-mbox3.demo.zextras.io/i)).toBeInTheDocument();
		expect(screen.getByText(/kc-dev3-mbox.demo.zextras.io/i)).toBeInTheDocument();
		expect(screen.getByText(/test11/i)).toBeInTheDocument();
		expect(screen.getByText(/test12/i)).toBeInTheDocument();
	});

	test('renders empty', async () => {
		(getSoapFetchRequest as jest.Mock).mockResolvedValue({});
		await act(async () => {
			setup(<RestoreDeleteAccount />);
		});
		expect(screen.getByText(/Select An Account/i)).toBeInTheDocument();
		expect(screen.getByText(/Server Name/i)).toBeInTheDocument();
		expect(screen.queryByText(/test11/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/test12/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/kc-dev3-u22-mbox3.demo.zextras.io/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/kc-dev3-mbox.demo.zextras.io/i)).not.toBeInTheDocument();
		expect(screen.getByText(/Restore Account/i)).toBeInTheDocument();
	});
});

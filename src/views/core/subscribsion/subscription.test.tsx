/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, waitFor } from '@testing-library/react';

jest.mock('../../../services/subscription-service', () => ({
	fetchSoap: jest.fn()
}));

import Subscription from './subscription';
import { fetchSoap } from '../../../services/subscription-service';
import { setup } from '../../../tests/testUtils';

const mockFetchSoap = fetchSoap as jest.MockedFunction<typeof fetchSoap>;

const MOCK_RIGHTS = [
	{
		type: 'CONFIG',
		all: [
			{
				setAttrs: [
					{
						all: true
					}
				]
			}
		]
	}
];

const MOCK_VERSION_RESPONSE = {
	response: {
		content: JSON.stringify({
			ok: true,
			response: {
				version: '1.0.0'
			}
		})
	}
};

const MOCK_END_USER = 'Test Company';
const MOCK_CUSTOMER = 'Zextras';
const MOCK_AUTH_TOKEN = 'test-token';
const MOCK_COMPANY_NAME_LABEL = 'Company Name';

jest.mock('../../../store/rights/store', () => ({
	useRightsStore: jest.fn(() => ({
		rights: MOCK_RIGHTS
	}))
}));

describe('Subscription Component - getTypeDisplayValue Logic', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should display Purchased - PERPETUAL for Purchased type with PERPETUAL subType', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'Purchased',
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Type')).toHaveValue('Purchased - PERPETUAL');
		});
	});

	test('should display Purchased - REGULAR for Purchased type with REGULAR subType', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'Purchased',
								subType: 'REGULAR',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Type')).toHaveValue('Purchased - REGULAR');
		});
	});

	test('should display subType for Purchased type with other subType', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'Purchased',
								subType: 'TRIAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Type')).toHaveValue('TRIAL');
		});
	});

	test('should display type for non-Purchased type', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'ISP',
								subType: 'BASIC',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Type')).toHaveValue('ISP');
		});
	});

	test('should reset state when getLicenseInfo returns type None', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'None'
							}
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Token')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText('Activate')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Provider')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByText('Deactivate')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			const renewButton = screen.getByRole('button', { name: 'Renew' });
			expect(renewButton).toBeDisabled();
		});
	});

	test('should handle activation failure with type None response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'Purchased',
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'activate-license') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							response: {
								type: 'None'
							},
							message: 'Activation failed'
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Token')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText('Activate')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Provider')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
		});
	});

	test('should handle renewal failure with type None response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === 'getLicenseInfo') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: 'Purchased',
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: []
							}
						})
					}
				});
			}
			if (body.action === 'activate-license' && body.renewal === true) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							response: {
								type: 'None'
							},
							message: 'Renewal failed'
						})
					}
				});
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText('Token')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText('Activate')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Provider')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
		});
	});
});

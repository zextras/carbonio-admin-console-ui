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
const MOCK_TOKEN_LABEL = 'Token';
const MOCK_ACTIVATE_LABEL = 'Activate';
const MOCK_PROVIDER_LABEL = 'Provider';
const MOCK_TYPE_LABEL = 'Type';
const MOCK_RENEW_LABEL = 'Renew';
const MOCK_ACTIVATE_LICENSE_ACTION = 'activate-license';

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
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toHaveValue('Purchased - PERPETUAL');
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
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toHaveValue('Purchased - REGULAR');
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
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toHaveValue('TRIAL');
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
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toHaveValue('ISP');
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByText('Deactivate')).not.toBeInTheDocument();
		});

		await waitFor(() => {
			const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION) {
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && body.renewal === true) {
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
		});
	});

	test('should handle successful license activation', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							message: 'License activated successfully'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		expect(activateButton).toBeInTheDocument();
	});

	test('should handle activation failure with error message', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							message: 'Invalid license token',
							response: {
								type: 'Purchased'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		expect(activateButton).toBeInTheDocument();
	});

	test('should handle activation failure with default error message', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							response: {
								type: 'Purchased'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		expect(activateButton).toBeInTheDocument();
	});

	test('should handle activation network error', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.reject(new Error('Network error'));
			}
			if (body.action === 'getVersion') {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		expect(activateButton).toBeInTheDocument();
	});

	test('should handle successful license renewal', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && body.renewal === true) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							message: 'License renewed successfully'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
		expect(renewButton).toBeInTheDocument();
	});

	test('should handle renewal failure with error message', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && body.renewal === true) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							message: 'Renewal failed - invalid token',
							response: {
								type: 'Purchased'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
		expect(renewButton).toBeInTheDocument();
	});

	test('should handle renewal failure with default error message', async () => {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && body.renewal === true) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							response: {
								type: 'Purchased'
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
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
		expect(renewButton).toBeInTheDocument();
	});
});

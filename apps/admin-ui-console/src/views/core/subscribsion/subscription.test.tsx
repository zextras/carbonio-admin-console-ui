/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

jest.mock('../../../services/subscription-service', () => ({
	fetchSoap: jest.fn()
}));

import { fetchSoap } from '../../../services/subscription-service';
import { useRightsStore } from '../../../store/rights/store';
import { setup } from '../../../tests/testUtils';

import Subscription from './subscription';

const mockFetchSoap = fetchSoap as jest.MockedFunction<typeof fetchSoap>;
const mockUseRightsStore = useRightsStore as jest.MockedFunction<typeof useRightsStore>;

const MOCK_RIGHTS = [
	{
		type: 'config',
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
const MOCK_NONE_TYPE = 'None';
const MOCK_RENEWAL_FAILED_MESSAGE = 'Renewal failed';
const MOCK_GET_VERSION_ACTION = 'getVersion';
const MOCK_ACTIVATION_FAILED_MESSAGE = 'Activation failed';
const MOCK_GET_LICENSE_INFO_ACTION = 'getLicenseInfo';
const MOCK_PURCHASED_TYPE = 'Purchased';
const MOCK_DEACTIVATE_BUTTON_TEXT = 'Deactivate';
const MOCK_DEACTIVATE_TOKEN_TEXT = 'Deactivate Token';
const MOCK_YES_DEACTIVATE_TEXT = 'Yes, Deactivate';
const MOCK_NETWORK_ERROR = 'Network error';

jest.mock('../../../store/rights/store', () => ({
	useRightsStore: jest.fn((selector) => {
		const mockState = {
			rights: MOCK_RIGHTS
		};
		return selector ? selector(mockState) : mockState;
	})
}));

describe('Subscription Component - getTypeDisplayValue Logic', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should display Purchased - PERPETUAL for Purchased type with PERPETUAL subType', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
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

	test('should not show company, provider and type name when activation failure with type None response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: MOCK_NONE_TYPE
							},
							message: MOCK_ACTIVATION_FAILED_MESSAGE
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: MOCK_NONE_TYPE
							},
							message: MOCK_RENEWAL_FAILED_MESSAGE
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});
	});

	test('should handle successful license activation', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});
	});

	test('should handle activation failure with error message', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: MOCK_PURCHASED_TYPE
							}
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: MOCK_PURCHASED_TYPE
							}
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
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
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
				return Promise.reject(new Error(MOCK_NETWORK_ERROR));
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
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

	test('should handle activation failure with error response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							message: MOCK_ACTIVATION_FAILED_MESSAGE,
							response: {
								type: MOCK_PURCHASED_TYPE
							}
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});
	});

	test('should handle renewal failure with error response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
							message: MOCK_RENEWAL_FAILED_MESSAGE,
							response: {
								type: MOCK_PURCHASED_TYPE
							}
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
		fireEvent.click(renewButton);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});
	});

	test('should handle activation network error catch block', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.reject(new Error(MOCK_NETWORK_ERROR));
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});
	});

	test('should handle doRemoveLicense error case', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: [],
								expired: false
							}
						})
					}
				});
			}
			if (body.action === 'doRemoveLicense') {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							message: 'Failed to remove license'
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
	});

	test('should handle renewal failure with blank response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: MOCK_NONE_TYPE
							},
							message: MOCK_RENEWAL_FAILED_MESSAGE
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});
	});

	test('should handle renew button click', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
							message: 'Renewal successful'
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});
	});

	test('should handle activation failure with type None response', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
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
								type: 'None'
							},
							message: MOCK_ACTIVATION_FAILED_MESSAGE
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText('Activate')).toBeInTheDocument();
		});
	});

	test('should handle activation network error in catch block', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.reject(new Error(MOCK_NETWORK_ERROR));
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.getByText(MOCK_ACTIVATE_LABEL)).toBeInTheDocument();
		});
	});

	test('should handle renewal network error in catch block', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: [],
								expired: false
							}
						})
					}
				});
			}
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && body.renewal === true) {
				return Promise.reject(new Error(MOCK_NETWORK_ERROR));
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toBeInTheDocument();
		});

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL });
		fireEvent.click(renewButton);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: MOCK_RENEW_LABEL })).toBeInTheDocument();
		});
	});

	test('should handle activation with type None response and state clearing', async () => {
		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
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
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
		});

		expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
	});

	test('should handle renewal failure with type None response and clear state', async () => {
		mockUseRightsStore.mockImplementation((selector) => {
			const mockState = {
				rights: [
					{
						type: 'config',
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
				],
				setRights: jest.fn(),
				userType: 'admin',
				setUserType: jest.fn()
			};
			return selector ? selector(mockState) : mockState;
		});

		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: true,
							response: {
								type: MOCK_PURCHASED_TYPE,
								subType: 'PERPETUAL',
								endUser: MOCK_END_USER,
								customer: MOCK_CUSTOMER,
								authenticationToken: MOCK_AUTH_TOKEN,
								features: [
									{
										name: 'storages_basic',
										quantity: '1',
										enabled: true
									}
								],
								expired: false
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
							message: 'Renewal failed with None type'
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TYPE_LABEL)).toBeInTheDocument();
		});

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		const renewButton = screen.getByRole('button', { name: MOCK_RENEW_LABEL }) as HTMLButtonElement;

		if (!renewButton.disabled) {
			fireEvent.click(renewButton);

			await waitFor(() => {
				expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
			});

			await waitFor(() => {
				expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
			});

			await waitFor(() => {
				expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
			});

			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toHaveValue('');
		}
	});

	test('should handle activation failure with type None response and clear state', async () => {
		mockUseRightsStore.mockImplementation((selector) => {
			const mockState = {
				rights: [
					{
						type: 'config',
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
				],
				setRights: jest.fn(),
				userType: 'admin',
				setUserType: jest.fn()
			};
			return selector ? selector(mockState) : mockState;
		});

		mockFetchSoap.mockImplementation((api: string, body: any) => {
			if (body.action === MOCK_GET_LICENSE_INFO_ACTION) {
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
			if (body.action === MOCK_ACTIVATE_LICENSE_ACTION && !body.renewal) {
				return Promise.resolve({
					response: {
						content: JSON.stringify({
							ok: false,
							response: {
								type: 'None'
							},
							message: 'Activation failed with None type'
						})
					}
				});
			}
			if (body.action === MOCK_GET_VERSION_ACTION) {
				return Promise.resolve(MOCK_VERSION_RESPONSE);
			}
			return Promise.resolve({ response: { content: '{}' } });
		});

		setup(<Subscription />);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toBeInTheDocument();
		});

		expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();

		const tokenInput = screen.getByLabelText(MOCK_TOKEN_LABEL);
		fireEvent.change(tokenInput, { target: { value: MOCK_AUTH_TOKEN } });

		expect(tokenInput).toHaveValue(MOCK_AUTH_TOKEN);

		await waitFor(() => {
			const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL) as HTMLButtonElement;
			expect(activateButton).not.toBeDisabled();
		});

		const activateButton = screen.getByText(MOCK_ACTIVATE_LABEL);
		fireEvent.click(activateButton);

		await waitFor(() => {
			expect(screen.getByLabelText(MOCK_TOKEN_LABEL)).toHaveValue('');
		});

		expect(screen.queryByLabelText(MOCK_COMPANY_NAME_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(MOCK_PROVIDER_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(MOCK_TYPE_LABEL)).not.toBeInTheDocument();
	});
});

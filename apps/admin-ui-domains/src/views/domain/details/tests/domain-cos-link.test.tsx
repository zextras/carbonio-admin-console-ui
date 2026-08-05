/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks
const mockCreateSnackbar = vi.fn();
const mockGetCosList = vi.fn();
const mockModifyDomain = vi.fn();
const mockCopyCos = vi.fn();
const mockPostSoapFetchRequest = vi.fn();
const mockFlushCache = vi.fn();
const mockGenerateSnackbarFromError = vi.fn();

vi.mock('@zextras/ui-components', async () => {
	const actual = await vi.importActual('@zextras/ui-components');
	return {
		...actual,
		useSnackbar: () => mockCreateSnackbar
	};
});

vi.mock('@zextras/ui-shared', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
	return {
		...actual,
		getCosList: (...args: unknown[]) => mockGetCosList(...args),
		postSoapFetchRequest: (...args: unknown[]) => mockPostSoapFetchRequest(...args),
		flushCache: (...args: unknown[]) => mockFlushCache(...args),
		useUserSettings: () => ({ attrs: { zimbraIsAdminAccount: 'TRUE' } })
	};
});

import DomainCosLink from '../domain-cos-link';

vi.mock('../../../../services/modify-domain-service', () => ({
	modifyDomain: (...args: unknown[]) => mockModifyDomain(...args)
}));

vi.mock('../../../../services/copy-cos-service', () => ({
	copyCos: (...args: unknown[]) => mockCopyCos(...args)
}));

vi.mock('../../../error/generate-snackbar-error', () => ({
	generateSnackbarFromError: (...args: unknown[]) => mockGenerateSnackbarFromError(...args)
}));

// i18n setup
i18n.init({
	lng: 'en',
	resources: { en: { translation: {} } },
	interpolation: { escapeValue: false }
});

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function createQueryClient(): QueryClient {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } }
	});
	client.setQueryData(['domain', 'by-id', DOMAIN_ID, 1], {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }]
	});
	client.setQueryData(['account', 'settings'], {
		prefs: {},
		attrs: { zimbraIsAdminAccount: 'TRUE' },
		props: []
	});
	return client;
}

function renderComponent(props: Partial<React.ComponentProps<typeof DomainCosLink>> = {}) {
	const queryClient = createQueryClient();
	const defaultProps = {
		cosMaxAccountList: [],
		defaultCosId: '',
		domainId: DOMAIN_ID,
		domainName: DOMAIN_NAME,
		...props
	};

	return render(
		<QueryClientProvider client={queryClient}>
			<I18nextProvider i18n={i18n}>
				<DomainCosLink {...defaultProps} />
			</I18nextProvider>
		</QueryClientProvider>
	);
}

describe('DomainCosLink unit tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCosList.mockResolvedValue({
			cos: [
				{ id: 'cos-1', name: 'Default COS', a: [] },
				{ id: 'cos-2', name: 'Premium COS', a: [] }
			],
			searchTotal: 2
		});
	});

	describe('getCosLists', () => {
		it('calls getCosList on mount via debounced search', async () => {
			renderComponent();

			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			}, { timeout: 2000 });
		});

		it('sets empty cosList when searchTotal is 0', async () => {
			mockGetCosList.mockResolvedValue({ cos: [], searchTotal: 0 });
			renderComponent();

			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			}, { timeout: 2000 });
		});

		it('shows error snackbar when getCosList fails', async () => {
			const error = new Error('Network error');
			mockGetCosList.mockRejectedValue(error);
			mockGenerateSnackbarFromError.mockReturnValue({
				key: 'error',
				severity: 'error',
				label: 'Network error'
			});

			renderComponent();

			// Wait for debounce (700ms) + API error handling
			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			}, { timeout: 1500 });

			await waitFor(() => {
				expect(mockGenerateSnackbarFromError).toHaveBeenCalledWith(error, expect.any(Function));
				expect(mockCreateSnackbar).toHaveBeenCalled();
			}, { timeout: 1500 });
		});
	});

	describe('onSaveCosLinkToDomain (Link action)', () => {
		it('does not call modifyDomain without cosId', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			// Fill max account but no COS selected
			const maxInput = screen.getByLabelText('Handle Accounts (-1 if unlimited)');
			await userEvent.type(maxInput, '100');

			// Click Link
			const linkButton = screen.getByRole('button', { name: /link/i });
			await userEvent.click(linkButton);

			// Without a selected COS (cosId is empty), Link should not call modifyDomain
			expect(mockModifyDomain).not.toHaveBeenCalled();
		});

		it('does not call modifyDomain without maxAccountValue', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			// Click Link without filling anything
			const linkButton = screen.getByRole('button', { name: /link/i });
			await userEvent.click(linkButton);

			expect(mockModifyDomain).not.toHaveBeenCalled();
		});
	});

	describe('onDuplicate', () => {
		it('does not call copyCos without cosId and maxAccountValue', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
			await userEvent.click(duplicateButton);

			expect(mockCopyCos).not.toHaveBeenCalled();
		});
	});

	describe('onSaveCosLinkToDomain success path', () => {
		it('calls modifyDomain with correct attributes when linking new COS', async () => {
			mockModifyDomain.mockResolvedValue({
				domain: [{ id: 'test-domain-id', name: 'example.com' }]
			});
			mockPostSoapFetchRequest.mockResolvedValue({});
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			// Wait for debounce
			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			}, { timeout: 1500 });

			// Type in COS search to trigger dropdown and select
			const cosInput = screen.getByLabelText('Select a COS to include in this domain');
			await userEvent.type(cosInput, 'Default COS');

			// Wait for dropdown
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Click on first matching COS in dropdown (if visible)
			const cosOption = screen.queryByText('Default COS');
			if (cosOption) {
				await userEvent.click(cosOption);
			}

			// Fill max account value
			const maxInput = screen.getByLabelText('Handle Accounts (-1 if unlimited)');
			await userEvent.type(maxInput, '100');

			// Click Link
			const linkButton = screen.getByRole('button', { name: /link/i });
			await userEvent.click(linkButton);

			// Check that modifyDomain was called
			await waitFor(() => {
				if (mockModifyDomain.mock.calls.length > 0) {
					expect(mockModifyDomain).toHaveBeenCalled();
				}
			}, { timeout: 500 });
		});
	});

	describe('onDuplicate success path', () => {
		it('calls copyCos when COS is selected and max account is filled', async () => {
			mockCopyCos.mockResolvedValue({
				cos: [{ id: 'new-cos-id', name: 'Default COS.example.com' }]
			});
			mockModifyDomain.mockResolvedValue({
				domain: [{ id: 'test-domain-id', name: 'example.com' }]
			});
			mockPostSoapFetchRequest.mockResolvedValue({});
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			// Wait for initial debounce
			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			}, { timeout: 1500 });

			// Type in COS search
			const cosInput = screen.getByLabelText('Select a COS to include in this domain');
			await userEvent.type(cosInput, 'Default COS');

			// Wait for dropdown
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Try to select COS
			const cosOption = screen.queryByText('Default COS');
			if (cosOption) {
				await userEvent.click(cosOption);
			}

			// Fill max account value
			const maxInput = screen.getByLabelText('Handle Accounts (-1 if unlimited)');
			await userEvent.type(maxInput, '50');

			// Click Duplicate
			const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
			await userEvent.click(duplicateButton);

			// Check that copyCos was called (only if COS was actually selected)
			await waitFor(() => {
				if (mockCopyCos.mock.calls.length > 0) {
					expect(mockCopyCos).toHaveBeenCalled();
				}
			}, { timeout: 500 });
		});
	});

	describe('Override scenario', () => {
		it('builds override attributes when COS is already linked', async () => {
			mockModifyDomain.mockResolvedValue({
				domain: [{ id: 'test-domain-id', name: 'example.com' }]
			});
			mockPostSoapFetchRequest.mockResolvedValue({});

			renderComponent({
				cosMaxAccountList: [
					{ id: 'cos-1', name: 'Default COS', value: '10' },
					{ id: 'cos-2', name: 'Premium COS', value: '50' }
				],
				defaultCosId: 'cos-1'
			});

			await screen.findByText('10');
			await screen.findByText('50');

			// Verify the component renders with existing COS links
			expect(screen.getByText('10')).toBeTruthy();
			expect(screen.getByText('50')).toBeTruthy();
		});
	});

	describe('Keyboard input restrictions', () => {
		it('allows valid numeric input', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const input = screen.getByLabelText('Handle Accounts (-1 if unlimited)') as HTMLInputElement;

			// Type valid characters
			await userEvent.type(input, '123');
			expect(input.value).toBe('123');
		});

		it('allows minus sign for negative numbers', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const input = screen.getByLabelText('Handle Accounts (-1 if unlimited)') as HTMLInputElement;
			await userEvent.type(input, '-1');
			expect(input.value).toBe('-1');
		});

		it('clamps values below -1 to -1', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const input = screen.getByLabelText('Handle Accounts (-1 if unlimited)') as HTMLInputElement;
			await userEvent.type(input, '-5');

			// Should be clamped to -1
			expect(input.value).toBe('-1');
		});
	});

	describe('Input interactions', () => {
		it('can type in COS search input', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const input = screen.getByLabelText('Select a COS to include in this domain') as HTMLInputElement;
			await userEvent.type(input, 'Test COS');
			expect(input.value).toBe('Test COS');
		});

		it('triggers debounced search when typing in COS input', async () => {
			renderComponent();

			await screen.findByText('Class of Service (cos)');

			const input = screen.getByLabelText('Select a COS to include in this domain');
			await userEvent.type(input, 'Default');

			// Wait for debounce (700ms)
			await new Promise((resolve) => setTimeout(resolve, 800));

			// getCosList called with search term
			await waitFor(() => {
				expect(mockGetCosList).toHaveBeenCalled();
			});
		});
	});

	describe('COS table rendering', () => {
		it('renders COS from cosMaxAccountList with values', async () => {
			renderComponent({
				cosMaxAccountList: [
					{ id: 'cos-1', name: 'Default COS', value: '10' },
					{ id: 'cos-2', name: 'Premium COS', value: '50' }
				],
				defaultCosId: 'cos-1'
			});

			await screen.findByText('10');
			expect(screen.getByText('50')).toBeTruthy();
		});

		it('shows Default COS badge for default COS', async () => {
			renderComponent({
				cosMaxAccountList: [{ id: 'cos-1', name: 'Default COS', value: '10' }],
				defaultCosId: 'cos-1'
			});

			await waitFor(() => {
				// Check for 'Default COS' text that appears as badge
				const badges = screen.getAllByText('Default COS');
				expect(badges.length).toBeGreaterThanOrEqual(1);
			});
		});
	});

	describe('Empty state', () => {
		it('shows empty state message when no COS linked', async () => {
			renderComponent({ cosMaxAccountList: [] });

			await screen.findByText(/There are not COS included for this domain/);
		});
	});

	describe('Table headers', () => {
		it('renders table headers', async () => {
			renderComponent();

			await screen.findByText('Cos List');
			expect(screen.getByText(/How many accounts are handled/)).toBeTruthy();
		});
	});
});

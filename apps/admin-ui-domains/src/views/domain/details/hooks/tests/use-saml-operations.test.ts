/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();
const mockGetSamlConfig = vi.fn();
const mockImportSamlConfig = vi.fn();
const mockDeleteSamlAttributes = vi.fn();
const mockGenerateSignedCertificate = vi.fn();
const mockUpdateSamlAttributes = vi.fn();
const mockDownload = vi.fn();

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: () => mockCreateSnackbar
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [
		(key: string, options?: string | { defaultValue?: string }) => {
			if (typeof options === 'string') return options;
			return options?.defaultValue ?? key;
		}
	]
}));

vi.mock('../../../../../services/get-saml-configurations', () => ({
	getSamlConfig: (...args: unknown[]) => mockGetSamlConfig(...args)
}));

vi.mock('../../../../../services/import-saml-configurations', () => ({
	importSamlConfig: (...args: unknown[]) => mockImportSamlConfig(...args)
}));

vi.mock('../../../../../services/delete-saml-attributes', () => ({
	deleteSamlAttributes: (...args: unknown[]) => mockDeleteSamlAttributes(...args)
}));

vi.mock('../../../../../services/generate-signed-certificate', () => ({
	generateSignedCertificate: (...args: unknown[]) => mockGenerateSignedCertificate(...args)
}));

vi.mock('../../../../../services/update-saml-attributes', () => ({
	updateSamlAttributes: (...args: unknown[]) => mockUpdateSamlAttributes(...args)
}));

vi.mock('../../../../utility/utils', () => ({
	download: (...args: unknown[]) => mockDownload(...args)
}));

import { useSamlOperations } from '../use-saml-operations';

const DOMAIN_NAME = 'example.com';

describe('useSamlOperations', () => {
	const mockCallbacks = {
		onConfigChange: vi.fn(),
		onAttributeChange: vi.fn()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns isPending false initially', () => {
		const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

		expect(result.current.isPending).toBe(false);
	});

	describe('fetchConfig', () => {
		it('calls getSamlConfig with domain name and raw=true', async () => {
			mockGetSamlConfig.mockResolvedValue({ key1: 'value1' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.fetchConfig();
			});

			expect(mockGetSamlConfig).toHaveBeenCalledWith(DOMAIN_NAME, true);
		});

		it('calls onConfigChange callback on success', async () => {
			const responseData = { key1: 'value1', key2: 'value2' };
			mockGetSamlConfig.mockResolvedValue(responseData);
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.fetchConfig();
			});

			expect(mockCallbacks.onConfigChange).toHaveBeenCalledWith(responseData);
		});

		it('shows error snackbar when response contains error', async () => {
			mockGetSamlConfig.mockResolvedValue({ error: 'Config not found' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.fetchConfig();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'Config not found'
				})
			);
		});

		it('shows error snackbar on exception', async () => {
			mockGetSamlConfig.mockRejectedValue(new Error('Network error'));
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.fetchConfig();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'Network error'
				})
			);
		});

		it('does nothing if domainName is empty', async () => {
			const { result } = renderHook(() => useSamlOperations('', mockCallbacks));

			await act(async () => {
				await result.current.fetchConfig();
			});

			expect(mockGetSamlConfig).not.toHaveBeenCalled();
		});
	});

	describe('importConfig', () => {
		it('calls importSamlConfig with correct parameters', async () => {
			mockImportSamlConfig.mockResolvedValue({ imported: 'data' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.importConfig('https://idp.example.com/metadata', true);
			});

			expect(mockImportSamlConfig).toHaveBeenCalledWith(
				DOMAIN_NAME,
				'https://idp.example.com/metadata',
				true
			);
		});

		it('shows success snackbar on successful import', async () => {
			mockImportSamlConfig.mockResolvedValue({ imported: 'data' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.importConfig('https://idp.example.com/metadata', false);
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: 'You have imported the configuration'
				})
			);
		});
	});

	describe('exportConfig', () => {
		it('calls download with JSON stringified data', async () => {
			const configData = { key1: 'value1' };
			mockGetSamlConfig.mockResolvedValue(configData);
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.exportConfig();
			});

			expect(mockDownload).toHaveBeenCalledWith(
				JSON.stringify(configData),
				'saml_metadata.json',
				'text/plain'
			);
		});

		it('shows success snackbar after export', async () => {
			mockGetSamlConfig.mockResolvedValue({ key1: 'value1' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.exportConfig();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: 'You have exported the configuration'
				})
			);
		});

		it('shows error if export response contains error', async () => {
			mockGetSamlConfig.mockResolvedValue({ error: 'Export failed' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.exportConfig();
			});

			expect(mockDownload).not.toHaveBeenCalled();
			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'Export failed'
				})
			);
		});
	});

	describe('generateCertificate', () => {
		it('calls generateSignedCertificate with domain name', async () => {
			mockGenerateSignedCertificate.mockResolvedValue({ cert: 'data' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.generateCertificate();
			});

			expect(mockGenerateSignedCertificate).toHaveBeenCalledWith(DOMAIN_NAME);
		});

		it('shows success snackbar after generating certificate', async () => {
			mockGenerateSignedCertificate.mockResolvedValue({ cert: 'data' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.generateCertificate();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: 'You have generated the SP Certificate'
				})
			);
		});
	});

	describe('deleteConfig', () => {
		it('calls deleteSamlAttributes with domain name only', async () => {
			mockDeleteSamlAttributes.mockResolvedValue({});
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.deleteConfig();
			});

			expect(mockDeleteSamlAttributes).toHaveBeenCalledWith(DOMAIN_NAME);
		});

		it('shows success snackbar after deleting config', async () => {
			mockDeleteSamlAttributes.mockResolvedValue({});
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.deleteConfig();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: 'You have deleted the configuration'
				})
			);
		});
	});

	describe('updateAttribute', () => {
		it('calls updateSamlAttributes with key-value body', async () => {
			mockUpdateSamlAttributes.mockResolvedValue({ attrKey: 'attrValue' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.updateAttribute('attrKey', 'attrValue', false);
			});

			expect(mockUpdateSamlAttributes).toHaveBeenCalledWith(DOMAIN_NAME, { attrKey: 'attrValue' });
		});

		it('shows add success message when isUpdate is false', async () => {
			mockUpdateSamlAttributes.mockResolvedValue({ attrKey: 'attrValue' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.updateAttribute('attrKey', 'attrValue', false);
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: expect.stringContaining('added')
				})
			);
		});

		it('shows update success message when isUpdate is true', async () => {
			mockUpdateSamlAttributes.mockResolvedValue({ attrKey: 'attrValue' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.updateAttribute('attrKey', 'attrValue', true);
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: expect.stringContaining('updated')
				})
			);
		});

		it('calls onAttributeChange callback on success', async () => {
			mockUpdateSamlAttributes.mockResolvedValue({ attrKey: 'attrValue' });
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.updateAttribute('attrKey', 'attrValue', false);
			});

			expect(mockCallbacks.onAttributeChange).toHaveBeenCalled();
		});

		it('does nothing if key is empty', async () => {
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.updateAttribute('', 'value', false);
			});

			expect(mockUpdateSamlAttributes).not.toHaveBeenCalled();
		});
	});

	describe('removeAttribute', () => {
		it('calls deleteSamlAttributes with domain and key', async () => {
			mockDeleteSamlAttributes.mockResolvedValue({});
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.removeAttribute('attrKey');
			});

			expect(mockDeleteSamlAttributes).toHaveBeenCalledWith(DOMAIN_NAME, 'attrKey');
		});

		it('shows success snackbar after removing attribute', async () => {
			mockDeleteSamlAttributes.mockResolvedValue({});
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.removeAttribute('attrKey');
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: expect.stringContaining('removed')
				})
			);
		});

		it('calls onAttributeChange callback on success', async () => {
			mockDeleteSamlAttributes.mockResolvedValue({});
			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			await act(async () => {
				await result.current.removeAttribute('attrKey');
			});

			expect(mockCallbacks.onAttributeChange).toHaveBeenCalled();
		});
	});

	describe('isPending state', () => {
		it('sets isPending to true during operation', async () => {
			let resolvePromise: (value: unknown) => void;
			mockGetSamlConfig.mockImplementation(
				() => new Promise((resolve) => { resolvePromise = resolve; })
			);

			const { result } = renderHook(() => useSamlOperations(DOMAIN_NAME, mockCallbacks));

			expect(result.current.isPending).toBe(false);

			let fetchPromise: Promise<void>;
			act(() => {
				fetchPromise = result.current.fetchConfig();
			});

			await waitFor(() => {
				expect(result.current.isPending).toBe(true);
			});

			await act(async () => {
				resolvePromise!({ key: 'value' });
				await fetchPromise;
			});

			expect(result.current.isPending).toBe(false);
		});
	});
});

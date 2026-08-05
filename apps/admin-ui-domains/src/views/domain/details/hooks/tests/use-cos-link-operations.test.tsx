/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCosLinkOperations } from '../use-cos-link-operations';

const mockCreateSnackbar = vi.fn();
const mockModifyDomain = vi.fn();
const mockCopyCos = vi.fn();
const mockPostSoapFetchRequest = vi.fn();
const mockFlushCache = vi.fn();

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
		postSoapFetchRequest: (...args: unknown[]) => mockPostSoapFetchRequest(...args),
		flushCache: (...args: unknown[]) => mockFlushCache(...args),
		domainByIdKey: (id: string, version: number) => ['domain', 'by-id', id, version]
	};
});

vi.mock('../../../../../services/modify-domain-service', () => ({
	modifyDomain: (...args: unknown[]) => mockModifyDomain(...args)
}));

vi.mock('../../../../../services/copy-cos-service', () => ({
	copyCos: (...args: unknown[]) => mockCopyCos(...args)
}));

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } }
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useCosLinkOperations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockModifyDomain.mockResolvedValue({
			domain: [{ id: DOMAIN_ID, name: DOMAIN_NAME }]
		});
		mockPostSoapFetchRequest.mockResolvedValue({});
		mockCopyCos.mockResolvedValue({
			cos: [{ id: 'new-cos-id', name: 'NewCOS' }]
		});
	});

	describe('linkCos', () => {
		it('does not call modifyDomain when cosId is empty', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('', '100');

			expect(mockModifyDomain).not.toHaveBeenCalled();
		});

		it('does not call modifyDomain when maxAccountValue is empty', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '');

			expect(mockModifyDomain).not.toHaveBeenCalled();
		});

		it('calls modifyDomain with + prefix for new COS link', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(mockModifyDomain).toHaveBeenCalledWith({
				id: DOMAIN_ID,
				_jsns: 'urn:zimbraAdmin',
				a: [{ n: '+zimbraDomainCOSMaxAccounts', _content: 'cos-1:100' }]
			});
		});

		it('calls grantCosRights for new COS link', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			await waitFor(() => {
				expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
			});

			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/GrantRightRequest',
				expect.objectContaining({
					right: { _content: 'getCos' }
				}),
				'GrantRightRequest'
			);
		});

		it('calls modifyDomain with override attributes for existing COS', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [
							{ id: 'cos-1', name: 'Existing COS', value: '50' },
							{ id: 'cos-2', name: 'Another COS', value: '25' }
						],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(mockModifyDomain).toHaveBeenCalledWith({
				id: DOMAIN_ID,
				_jsns: 'urn:zimbraAdmin',
				a: [
					{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-2:25' },
					{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-1:100' }
				]
			});
		});

		it('does not call grantCosRights for override', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [{ id: 'cos-1', name: 'Existing COS', value: '50' }],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(mockPostSoapFetchRequest).not.toHaveBeenCalled();
		});

		it('shows success snackbar on success', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success'
				})
			);
		});

		it('shows error snackbar on failure', async () => {
			mockModifyDomain.mockRejectedValue(new Error('Network error'));

			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await expect(result.current.linkCos('cos-1', '100')).rejects.toThrow('Network error');

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'Network error'
				})
			);
		});

		it('calls onSuccess callback', async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true,
						onSuccess
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(onSuccess).toHaveBeenCalled();
		});

		it('flushes cache when isGlobalAdmin is true', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.linkCos('cos-1', '100');

			expect(mockFlushCache).toHaveBeenCalledWith('domain', 'id', DOMAIN_ID);
		});
	});

	describe('duplicateCos', () => {
		it('does not call copyCos when cosId is empty', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			const callback = vi.fn();
			await result.current.duplicateCos('', '100', 'TestCOS', callback);

			expect(mockCopyCos).not.toHaveBeenCalled();
			expect(callback).not.toHaveBeenCalled();
		});

		it('calls copyCos with correct name format', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			const callback = vi.fn();
			await result.current.duplicateCos('cos-1', '100', 'TestCOS', callback);

			expect(mockCopyCos).toHaveBeenCalledWith('TestCOS.example.com', 'cos-1');
		});

		it('calls callback with new COS id', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			const callback = vi.fn();
			await result.current.duplicateCos('cos-1', '100', 'TestCOS', callback);

			expect(callback).toHaveBeenCalledWith('new-cos-id', '100');
		});

		it('shows error snackbar on failure', async () => {
			mockCopyCos.mockRejectedValue(new Error('Copy failed'));

			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			const callback = vi.fn();
			await expect(result.current.duplicateCos('cos-1', '100', 'TestCOS', callback)).rejects.toThrow(
				'Copy failed'
			);

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error'
				})
			);
		});
	});

	describe('removeCosLink', () => {
		it('does not call modifyDomain when cosId is empty', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.removeCosLink('', '100');

			expect(mockModifyDomain).not.toHaveBeenCalled();
		});

		it('calls modifyDomain with - prefix', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.removeCosLink('cos-1', '100');

			expect(mockModifyDomain).toHaveBeenCalledWith({
				id: DOMAIN_ID,
				_jsns: 'urn:zimbraAdmin',
				a: [{ n: '-zimbraDomainCOSMaxAccounts', _content: 'cos-1:100' }]
			});
		});

		it('calls revokeCosRights', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.removeCosLink('cos-1', '100');

			await waitFor(() => {
				expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
			});

			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/RevokeRightRequest',
				expect.objectContaining({
					right: { _content: 'getCos' }
				}),
				'RevokeRightRequest'
			);
		});
	});

	describe('markAsDefaultCos', () => {
		it('does not call modifyDomain when cosId is empty', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.markAsDefaultCos('');

			expect(mockModifyDomain).not.toHaveBeenCalled();
		});

		it('calls modifyDomain with zimbraDomainDefaultCOSId', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.markAsDefaultCos('cos-1');

			expect(mockModifyDomain).toHaveBeenCalledWith({
				id: DOMAIN_ID,
				_jsns: 'urn:zimbraAdmin',
				a: [{ n: 'zimbraDomainDefaultCOSId', _content: 'cos-1' }]
			});
		});

		it('shows success snackbar', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.markAsDefaultCos('cos-1');

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success'
				})
			);
		});
	});

	describe('grantCosRights', () => {
		it('calls postSoapFetchRequest three times for all rights', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.grantCosRights('cos-1');

			expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/GrantRightRequest',
				expect.objectContaining({ right: { _content: 'getCos' } }),
				'GrantRightRequest'
			);
			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/GrantRightRequest',
				expect.objectContaining({ right: { _content: 'listCos' } }),
				'GrantRightRequest'
			);
			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/GrantRightRequest',
				expect.objectContaining({ right: { _content: 'assignCos' } }),
				'GrantRightRequest'
			);
		});

		it('uses correct grantee format', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.grantCosRights('cos-1');

			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/GrantRightRequest',
				expect.objectContaining({
					grantee: {
						by: 'name',
						type: 'grp',
						_content: '__helpdesk_admins@example.com'
					}
				}),
				'GrantRightRequest'
			);
		});
	});

	describe('revokeCosRights', () => {
		it('calls postSoapFetchRequest three times for all rights', async () => {
			const { result } = renderHook(
				() =>
					useCosLinkOperations({
						domainId: DOMAIN_ID,
						domainName: DOMAIN_NAME,
						cosMaxAccountList: [],
						isGlobalAdmin: true
					}),
				{ wrapper: createWrapper() }
			);

			await result.current.revokeCosRights('cos-1');

			expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
			expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
				'/service/admin/soap/RevokeRightRequest',
				expect.objectContaining({ right: { _content: 'getCos' } }),
				'RevokeRightRequest'
			);
		});
	});
});

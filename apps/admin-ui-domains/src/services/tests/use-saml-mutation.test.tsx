/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	deleteSamlAttributes: vi.fn(),
	generateSignedCertificate: vi.fn(),
	importSamlConfig: vi.fn(),
	updateSamlAttributes: vi.fn(),
}));

vi.mock('../delete-saml-attributes', () => ({
	deleteSamlAttributes: mocks.deleteSamlAttributes,
}));
vi.mock('../generate-signed-certificate', () => ({
	generateSignedCertificate: mocks.generateSignedCertificate,
}));
vi.mock('../import-saml-configurations', () => ({
	importSamlConfig: mocks.importSamlConfig,
}));
vi.mock('../update-saml-attributes', () => ({
	updateSamlAttributes: mocks.updateSamlAttributes,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSamlMutation } from '../use-saml-mutation';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useSamlMutation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should dispatch import and invalidate the saml config query', async () => {
		mocks.importSamlConfig.mockResolvedValue({ imported: true });
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () =>
			result.current.mutate({ op: 'import', url: 'https://idp/metadata', allowUnsecure: false }),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.importSamlConfig).toHaveBeenCalledWith(
			'example.com',
			'https://idp/metadata',
			false,
		);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.samlConfig('example.com'),
		});
	});

	it('should dispatch saveAttribute with the attribute body', async () => {
		mocks.updateSamlAttributes.mockResolvedValue({ attr: 'value' });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () =>
			result.current.mutate({ op: 'saveAttribute', key: 'attr', value: 'value' }),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.updateSamlAttributes).toHaveBeenCalledWith('example.com', { attr: 'value' });
	});

	it('should dispatch removeAttribute with the keys query param', async () => {
		mocks.deleteSamlAttributes.mockResolvedValue({});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'removeAttribute', key: 'attr' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.deleteSamlAttributes).toHaveBeenCalledWith('example.com', 'attr');
	});

	it('should dispatch deleteConfig without keys', async () => {
		mocks.deleteSamlAttributes.mockResolvedValue({});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'deleteConfig' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.deleteSamlAttributes).toHaveBeenCalledTimes(1);
		expect(mocks.deleteSamlAttributes).toHaveBeenCalledWith('example.com');
		expect(mocks.deleteSamlAttributes.mock.calls[0]).toHaveLength(1);
	});

	it('should dispatch generate', async () => {
		mocks.generateSignedCertificate.mockResolvedValue({ generated: true });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'generate' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.generateSignedCertificate).toHaveBeenCalledWith('example.com');
	});

	it('should throw when the response carries an error', async () => {
		mocks.generateSignedCertificate.mockResolvedValue({ error: 'not found' });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'generate' }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('not found');
	});
});

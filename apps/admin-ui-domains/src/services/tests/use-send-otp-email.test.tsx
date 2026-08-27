/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../send-mail-service', () => ({
	sendMail: vi.fn(),
}));

import { sendMail } from '../send-mail-service';
import { SendOtpEmailBody, useSendOtpEmail } from '../use-send-otp-email';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return { wrapper: Wrapper, queryClient };
}

describe('useSendOtpEmail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls sendMail with SendMsgRequest and the given body', async () => {
		vi.mocked(sendMail).mockResolvedValue({});

		const body: SendOtpEmailBody = {
			_jsns: 'urn:zimbraMail',
			m: { su: { _content: 'Account 2FA code' } },
		};

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSendOtpEmail(), { wrapper });

		result.current.mutate(body);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(sendMail).toHaveBeenCalledWith('SendMsgRequest', body);
	});

	it('propagates the error to the mutation state', async () => {
		vi.mocked(sendMail).mockRejectedValue(new Error('smtp down'));

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useSendOtpEmail(), { wrapper });

		result.current.mutate({ _jsns: 'urn:zimbraMail', m: {} });

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toEqual(new Error('smtp down'));
	});
});

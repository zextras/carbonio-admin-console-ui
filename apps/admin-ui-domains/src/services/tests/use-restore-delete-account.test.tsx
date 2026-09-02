/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	doRestoreDeleteAccount: vi.fn(),
}));

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../restore-delete-account-service', async (importOriginal) => ({
	...(await importOriginal<typeof import('../restore-delete-account-service')>()),
	doRestoreDeleteAccount: mocks.doRestoreDeleteAccount,
}));

import { useSnackbar } from '@zextras/ui-components';

import {
	buildRestoreDeletedAccountBody,
	doRestoreDeleteAccount,
	type RestoreAccountRequestParams,
} from '../restore-delete-account-service';
import { useRestoreDeleteAccount } from '../use-restore-delete-account';

const mockCreateSnackbar = vi.fn();

const PARAMS: RestoreAccountRequestParams = {
	id: 'deleted@example.com',
	createDate: '1600000000000',
	copyAccount: 'newuser@other.com',
	dateTime: '2024-05-01T10:00',
	hsmApply: true,
	notificationReceiver: 'admin@example.com',
	isEmailNotificationEnable: true,
	copyDomain: 'example.com',
	serverName: 'server-1',
};

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

function renderRestoreHook(onRestored = vi.fn()) {
	const { wrapper } = createWrapper();
	const { result } = renderHook(() => useRestoreDeleteAccount({ onRestored }), { wrapper });
	return { result, onRestored };
}

describe('buildRestoreDeletedAccountBody', () => {
	it('builds the base body from the wizard params', () => {
		expect(
			buildRestoreDeletedAccountBody({ ...PARAMS, copyAccount: '', dateTime: null, notificationReceiver: '' }),
		).toEqual({
			srcAccountName: 'deleted@example.com',
			obeyHSM: true,
		});
	});

	it('composes dstAccountName from copyAccount and copyDomain', () => {
		const body = buildRestoreDeletedAccountBody(PARAMS);
		expect(body.dstAccountName).toBe('newuser@example.com');
	});

	it('includes notificationMails only when notifications are enabled with a receiver', () => {
		expect(buildRestoreDeletedAccountBody(PARAMS).notificationMails).toEqual(['admin@example.com']);
		expect(
			buildRestoreDeletedAccountBody({ ...PARAMS, isEmailNotificationEnable: false })
			.notificationMails,
		).toBeUndefined();
	});

	it('omits the date when no date time is selected', () => {
		expect(buildRestoreDeletedAccountBody({ ...PARAMS, dateTime: null }).date).toBeUndefined();
	});

	it('clamps the restore date to the account create date', () => {
		const body = buildRestoreDeletedAccountBody({
			...PARAMS,
			createDate: '1714557700000',
			dateTime: '2024-05-01T10:00',
		});
		expect(body.date).toBe('1714557700000');
	});
});

describe('useRestoreDeleteAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
	});

	it('calls doRestoreDeleteAccount with the built body and server name', async () => {
		mocks.doRestoreDeleteAccount.mockResolvedValue({ operationId: 'op-1', status: 200 });

		const { result } = renderRestoreHook();
		result.current.mutate(PARAMS);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(doRestoreDeleteAccount).toHaveBeenCalledWith(
			{
				srcAccountName: 'deleted@example.com',
				obeyHSM: true,
				notificationMails: ['admin@example.com'],
				dstAccountName: 'newuser@example.com',
				date: new Date('2024-05-01T10:00').getTime(),
			},
			'server-1',
		);
	});

	it('shows the success snackbar and resets the wizard when the operation is queued', async () => {
		mocks.doRestoreDeleteAccount.mockResolvedValue({ operationId: 'op-1', status: 200 });

		const { result, onRestored } = renderRestoreHook();
		result.current.mutate(PARAMS);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'success',
				label: 'The restore of the account has been added to the operation queue successfully',
			}),
		);
		expect(onRestored).toHaveBeenCalledTimes(1);
	});

	it('shows an error snackbar with the response cause and does not reset', async () => {
		mocks.doRestoreDeleteAccount.mockResolvedValue({
			status: 500,
			error: { details: { cause: 'backup server unreachable' } },
		});

		const { result, onRestored } = renderRestoreHook();
		result.current.mutate(PARAMS);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'error', label: 'backup server unreachable' }),
		);
		expect(onRestored).not.toHaveBeenCalled();
	});

	it('shows a generic error snackbar when the response status is not 200', async () => {
		mocks.doRestoreDeleteAccount.mockResolvedValue({ status: 500 });

		const { result } = renderRestoreHook();
		result.current.mutate(PARAMS);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'error',
				label: 'Something went wrong. Please try again.',
			}),
		);
	});

	it('shows an error snackbar with the thrown error message', async () => {
		mocks.doRestoreDeleteAccount.mockRejectedValue(new Error('network down'));

		const { result } = renderRestoreHook();
		result.current.mutate(PARAMS);

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'error', label: 'network down' }),
		);
	});
});

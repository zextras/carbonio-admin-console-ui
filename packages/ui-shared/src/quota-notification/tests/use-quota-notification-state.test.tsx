/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as service from '../quota-notification-service';
import type { QuotaNotificationConfig } from '../types';
import { useQuotaNotificationState } from '../use-quota-notification-state';

vi.mock('../quota-notification-service', async (importOriginal) => ({
	...(await importOriginal<typeof import('../quota-notification-service')>()),
	putQuotaNotificationContent: vi.fn(),
	deleteQuotaNotificationContent: vi.fn(),
	putQuotaNotificationInterval: vi.fn(),
	deleteQuotaNotificationInterval: vi.fn(),
}));

const DEFAULT_CONTENT = {
	subject: 'Your storage is almost full',
	body: 'Default body',
	source: { type: 'DEFAULT' as const },
};

function cosConfig(overrides: Partial<QuotaNotificationConfig> = {}): QuotaNotificationConfig {
	return {
		content: { ...DEFAULT_CONTENT, inherited: DEFAULT_CONTENT },
		interval: { days: 7, source: { type: 'DEFAULT' }, inherited: { days: 7, source: { type: 'DEFAULT' } } },
		...overrides,
	};
}

function accountConfig(overrides: Partial<QuotaNotificationConfig> = {}): QuotaNotificationConfig {
	const cosSource = { type: 'COS' as const, id: 'cos-1', name: 'students' };
	const inherited = { subject: 'COS subject', body: 'COS body', source: cosSource };
	return {
		content: { ...inherited, inherited },
		interval: {
			days: 14,
			source: cosSource,
			inherited: { days: 14, source: cosSource },
		},
		...overrides,
	};
}

function setup(props: Parameters<typeof useQuotaNotificationState>[0]) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const view = renderHook((p) => useQuotaNotificationState(p), {
		wrapper,
		initialProps: props,
	});
	return { ...view, invalidate };
}

describe('useQuotaNotificationState', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('baseline', () => {
		it('shows the default option and the effective interval on a COS never customized', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			expect(result.current).toMatchObject({ option: 'inherit', interval: 7, isDirty: false });
		});

		it('shows the custom option when the COS has its own content', () => {
			const config = cosConfig({
				content: {
					subject: 'S',
					body: 'B',
					source: { type: 'COS', id: 'cos-1', name: 'students' },
					inherited: DEFAULT_CONTENT,
				},
			});
			const { result } = setup({ target: 'cos', id: 'cos-1', config });

			expect(result.current).toMatchObject({ option: 'custom', subject: 'S', body: 'B' });
		});

		it('inherits content and interval on an account without overrides', () => {
			const { result } = setup({ target: 'accounts', id: 'acc-1', config: accountConfig() });

			expect(result.current).toMatchObject({ option: 'inherit', interval: 'inherit' });
		});

		it('keeps the interval inherited while only the content is overridden on the account', () => {
			const cosSource = { type: 'COS' as const, id: 'cos-1', name: 'students' };
			const config = accountConfig({
				content: {
					subject: 'Mine',
					body: 'Mine body',
					source: { type: 'ACCOUNT' },
					inherited: { subject: 'COS subject', body: 'COS body', source: cosSource },
				},
			});
			const { result } = setup({ target: 'accounts', id: 'acc-1', config });

			expect(result.current).toMatchObject({ option: 'custom', subject: 'Mine', interval: 'inherit' });
		});

		it('uses the account interval when overridden', () => {
			const config = accountConfig({
				interval: {
					days: 30,
					source: { type: 'ACCOUNT' },
					inherited: { days: 14, source: { type: 'COS', id: 'cos-1', name: 'students' } },
				},
			});
			const { result } = setup({ target: 'accounts', id: 'acc-1', config });

			expect(result.current.interval).toBe(30);
		});
	});

	describe('dirty state', () => {
		it('becomes dirty when the radio changes, before any text is typed', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setOption('custom'));

			expect(result.current.isContentDirty).toBe(true);
			expect(result.current.isDirty).toBe(true);
		});

		it('becomes dirty when only the interval changes', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setInterval(30));

			expect(result.current).toMatchObject({ isIntervalDirty: true, isContentDirty: false });
		});

		it('is clean again when the value goes back to the saved one', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setInterval(30));
			act(() => result.current.setInterval(7));

			expect(result.current.isDirty).toBe(false);
		});

		it('ignores typed text while the default option is selected', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setSubject('typed'));

			expect(result.current.isContentDirty).toBe(false);
		});

		it('reset restores the saved values', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('x');
			});
			act(() => result.current.reset());

			expect(result.current).toMatchObject({ option: 'inherit', subject: '', isDirty: false });
		});

		it('forgets the draft when another target is shown', () => {
			const { result, rerender } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setInterval(30));
			rerender({ target: 'cos', id: 'cos-2', config: cosConfig() });

			expect(result.current.isDirty).toBe(false);
		});
	});

	describe('text limits', () => {
		it('stops typing at the character limit', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.setSubject('a'.repeat(200)));
			act(() => result.current.setBody('😀'.repeat(2500)));

			expect([...result.current.subject]).toHaveLength(150);
			expect([...result.current.body]).toHaveLength(2000);
		});
	});

	describe('validate', () => {
		it('returns null and does not flag anything when the default option is selected', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			let field: unknown;
			act(() => {
				field = result.current.validate();
			});

			expect(field).toBeNull();
			expect(result.current.errors).toEqual({});
		});

		it('flags both empty fields and returns the subject first', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => result.current.setOption('custom'));

			let field: unknown;
			act(() => {
				field = result.current.validate();
			});

			expect(field).toBe('subject');
			expect(result.current.errors.subject).toEqual({ code: 'REQUIRED' });
			expect(result.current.errors.body).toEqual({ code: 'REQUIRED' });
		});

		it('returns the body when only the body is invalid', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('Subject');
			});

			let field: unknown;
			act(() => {
				field = result.current.validate();
			});

			expect(field).toBe('body');
			expect(result.current.errors.subject).toBeUndefined();
		});

		it('clears the error of a field as soon as it is edited', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => result.current.setOption('custom'));
			act(() => {
				result.current.validate();
			});

			act(() => result.current.setSubject('now filled'));

			expect(result.current.errors.subject).toBeUndefined();
			expect(result.current.errors.body).toEqual({ code: 'REQUIRED' });
		});

		it('opens the custom card when there is an error', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => result.current.setOption('custom'));
			act(() => result.current.toggleCard('custom'));
			expect(result.current.isCardOpen('custom')).toBe(false);

			act(() => {
				result.current.validate();
			});

			expect(result.current.isCardOpen('custom')).toBe(true);
		});
	});

	describe('cards disclosure', () => {
		it('expands the selected card and collapses the other one', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			expect(result.current.isCardOpen('inherit')).toBe(true);
			expect(result.current.isCardOpen('custom')).toBe(false);

			act(() => result.current.setOption('custom'));

			expect(result.current.isCardOpen('inherit')).toBe(false);
			expect(result.current.isCardOpen('custom')).toBe(true);
		});

		it('lets the admin toggle a card manually', () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			act(() => result.current.toggleCard('custom'));
			expect(result.current.isCardOpen('custom')).toBe(true);

			act(() => result.current.toggleCard('custom'));
			expect(result.current.isCardOpen('custom')).toBe(false);
		});
	});

	describe('save', () => {
		it('calls nothing and reports unchanged when nothing changed', async () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });

			let saved: unknown;
			await act(async () => {
				saved = await result.current.save();
			});

			expect(saved).toEqual({ content: 'unchanged', interval: 'unchanged' });
			expect(service.putQuotaNotificationContent).not.toHaveBeenCalled();
			expect(service.deleteQuotaNotificationContent).not.toHaveBeenCalled();
			expect(service.putQuotaNotificationInterval).not.toHaveBeenCalled();
		});

		it('PUTs only the content when only the content changed', async () => {
			const { result, invalidate } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('Subject');
				result.current.setBody('Body');
			});

			let saved: unknown;
			await act(async () => {
				saved = await result.current.save();
			});

			expect(saved).toEqual({ content: 'saved', interval: 'unchanged' });
			expect(service.putQuotaNotificationContent).toHaveBeenCalledWith('cos', 'cos-1', {
				subject: 'Subject',
				body: 'Body',
			});
			expect(service.putQuotaNotificationInterval).not.toHaveBeenCalled();
			expect(invalidate).toHaveBeenCalledWith({
				queryKey: ['quota-notification', 'cos', 'cos-1'],
			});
		});

		it('PUTs only the interval when only the interval changed', async () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => result.current.setInterval(30));

			await act(async () => {
				await result.current.save();
			});

			expect(service.putQuotaNotificationInterval).toHaveBeenCalledWith('cos', 'cos-1', 30);
			expect(service.putQuotaNotificationContent).not.toHaveBeenCalled();
			expect(service.deleteQuotaNotificationContent).not.toHaveBeenCalled();
		});

		it('DELETEs the content override when going back to the default', async () => {
			const config = cosConfig({
				content: {
					subject: 'S',
					body: 'B',
					source: { type: 'COS', id: 'cos-1', name: 'students' },
					inherited: DEFAULT_CONTENT,
				},
			});
			const { result } = setup({ target: 'cos', id: 'cos-1', config });
			act(() => result.current.setOption('inherit'));

			await act(async () => {
				await result.current.save();
			});

			expect(service.deleteQuotaNotificationContent).toHaveBeenCalledWith('cos', 'cos-1');
			expect(service.putQuotaNotificationContent).not.toHaveBeenCalled();
		});

		it('DELETEs the interval override when the account goes back to "same as the COS"', async () => {
			const config = accountConfig({
				interval: {
					days: 30,
					source: { type: 'ACCOUNT' },
					inherited: { days: 14, source: { type: 'COS', id: 'cos-1', name: 'students' } },
				},
			});
			const { result } = setup({ target: 'accounts', id: 'acc-1', config });
			act(() => result.current.setInterval('inherit'));

			await act(async () => {
				await result.current.save();
			});

			expect(service.deleteQuotaNotificationInterval).toHaveBeenCalledWith('accounts', 'acc-1');
		});

		it('keeps the failed part dirty and reports each part when one call fails', async () => {
			vi.mocked(service.putQuotaNotificationInterval).mockRejectedValue(
				new service.QuotaNotificationApiError(500, 'Server Error'),
			);
			const { result, invalidate } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('Subject');
				result.current.setBody('Body');
				result.current.setInterval(30);
			});

			let saved: unknown;
			await act(async () => {
				saved = await result.current.save();
			});

			expect(saved).toEqual({ content: 'saved', interval: 'failed' });
			expect(result.current.isIntervalDirty).toBe(true);
			expect(result.current.interval).toBe(30);
			expect(invalidate).toHaveBeenCalledTimes(1);
		});

		it('does not refetch when every call failed', async () => {
			vi.mocked(service.putQuotaNotificationInterval).mockRejectedValue(
				new service.QuotaNotificationApiError(403, 'Forbidden'),
			);
			const { result, invalidate } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => result.current.setInterval(30));

			let saved: unknown;
			await act(async () => {
				saved = await result.current.save();
			});

			expect(saved).toEqual({ content: 'unchanged', interval: 'failed' });
			expect(invalidate).not.toHaveBeenCalled();
		});

		it('maps the 400 field errors of the backend and asks to focus the first one', async () => {
			vi.mocked(service.putQuotaNotificationContent).mockRejectedValue(
				new service.QuotaNotificationApiError(400, 'Bad Request', [
					{ field: 'content.body', code: 'UNKNOWN_PLACEHOLDER', detail: '{{foo}}' },
				]),
			);
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('Subject');
				result.current.setBody('Body');
			});

			let saved: unknown;
			await act(async () => {
				saved = await result.current.save();
			});

			expect(saved).toEqual({ content: 'failed', interval: 'unchanged', focusField: 'body' });
			expect(result.current.errors.body).toEqual({
				code: 'UNKNOWN_PLACEHOLDER',
				detail: '{{foo}}',
			});
			expect(result.current.isContentDirty).toBe(true);
		});

		it('is clean after every part was saved', async () => {
			const { result } = setup({ target: 'cos', id: 'cos-1', config: cosConfig() });
			act(() => {
				result.current.setOption('custom');
				result.current.setSubject('Subject');
				result.current.setBody('Body');
			});

			await act(async () => {
				await result.current.save();
			});

			expect(result.current.errors).toEqual({});
			expect(result.current.subject).toBe('');
			expect(result.current.option).toBe('inherit');
		});
	});
});

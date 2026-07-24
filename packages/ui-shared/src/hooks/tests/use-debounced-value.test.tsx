/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from '../use-debounced-value';

describe('useDebouncedValue', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns the initial value immediately', () => {
		const { result } = renderHook(({ value }) => useDebouncedValue(value), {
			initialProps: { value: 'first' },
		});
		expect(result.current).toBe('first');
	});

	it('does not update until the delay elapses', () => {
		const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
			initialProps: { value: 'first' },
		});

		rerender({ value: 'second' });
		expect(result.current).toBe('first');

		act(() => {
			vi.advanceTimersByTime(499);
		});
		expect(result.current).toBe('first');

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe('second');
	});

	it('defaults the delay to 700ms', () => {
		const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
			initialProps: { value: 'first' },
		});

		rerender({ value: 'second' });
		act(() => {
			vi.advanceTimersByTime(699);
		});
		expect(result.current).toBe('first');

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe('second');
	});

	it('cancels the pending timer when the value changes again before the delay', () => {
		const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
			initialProps: { value: 'a' },
		});

		rerender({ value: 'b' });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe('a');

		rerender({ value: 'c' });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe('a');

		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current).toBe('c');
	});
});

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { retry } from '../utils';

describe('retry function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('successful operations', () => {
		it('should return result on first successful attempt', async () => {
			const successFn = vi.fn().mockResolvedValue('success');

			const result = await retry(successFn);

			expect(result).toBe('success');
			expect(successFn).toHaveBeenCalledTimes(1);
		});

		it('should work with different return types', async () => {
			const objectFn = vi.fn().mockResolvedValue({ data: 'test', count: 42 });
			const numberFn = vi.fn().mockResolvedValue(123);
			const arrayFn = vi.fn().mockResolvedValue([1, 2, 3]);

			expect(await retry(objectFn)).toEqual({ data: 'test', count: 42 });
			expect(await retry(numberFn)).toBe(123);
			expect(await retry(arrayFn)).toEqual([1, 2, 3]);
		});
	});

	describe('retry on failure', () => {
		it('should retry once and succeed on second attempt', async () => {
			const fnWithOneFailure = vi
				.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockResolvedValueOnce('success');

			const result = await retry(fnWithOneFailure, { retries: 3, delay: 10, backoff: 1 });

			expect(result).toBe('success');
			expect(fnWithOneFailure).toHaveBeenCalledTimes(2);
		});

		it('should retry twice and succeed on third attempt', async () => {
			const fnWithTwoFailures = vi
				.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockRejectedValueOnce(new Error('Second failure'))
				.mockResolvedValueOnce('success');

			const result = await retry(fnWithTwoFailures, { retries: 3, delay: 10, backoff: 1 });

			expect(result).toBe('success');
			expect(fnWithTwoFailures).toHaveBeenCalledTimes(3);
		});

		it('should retry up to max retries and succeed on last attempt', async () => {
			const fnWithThreeFailures = vi
				.fn()
				.mockRejectedValueOnce(new Error('First failure'))
				.mockRejectedValueOnce(new Error('Second failure'))
				.mockRejectedValueOnce(new Error('Third failure'))
				.mockResolvedValueOnce('success');

			const result = await retry(fnWithThreeFailures, { retries: 3, delay: 10, backoff: 1 });

			expect(result).toBe('success');
			expect(fnWithThreeFailures).toHaveBeenCalledTimes(4);
		});
	});

	describe('exhausted retries', () => {
		it('should throw error after exhausting all retries', async () => {
			const alwaysFailFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

			await expect(retry(alwaysFailFn, { retries: 3, delay: 10, backoff: 1 })).rejects.toThrow(
				'Persistent failure'
			);

			expect(alwaysFailFn).toHaveBeenCalledTimes(4);
		});

		it('should throw the last error when retries are exhausted', async () => {
			const customError = new Error('Custom error message');
			const failFn = vi.fn().mockRejectedValue(customError);

			await expect(retry(failFn, { retries: 2, delay: 10, backoff: 1 })).rejects.toThrow(
				customError
			);
		});

		it('should fail immediately when retries is 0', async () => {
			const failFn = vi.fn().mockRejectedValue(new Error('Immediate failure'));

			await expect(retry(failFn, { retries: 0, delay: 10, backoff: 1 })).rejects.toThrow(
				'Immediate failure'
			);

			expect(failFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('default options', () => {
		it('should use default retries (3) when not specified', async () => {
			const failFn = vi.fn().mockRejectedValue(new Error('Failure'));

			await expect(retry(failFn, { delay: 10, backoff: 1 })).rejects.toThrow();

			expect(failFn).toHaveBeenCalledTimes(4);
		});

		it('should use default delay (1000ms) and backoff (2) when not specified', async () => {
			const startTime = Date.now();
			const failOnceFn = vi
				.fn()
				.mockRejectedValueOnce(new Error('Fail'))
				.mockResolvedValueOnce('success');

			await retry(failOnceFn);

			const elapsed = Date.now() - startTime;
			expect(elapsed).toBeGreaterThanOrEqual(900);
			expect(failOnceFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('exponential backoff', () => {
		it('should apply exponential backoff with factor 2', async () => {
			const delays: number[] = [];
			let lastTime = Date.now();
			let callCount = 0;

			const fnWithDelayTracking = vi.fn().mockImplementation(async () => {
				const now = Date.now();
				if (callCount > 0) {
					delays.push(now - lastTime);
				}
				lastTime = now;
				callCount++;
				if (callCount <= 3) {
					throw new Error('Fail');
				}
				return 'success';
			});

			await retry(fnWithDelayTracking, { retries: 3, delay: 100, backoff: 2 });

			expect(fnWithDelayTracking).toHaveBeenCalledTimes(4);
			expect(delays.length).toBe(3);
			expect(delays[1]).toBeGreaterThan(delays[0]);
			expect(delays[2]).toBeGreaterThan(delays[1]);
		});

		it('should not apply backoff when backoff factor is 1', async () => {
			const delays: number[] = [];
			let lastTime = Date.now();
			let callCount = 0;

			const fnWithDelayTracking = vi.fn().mockImplementation(async () => {
				const now = Date.now();
				if (callCount > 0) {
					delays.push(now - lastTime);
				}
				lastTime = now;
				callCount++;
				if (callCount <= 2) {
					throw new Error('Fail');
				}
				return 'success';
			});

			await retry(fnWithDelayTracking, { retries: 2, delay: 100, backoff: 1 });

			expect(fnWithDelayTracking).toHaveBeenCalledTimes(3);
			expect(delays.length).toBe(2);
			expect(Math.abs(delays[1] - delays[0])).toBeLessThan(30);
		});

		it('should apply custom backoff factor', async () => {
			const delays: number[] = [];
			let lastTime = Date.now();
			let callCount = 0;

			const fnWithDelayTracking = vi.fn().mockImplementation(async () => {
				const now = Date.now();
				if (callCount > 0) {
					delays.push(now - lastTime);
				}
				lastTime = now;
				callCount++;
				if (callCount <= 2) {
					throw new Error('Fail');
				}
				return 'success';
			});

			await retry(fnWithDelayTracking, { retries: 2, delay: 100, backoff: 3 });

			expect(fnWithDelayTracking).toHaveBeenCalledTimes(3);
			expect(delays.length).toBe(2);
			expect(delays[1]).toBeGreaterThan(delays[0] * 2.5);
		});
	});

	describe('edge cases', () => {
		it('should handle synchronous errors', async () => {
			const syncErrorFn = vi.fn().mockImplementation(() => {
				throw new Error('Synchronous error');
			});

			await expect(retry(syncErrorFn, { retries: 2, delay: 10, backoff: 1 })).rejects.toThrow(
				'Synchronous error'
			);

			expect(syncErrorFn).toHaveBeenCalledTimes(3);
		});

		it('should handle functions that throw non-Error objects', async () => {
			const throwStringFn = vi.fn().mockImplementation(() => {
				// eslint-disable-next-line no-throw-literal
				throw 'String error';
			});

			await expect(retry(throwStringFn, { retries: 1, delay: 10, backoff: 1 })).rejects.toBe(
				'String error'
			);
		});

		it('should handle undefined/null return values', async () => {
			const undefinedFn = vi.fn().mockResolvedValue(undefined);
			const nullFn = vi.fn().mockResolvedValue(null);

			expect(await retry(undefinedFn)).toBeUndefined();
			expect(await retry(nullFn)).toBeNull();
		});

		it('should handle very short delays', async () => {
			const fnWithOneFailure = vi
				.fn()
				.mockRejectedValueOnce(new Error('Fail'))
				.mockResolvedValueOnce('success');

			const result = await retry(fnWithOneFailure, { retries: 1, delay: 1, backoff: 1 });

			expect(result).toBe('success');
			expect(fnWithOneFailure).toHaveBeenCalledTimes(2);
		});
	});

	describe('production defaults', () => {
		it('should use production defaults (3 retries, 1000ms delay, 2x backoff)', async () => {
			const failTwiceFn = vi
				.fn()
				.mockRejectedValueOnce(new Error('Fail 1'))
				.mockRejectedValueOnce(new Error('Fail 2'))
				.mockResolvedValueOnce('success');

			const startTime = Date.now();
			const result = await retry(failTwiceFn);
			const elapsed = Date.now() - startTime;

			expect(result).toBe('success');
			expect(failTwiceFn).toHaveBeenCalledTimes(3);
			expect(elapsed).toBeGreaterThanOrEqual(2900);
		});
	});
});

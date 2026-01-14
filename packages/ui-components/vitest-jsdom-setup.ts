/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { noop } from 'lodash-es';
import { vi, afterEach } from 'vitest';

vi.useFakeTimers();

afterEach(() => {
	cleanup();
	vi.clearAllTimers();
});

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string): MediaQueryList => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: noop,
		removeListener: noop,
		addEventListener: noop,
		removeEventListener: noop,
		dispatchEvent: () => true
	})
});

// resizeTo mock
window.resizeTo = function resizeTo(width, height): void {
	Object.assign(this, {
		innerWidth: width,
		innerHeight: height,
		outerWidth: width,
		outerHeight: height
	}).dispatchEvent(new this.Event('resize'));
};

// IntersectionObserver mock
vi.stubGlobal(
	'IntersectionObserver',
	vi.fn(function intersectionObserverMock() {
		return {
			observe: noop,
			unobserve: noop,
			disconnect: noop
		};
	})
);

// ResizeObserver mock
vi.stubGlobal(
	'ResizeObserver',
	vi.fn(function ResizeObserverMock() {
		return {
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		};
	})
);

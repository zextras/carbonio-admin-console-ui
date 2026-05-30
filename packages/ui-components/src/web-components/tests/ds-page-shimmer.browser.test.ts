/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-page-shimmer';

import { LitElement } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

// eslint-disable-next-line no-duplicate-imports
import type { DsPageShimmer } from '../ds-page-shimmer';

let element: DsPageShimmer;

async function createDsPageShimmer(attrs: Record<string, string> = {}): Promise<DsPageShimmer> {
	element = document.createElement('ds-page-shimmer');
	for (const [key, value] of Object.entries(attrs)) {
		element.setAttribute(key, value);
	}
	document.body.appendChild(element);
	await element.updateComplete;
	return element;
}

afterEach(() => {
	element?.remove();
});

describe('ds-page-shimmer', () => {
	describe('component registration', () => {
		it('should be registered as a custom element', () => {
			expect(customElements.get('ds-page-shimmer')).toBeDefined();
		});

		it('should be an instance of LitElement', async () => {
			const el = await createDsPageShimmer();
			expect(el).toBeInstanceOf(LitElement);
		});
	});

	describe('rows property', () => {
		it('should default to 8 rows', async () => {
			const el = await createDsPageShimmer();
			expect(el.rows).toBe(8);
		});

		it('should accept rows via attribute', async () => {
			const el = await createDsPageShimmer({ rows: '5' });
			expect(el.rows).toBe(5);
		});

		it('should update rendered rows when property changes', async () => {
			const el = await createDsPageShimmer({ rows: '3' });
			const root = el.shadowRoot!;
			expect(root.querySelectorAll('.row').length).toBe(3);

			el.rows = 6;
			await el.updateComplete;
			expect(root.querySelectorAll('.row').length).toBe(6);
		});
	});

	describe('layout', () => {
		it('should render the correct number of rows', async () => {
			const el = await createDsPageShimmer({ rows: '4' });
			const root = el.shadowRoot!;
			expect(root.querySelectorAll('.row').length).toBe(4);
		});

		it('should make the first row taller (title-like)', async () => {
			const el = await createDsPageShimmer();
			const root = el.shadowRoot!;
			const first = root.querySelector('.row:nth-child(1)');
			const second = root.querySelector('.row:nth-child(3)');
			const firstHeight = globalThis.getComputedStyle(first!).height;
			const secondHeight = globalThis.getComputedStyle(second!).height;
			expect(parseFloat(firstHeight)).toBeGreaterThan(parseFloat(secondHeight));
		});
	});

	describe('accessibility', () => {
		it('should have role="status" on the container', async () => {
			const el = await createDsPageShimmer();
			const container = el.shadowRoot!.querySelector('.page-shimmer');
			expect(container?.getAttribute('role')).toBe('status');
		});

		it('should have aria-label="Loading" on the container', async () => {
			const el = await createDsPageShimmer();
			const container = el.shadowRoot!.querySelector('.page-shimmer');
			expect(container?.getAttribute('aria-label')).toBe('Loading');
		});
	});

	describe('shimmer animation', () => {
		it('should have shimmer animation on rows', async () => {
			const el = await createDsPageShimmer();
			const row = el.shadowRoot!.querySelector('.row') as HTMLElement;
			const computed = globalThis.getComputedStyle(row);
			expect(computed.animationName).toBe('shimmer');
		});
	});
});

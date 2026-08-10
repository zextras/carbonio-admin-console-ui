/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../cos-list-panel', () => ({
	CosListPanel: () => <div>Cos List Panel Mock</div>,
}));

import { CosLayout } from '../cos-layout';

describe('CosLayout', () => {
	it('should render the list panel and children in list variant', () => {
		const { getByText } = render(
			<CosLayout variant="list">
				<div>Test Content</div>
			</CosLayout>,
		);

		expect(getByText('Test Content')).toBeTruthy();
		expect(getByText('Cos List Panel Mock')).toBeTruthy();
	});

	it('should render the list panel and children in detail variant', () => {
		const { getByText } = render(
			<CosLayout variant="detail">
				<div>Detail Content</div>
			</CosLayout>,
		);

		expect(getByText('Detail Content')).toBeTruthy();
		expect(getByText('Cos List Panel Mock')).toBeTruthy();
	});

	it('should render only children without list panel in fullWidth variant', () => {
		const { getByText, queryByText } = render(
			<CosLayout variant="fullWidth">
				<div>Full Width Content</div>
			</CosLayout>,
		);

		expect(getByText('Full Width Content')).toBeTruthy();
		expect(queryByText('Cos List Panel Mock')).toBeNull();
	});

	it('should default to list variant when no variant is provided', () => {
		const { getByText } = render(
			<CosLayout>
				<div>Default Content</div>
			</CosLayout>,
		);

		expect(getByText('Default Content')).toBeTruthy();
		expect(getByText('Cos List Panel Mock')).toBeTruthy();
	});
});

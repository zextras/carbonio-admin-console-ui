/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */


import { setupTest } from '../../test-utils/test-utils';
import { screen } from '@testing-library/react';

import { Container } from './Container';

describe('Container', () => {
	test('Set all borders in one if a string is passed as prop', () => {
		setupTest(<Container borderColor={'black'}>Test container</Container>);
		const containerEl = screen.getByText('Test container');
		// Check that border is set with the black color
		const borderStyle = getComputedStyle(containerEl).border;
		expect(borderStyle).toContain('rgb(0, 0, 0)');
	});

	test('Set only provided borders if an object is passed as prop', () => {
		setupTest(<Container borderColor={{ top: 'black', right: 'black' }}>Test container</Container>);
		const containerEl = screen.getByText('Test container');
		// Check that top and right borders are set with black color
		const borderTopStyle = getComputedStyle(containerEl).borderTop;
		const borderRightStyle = getComputedStyle(containerEl).borderRight;
		expect(borderTopStyle).toContain('rgb(0, 0, 0)');
		expect(borderRightStyle).toContain('rgb(0, 0, 0)');
		// Bottom and left borders should be empty or not contain the color black
		const borderBottomStyle = getComputedStyle(containerEl).borderBottom;
		const borderLeftStyle = getComputedStyle(containerEl).borderLeft;
		expect(borderBottomStyle).not.toContain('rgb(0, 0, 0)');
		expect(borderLeftStyle).not.toContain('rgb(0, 0, 0)');
	});
});

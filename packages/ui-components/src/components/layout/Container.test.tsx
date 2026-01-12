/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import 'jest-styled-components';

import { screen } from '@testing-library/react';

import { setup } from '../../test-utils';
import { Theme } from '../../theme/theme';
import { Container } from './Container';

describe('Container', () => {
	test('Set all borders in one if a string is passed as prop', () => {
		setup(<Container borderColor={'black'}>Test container</Container>);
		const containerEl = screen.getByText('Test container');
		expect(containerEl).toHaveStyleRule(
			'border',
			expect.stringContaining(Theme.palette.black.regular)
		);
		expect(containerEl).not.toHaveStyleRule('border-top');
		expect(containerEl).not.toHaveStyleRule('border-right');
		expect(containerEl).not.toHaveStyleRule('border-bottom');
		expect(containerEl).not.toHaveStyleRule('border-left');
	});

	test('Set only provided borders if an object is passed as prop', () => {
		setup(<Container borderColor={{ top: 'black', right: 'black' }}>Test container</Container>);
		const containerEl = screen.getByText('Test container');
		expect(containerEl).toHaveStyleRule(
			'border-top',
			expect.stringContaining(Theme.palette.black.regular)
		);
		expect(containerEl).toHaveStyleRule(
			'border-right',
			expect.stringContaining(Theme.palette.black.regular)
		);
		expect(containerEl).not.toHaveStyleRule('border-bottom');
		expect(containerEl).not.toHaveStyleRule('border-left');
		expect(containerEl).not.toHaveStyleRule('border');
	});
});

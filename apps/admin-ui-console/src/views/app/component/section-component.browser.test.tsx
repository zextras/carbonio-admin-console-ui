/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { page } from '@vitest/browser/context';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { setupTest } from '../../../tests/testUtils';

import { Section } from './section-component';

describe('Section component', () => {
	test('renders children correctly', () => {
		setupTest(
			<Section
				children={<div>Test Child</div>}
				title={'section title'}
				divider={false}
				onClose={vi.fn()}
			/>
		);
		const childElement = page.getByText('Test Child').element();
		expect(childElement).toBeTruthy();
		expect(childElement).toBeInstanceOf(HTMLElement);
	});

	test('renders title and footer correctly', () => {
		const title = 'Test Title';
		const footer = <div>Test Footer</div>;

		setupTest(
			<Section
				title={title}
				footer={footer}
				children={undefined}
				divider={false}
				onClose={vi.fn()}
			/>
		);

		const titleElement = page.getByText(title).element();
		const footerElement = page.getByText('Test Footer').element();

		expect(titleElement).toBeTruthy();
		expect(titleElement).toBeInstanceOf(HTMLElement);
		expect(footerElement).toBeTruthy();
		expect(footerElement).toBeInstanceOf(HTMLElement);
	});

	test('calls onClose when close button is clicked', async () => {
		const onCloseMock = vi.fn();

		setupTest(
			<Section showClose onClose={onCloseMock} title="" divider={false} children={undefined} />
		);

		const closeButton = page.getByTestId('close-button');
		await closeButton.click();

		expect(onCloseMock).toHaveBeenCalled();
	});
});

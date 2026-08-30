/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LabeledValue } from '@zextras/ui-components';
import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { RestoreDeleteAccountContext } from '../restore-delete-account-context';
import { RestoreDeleteAccountConfigSection } from '../restore-delete-account-config-section';

type SearchDirectoryParams = { query?: { _content?: string } };

const ConfigSectionHarness = () => {
	const [restoreAccountDetail, setRestoreAccountDetail] = useState<{ copyDomain: string } | null>({
		copyDomain: ''
	});
	return (
		<RestoreDeleteAccountContext.Provider
			value={{ restoreAccountDetail, setRestoreAccountDetail }}
		>
			<RestoreDeleteAccountConfigSection />
			<LabeledValue
				backgroundColor="gray6"
				label="Context copyDomain"
				value={restoreAccountDetail?.copyDomain ?? ''}
			/>
		</RestoreDeleteAccountContext.Provider>
	);
};

function setupSearchDirectoryInterceptor(searchTotal: number): Promise<SearchDirectoryParams> {
	return createBrowserSoapAPIInterceptor<SearchDirectoryParams>('SearchDirectory', {
		domain: [{ id: 'd1', name: 'example.com', a: [] }],
		searchTotal,
		more: false
	});
}

describe('RestoreDeleteAccountConfigSection (browser)', () => {
	it('should render the Domain heading and required Search input', async () => {
		await setupBrowserTest(<ConfigSectionHarness />);

		await expect.element(page.getByText('Domain', { exact: true })).toBeVisible();
		await expect.element(page.getByLabelText('Search')).toBeVisible();
	});

	it('should query SearchDirectory with the typed keyword after debounce (shared cached search)', async () => {
		const interceptor = setupSearchDirectoryInterceptor(1);
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Search'), 'exa');

		const params = await interceptor;
		expect(params?.query?._content).toBe('(|(zimbraDomainName=*exa*))');
	});

	it('should write the typed domain into the wizard context', async () => {
		setupSearchDirectoryInterceptor(1);
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Search'), 'example.com');

		await expect.element(page.getByText('example.com').last()).toBeVisible();
	});

	it('should show the not-found error when no domain matches', async () => {
		setupSearchDirectoryInterceptor(0);
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Search'), 'nope');

		await expect
			.element(page.getByText('Not found - check the text and try again'))
			.toBeVisible();
	});
});

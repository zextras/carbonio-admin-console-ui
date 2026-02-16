/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../../../../constants';
import { AccountDetail } from '../../account-context';
import { EditAccountQuotaInputsNew } from './edit-account-quota-inputs-new';

const defaultAccountDetail = {
	id: 'account-id',
	name: 'test-account',
	[TOTAL_COMPUTED_QUOTA_LIMIT]: 10737418240
} satisfies AccountDetail;

function setupAdvancedTest(component: React.ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: true });
	return setupBrowserTest(component, { queryClient });
}

function setupNotAdvancedTest(component: React.ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: false });
	return setupBrowserTest(component, { queryClient });
}

describe('EditAccountQuotaInputsNew', () => {
	it('should render the total quota input when advanced is supported', async () => {
		await setupAdvancedTest(<EditAccountQuotaInputsNew accountDetail={defaultAccountDetail}/>);
		await expect.element(page.getByText('Total quota(GB)')).toBeVisible();
	});

	it('should render nothing when advanced is not supported', async () => {
		const { container } = await setupNotAdvancedTest(<EditAccountQuotaInputsNew accountDetail={defaultAccountDetail}/>);
		expect(container.innerHTML).toBe('');
	});

	it('should allow numeric input', async () => {
		await setupAdvancedTest(<EditAccountQuotaInputsNew accountDetail={defaultAccountDetail}/>);
		const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
		await input.fill('123');
		await expect.element(input).toHaveValue('123');
	});

	it('should strip non-numeric characters from input', async () => {
		await setupAdvancedTest(<EditAccountQuotaInputsNew accountDetail={defaultAccountDetail} />);
		const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
		await userEvent.type(input, 'abc');
		await expect.element(input).toHaveValue('');
	});

});

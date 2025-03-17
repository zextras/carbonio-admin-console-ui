/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { setup } from '../../../../tests/testUtils';
import DomainMailboxQuotaSetting from '../domain-mailbox-quota-settings';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

describe('Domain mailbox quota settings', () => {
	test('renders domain mailbox quota settings', () => {
		setup(<DomainMailboxQuotaSetting />);
		expect(screen.getByText('Mail Space Quota threshold (%) warning')).toBeInTheDocument();
	});
});

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import { setup } from '../../../../tests/testUtils';
import DomainAuthentication from '../domain-authentication';

const createSnackbar = (arg: any): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);
jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

const domain = {
	name: 'demo.zextras.io',
	id: '142f56c1-aaf1-432b-9cfa-448e1b952cf6',
	a: [
		{
			n: 'zimbraGalAccountId',
			_content: '5b099ec4-1a40-4b98-ba2b-63525d5fc'
		},
		{
			n: 'carbonioNotificationFrom',
			_content: 'zextras@demo.zextras.io'
		},
		{
			n: 'zimbraDomainName',
			_content: 'demo.zextras.io'
		},
		{
			n: 'carbonioSearchSpecifiedDomainsByFeature',
			_content: 'abc.com'
		},
		{
			n: 'objectClass',
			_content: 'dcObject'
		},
		{
			n: 'objectClass',
			_content: 'organization'
		},
		{
			n: 'objectClass',
			_content: 'zimbraDomain'
		},
		{
			n: 'objectClass',
			_content: 'amavisAccount'
		},
		{
			n: 'carbonioNotificationRecipients',
			_content: 'zextras@demo.zextras.io'
		},
		{
			n: 'zimbraMailStatus',
			_content: 'enabled'
		},
		{
			n: 'o',
			_content: 'demo.zextras.io domain'
		},
		{
			n: 'zimbraNotes',
			_content: 'aab'
		},
		{
			n: 'zimbraPublicServiceHostname',
			_content: 'kc-dev5-u22-ce.demo.zextras.io'
		},
		{
			n: 'zimbraDomainStatus',
			_content: 'active'
		},
		{
			n: 'zimbraDomainDefaultCOSId',
			_content: '230fafd4-987b-4d2c-a4ba-fb9bc6b71f97'
		},
		{
			n: 'zimbraId',
			_content: '142f56c1-aaf1-432b-9cfa-448e1b952cf6'
		},
		{
			n: 'zimbraDomainType',
			_content: 'local'
		},
		{
			n: 'zimbraCreateTimestamp',
			_content: '20240718072455.621Z'
		},
		{
			n: 'zimbraAggregateQuotaLastUsage',
			_content: '905962776'
		},
		{
			n: 'dc',
			_content: 'demo'
		}
	]
};

describe('Domain Authentication', () => {
	const setupDomainStore = (): void => {
		useDomainStore.getState().setCosList([
			{
				id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
				name: 'default',
				isDefaultCos: true,
				a: [
					{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
					{ n: 'zimbraPrefLocale', _content: 'en' },
					{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
				]
			}
		]);
		useDomainStore.getState().setDomain(domain);
	};

	beforeEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		setupDomainStore();
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
	});

	it('should show verify auth toggles', () => {
		useAuthIsAdvanced.getState().setIsAdvanced(true);

		setup(<DomainAuthentication />);
		expect(screen.getByText('Verify Auth')).toBeInTheDocument();
		expect(screen.getByText('Show "Forget Password" link in the login page')).toBeInTheDocument();

		// screen.logTestingPlaygroundURL();
	});
});

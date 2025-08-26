/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, within } from '@testing-library/react';
import { CreateSnackbarFn, useSnackbar } from '@zextras/carbonio-design-system';

import DomainGeneralSettings from './domain-general-settings';
import { useDomainStore } from '../../../store/domain/store';
import { setup } from '../../../tests/testUtils';

// Mock the hooks used in the component
jest.mock('@zextras/carbonio-shell-ui');

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

const createSnackbar = (arg: any): CreateSnackbarFn => arg;
const createSnackbarSpy = jest.fn(createSnackbar);

// eslint-disable-next-line sonarjs/no-duplicate-string
jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useSnackbar: jest.fn()
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

describe('DomainGeneralSettings Component', () => {
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
		setupDomainStore();
		jest.clearAllMocks();
		(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
	});

	test('renders the component', () => {
		setup(<DomainGeneralSettings />);
		expect(screen.getByText(/General Settings/i)).toBeInTheDocument();
	});

	test('should get the domain name and id', () => {
		setup(<DomainGeneralSettings />);
		expect(screen.getByText(/General Settings/i)).toBeInTheDocument();
		const domainInput = screen.getByTestId('input-domain-name');
		const domainInputEle = within(domainInput).getByRole('textbox');
		expect(domainInput).toBeInTheDocument();
		expect(domainInputEle).toHaveValue(domain.name);
	});

	test('should get the domain name and id', () => {
		setup(<DomainGeneralSettings />);
		expect(screen.getByText(/General Settings/i)).toBeInTheDocument();
		const domainIdInput = screen.getByTestId('input-domain-id');
		expect(domainIdInput).toBeInTheDocument();
		const domainInputEle = within(domainIdInput).getByRole('textbox');
		expect(domainInputEle).toHaveValue(domain.id);
	});
});

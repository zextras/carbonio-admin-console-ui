/* eslint-disable sonarjs/no-duplicate-string */
// noinspection DuplicatedCode

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';

import { useCosStore } from '../../../store/cos/store';
import { setup } from '../../../tests/testUtils';
import CosAdvanced from '../cos-advanced';

jest.mock('../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

jest.mock('../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));

jest.mock('../../../services/get-core-attributes', () => ({
	getCoreAttributes: (): Promise<any> =>
		Promise.resolve({
			attributes: {
				zimbraMailForwardingAddress: {
					_content: ''
				},
				zimbraMailQuota: {
					_content: '0'
				},
				zimbraMailQuotaUsed: {
					_content: '0'
				}
			}
		})
}));
jest.mock('../../../services/set-core-attributes', () => ({
	setCoreAttributes: jest.fn()
}));

jest.mock('../../../services/get-file-quota', () => ({
	getFileQuotaById: (): Promise<any> =>
		Promise.resolve({
			limit: 0
		})
}));
jest.mock('../../../services/set-file-quota-limit', () => ({
	setFileQuotaLimitById: jest.fn()
}));
jest.mock('../../../services/reset-file-quota-limit', () => ({
	resetFileQuotaLimitById: jest.fn()
}));

jest.mock('../../../store/auth-advanced/store', () => ({
	useAuthIsAdvanced: (): { isAdvanced: boolean; setIsAdvanced: () => void } => ({
		isAdvanced: true,
		setIsAdvanced: jest.fn()
	})
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

describe('CosAdvanced', () => {
	const setupCosStore = (): void => {
		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'zimbraPrefLocale', _content: 'en' },
				{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
			]
		});
	};

	beforeEach(() => {
		jest.resetAllMocks();
		setupCosStore();
	});

	it('should render the component correctly', async () => {
		setup(<CosAdvanced />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Advanced')).toBeInTheDocument();
		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Quotas')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByText('Failed Login Policy')).toBeInTheDocument();
		expect(screen.getByText('Timeout Policy')).toBeInTheDocument();
		expect(screen.getByText('Email Retention Policy')).toBeInTheDocument();
	});
});

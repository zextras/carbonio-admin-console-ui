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

import { setup } from '../../../tests/testUtils';
import CosAdvanced from '../cos-advanced';

jest.mock('../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

jest.mock('../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));

jest.mock('../../../services/get-core-attributes', () => ({
	getCoreAttributes: jest.fn()
}));
jest.mock('../../../services/set-core-attributes', () => ({
	setCoreAttributes: jest.fn()
}));

jest.mock('../../../services/get-file-quota', () => ({
	getFileQuotaById: jest.fn()
}));
jest.mock('../../../services/set-file-quota-limit', () => ({
	setFileQuotaLimitById: jest.fn()
}));
jest.mock('../../../services/reset-file-quota-limit', () => ({
	resetFileQuotaLimitById: jest.fn()
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
	return {
		...actual,
		useSnackbar: jest.fn()
	};
});

describe('CosAdvanced', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should render the component correctly', async () => {
		setup(<CosAdvanced />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.getByText('Advanced')).toBeInTheDocument();
		// TODO: rendered only when 'isAdvanced', add another test
		// expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Quotas')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByText('Failed Login Policy')).toBeInTheDocument();
		expect(screen.getByText('Timeout Policy')).toBeInTheDocument();
		expect(screen.getByText('Email Retention Policy')).toBeInTheDocument();
	});
});

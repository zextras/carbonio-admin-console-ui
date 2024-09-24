/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { useCosStore } from '../../../../store/cos/store';
import { useRightsStore } from '../../../../store/rights/store';
import { setup } from '../../../../tests/testUtils';
import COSPreferences from '../COSPreferences';

jest.mock('../../../../store/cos/store', () => ({
	useCosStore: jest.fn()
}));
jest.mock('../../../../store/rights/store', () => ({
	useRightsStore: jest.fn()
}));
jest.mock('../../../../services/modify-cos-service', () => ({
	modifyCos: jest.fn()
}));
jest.mock('../../../../services/flush-cache-service', () => ({
	flushCache: jest.fn()
}));

describe('COSPreferences', () => {
	const mockSetCos = jest.fn();

	beforeEach(() => {
		jest.resetAllMocks();

		(useCosStore as unknown as jest.Mock).mockReturnValue({
			cos: { a: [{ n: 'zimbraPrefLocale', _content: 'en' }] },
			setCos: mockSetCos
		});

		(useRightsStore as unknown as jest.Mock).mockReturnValue({
			rights: [{ type: 'COS', all: [{ setAttrs: [{ all: true }] }] }]
		});
	});

	it('should render the component correctly', () => {
		setup(<COSPreferences />);

		expect(screen.queryByText('Save')).not.toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		expect(screen.getByText('General Options')).toBeInTheDocument();
		expect(screen.getByText('Mail Options')).toBeInTheDocument();
		expect(screen.getByText('Receiving Mails')).toBeInTheDocument();
		expect(screen.getByText('Forwarding')).toBeInTheDocument();
		expect(screen.getByText('Sending Mails')).toBeInTheDocument();
		expect(screen.getByText('Contact Options')).toBeInTheDocument();
	});
});

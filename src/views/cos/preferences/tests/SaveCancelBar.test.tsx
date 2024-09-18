/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { setup } from '../../../../tests/testUtils';
import SaveCancelBar from '../SaveCancelBar';

describe('SaveCancelBar', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	const mockOnSave = jest.fn();
	const mockOnCancel = jest.fn();

	it('should renders SaveCancelBar with buttons when isDirty is true', () => {
		setup(<SaveCancelBar isDirty onSave={mockOnSave} onCancel={mockOnCancel} />);

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Save')).toBeInTheDocument();
	});
	it('should not show buttons when isDirty is false', () => {
		setup(<SaveCancelBar isDirty={false} onSave={mockOnSave} onCancel={mockOnCancel} />);

		expect(screen.getByText('Preferences')).toBeInTheDocument();
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.queryByText('Save')).not.toBeInTheDocument();
	});

	it('should call onSave when Save button is clicked', async () => {
		const { user } = setup(<SaveCancelBar isDirty onSave={mockOnSave} onCancel={mockOnCancel} />);

		await user.click(screen.getByText('Save'));

		expect(mockOnSave).toHaveBeenCalledTimes(1);
	});

	it('should call onCancel when Cancel button is clicked', async () => {
		const { user } = setup(<SaveCancelBar isDirty onSave={mockOnSave} onCancel={mockOnCancel} />);

		await user.click(screen.getByText('Cancel'));

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});
});

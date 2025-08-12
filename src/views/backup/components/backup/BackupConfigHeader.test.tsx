/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import BackupConfigHeader from './BackupConfigHeader';
import { setup } from '../../../../tests/testUtils';

describe('BackupConfigHeader', () => {
	const mockT = (key: string, fallback?: string): string => fallback || key;
	const defaultProps = {
		title: 'Backup Configuration',
		isDirty: false,
		onCancel: jest.fn(),
		onSave: jest.fn(),
		t: mockT
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('renders title correctly', () => {
		setup(<BackupConfigHeader {...defaultProps} />);
		expect(screen.getByText('Backup Configuration')).toBeInTheDocument();
	});

	test('does not show save and cancel buttons when isDirty is false', () => {
		setup(<BackupConfigHeader {...defaultProps} isDirty={false} />);
		expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
		expect(screen.queryByText('Save')).not.toBeInTheDocument();
	});

	test('shows save and cancel buttons when isDirty is true', () => {
		setup(<BackupConfigHeader {...defaultProps} isDirty />);
		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Save')).toBeInTheDocument();
	});

	test('calls onCancel when cancel button is clicked', async () => {
		const onCancel = jest.fn();
		const { user } = setup(<BackupConfigHeader {...defaultProps} isDirty onCancel={onCancel} />);

		await user.click(screen.getByText('Cancel'));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	test('calls onSave when save button is clicked', async () => {
		const onSave = jest.fn();
		const { user } = setup(<BackupConfigHeader {...defaultProps} isDirty onSave={onSave} />);

		await user.click(screen.getByText('Save'));
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	test('uses translation function for button labels', () => {
		const mockTranslation = jest.fn((key, fallback) => {
			if (key === 'label.cancel') return 'Annuler';
			if (key === 'label.save') return 'Sauvegarder';
			return fallback || key;
		});

		setup(<BackupConfigHeader {...defaultProps} isDirty t={mockTranslation} />);

		expect(screen.getByText('Annuler')).toBeInTheDocument();
		expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
		expect(mockTranslation).toHaveBeenCalledWith('label.cancel', 'Cancel');
		expect(mockTranslation).toHaveBeenCalledWith('label.save', 'Save');
	});

	test('renders with custom title', () => {
		setup(<BackupConfigHeader {...defaultProps} title="Custom Backup Title" />);
		expect(screen.getByText('Custom Backup Title')).toBeInTheDocument();
	});
});

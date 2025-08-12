/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { setup } from '../../../../../tests/testUtils';
import BackupRouteLeavingGuard from '../BackupRouteLeavingGuard';

jest.mock('../../../../../views/ui-extras/nav-guard', () => ({
	RouteLeavingGuard: ({
		when,
		onSave,
		children
	}: {
		when?: boolean;
		onSave: () => void;
		children?: React.ReactNode;
	}): JSX.Element => (
		<div data-testid="route-leaving-guard" data-when={when}>
			{children}
			<button onClick={onSave} data-testid="mock-save-button">
				Mock Save
			</button>
		</div>
	)
}));

describe('BackupRouteLeavingGuard', () => {
	const mockT = (key: string, fallback?: string): string => fallback || key;
	const defaultProps = {
		isDirty: false,
		onSave: jest.fn(),
		t: mockT
	};

	const UNSAVED_CHANGES_DETAIL = 'Are you sure you want to leave this page without saving?';
	const UNSAVED_CHANGES_TITLE = 'All your unsaved changes will be lost';
	const ROUTE_LEAVING_GUARD = 'route-leaving-guard';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('renders warning messages correctly', () => {
		setup(<BackupRouteLeavingGuard {...defaultProps} />);

		expect(screen.getByText(UNSAVED_CHANGES_DETAIL)).toBeInTheDocument();
		expect(screen.getByText(UNSAVED_CHANGES_TITLE)).toBeInTheDocument();
	});

	test('passes isDirty prop to RouteLeavingGuard as when prop', () => {
		setup(<BackupRouteLeavingGuard {...defaultProps} isDirty />);

		const routeLeavingGuard = screen.getByTestId(ROUTE_LEAVING_GUARD);
		expect(routeLeavingGuard).toHaveAttribute('data-when', 'true');
	});

	test('passes isDirty false to RouteLeavingGuard', () => {
		setup(<BackupRouteLeavingGuard {...defaultProps} isDirty={false} />);

		const routeLeavingGuard = screen.getByTestId(ROUTE_LEAVING_GUARD);
		expect(routeLeavingGuard).toHaveAttribute('data-when', 'false');
	});

	test('passes onSave callback to RouteLeavingGuard', async () => {
		const onSave = jest.fn();
		const { user } = setup(<BackupRouteLeavingGuard {...defaultProps} onSave={onSave} />);

		await user.click(screen.getByTestId('mock-save-button'));
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	test('uses translation function for warning messages', () => {
		const mockTranslation = jest.fn((key, fallback): string => {
			if (key === 'label.unsaved_changes_line1')
				return 'Êtes-vous sûr de vouloir quitter cette page sans sauvegarder?';
			if (key === 'label.unsaved_changes_line2')
				return 'Tous vos changements non sauvegardés seront perdus';
			return fallback || key;
		});

		setup(<BackupRouteLeavingGuard {...defaultProps} t={mockTranslation} />);

		expect(
			screen.getByText('Êtes-vous sûr de vouloir quitter cette page sans sauvegarder?')
		).toBeInTheDocument();
		expect(
			screen.getByText('Tous vos changements non sauvegardés seront perdus')
		).toBeInTheDocument();
		expect(mockTranslation).toHaveBeenCalledWith(
			'label.unsaved_changes_line1',
			UNSAVED_CHANGES_DETAIL
		);
		expect(mockTranslation).toHaveBeenCalledWith(
			'label.unsaved_changes_line2',
			UNSAVED_CHANGES_TITLE
		);
	});

	test('renders children inside RouteLeavingGuard', () => {
		setup(<BackupRouteLeavingGuard {...defaultProps} />);

		// The component renders the warning text as children of RouteLeavingGuard
		const routeLeavingGuard = screen.getByTestId(ROUTE_LEAVING_GUARD);
		expect(routeLeavingGuard).toBeInTheDocument();

		// Check that the text content is within the guard
		expect(screen.getByText(UNSAVED_CHANGES_DETAIL)).toBeInTheDocument();
		expect(screen.getByText(UNSAVED_CHANGES_TITLE)).toBeInTheDocument();
	});
});

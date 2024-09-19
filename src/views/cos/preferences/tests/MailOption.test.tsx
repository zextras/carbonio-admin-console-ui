/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { CosPrefAttributes } from '../../../../../types';
import { setup } from '../../../../tests/testUtils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../../constants';
import MailOptions from '../MailOptions';

describe('MailOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockOnFileUploadMaxSizePerFileChange = jest.fn();
	const mockOnGroupByChange = jest.fn();
	const mockOnCharactorSetChange = jest.fn();
	const mockChangeSwitchOption = jest.fn();

	const cosPrefAttributes: CosPrefAttributes = {
		...DEFAULT_COS_PREF_ATTRIBUTES,
		zimbraFileUploadMaxSizePerFile: '52428800', // 50 MB
		zimbraPrefGroupMailBy: 'conversation',
		zimbraPrefMailDefaultCharset: 'UTF-8',
		zimbraPrefMessageViewHtmlPreferred: 'TRUE',
		zimbraPrefMessageIdDedupingEnabled: 'TRUE',
		zimbraPrefMailToasterEnabled: 'TRUE'
	};

	it('should render MailOptions with the correct elements', () => {
		setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		expect(screen.getByText('Mail Options')).toBeInTheDocument();
		expect(screen.getByText('View mail as HTML')).toBeInTheDocument();
		expect(screen.getByText('Auto-Delete duplicate messages')).toBeInTheDocument();
		expect(screen.getByText('Enable New Mail Toast Notification')).toBeInTheDocument();
		expect(
			// eslint-disable-next-line sonarjs/no-duplicate-string
			screen.getByText('Maximum size (bytes) allowed for each attachment')
		).toBeInTheDocument();
		expect(screen.getByText('~50 MB')).toBeInTheDocument();
	});

	it('should call changeSwitchOption when a switch is toggled', async () => {
		const { user } = setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		await user.click(screen.getByText('View mail as HTML'));
		expect(mockChangeSwitchOption).toHaveBeenCalledWith('zimbraPrefMessageViewHtmlPreferred');
	});

	it('should call onFileUploadMaxSizePerFileChange when the file upload size changes', async () => {
		const { user } = setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		const input = screen.getByLabelText('Maximum size (bytes) allowed for each attachment');
		await user.clear(input);
		await user.type(input, '104857600'); // input event count:  1 for clear input event + 9 for each char count = 10

		expect(mockOnFileUploadMaxSizePerFileChange).toHaveBeenCalledTimes(10);
	});

	it('should not call onFileUploadMaxSizePerFileChange when the file upload size is non numeric', async () => {
		const cosPrefAttributesWithNonNumericValue: CosPrefAttributes = {
			...DEFAULT_COS_PREF_ATTRIBUTES,
			zimbraFileUploadMaxSizePerFile: 'abc'
		};
		const { user } = setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributesWithNonNumericValue}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		// initial render
		expect(mockOnFileUploadMaxSizePerFileChange).toHaveBeenCalledTimes(0);

		// user input
		const input = screen.getByLabelText('Maximum size (bytes) allowed for each attachment');
		await user.clear(input);
		await user.type(input, 'def');

		expect(mockOnFileUploadMaxSizePerFileChange).toHaveBeenCalledTimes(0);
	});

	it('should call onGroupByChange when a different group by option is selected', async () => {
		const { user } = setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		expect(screen.getByText('Display by')).toBeInTheDocument();
		await user.click(screen.getByText('Conversation'));
		await user.click(screen.getByText('Message'));

		expect(mockOnGroupByChange).toHaveBeenCalledWith('message');
	});

	it('should call onCharactorSetChange when a different charset is selected', async () => {
		const { user } = setup(
			<MailOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onFileUploadMaxSizePerFileChange={mockOnFileUploadMaxSizePerFileChange}
				onGroupByChange={mockOnGroupByChange}
				onCharactorSetChange={mockOnCharactorSetChange}
				changeSwitchOption={mockChangeSwitchOption}
			/>
		);

		expect(screen.getByText('Default Charset')).toBeInTheDocument();
		await user.click(screen.getByText('UTF-8'));
		await user.click(screen.getByText('ISO-8859-1'));

		expect(mockOnCharactorSetChange).toHaveBeenCalledWith('ISO-8859-1');
	});
});

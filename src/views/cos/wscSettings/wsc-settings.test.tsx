/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { jest } from '@jest/globals';
import { act, screen, within } from '@testing-library/react';
import { filter } from 'lodash';

import { WscSettings } from './wsc-settings';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { setup } from '../../../tests/testUtils';
import { accountDetail } from '../../domain/manange/accounts/edit-account/tests/mock-edit-account-data';

const wscAttrs = [
	{ name: 'carbonioFeatureWscEnabled', type: 'switch' },
	{ name: 'carbonioWscShowMessageReads', type: 'switch' },
	{ name: 'carbonioWscShowUsersPresence', type: 'switch' },
	{ name: 'carbonioWscVirtualBackgroundEnabled', type: 'switch' },
	{ name: 'carbonioWscVideoCallEnabled', type: 'switch' },
	{ name: 'carbonioWscGroupChatCreation', type: 'switch' },
	{ name: 'carbonioWscPrivateChatCreation', type: 'switch' },
	{ name: 'carbonioWscAttachmentUpload', type: 'switch' },
	{ name: 'carbonioWscRecordingEnabled', type: 'switch', advanced: true },
	{ name: 'carbonioWscMessageDeleteTimeLimit', type: 'select' },
	{ name: 'carbonioWscMessageEditTimeLimit', type: 'select' },
	{ name: 'carbonioWscMaxGroupMembers', type: 'input' },
	{ name: 'carbonioWscMaxRoomPictureSize', type: 'input' },
	{ name: 'carbonioWscMaxAttachmentSize', type: 'input' }
];

const wscCeAttrs = filter(wscAttrs, (attr) => !attr.advanced);

describe('WscSettings - general', () => {
	test.each(wscCeAttrs)('CE: should render the input for changing $name', (attr) => {
		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={jest.fn()} />);
		const element = screen.getByTestId(`inherited-${attr.name}`);
		expect(element).toBeInTheDocument();
	});

	test.each(wscAttrs)('Advanced: should render the input for changing $name', (attr) => {
		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={jest.fn()} />);
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const element = screen.getByTestId(`inherited-${attr.name}`);
		expect(element).toBeInTheDocument();
	});

	test('when carbonioWscVideoCallEnabled is false, all the related attrs are disabled', () => {
		const setFeaturesDetail = jest.fn();
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					...accountDetail,
					carbonioWscVideoCallEnabled: 'FALSE'
				}}
				setFeaturesDetail={setFeaturesDetail}
			/>
		);
		user.click(screen.getByTestId('inherited-carbonioWscVirtualBackgroundEnabled'));
		expect(setFeaturesDetail).not.toHaveBeenCalled();

		user.click(screen.getByTestId('inherited-carbonioWscRecordingEnabled'));
		expect(setFeaturesDetail).not.toHaveBeenCalled();
	});

	test('when carbonioWscAttachmentUpload is false, all the related attrs are disabled', () => {
		const setFeaturesDetail = jest.fn();
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					...accountDetail,
					carbonioWscVideoCallEnabled: 'FALSE'
				}}
				setFeaturesDetail={setFeaturesDetail}
			/>
		);
		user.click(screen.getByTestId('inherited-carbonioWscMaxAttachmentSize'));
		expect(setFeaturesDetail).not.toHaveBeenCalled();
	});
});

const switchAttrs = filter(
	wscAttrs,
	(attr) => attr.name !== 'carbonioFeatureWscEnabled' && attr.type === 'switch'
);
describe('WscSettings - Switch attrs', () => {
	test.each(switchAttrs)(
		'Switch for changing $name is disabled when carbonioFeatureWscEnabled is false',
		(attr) => {
			act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
			setup(
				<WscSettings
					featuresDetail={{
						...accountDetail,
						carbonioFeatureWscEnabled: 'FALSE',
						[attr.name]: 'FALSE'
					}}
					setFeaturesDetail={jest.fn()}
				/>
			);
			const element = screen.getByTestId(`inherited-${attr.name}`);
			const switchIcon = within(element).getByTestId('icon: ToggleLeftOutline');
			expect(switchIcon).toHaveStyle('color: #AAC8EE');
		}
	);

	test.each(switchAttrs)('Reset $name', async (attr) => {
		const setEmptyValue = jest.fn();
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					[attr.name]: 'FALSE'
				}}
				setFeaturesDetail={jest.fn()}
				cosDetail={accountDetail}
				accSpecificDetail={{ [attr.name]: 'TRUE' }}
				setEmptyValue={setEmptyValue}
			/>
		);
		const element = screen.getByTestId(`inherited-${attr.name}`);
		await user.click(within(element).getByTestId('icon: RefreshOutline'));
		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
		await user.hover(within(element).getByTestId('icon: ToggleLeftOutline'));
	});
});

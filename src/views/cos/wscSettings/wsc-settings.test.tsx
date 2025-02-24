/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { jest } from '@jest/globals';
import { act, screen } from '@testing-library/react';
import { filter } from 'lodash';

import { WscSettings } from './wsc-settings';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { setup } from '../../../tests/testUtils';
import { accountDetail } from '../../domain/manange/accounts/edit-account/tests/mock-edit-account-data';

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
				backupEnabled: [
					{
						configName: 'default',
						configType: 'cos',
						value: false
					}
				],
				backupSelfUndeleteAllowed: [
					{
						configName: 'default',
						configType: 'cos',
						value: true
					}
				]
			}
		})
}));

jest.mock('../../../services/set-core-attributes', () => ({
	setCoreAttributes: jest.fn()
}));

const wscCeAttrs = [
	'carbonioFeatureChatsEnabled',
	'carbonioWscShowMessageReads',
	'carbonioWscShowUsersPresence',
	'carbonioWscVirtualBackgroundEnabled',
	'carbonioWscVideoCallEnabled',
	'carbonioWscGroupChatCreation',
	'carbonioWscPrivateChatCreation',
	'carbonioWscAttachmentUpload',
	'carbonioWscMessageDeleteTimeLimit',
	'carbonioWscMessageEditTimeLimit',
	'carbonioWscMaxGroupMembers',
	'carbonioWscMaxRoomPictureSize',
	'carbonioWscMaxAttachmentSize'
];

const wscAdvancedAttrs = ['carbonioWscRecordingEnabled'];

const allWscAttrs = [...wscCeAttrs, ...wscAdvancedAttrs];

const secondLevelAttrs = filter(allWscAttrs, (attr) => attr !== 'carbonioFeatureChatsEnabled');

const setFeaturesDetail = jest.fn();

describe('WscSettings', () => {
	test.each(wscCeAttrs)('CE: should render the input for changing %s', (attr) => {
		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={setFeaturesDetail} />);
		const element = screen.getByTestId(`inherited-${attr}`);
		expect(element).toBeInTheDocument();
	});

	test.each(allWscAttrs)('Advanced: should render the input for changing %s', (attr) => {
		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={setFeaturesDetail} />);
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const element = screen.getByTestId(`inherited-${attr}`);
		expect(element).toBeInTheDocument();
	});

	test.each(secondLevelAttrs)(
		'input for changing %s is disabled when carbonioFeatureChatsEnabled is false',
		(attr) => {
			act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
			const { user } = setup(
				<WscSettings
					featuresDetail={{
						...accountDetail,
						carbonioFeatureChatsEnabled: 'FALSE'
					}}
					setFeaturesDetail={setFeaturesDetail}
				/>
			);
			const element = screen.getByTestId(`inherited-${attr}`);
			user.click(element);
			expect(setFeaturesDetail).not.toHaveBeenCalled();
		}
	);

	test('when carbonioWscVideoCallEnabled is false, all the related attrs are disabled', () => {
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

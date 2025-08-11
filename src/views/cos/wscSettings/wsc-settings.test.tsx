/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
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

const iconRefreshOutline = 'icon: RefreshOutline';

jest.mock('../../../services/subscription-service', () => ({
	fetchSoap: (): Promise<unknown> =>
		Promise.resolve({
			response: {
				content: JSON.stringify({
					ok: true,
					response: {
						features: [
							{
								name: 'wsc_basic',
								enabled: true
							}
						]
					}
				})
			}
		})
}));

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

	test('Reset carbonioFeatureWscEnabled', async () => {
		const setEmptyValue = jest.fn();
		const { user } = setup(
			<WscSettings
				featuresDetail={{ carbonioFeatureWscEnabled: 'FALSE' }}
				setFeaturesDetail={jest.fn()}
				cosDetail={accountDetail}
				accSpecificDetail={{ carbonioFeatureWscEnabled: 'TRUE' }}
				setEmptyValue={setEmptyValue}
			/>
		);

		const iconCheckbox = screen.getByTestId('reset-inherited-carbonioFeatureWscEnabled');
		expect(iconCheckbox).toHaveStyle('pointer-events: none');
		await waitFor(() => {
			expect(iconCheckbox).not.toHaveStyle('pointer-events: none');
		});
		expect(iconCheckbox).toHaveStyle('pointer-events: all');

		await user.click(iconCheckbox);
		expect(setEmptyValue).toHaveBeenCalledWith('carbonioFeatureWscEnabled');
	});
});

const switchAttrs = filter(
	wscAttrs,
	(attr) => attr.name !== 'carbonioFeatureWscEnabled' && attr.type === 'switch'
);
describe('WscSettings - Switch attrs', () => {
	test.each(switchAttrs)(
		'$name switch is disabled when carbonioFeatureWscEnabled is false',
		(attr) => {
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
			act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
			const element = screen.getByTestId(`inherited-${attr.name}`);
			const switchIcon = within(element).getByTestId('icon: ToggleLeftOutline');
			expect(switchIcon).toHaveStyle('color: #AAC8EE');
		}
	);

	test.each(switchAttrs)('Reset $name switch', async (attr) => {
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
		await user.click(within(element).getByTestId(iconRefreshOutline));
		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
		await user.hover(element);
	});
});

const selectAttrs = filter(wscAttrs, (attr) => attr.type === 'select');
describe('WscSettings - Select attrs', () => {
	test.each(selectAttrs)(
		'$name select is disabled when carbonioFeatureWscEnabled is false',
		(attr) => {
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
			const selectIcon = within(element).getByTestId('icon: ArrowDown');
			expect(selectIcon).toHaveStyle('color: #CFD5DC');
		}
	);

	test.each(selectAttrs)('Change selection $name', async (attr) => {
		const setFeaturesDetails = jest.fn();
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					carbonioFeatureWscEnabled: 'TRUE',
					[attr.name]: '5m'
				}}
				setFeaturesDetail={setFeaturesDetails}
			/>
		);
		const element = screen.getByTestId(`inherited-${attr.name}`);
		await user.click(within(element).getByText('5 minute time limit'));
		await user.click(screen.getByText('10 minute time limit'));
		expect(setFeaturesDetails).toHaveBeenCalled();
	});

	test.each(selectAttrs)('Reset select $name', async (attr) => {
		const setEmptyValue = jest.fn();
		act(() => useAuthIsAdvanced.getState().setIsAdvanced(true));
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					carbonioFeatureWscEnabled: 'TRUE',
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
		await user.hover(element);
	});
});

const inputAttrs = filter(wscAttrs, (attr) => attr.type === 'input');
describe('WscSettings - Input attrs', () => {
	test.each(inputAttrs)(
		'$name input is disabled when carbonioFeatureWscEnabled is false',
		(attr) => {
			setup(
				<WscSettings
					featuresDetail={{
						...accountDetail,
						carbonioFeatureWscEnabled: 'FALSE'
					}}
					setFeaturesDetail={jest.fn()}
				/>
			);
			const element = screen.getByTestId(`inherited-${attr.name}`);
			const inputElement = within(element).getByRole('textbox');
			expect(inputElement).toBeDisabled();
		}
	);

	test.each(inputAttrs)('Change $name input', async (attr) => {
		const setFeaturesDetails = jest.fn();
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					carbonioFeatureWscEnabled: 'TRUE',
					[attr.name]: '5'
				}}
				setFeaturesDetail={setFeaturesDetails}
			/>
		);
		const element = screen.getByTestId(`inherited-${attr.name}`);
		const inputElement = within(element).getByRole('textbox');
		await user.type(inputElement, '100');
		expect(setFeaturesDetails).toHaveBeenCalled();
	});

	test.each(inputAttrs)('Reset $name input', async (attr) => {
		const setEmptyValue = jest.fn();
		const { user } = setup(
			<WscSettings
				featuresDetail={{
					carbonioFeatureWscEnabled: 'TRUE',
					[attr.name]: 'FALSE'
				}}
				setFeaturesDetail={jest.fn()}
				cosDetail={accountDetail}
				accSpecificDetail={{ [attr.name]: 'TRUE' }}
				setEmptyValue={setEmptyValue}
			/>
		);
		const element = screen.getByTestId(`inherited-${attr.name}`);
		await user.click(within(element).getByTestId(iconRefreshOutline));
		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
		await user.hover(element);
	});
});

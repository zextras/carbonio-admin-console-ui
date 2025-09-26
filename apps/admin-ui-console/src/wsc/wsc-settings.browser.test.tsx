/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filter } from 'lodash';
import { describe } from 'vitest';

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

// jest.mock('../services/subscription-service', () => ({
// 	fetchSoap: (): Promise<unknown> =>
// 		Promise.resolve({
// 			response: {
// 				content: JSON.stringify({
// 					ok: true,
// 					response: {
// 						features: [
// 							{
// 								name: 'wsc_basic',
// 								enabled: true
// 							}
// 						]
// 					}
// 				})
// 			}
// 		})
// }));
//
describe.skip('WscSettings - general', () => {
	// 	test.each(wscCeAttrs)('CE: should render the input for changing $name', async (attr) => {
	// 		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={jest.fn()} />);
	// 		expect(await screen.findByTestId(`inherited-${attr.name}`)).toBeVisible();
	// 	});
	//
	// 	test.each(wscAttrs)('Advanced: should render the input for changing $name', async (attr) => {
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		setup(<WscSettings featuresDetail={accountDetail} setFeaturesDetail={jest.fn()} />);
	// 		expect(await screen.findByTestId(`inherited-${attr.name}`)).toBeVisible();
	// 	});
	//
	// 	test('when carbonioWscVideoCallEnabled is false, all the related attrs are disabled', async () => {
	// 		const setFeaturesDetail = jest.fn();
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					...accountDetail,
	// 					carbonioWscVideoCallEnabled: 'FALSE'
	// 				}}
	// 				setFeaturesDetail={setFeaturesDetail}
	// 			/>
	// 		);
	// 		await user.click(await screen.findByTestId('inherited-carbonioWscVirtualBackgroundEnabled'));
	// 		expect(setFeaturesDetail).not.toHaveBeenCalled();
	//
	// 		await user.click(screen.getByTestId('inherited-carbonioWscRecordingEnabled'));
	// 		expect(setFeaturesDetail).not.toHaveBeenCalled();
	// 	});
	//
	// 	test('when carbonioWscAttachmentUpload is false, all the related attrs are disabled', async () => {
	// 		const setFeaturesDetail = jest.fn();
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					...accountDetail,
	// 					carbonioWscVideoCallEnabled: 'FALSE'
	// 				}}
	// 				setFeaturesDetail={setFeaturesDetail}
	// 			/>
	// 		);
	// 		await user.click(await screen.findByTestId('inherited-carbonioWscMaxAttachmentSize'));
	// 		expect(setFeaturesDetail).not.toHaveBeenCalled();
	// 	});
	//
	// 	test('Reset carbonioFeatureWscEnabled', async () => {
	// 		const setEmptyValue = jest.fn();
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{ carbonioFeatureWscEnabled: 'FALSE' }}
	// 				setFeaturesDetail={jest.fn()}
	// 				cosDetail={accountDetail}
	// 				accSpecificDetail={{ carbonioFeatureWscEnabled: 'TRUE' }}
	// 				setEmptyValue={setEmptyValue}
	// 			/>
	// 		);
	//
	// 		const element = await screen.findByTestId('inherited-carbonioFeatureWscEnabled');
	// 		await user.click(within(element).getByTestId(iconRefreshOutline));
	// 		expect(setEmptyValue).toHaveBeenCalledWith('carbonioFeatureWscEnabled');
	// 		await user.hover(element);
	// 	});
	// });
	//
	// const switchAttrs = filter(
	// 	wscAttrs,
	// 	(attr) => attr.name !== 'carbonioFeatureWscEnabled' && attr.type === 'switch'
	// );
	// describe('WscSettings - Switch attrs', () => {
	// 	test.each(switchAttrs)(
	// 		'$name switch is disabled when carbonioFeatureWscEnabled is false',
	// 		async (attr) => {
	// 			useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 			setup(
	// 				<WscSettings
	// 					featuresDetail={{
	// 						...accountDetail,
	// 						carbonioFeatureWscEnabled: 'FALSE',
	// 						[attr.name]: 'FALSE'
	// 					}}
	// 					setFeaturesDetail={jest.fn()}
	// 				/>
	// 			);
	// 			const switchIcon = within(await screen.findByTestId(`inherited-${attr.name}`)).getByTestId(
	// 				'icon: ToggleLeftOutline'
	// 			);
	// 			expect(switchIcon).toHaveStyle('color: #AAC8EE');
	// 		}
	// 	);
	//
	// 	test.each(switchAttrs)('Reset $name switch', async (attr) => {
	// 		const setEmptyValue = jest.fn();
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					[attr.name]: 'FALSE'
	// 				}}
	// 				setFeaturesDetail={jest.fn()}
	// 				cosDetail={accountDetail}
	// 				accSpecificDetail={{ [attr.name]: 'TRUE' }}
	// 				setEmptyValue={setEmptyValue}
	// 			/>
	// 		);
	// 		const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 		await user.click(within(element).getByTestId(iconRefreshOutline));
	// 		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
	// 		await user.hover(element);
	// 	});
	// });
	//
	// const selectAttrs = filter(wscAttrs, (attr) => attr.type === 'select');
	// describe('WscSettings - Select attrs', () => {
	// 	test.each(selectAttrs)(
	// 		'$name select is disabled when carbonioFeatureWscEnabled is false',
	// 		async (attr) => {
	// 			setup(
	// 				<WscSettings
	// 					featuresDetail={{
	// 						...accountDetail,
	// 						carbonioFeatureWscEnabled: 'FALSE',
	// 						[attr.name]: 'FALSE'
	// 					}}
	// 					setFeaturesDetail={jest.fn()}
	// 				/>
	// 			);
	// 			const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 			const selectIcon = within(element).getByTestId('icon: ArrowDown');
	// 			expect(selectIcon).toHaveStyle('color: #CFD5DC');
	// 		}
	// 	);
	//
	// 	test.each(selectAttrs)('Change selection $name', async (attr) => {
	// 		const setFeaturesDetails = jest.fn();
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					carbonioFeatureWscEnabled: 'TRUE',
	// 					[attr.name]: '5m'
	// 				}}
	// 				setFeaturesDetail={setFeaturesDetails}
	// 			/>
	// 		);
	// 		const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 		await user.click(within(element).getByText('5 minute time limit'));
	// 		await user.click(screen.getByText('10 minute time limit'));
	// 		expect(setFeaturesDetails).toHaveBeenCalled();
	// 	});
	//
	// 	test.each(selectAttrs)('Reset select $name', async (attr) => {
	// 		const setEmptyValue = jest.fn();
	// 		useAuthIsAdvanced.getState().setIsAdvanced(true);
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					carbonioFeatureWscEnabled: 'TRUE',
	// 					[attr.name]: 'FALSE'
	// 				}}
	// 				setFeaturesDetail={jest.fn()}
	// 				cosDetail={accountDetail}
	// 				accSpecificDetail={{ [attr.name]: 'TRUE' }}
	// 				setEmptyValue={setEmptyValue}
	// 			/>
	// 		);
	// 		const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 		await user.click(within(element).getByTestId('icon: RefreshOutline'));
	// 		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
	// 		await user.hover(element);
	// 	});
	// });
	//
	// const inputAttrs = filter(wscAttrs, (attr) => attr.type === 'input');
	// describe('WscSettings - Input attrs', () => {
	// 	test.each(inputAttrs)(
	// 		'$name input is disabled when carbonioFeatureWscEnabled is false',
	// 		async (attr) => {
	// 			setup(
	// 				<WscSettings
	// 					featuresDetail={{
	// 						...accountDetail,
	// 						carbonioFeatureWscEnabled: 'FALSE'
	// 					}}
	// 					setFeaturesDetail={jest.fn()}
	// 				/>
	// 			);
	// 			const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 			const inputElement = within(element).getByRole('textbox');
	// 			expect(inputElement).toBeDisabled();
	// 		}
	// 	);
	//
	// 	test.each(inputAttrs)('Change $name input', async (attr) => {
	// 		const setFeaturesDetails = jest.fn();
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					carbonioFeatureWscEnabled: 'TRUE',
	// 					[attr.name]: '5'
	// 				}}
	// 				setFeaturesDetail={setFeaturesDetails}
	// 			/>
	// 		);
	// 		const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 		const inputElement = within(element).getByRole('textbox');
	// 		await user.type(inputElement, '100');
	// 		expect(setFeaturesDetails).toHaveBeenCalled();
	// 	});
	//
	// 	test.each(inputAttrs)('Reset $name input', async (attr) => {
	// 		const setEmptyValue = jest.fn();
	// 		const { user } = setup(
	// 			<WscSettings
	// 				featuresDetail={{
	// 					carbonioFeatureWscEnabled: 'TRUE',
	// 					[attr.name]: 'FALSE'
	// 				}}
	// 				setFeaturesDetail={jest.fn()}
	// 				cosDetail={accountDetail}
	// 				accSpecificDetail={{ [attr.name]: 'TRUE' }}
	// 				setEmptyValue={setEmptyValue}
	// 			/>
	// 		);
	// 		const element = await screen.findByTestId(`inherited-${attr.name}`);
	// 		await user.click(within(element).getByTestId(iconRefreshOutline));
	// 		expect(setEmptyValue).toHaveBeenCalledWith(attr.name);
	// 		await user.hover(element);
	// 	});
});

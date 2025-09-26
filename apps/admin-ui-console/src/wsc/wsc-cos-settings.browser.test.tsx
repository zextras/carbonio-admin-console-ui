/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe } from 'vitest';

// const mock = (fn: any): jest.MockedFunction<(body: any) => Promise<any>> =>
// 	fn as jest.MockedFunction<typeof fn>;
//
// jest.mock('../services/flush-cache-service', () => ({
// 	flushCache: jest.fn()
// }));
//
// jest.mock('../services/modify-cos-service', () => ({
// 	modifyCos: jest.fn()
// }));
//
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
// beforeEach(() => {
// 	useCosStore.setState({
// 		cos: {
// 			a: [
// 				{ n: 'zimbraId', _content: '123' },
// 				{ n: 'carbonioFeatureWscEnabled', _content: 'FALSE' }
// 			]
// 		}
// 	});
// });
describe.skip('WscCosSettings', () => {
	// test('User changes an attribute and saves', async () => {
	// 	mock(modifyCos).mockResolvedValue({});
	// 	mock(flushCache).mockResolvedValue({});
	// 	const { user } = setup(<WscCosSettings />);
	// 	const inheritedSwitch = await screen.findByTestId(`inherited-carbonioFeatureWscEnabled`);
	// 	const switchIcon = within(inheritedSwitch).getByTestId('icon: ToggleLeftOutline');
	// 	await user.click(switchIcon);
	// 	await user.click(screen.getByText('Save'));
	// 	expect(modifyCos).toHaveBeenCalled();
	// 	expect(flushCache).toHaveBeenCalled();
	// });
	//
	// test('User cancel his changes, resetting the values', async () => {
	// 	mock(modifyCos).mockResolvedValue({});
	// 	const { user } = setup(<WscCosSettings />);
	// 	const inheritedSwitch = await screen.findByTestId(`inherited-carbonioFeatureWscEnabled`);
	// 	const switchIcon = within(inheritedSwitch).getByTestId('icon: ToggleLeftOutline');
	// 	await user.click(switchIcon);
	// 	await user.click(screen.getByText('Cancel'));
	// 	expect(screen.queryByText('Save')).not.toBeInTheDocument();
	// });
});

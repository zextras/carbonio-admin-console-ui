/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe } from 'vitest';

// Mock the getDomainList service
// jest.mock('../../../../services/search-domain-service', () => ({
// 	getDomainList: jest.fn(() => Promise.resolve({ domain: [{ name: 'example.com' }] }))
// }));

const DOMAIN_INPUT_NAME = 'domain-input';
describe.skip('DomainListChipInput', () => {
	// test('renders the component', () => {
	// 	setup(<DomainListChipInput domainName="test.com" domainList={[]} setDomainList={jest.fn()} />);
	//
	// 	const inputElement = screen.getByTestId(DOMAIN_INPUT_NAME);
	// 	expect(inputElement).toBeInTheDocument();
	// 	expect(inputElement).toHaveTextContent('Search Domain');
	// });
	//
	// test('calls getAllDomainList on input type', async () => {
	// 	const { user } = setup(
	// 		<DomainListChipInput domainName="test.com" domainList={[]} setDomainList={jest.fn()} />
	// 	);
	//
	// 	const inputElement = screen.getByTestId(DOMAIN_INPUT_NAME);
	// 	await user.click(inputElement);
	// });
	//
	// test('should get the chip of already added domain name', async () => {
	// 	setup(
	// 		<DomainListChipInput
	// 			domainName="test.com"
	// 			domainList={[{ label: 'demo.com' }]}
	// 			setDomainList={jest.fn()}
	// 		/>
	// 	);
	//
	// 	const inputElement = screen.getByTestId(DOMAIN_INPUT_NAME);
	// 	expect(inputElement).toBeInTheDocument();
	// 	expect(screen.getByText('demo.com')).toBeInTheDocument();
	// });
});

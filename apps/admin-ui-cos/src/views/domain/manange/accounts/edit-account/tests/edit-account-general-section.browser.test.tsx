/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe } from 'vitest';

// const createSnackbar = (arg: any): CreateSnackbarFn => arg;
// const createSnackbarSpy = jest.fn(createSnackbar);
//
// jest.mock('@zextras/carbonio-design-system', () => ({
// 	...jest.requireActual('@zextras/carbonio-design-system'),
// 	useSnackbar: jest.fn()
// }));
//
// jest.mock('@zextras/carbonio-design-system', () => {
// 	const actual: CreateSnackbarFn = jest.requireActual('@zextras/carbonio-design-system');
// 	return {
// 		...actual,
// 		useSnackbar: jest.fn()
// 	};
// });
//
// const initAccountDetail = { ...accountDetail };
//
// const setAccountDetail = jest.fn((accountDetailObj: AccountType) => ({
// 	...accountDetail,
// 	...accountDetailObj
// }));
//
// const allowedDeletePassword = true;
//
// const accountContextValue = {
// 	accountDetail,
// 	cosDetail: {},
// 	setAccountDetail,
// 	accSpecificDetail: {},
// 	setAccSpecificDetail: jest.fn(),
// 	directMemberList: [],
// 	inDirectMemberList: [],
// 	setDirectMemberList: jest.fn(),
// 	setInDirectMemberList: jest.fn(),
// 	initAccountDetail,
// 	setInitAccountDetail: jest.fn(),
// 	setSignatureItems: jest.fn(),
// 	setSignatureList: jest.fn(),
// 	otpList: [],
// 	getListOtp: jest.fn(),
// 	identitiesList: [],
// 	deligateDetail: {},
// 	setDeligateDetail: jest.fn(),
// 	getIdentitiesList: jest.fn(),
// 	folderList: [],
// 	setFolderList: jest.fn(),
// 	credentialList: [],
// 	getCredentialList: [],
// 	initialGlobalRights: {},
// 	setinitialGlobalRights: jest.fn(),
// 	globalRights: {},
// 	setGlobalRights: jest.fn(),
// 	deleteAdministrationRights: [],
// 	setDeleteAdministrationRights: jest.fn(),
// 	userSessionList: [],
// 	setAllUserSessionList: jest.fn(),
// 	allUserSessionList: [],
// 	setUserSessionList: jest.fn(),
// 	defaultCOS: {},
// 	setDefaultCOS: jest.fn(),
// 	allowedDeletePassword,
// 	setAllowedDeletePassword: jest.fn()
// };

describe.skip('EditAccountGeneralSection', () => {
	// const setupDomainStore = (): void => {
	// 	useDomainStore.getState().setCosList([
	// 		{
	// 			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
	// 			name: 'default',
	// 			isDefaultCos: true,
	// 			a: [
	// 				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
	// 				{ n: 'zimbraPrefLocale', _content: 'en' },
	// 				{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' }
	// 			]
	// 		}
	// 	]);
	// 	useDomainStore.getState().setDomain(domain);
	// };
	//
	// beforeEach(() => {
	// 	jest.resetAllMocks();
	// 	setupDomainStore();
	// 	jest.clearAllMocks();
	// 	(useSnackbar as jest.Mock).mockReturnValue(createSnackbarSpy);
	// });
	// test('renders the component', async () => {
	// 	setup(
	// 		<AccountContext.Provider value={accountContextValue}>
	// 			<EditAccountGeneralSection setChange={jest.fn()} />{' '}
	// 		</AccountContext.Provider>
	// 	);
	// 	await waitFor(() => {
	// 		expect(screen.getByText('Account')).toBeInTheDocument();
	// 	});
	// });
	//
	// test('sure name shuld be valid', async () => {
	// 	setup(
	// 		<AccountContext.Provider value={accountContextValue}>
	// 			<EditAccountGeneralSection setChange={jest.fn()} />{' '}
	// 		</AccountContext.Provider>
	// 	);
	// 	const surenameComponent = screen.getByTestId('surname-input');
	// 	const surenameInputEle = within(surenameComponent).getByRole('textbox');
	// 	await waitFor(() => {
	// 		expect(surenameInputEle).toHaveValue(accountDetail.sn);
	// 	});
	// });
});

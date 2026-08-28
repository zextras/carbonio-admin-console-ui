/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	CustomHeaderFactory,
	CustomTextArea,
	HoverableRowFactory,
	Input,
	LabeledValue,
	ListRow,
	Padding,
	Paging,
	Row,
	Switch,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { searchDirectory, useUserSettings } from '@zextras/ui-shared';
import {
	type ChangeEvent,
	createContext,
	type FC,
	useCallback,
	useContext,
	useMemo,
	useState
} from 'react';
import { useTranslation } from 'react-i18next';

import { LDAP, LDAP_QUERY, TRUE } from '../../../../constants';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { isValidLdapQuery } from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';

const LIMIT = 15;

const LdapQueryLoaderContext = createContext<{ loadMembers: () => void }>({
	loadMembers: (): void => undefined
});

const LdapQueryIcon = (): React.ReactElement => {
	const { loadMembers } = useContext(LdapQueryLoaderContext);
	return (
		<ds-icon
			icon="CheckmarkOutline"
			size="large"
			color="grey"
			onClick={loadMembers}
			style={{ cursor: 'pointer' }}
		></ds-icon>
	);
};

const ListSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const createSnackbar = useSnackbar();
	const [isValidQuery, setIsValidQuery] = useState<boolean>(true);
	const { mailingListDetail, setMailingListDetail } = context;
	const [dynamicListMember, setDynamicListMember] = useState<Array<any>>(
		mailingListDetail?.ldapQueryMembers
	);
	const [isShowLdapQueryMessage, setIsShowLdapQueryMessage] = useState<boolean>(false);
	const [ldapQueryErrorMessage, setLdapQueryErrorMessage] = useState<string | null>('');

	const userSetting = useUserSettings();
	const isDelegatedAdmin = userSetting?.attrs?.zimbraIsDelegatedAdminAccount === TRUE;

	// dist list members offset
	const [offset, setOffset] = useState<number>(0);
	const [dlmCurrentPage, setDlmCurrentPage] = useState(1);

	// filtering
	const [filterMember, setFilterMember] = useState<string>('');

	const setValueByName = useCallback(
		(name: string, value: any) => {
			setMailingListDetail((prev: any) => ({ ...prev, [name]: value }));
		},
		[setMailingListDetail]
	);

	const changeLdapDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			let isValid = false;
			if (newValue.startsWith(LDAP)) {
				setValueByName(e.target.name, newValue);
				isValid = isValidLdapQuery(newValue);
			} else {
				setValueByName(e.target.name, LDAP);
			}
			setIsValidQuery(isValid);
			setIsShowLdapQueryMessage(!isValid);
		},
		[setValueByName]
	);
	const changeResourceDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValueByName(e.target.name, e.target.value);
		},
		[setValueByName]
	);

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const getMemberFromLdapQuery = useCallback(() => {
		const query = mailingListDetail?.memberURL.replace('ldap:///??sub?', '');
		searchDirectory({
			attr: 'cn,description,name,zimbraId',
			type: 'accounts,distributionlists,dynamicgroups,accounts,aliases,dynamicgroups,resources',
			domainName: '',
			query
		})
			.then((data) => {
				const allList: any[] = [];
				const account = data?.account;
				const dl = data?.dl;
				const alias = data?.alias;
				const calresource = data?.calresource;
				const errorFault = data?.Body?.Fault;
				if (errorFault) {
					setIsShowLdapQueryMessage(true);
					setLdapQueryErrorMessage(t('label.query_is_not_valid', 'Query is not valid'));
				} else {
					setIsShowLdapQueryMessage(false);
					setLdapQueryErrorMessage('');
				}
				if (dl) {
					dl.forEach((item: any) => allList.push({ id: item?.id, name: item?.name }));
				}
				if (account) {
					account.forEach((item: any) => allList.push({ id: item?.id, name: item?.name }));
				}
				if (alias) {
					alias.forEach((item: any) => allList.push({ id: item?.id, name: item?.name }));
				}
				if (calresource) {
					calresource.forEach((item: any) => allList.push({ id: item?.id, name: item?.name }));
				}
				if (allList && allList.length > 0) {
					setDynamicListMember(allList);
					setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: allList }));
				} else {
					setDynamicListMember([]);
					setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: [] }));
				}
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
			});
	}, [createSnackbar, mailingListDetail?.memberURL, t, setMailingListDetail]);

	const dynamicListMemberRows: Array<any> = (
		filterMember
			? dynamicListMember.filter((item: any) =>
					item?.name.toLowerCase().includes(filterMember.toLowerCase())
				)
			: (dynamicListMember ?? [])
	).map((item: any) => ({
		id: item?.name,
		columns: [
			<ds-text as="span" size="medium" weight="light" key={item?.id} color="#828282">
				{item?.name}
			</ds-text>,
			''
		]
	}));
	const DLMPagedRows = dynamicListMemberRows.slice(offset, offset + LIMIT);

	const handleInputChangeMember = (e: ChangeEvent<HTMLInputElement>): void => {
		setFilterMember(e.target.value);
		setDlmCurrentPage(1);
		setOffset(0);
	};

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 13rem)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<ds-text as="h3" size="small" weight="bold">
						{t('label.distribution_list_name', 'Distribution List Name')}
					</ds-text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							isRequired
							label={t('label.display_name', 'Display Name')}
							backgroundColor="gray5"
							value={mailingListDetail?.displayName}
							inputName="displayName"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							isRequired
							label={t('label.list_name', 'List Name')}
							backgroundColor="gray5"
							value={mailingListDetail?.prefixName}
							inputName="prefixName"
							onChange={changeResourceDetail}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="fit"
					>
						<ds-icon icon="AtOutline" size="large"></ds-icon>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', left: 'small' }}
					>
						<LabeledValue
							label={t('domain.type_here_a_domain', 'Type here a domain')}
							value={mailingListDetail?.suffixName}
							backgroundColor="gray5"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<Input
							label={t('label.description', 'Description')}
							backgroundColor="gray5"
							value={mailingListDetail?.description}
							inputName="description"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<CustomTextArea
							label={t('label.notes', 'Notes')}
							backgroundColor="gray5"
							value={mailingListDetail?.zimbraNotes}
							inputName="zimbraNotes"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
				{!isDelegatedAdmin && (
					<>
						<Row
							mainAlignment="flex-start"
							width="100%"
							padding={{ top: 'small', bottom: 'small' }}
						>
							<Container padding={{ bottom: 'small' }}>
								<ds-divider />
							</Container>
						</Row>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'medium', bottom: 'medium' }}
							>
								<Switch
									value={mailingListDetail?.dynamic}
									label={t('label.dynamic_mode', 'Dynamic Mode')}
									onClick={(): void => {
										setMailingListDetail((prev: any) => ({
											...prev,
											dynamic: !mailingListDetail?.dynamic
										}));
									}}
									iconColor="primary"
								/>
							</Container>
						</ListRow>
					</>
				)}
				{mailingListDetail?.dynamic && (
					<>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'small', bottom: 'medium' }}
							>
								<LdapQueryLoaderContext.Provider value={{ loadMembers: getMemberFromLdapQuery }}>
								<Input
									isRequired
									label={t('label.distribution_list_url', "Distribution List's URL")}
									backgroundColor="gray5"
									value={mailingListDetail?.memberURL}
									inputName="memberURL"
									onChange={changeLdapDetail}
									hasError={!isValidQuery}
									CustomIcon={LdapQueryIcon}
								/>
								</LdapQueryLoaderContext.Provider>
							</Container>
						</ListRow>
						<ListRow>
							<ds-text as="small" size="small" weight="regular" color="gray1">
								{`${t('label.example_lbl', 'Example:')} ${LDAP_QUERY}`}
							</ds-text>
						</ListRow>
						{isShowLdapQueryMessage && (
							<Row>
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding all={'0'}>
										<ds-text as="span" size="extrasmall" weight="regular" color="error">
											{ldapQueryErrorMessage}
										</ds-text>
									</Padding>
								</Container>
							</Row>
						)}
					</>
				)}
				{mailingListDetail?.dynamic && (
					<>
						<Row padding={{ top: 'large' }}>
							<ds-text as="h3" size="small" weight="bold">
								{t('label.members', 'Members')}
							</ds-text>
						</Row>
						<ListRow padding={{ all: 'small' }}>
							<Container padding={{ bottom: 'large', top: 'large' }}>
								{dynamicListMemberRows.length > 0 && (
									<>
										<Input
											label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
											value={filterMember}
											backgroundColor="gray5"
											onChange={handleInputChangeMember}
											CustomIcon={FilterColumnIcon}
										/>
										<Container padding={{ bottom: 'small' }}>
											<ds-divider />
										</Container>
									</>
								)}
								<Table
									rows={DLMPagedRows}
									headers={memberHeaders}
									showCheckbox={false}
									RowFactory={HoverableRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
								<Container
									style={{
										position: 'sticky',
										bottom: '-4rem'
									}}
								>
									<Container
										orientation="horizontal"
										mainAlignment="space-between"
										background="gray6"
										width="100%"
										padding={{ right: 'extralarge' }}
										height="auto"
									>
										<Container crossAlignment="flex-start">
											<Paging
												totalItem={dynamicListMemberRows.length}
												setOffset={setOffset}
												pageSize={LIMIT}
												currentPageProp={dlmCurrentPage}
												onPageChange={setDlmCurrentPage}
											/>
										</Container>
									</Container>
								</Container>
							</Container>
						</ListRow>
					</>
				)}
			</Container>
		</Container>
	);
};

export default ListSection;

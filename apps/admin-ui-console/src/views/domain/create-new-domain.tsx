/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceHistory, useDomainStore, useMailstoreServers } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Button,
	Text,
	Input,
	Select,
	Padding,
	Divider,
	Tooltip,
	Switch,
	ChipInput,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Attribute, DomainResponse, SelectItem, objectType } from '../../../types';
import {
	ACTIVE,
	DOMAINS_ROUTE_ID,
	GENERAL_SETTINGS,
	HTTPS,
	INTERNAL_GAL,
	MANAGE,
	ZIMBRA_ADMIN_URN
} from '../../constants';
import { createDomain } from '../../services/create-domain';
import { createGalSyncAccount } from '../../services/create-gal-sync-service';
import { createObjectAttribute } from '../../services/create-object-attribute-service';
import { InitDomainForDelegation } from '../../services/init-domain-for-delegation';
import { getCosList } from '../../services/search-cos-service';
import OverlayDivision from '../components/overlayDivision';
import Textarea from '../components/textarea';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import ListRow from '../list/list-row';
import { GbToBytes, isValidEmail } from '../utility/utils';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 70.35rem;
	top: 6.5rem;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

export enum GAL_MODE {
	INTERNAL = 'zimbra',
	EXTERNAL = 'external',
	BOTH = 'both'
}

const CreateDomain: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const history = useHistory();
	const setDomain = useDomainStore((state) => state.setDomain);
	const setDomainView = useDomainStore((state) => state.setDomainView);
	const setIsDomainSupportDelegatedAdmin = useDomainStore(
		(state) => state.setIsDomainSupportDelegatedAdmin
	);
	const [zimbraGalMode, setZimbraGalMode] = useState<string>('Internal');
	const [zimbraPublicServiceHostnameList, setZimbraPublicServiceHostnameList] = useState<
		SelectItem[]
	>([]);
	const [zimbraPublisServiceHostname, setZimbraPublisServiceHostname] = useState<any>();
	const [galSyncAccountName, setGalSyncAccountName] = useState<string>('galsync');
	const [dataSourceName, setDataSourceName] = useState<string>(INTERNAL_GAL);
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [domainName, setDomainName] = useState<string>('');
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');
	const { data: allMailStoreList = [] } = useMailstoreServers();
	const [isDomainDelegatedAdmin, setIsDomainDelegatedAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [carbonioNotificationFrom, setCarbonioNotificationFrom] = useState('');
	const [carbonioNotificationRecipients, setCarbonioNotificationRecipients] = useState<
		{ label: string }[]
	>([]);
	const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const cosList = useDomainStore((state) => state.cosList);
	const setCosList = useDomainStore((state) => state.setCosList);
	const [zimbraDomainDefaultCOSId, setZimbraDomainDefaultCOSId] = useState<string>('');

	useEffect(() => {
		if (allMailStoreList && allMailStoreList.length > 0) {
			const data = allMailStoreList.map((item) => ({
				label: item?.name || '',
				value: item?.name || ''
			}));
			if (data && data.length > 0) {
				setZimbraPublicServiceHostnameList(data);
				setZimbraPublisServiceHostname(data[0]);
			}
		}
	}, [allMailStoreList]);

	const getCreateObjectAttribute = (): void => {
		const target = [
			{
				type: 'domain'
			}
		];
		const domain = [
			{
				by: 'name',
				_content: 'domain.tld'
			}
		];
		createObjectAttribute(target, domain).then((data) => {
			const obj: {
				[key: string]: string | string[];
			} = {};
			const allData = data?.setAttrs[0]?.a;
			if (allData && allData.length > 0) {
				allData.forEach((item: { [key: string]: string }) => {
					if (item?.default) {
						obj[item?.n] = item.default;
					} else {
						obj[item?.n] = [];
					}
				});
			}
		});
	};

	const onPublicServiceProtocolChange = (v: any): void => {
		const item = zimbraPublicServiceHostnameList.find(
			(itemList: SelectItem) => itemList.value === v
		);
		setZimbraPublisServiceHostname(item);
	};

	const getCosLists = (cos: string): any => {
		setIsLoading(true);
		getCosList(cos, 0)
			.then((data) => {
				const searchResponse: any = data;
				if (!!searchResponse && searchResponse?.searchTotal > 0) {
					setCosList(searchResponse?.cos);
					setIsLoading(false);
				} else {
					setCosList([]);
					setIsLoading(false);
				}
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
				setIsLoading(false);
			});
	};

	useEffect(() => {
		getCosLists('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		getCreateObjectAttribute();
	}, []);

	const showSuccessSnackBar = (): void => {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label: t('label.create_domain_success_msg', {
				domainName,
				defaultValue: '{{domainName}} has been created successfully'
			}),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	};

	const routeToDomain = (resp: DomainResponse): void => {
		const domainId = resp?.domain[0]?.id;
		if (domainId) {
			setDomain({
				a: resp?.domain[0]?.a,
				id: domainId,
				name: resp?.domain[0]?.name
			});
			setDomainView(GENERAL_SETTINGS);
		} else {
			replaceHistory(`/`);
		}
	};

	const handleRevokesGrants = useCallback(() => {
		InitDomainForDelegation('/admin/initDomainForDelegation', {
			_jsns: ZIMBRA_ADMIN_URN,
			domain: domainName
		})
			.then((res: objectType) => {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: res?.message
						? res?.message
						: t(
								'label.the_last_changes_has_been_saved_successfully',
								'Changes have been saved successfully'
							),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, domainName, t]);

	const onCreate = (): void => {
		if (isValidEmail(carbonioNotificationFrom ?? '') || carbonioNotificationFrom === '') {
			setHasCarbonioNotificationFromError(false);
			setIsLoading(true);
			let attributes: Attribute[] &
				{
					n: string;
					_content: string[];
				}[] = [];
			attributes.push({
				n: 'zimbraNotes',
				_content: zimbraNotes
			});
			attributes.push({
				n: 'description',
				_content: description
			});
			attributes.push({
				n: 'zimbraGalMode',
				_content: GAL_MODE.INTERNAL
			});
			attributes.push({
				n: 'zimbraGalMaxResults',
				_content: ''
			});
			attributes.push({
				n: 'zimbraAuthMech',
				_content: ''
			});
			attributes.push({
				n: 'zimbraDomainMaxAccounts',
				_content: zimbraDomainMaxAccounts
			});
			if (zimbraMailDomainQuota) {
				attributes.push({
					n: 'zimbraMailDomainQuota',
					_content: GbToBytes(zimbraMailDomainQuota).toString()
				});
			}
			attributes.push({
				n: 'zimbraDomainStatus',
				_content: ACTIVE
			});
			attributes.push({
				n: 'zimbraPublicServiceProtocol',
				_content: HTTPS
			});
			attributes.push({
				n: 'carbonioNotificationFrom',
				_content: carbonioNotificationFrom
			});
			if (zimbraDomainDefaultCOSId && zimbraDomainDefaultCOSId !== '') {
				attributes.push({
					n: 'zimbraDomainDefaultCOSId',
					_content: zimbraDomainDefaultCOSId
				});
			}

			carbonioNotificationRecipients.forEach((item: { label: string }): void => {
				attributes.push({
					n: 'carbonioNotificationRecipients',
					_content: item?.label
				});
			});

			createDomain(domainName, attributes)
				.then((data) => {
					if (zimbraPublisServiceHostname && galSyncAccountName !== '' && dataSourceName) {
						attributes = [];
						const account = [];
						attributes.push({
							n: 'zimbraDataSourcePollingInterval',
							_content: '1d'
						});
						account.push({
							by: 'name',
							_content: `${galSyncAccountName}@${domainName}`
						});
						createGalSyncAccount(
							dataSourceName,
							domainName,
							zimbraPublisServiceHostname.value,
							account,
							GAL_MODE.INTERNAL,
							attributes,
							`_${dataSourceName}`
						).then((resp) => {
							if (isDomainDelegatedAdmin) {
								handleRevokesGrants();
							}
							showSuccessSnackBar();
							routeToDomain(data);
						});
					} else {
						const domain: Attribute = data?.domain[0];
						if (domain) {
							showSuccessSnackBar();
							routeToDomain(data);
						} else {
							createSnackbar({
								key: 'error',
								severity: 'error',
								label: data?.Body?.Fault?.Reason?.Text,
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						}
					}
					setIsLoading(false);
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setIsLoading(false);
				});
		} else {
			setHasCarbonioNotificationFromError(true);
		}
	};

	const onCancel = (): void => {
		history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}`);
	};

	useEffect(() => {
		setIsDomainSupportDelegatedAdmin(!isDomainDelegatedAdmin);
	}, [isDomainDelegatedAdmin, setIsDomainSupportDelegatedAdmin]);

	useEffect(() => {
		if (!!cosList && cosList.length > 0) {
			const arrayItem: any[] = [];
			cosList.forEach((item: any) => {
				arrayItem.push({
					label: item.name,
					value: item.id
				});
			});
			setCosItems(arrayItem);
		}
	}, [cosList]);

	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					background="gray6"
					height="3.625rem"
				>
					<Row width="100%" mainAlignment="flex-start">
						<Padding all="large">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.new_domain', 'New Domain')}
							</Text>
						</Padding>
						<Divider />
					</Row>
				</Container>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 9.375rem)"
					padding={{ top: 'large' }}
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
							>
								<Text size="small" weight="bold" color="gray0">
									{t('label.general_information', 'General Information')}
								</Text>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.type_name_your_domain_will_have',
											'Type the name your domain will have'
										)}
										backgroundColor="gray5"
										value={domainName}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setDomainName(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_manageable_account_for_the_domain',
											'Max manageable account for the domain (0=unlimited)'
										)}
										backgroundColor="gray5"
										value={zimbraDomainMaxAccounts}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraDomainMaxAccounts(e.target.value);
										}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_mainbox_quota_for_the_domain_in_gb',
											'Max mailbox quota for the domain (GB) (0=unlimited)'
										)}
										backgroundColor="gray5"
										value={zimbraMailDomainQuota}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraMailDomainQuota(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ horizontal: 'small', top: 'small', bottom: 'large' }}>
									<Input
										label={t('label.description', 'Description')}
										backgroundColor="gray5"
										value={description}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setDescription(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ horizontal: 'small', top: 'small', bottom: 'large' }}>
									<Textarea
										label={t('label.notes', 'Notes')}
										backgroundColor="gray5"
										value={zimbraNotes}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraNotes(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row
						width="100%"
						mainAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'small' }}
					>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
							>
								<Text size="small" weight="bold" color="gray0">
									{t('label.gal', 'GAL')}
								</Text>
								<Tooltip
									placement="top"
									label={t('label.global_address_list', 'Global Address List')}
								>
									<Text size="small" color="gray0" style={{ textDecoration: 'underline' }}>
										({t('label.what_is_a_gal', "What's a GAL?")})
									</Text>
								</Tooltip>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										value={zimbraGalMode}
										disabled
										label={t('label.gal_mode', 'GAL Mode')}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraGalMode(e.target.value);
										}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.gal_folder_name', 'GAL folder name')}
										backgroundColor="gray5"
										value={galSyncAccountName}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setGalSyncAccountName(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={zimbraPublicServiceHostnameList}
										background="gray5"
										label={t('domain.mail_server', 'Mail Server')}
										showCheckbox={false}
										selection={zimbraPublisServiceHostname}
										onChange={onPublicServiceProtocolChange}
									/>
								</Container>
								<Container padding={{ horizontal: 'small', top: 'small', bottom: 'large' }}>
									<Input
										label={t('label.datasource_name', 'Datasource name')}
										backgroundColor="gray5"
										value={dataSourceName}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setDataSourceName(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<Row
								width="100%"
								mainAlignment="flex-start"
								padding={{ vertical: 'large', horizontal: 'small' }}
							>
								<Divider />
							</Row>
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
							>
								<Text size="small" weight="bold" color="gray0">
									{t('label.class_of_service_cos', 'Class Of Service (COS)')}
								</Text>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={cosItems}
										background="gray5"
										label={t('label.default_class_of_service', 'Default Class of Service')}
										showCheckbox={false}
										onChange={(e: any): any => {
											setZimbraDomainDefaultCOSId(
												cosItems.find((item: any) => item.value === e)?.value
											);
										}}
										selection={
											zimbraDomainDefaultCOSId === ''
												? cosItems[-1]
												: cosItems.find((item: any) => item.value === zimbraDomainDefaultCOSId)
										}
									/>
								</Container>
							</ListRow>
							<Row
								width="100%"
								mainAlignment="flex-start"
								padding={{ vertical: 'large', horizontal: 'small' }}
							>
								<Divider />
							</Row>
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
							>
								<Text size="small" weight="bold" color="gray0">
									{t('label.delegated_administration_title', 'Delegated Administration')}
								</Text>
							</Row>
							<ListRow>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ horizontal: 'small', top: 'large', bottom: 'small' }}
								>
									<Switch
										label={t(
											'label.domain_support_delegated_administration',
											'This domain supports delegated administration'
										)}
										onClick={(): void => setIsDomainDelegatedAdmin(!isDomainDelegatedAdmin)}
										iconColor="primary"
									/>
								</Container>
							</ListRow>
							<Row
								width="100%"
								mainAlignment="flex-start"
								padding={{ vertical: 'large', horizontal: 'small' }}
							>
								<Divider />
							</Row>
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ left: 'large', top: 'large' }}
							>
								<Text size="small" weight="bold" color="gray0">
									{t('label.domain_system_notifications', 'Domain System Notifications')}
								</Text>
							</Row>
							<ListRow>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ horizontal: 'small', top: 'large', bottom: 'small' }}
								>
									<Input
										label={t('label.notification_sender', 'Notification Sender')}
										backgroundColor="gray5"
										value={carbonioNotificationFrom}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setCarbonioNotificationFrom(e.target.value);
										}}
										hasError={hasCarbonioNotificationFromError}
										description={
											hasCarbonioNotificationFromError
												? t('label.notification_error_msg', 'Enter a valid email address.')
												: undefined
										}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ horizontal: 'small', top: 'large', bottom: 'extralarge' }}
								>
									<ChipInput
										placeholder={t('label.send_notifications_to', 'Send notifications to...')}
										background="gray5"
										defaultValue={carbonioNotificationRecipients}
										value={carbonioNotificationRecipients}
										onChange={(emails: any): void => {
											const data: { label: string }[] = [];
											map(emails, (email) => {
												if (isValidEmail(email.label ?? '')) data.push(email);
											});
											setCarbonioNotificationRecipients(data);
										}}
										hasError={some(carbonioNotificationRecipients || [], { error: true })}
										maxChips={null}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>
				<Container
					orientation="horizontal"
					crossAlignment="flex-start"
					mainAlignment="flex-end"
					background="gray6"
					height="3.625rem"
					padding={{ top: 'small', right: 'large' }}
				>
					<Padding right="medium">
						<Button
							label={t('label.cancel', 'Cancel')}
							icon="Close"
							color="secondary"
							onClick={onCancel}
						/>
					</Padding>

					<Button
						label={t('label.create', 'Create')}
						icon="CheckmarkCircle"
						color="primary"
						disabled={domainName === ''}
						onClick={onCreate}
					/>
				</Container>
			</Container>
		</>
	);
};
export default CreateDomain;

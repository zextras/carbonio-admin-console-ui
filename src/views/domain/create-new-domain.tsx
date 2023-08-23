/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Button,
	Text,
	SnackbarManagerContext,
	Input,
	Select,
	Padding,
	Divider,
	Tooltip,
	Switch,
	ChipInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useHistory } from 'react-router-dom';
import { map, some } from 'lodash';
import { createObjectAttribute } from '../../services/create-object-attribute-service';
import { createDomain } from '../../services/create-domain';
import { createGalSyncAccount } from '../../services/create-gal-sync-service';
import {
	ACTIVE,
	DOMAINS_ROUTE_ID,
	GENERAL_SETTINGS,
	HTTPS,
	INTERNAL_GAL,
	MANAGE
} from '../../constants';
import ListRow from '../list/list-row';
import { useMailstoreListStore } from '../../store/mailstore-list/store';
import { useDomainStore } from '../../store/domain/store';
import { Attribute, CreateSnackbarType, DomainResponse, objectType } from '../../../types';
import { InitDomainForDelegation } from '../../services/init-domain-for-delegation';
import { isValidEmail } from '../utility/utils';

// eslint-disable-next-line no-shadow
export enum GAL_MODE {
	INTERNAL = 'zimbra',
	EXTERNAL = 'external',
	BOTH = 'both'
}

const CreateDomain: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const history = useHistory();
	const galModes = useMemo(
		() => [
			{
				label: t('label.internal', 'Internal'),
				value: GAL_MODE.INTERNAL
			},
			{
				label: t('label.external', 'External'),
				value: GAL_MODE.EXTERNAL
			},
			{
				label: t('label.both', 'Both'),
				value: GAL_MODE.BOTH
			}
		],
		[t]
	);
	const setIsDomainSupportDelegatedAdmin = useDomainStore(
		(state) => state.setIsDomainSupportDelegatedAdmin
	);
	const [createObjectAttributeData, setCreateObjectAttributeData] = useState<{
		[key: string]: string | string[];
	}>({});
	const [zimbraGalMode, setZimbraGalMode] = useState<string>('Internal');
	const [zimbraPublicServiceHostnameList, setZimbraPublicServiceHostnameList] = useState<
		{ [key: string]: string }[]
	>([]);
	const [zimbraPublisServiceHostname, setZimbraPublisServiceHostname] = useState<
		| {
				[key: string]: string;
		  }
		| undefined
	>({});
	const [galSyncAccountName, setGalSyncAccountName] = useState<string>('galsync');
	const [dataSourceName, setDataSourceName] = useState<string>(INTERNAL_GAL);
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [domainName, setDomainName] = useState<string>('');
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');
	const allMailStoreList = useMailstoreListStore((state) => state.allMailstoreList);
	const [isDomainDelegatedAdmin, setIsDomainDelegatedAdmin] = useState(false);
	const [carbonioNotificationFrom, setCarbonioNotificationFrom] = useState('');
	const [carbonioNotificationRecipients, setCarbonioNotificationRecipients] = useState<
		{ label: string }[]
	>([]);
	const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
	useEffect(() => {
		if (allMailStoreList && allMailStoreList.length > 0) {
			const data = allMailStoreList.map((item: { [key: string]: string }) => ({
				label: item?.name,
				value: item?.name
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
				setCreateObjectAttributeData(obj);
			}
		});
	};

	const onPublicServiceProtocolChange = (v: string): void => {
		const item = zimbraPublicServiceHostnameList.find(
			(itemList: { [key: string]: string }) => itemList.value === v
		);
		setZimbraPublisServiceHostname(item);
	};

	useEffect(() => {
		getCreateObjectAttribute();
	}, []);

	const showSuccessSnackBar = (): void => {
		createSnackbar({
			key: 'success',
			type: 'success',
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
			replaceHistory(`/${domainId}/${GENERAL_SETTINGS}`);
		} else {
			replaceHistory(`/`);
		}
	};

	const handleRevokesGrants = useCallback(() => {
		InitDomainForDelegation('/admin/initDomainForDelegation', {
			_jsns: 'urn:zimbraAdmin',
			domain: domainName
		})
			.then((res: objectType) => {
				createSnackbar({
					key: 'success',
					type: 'success',
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
					type: 'error',
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
				n: 'zimbraGalMode',
				_content: GAL_MODE.INTERNAL
			});
			attributes.push({
				n: 'zimbraGalMaxResults',
				_content: ''
			});
			attributes.push({
				n: 'zimbraAuthMech',
				_content: GAL_MODE.INTERNAL
			});
			attributes.push({
				n: 'zimbraDomainMaxAccounts',
				_content: zimbraDomainMaxAccounts
			});
			attributes.push({
				n: 'zimbraMailDomainQuota',
				_content: zimbraMailDomainQuota
			});
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
			// eslint-disable-next-line array-callback-return
			carbonioNotificationRecipients.map((item: { label: string }): void => {
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
								type: 'error',
								label: data?.Body?.Fault?.Reason?.Text,
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						}
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
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

	return (
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
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							takeAvwidth="fill"
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
									background="gray5"
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
									background="gray5"
									value={zimbraDomainMaxAccounts}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setZimbraDomainMaxAccounts(e.target.value);
									}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t(
										'label.max_mainbox_quota_for_the_domain_in_bytes',
										'Max mailbox quota for the domain (bytes) (0=unlimited)'
									)}
									background="gray5"
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
									label={t('label.note', 'Note')}
									background="gray5"
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
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-start"
							width="100%"
							background="gray6"
							padding={{ left: 'large', top: 'large' }}
						>
							<Text size="small" weight="bold" color="gray0">
								{t('label.gal_settings', 'GAL Settings ')}&nbsp;
							</Text>
							<Tooltip
								placement="top"
								label={t('label.global_address_list', 'Global Address List')}
							>
								<Text size="small" color="gray0" style={{ 'text-decoration': 'underline' }}>
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
									background="gray5"
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setZimbraGalMode(e.target.value);
									}}
									disable
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.gal_folder_name', 'GAL folder name')}
									background="gray5"
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
									background="gray5"
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
							takeAvwidth="fill"
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
							takeAvwidth="fill"
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
									background="gray5"
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
									onChange={(emails: { label: string }[]): void => {
										const data: { label: string }[] = [];
										map(emails, (email) => {
											if (isValidEmail(email.label ?? '')) data.push(email);
										});
										setCarbonioNotificationRecipients(data);
									}}
									hasError={some(carbonioNotificationRecipients || [], { error: true })}
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
	);
};
export default CreateDomain;

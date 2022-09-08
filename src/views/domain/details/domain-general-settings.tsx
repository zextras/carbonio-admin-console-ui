/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Select,
	Divider,
	Button,
	Padding,
	Icon,
	Shimmer,
	SnackbarManagerContext,
	Modal
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { timeZoneList, getFormatedDate, getDateFromStr } from '../../utility/utils';
import {
	ACTIVE,
	CLOSED,
	DOMAINS_ROUTE_ID,
	HTTP,
	HTTPS,
	LOCKED,
	MAINTENANCE,
	NOT_SET,
	SUSPENDED
} from '../../../constants';
import { modifyDomain } from '../../../services/modify-domain-service';
import { deleteDomain } from '../../../services/delete-domain-service';
import { searchDirectory } from '../../../services/search-directory-service';
import { deleteAccount } from '../../../services/delete-account-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainGeneralSettings: FC = () => {
	const [t] = useTranslation();
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const cosList = useDomainStore((state) => state.cosList);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const removeDomain = useDomainStore((state) => state.removeDomain);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const serviceProtocolItems: any = useMemo(
		() => [
			{
				value: NOT_SET,
				label: t('label.not_set', 'Not Set')
			},
			{
				label: t('label.https', 'https'),
				value: HTTPS
			},
			{
				label: t('label.http', 'http'),
				value: HTTP
			}
		],
		[t]
	);

	const domainStatusItems = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: ACTIVE
			},
			{
				label: t('label.closed', 'Closed'),
				value: CLOSED
			},
			{
				label: t('label.locked', 'Locked'),
				value: LOCKED
			},
			{
				label: t('label.maintenance', 'Maintenance'),
				value: MAINTENANCE
			},
			{
				label: t('label.suspended', 'Suspended'),
				value: SUSPENDED
			}
		],
		[t]
	);

	const [domainData, setDomainData]: any = useState({
		zimbraPrefTimeZoneId: NOT_SET,
		zimbraPublicServiceProtocol: NOT_SET,
		zimbraDomainStatus: ACTIVE,
		zimbraPublicServicePort: '',
		zimbraDNSCheckHostname: '',
		zimbraNotes: '',
		zimbraHelpAdminURL: '',
		zimbraHelpDelegatedURL: '',
		zimbraPublicServiceHostname: '',
		zimbraDomainMaxAccounts: '',
		zimbraDomainAggregateQuota: ''
	});
	const [selectedTimeZone, setSelectedTimeZone]: any = useState(timezones[0]);
	const [selectedPublicServiceProtocol, setSelectedPublicServiceProtocol]: any = useState(
		serviceProtocolItems[0]
	);
	const [domainStatus, setDomainStatus] = useState<any>(domainStatusItems[0]);
	const [domainName, setDomainName] = useState<string>('');
	const [publicServiceHostName, setPublicServiceHostName] = useState<string>('');
	const [zimbraPublicServicePort, setZimbraPublicServicePort] = useState<string>('');
	const [zimbraDNSCheckHostname, setZimbraDNSCheckHostname] = useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [zimbraHelpAdminURL, setZimbraHelpAdminURL] = useState<string>('');
	const [zimbraHelpDelegatedURL, setZimbraHelpDelegatedURL] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [zimbraDomainDefaultCOSId, setZimbraDomainDefaultCOSId] = useState<string>('');
	const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
	const [openDeleteDomainConfirmDialog, setOpenDeleteDomainConfirmDialog] =
		useState<boolean>(false);
	const [domainAccounts, setDomainAccounts] = useState<any[]>([]);
	const [isRequstInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');

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

	useEffect(() => {
		setDomainAccounts([]);
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setDomainName(obj.zimbraDomainName);
			if (obj.zimbraPrefTimeZoneId) {
				setSelectedTimeZone(timezones.find((item) => item.value === obj.zimbraPrefTimeZoneId));
			} else {
				obj.zimbraPrefTimeZoneId = NOT_SET;
				setSelectedTimeZone(timezones[0]);
			}

			if (obj.zimbraPublicServiceProtocol) {
				setSelectedPublicServiceProtocol(
					serviceProtocolItems.find((item: any) => item.value === obj.zimbraPublicServiceProtocol)
				);
			} else {
				obj.zimbraPublicServiceProtocol = NOT_SET;
				setSelectedPublicServiceProtocol(serviceProtocolItems[0]);
			}

			if (obj.zimbraDomainStatus) {
				setDomainStatus(domainStatusItems.find((item) => item.value === obj.zimbraDomainStatus));
			} else {
				setDomainStatus(domainStatusItems[0]);
			}

			if (obj.zimbraPublicServicePort) {
				setZimbraPublicServicePort(obj.zimbraPublicServicePort);
			} else {
				obj.zimbraPublicServicePort = '';
				setZimbraPublicServicePort('');
			}

			if (obj.zimbraDNSCheckHostname) {
				setZimbraDNSCheckHostname(obj.zimbraDNSCheckHostname);
			} else {
				obj.zimbraDNSCheckHostname = '';
				setZimbraDNSCheckHostname('');
			}

			if (obj.zimbraPublicServiceHostname) {
				setPublicServiceHostName(obj.zimbraPublicServiceHostname);
			} else {
				obj.zimbraPublicServiceHostname = '';
				setPublicServiceHostName('');
			}

			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
				setZimbraNotes('');
			}

			if (obj.zimbraHelpAdminURL) {
				setZimbraHelpAdminURL(obj.zimbraHelpAdminURL);
			} else {
				obj.zimbraHelpAdminURL = '';
				setZimbraHelpAdminURL('');
			}

			if (obj.zimbraHelpDelegatedURL) {
				setZimbraHelpDelegatedURL(obj.zimbraHelpDelegatedURL);
			} else {
				obj.zimbraHelpDelegatedURL = '';
				setZimbraHelpDelegatedURL('');
			}
			if (obj.zimbraDomainDefaultCOSId) {
				const getItem = cosItems.find((item: any) => item.value === obj.zimbraDomainDefaultCOSId);
				if (!!getItem && getItem.value) {
					setZimbraDomainDefaultCOSId(getItem.value);
				} else {
					obj.zimbraDomainDefaultCOSId = '';
					setZimbraDomainDefaultCOSId('');
				}
			} else {
				obj.zimbraDomainDefaultCOSId = '';
				setZimbraDomainDefaultCOSId('');
			}

			if (obj.zimbraDomainMaxAccounts) {
				setZimbraDomainMaxAccounts(obj.zimbraDomainMaxAccounts);
			} else {
				obj.zimbraDomainMaxAccounts = '';
				setZimbraDomainMaxAccounts('');
			}

			if (obj.zimbraDomainAggregateQuota) {
				setZimbraMailDomainQuota(obj.zimbraDomainAggregateQuota);
			} else {
				obj.zimbraMailDomainQuota = '';
				setZimbraMailDomainQuota('');
			}

			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, timezones, serviceProtocolItems, domainStatusItems, cosItems]);

	const onTimeZoneChange = (v: any): any => {
		const it = timezones.find((item: any) => item.value === v);
		setSelectedTimeZone(it);
	};

	const onPublicServiceProtocolChange = (v: any): any => {
		const it = serviceProtocolItems.find((item: any) => item.value === v);
		setSelectedPublicServiceProtocol(it);
	};

	const onDomainStatusChange = (v: any): any => {
		const it = domainStatusItems.find((item: any) => item.value === v);
		setDomainStatus(it);
	};

	useEffect(() => {
		if (domainData.zimbraPrefTimeZoneId.toString() !== selectedTimeZone?.value.toString()) {
			setIsDirty(true);
		}
	}, [domainData, selectedTimeZone]);

	useEffect(() => {
		if (domainData.zimbraPublicServiceProtocol !== selectedPublicServiceProtocol.value) {
			setIsDirty(true);
		}
	}, [domainData, selectedPublicServiceProtocol]);

	useEffect(() => {
		if (domainData.zimbraPublicServiceHostname !== publicServiceHostName) {
			setIsDirty(true);
		}
	}, [domainData, publicServiceHostName]);

	useEffect(() => {
		if (domainData.zimbraDomainStatus !== domainStatus.value) {
			setIsDirty(true);
		}
	}, [domainData, domainStatus]);

	useEffect(() => {
		if (domainData.zimbraPublicServicePort !== zimbraPublicServicePort) {
			setIsDirty(true);
		}
	}, [domainData, zimbraPublicServicePort]);

	useEffect(() => {
		if (domainData.zimbraDNSCheckHostname !== zimbraDNSCheckHostname) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDNSCheckHostname]);

	useEffect(() => {
		if (domainData.zimbraNotes !== zimbraNotes) {
			setIsDirty(true);
		}
	}, [domainData, zimbraNotes]);

	useEffect(() => {
		if (domainData.zimbraHelpAdminURL !== zimbraHelpAdminURL) {
			setIsDirty(true);
		}
	}, [domainData, zimbraHelpAdminURL]);

	useEffect(() => {
		if (domainData.zimbraHelpDelegatedURL !== zimbraHelpDelegatedURL) {
			setIsDirty(true);
		}
	}, [domainData, zimbraHelpDelegatedURL]);

	useEffect(() => {
		if (domainData.zimbraDomainDefaultCOSId !== zimbraDomainDefaultCOSId) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainDefaultCOSId]);

	useEffect(() => {
		if (domainData.zimbraDomainMaxAccounts !== zimbraDomainMaxAccounts) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainMaxAccounts]);

	useEffect(() => {
		if (domainData.zimbraDomainAggregateQuota !== zimbraMailDomainQuota) {
			setIsDirty(true);
		}
	}, [domainData, zimbraMailDomainQuota]);

	const onCancel = (): void => {
		setLoading(true);
		setTimeout(() => setLoading(false), 10);
		setSelectedPublicServiceProtocol(
			serviceProtocolItems.find(
				(item: any) => item.value === domainData.zimbraPublicServiceProtocol
			)
		);
		setSelectedTimeZone(timezones.find((item) => item.value === domainData.zimbraPrefTimeZoneId));
		setDomainStatus(domainStatusItems.find((item) => item.value === domainData.zimbraDomainStatus));
		setZimbraPublicServicePort(domainData.zimbraPublicServicePort);
		setZimbraDNSCheckHostname(domainData.zimbraDNSCheckHostname);
		setZimbraNotes(domainData.zimbraNotes);
		setZimbraHelpAdminURL(domainData.zimbraHelpAdminURL);
		setZimbraHelpDelegatedURL(domainData.zimbraHelpDelegatedURL);
		setPublicServiceHostName(domainData.zimbraPublicServiceHostname);
		setZimbraDomainMaxAccounts(domainData.zimbraDomainMaxAccounts);
		setZimbraMailDomainQuota(domainData.zimbraDomainAggregateQuota);
		const getItem = cosItems.find(
			(item: any) => item.value === domainData.zimbraDomainDefaultCOSId
		);
		if (!!getItem && getItem.value) {
			setZimbraDomainDefaultCOSId(getItem.value);
		} else {
			setZimbraDomainDefaultCOSId('');
		}
		setIsDirty(false);
	};

	const onSave = (): void => {
		const body: any = {};
		const attributes: any[] = [];
		body.id = domainData.zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraNotes',
			_content: zimbraNotes
		});
		if (selectedTimeZone.value !== NOT_SET) {
			attributes.push({
				n: 'zimbraPrefTimeZoneId',
				_content: selectedTimeZone.value
			});
		}
		if (selectedPublicServiceProtocol.value !== NOT_SET) {
			attributes.push({
				n: 'zimbraPublicServiceProtocol',
				_content: selectedPublicServiceProtocol.value
			});
		}
		attributes.push({
			n: 'zimbraDomainStatus',
			_content: domainStatus.value
		});
		attributes.push({
			n: 'zimbraPublicServicePort',
			_content: zimbraPublicServicePort
		});
		attributes.push({
			n: 'zimbraDNSCheckHostname',
			_content: zimbraDNSCheckHostname
		});
		attributes.push({
			n: 'zimbraHelpAdminURL',
			_content: zimbraHelpAdminURL
		});
		attributes.push({
			n: 'zimbraHelpDelegatedURL',
			_content: zimbraHelpDelegatedURL
		});
		attributes.push({
			n: 'zimbraDomainMaxAccounts',
			_content: zimbraDomainMaxAccounts
		});
		attributes.push({
			n: 'zimbraDomainAggregateQuota',
			_content: zimbraMailDomainQuota
		});
		if (zimbraDomainDefaultCOSId && zimbraDomainDefaultCOSId !== '') {
			attributes.push({
				n: 'zimbraDomainDefaultCOSId',
				_content: zimbraDomainDefaultCOSId
			});
		}
		attributes.push({
			n: 'zimbraPublicServiceHostname',
			_content: publicServiceHostName
		});
		body.a = attributes;
		modifyDomain(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.domain[0];
				if (domain) {
					setDomain(domain);
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
	};

	const deleteOnlyDomain = (): void => {
		deleteDomain(domainData.zimbraId).then((resData) => {
			setIsRequestInProgress(false);
			setOpenDeleteDomainConfirmDialog(false);
			setDomainAccounts([]);
			createSnackbar({
				key: 'success',
				type: 'success',
				label: t('label.delete_domain_success_msg', 'Domain has been delete successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			removeDomain();
			replaceHistory(`/${DOMAINS_ROUTE_ID}`);
		});
	};

	const onDeleteAccountAndDomain = (): void => {
		setIsRequestInProgress(true);
		const requests = domainAccounts.map((item: any): any => deleteAccount(item?.id));
		Promise.all(requests).then((response) => {
			deleteOnlyDomain();
		});
	};

	const domainCreationDate = useMemo(
		() =>
			!!domainData.zimbraCreateTimestamp && domainData.zimbraCreateTimestamp !== null
				? getFormatedDate(getDateFromStr(domainData.zimbraCreateTimestamp))
				: '',
		[domainData.zimbraCreateTimestamp]
	);

	const onDeleteDomain = (): void => {
		setIsRequestInProgress(true);
		const type = 'accounts,distributionlists,aliases,resources,dynamicgroups';
		const attrs =
			'zimbraAliasTargetId,zimbraId,targetName,uid,type,description,displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,displayName,zimbraId,zimbraMailHost,uid,zimbraAccountStatus,description,zimbraCalResType,displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
		searchDirectory(attrs, type, domainName, '').then((data) => {
			setIsRequestInProgress(false);
			if (data?.searchTotal > 0) {
				const accounts = data?.account;
				if (accounts && accounts.length > 0) {
					setDomainAccounts(accounts);
					setOpenConfirmDialog(false);
					setOpenDeleteDomainConfirmDialog(true);
				} else {
					deleteOnlyDomain();
				}
			} else if (data?.searchTotal === 0) {
				deleteOnlyDomain();
			}
		});
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.general_settings', 'General Settings')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>

			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 150px)"
			>
				{loading ? (
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						width="fill"
						crossAlignment="flex-start"
					>
						<Shimmer.FormSection>
							<Shimmer.FormSubSection />
						</Shimmer.FormSection>
					</Container>
				) : (
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.name', 'Name')}
										value={domainName}
										background="gray6"
										disabled
										// eslint-disable-next-line @typescript-eslint/no-empty-function
										onChange={(e: any): any => {}}
									/>
								</Container>
								{/* <Container padding={{ all: 'small' }}>
									<Input
										label={t('label.certificate', 'Certificate')}
										value=""
										background="gray6"
										// eslint-disable-next-line @typescript-eslint/no-empty-function
										onChange={(e: any): any => {}}
									/>
								</Container> */}
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.id', 'Id')}
										value={domainData.zimbraId}
										background="gray6"
										disabled
										// eslint-disable-next-line @typescript-eslint/no-empty-function
										onChange={(e: any): any => {}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.creation_date', 'Creation Date')}
										value={domainCreationDate}
										background="gray6"
										disabled
										// eslint-disable-next-line @typescript-eslint/no-empty-function
										onChange={(e: any): any => {}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_account_you_can_manage_is',
											'The max accounts you can manage is...'
										)}
										value={zimbraDomainMaxAccounts}
										background="gray6"
										onChange={(e: any): any => {
											setZimbraDomainMaxAccounts(e.target.value);
										}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label."max_email_quota_you_can_manage_is',
											'The max email quota you can manage is...'
										)}
										value={zimbraMailDomainQuota}
										background="gray6"
										onChange={(e: any): any => {
											setZimbraMailDomainQuota(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={serviceProtocolItems}
										background="gray5"
										label={t('label.public_service_protocol', 'Public Service Protocol')}
										showCheckbox={false}
										onChange={onPublicServiceProtocolChange}
										selection={selectedPublicServiceProtocol}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.public_service_hostname', 'Public Service Host Name')}
										value={publicServiceHostName}
										background="gray5"
										onChange={(e: any): any => {
											setPublicServiceHostName(e.target.value);
										}}
									/>
								</Container>

								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.public_service_port', 'Public Service Port')}
										value={zimbraPublicServicePort}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraPublicServicePort(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={timezones}
										background="gray5"
										label={t('label.timezone', 'Time Zone')}
										showCheckbox={false}
										onChange={onTimeZoneChange}
										selection={selectedTimeZone}
									/>
								</Container>
							</ListRow>
							<Container
								orientation="horizontal"
								width="98%"
								crossAlignment="center"
								mainAlignment="space-between"
								style={{ margin: '8px' }}
							>
								<Divider />
							</Container>

							<ListRow>
								<Container
									orientation="horizontal"
									width="99%"
									crossAlignment="center"
									mainAlignment="space-between"
									background="#D3EBF8"
									padding={{
										all: 'large'
									}}
									style={{ margin: '8px' }}
								>
									<Row takeAvwidth="fill" mainAlignment="flex-start">
										<Padding horizontal="small">
											<CustomIcon icon="InfoOutline"></CustomIcon>
										</Padding>
									</Row>
									<Row
										takeAvwidth="fill"
										mainAlignment="flex-start"
										width="100%"
										padding={{
											all: 'small'
										}}
									>
										<Text overflow="break-word">
											{t(
												'label.mx_record_information_msg',
												'If your MX records point to a spam-relay or any other external server, enter the name of that server in "Inbound SMTP Host Name" field.'
											)}
										</Text>
									</Row>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.inbound_smtp_host_name', 'Inbound SMTP Host Name')}
										value={zimbraDNSCheckHostname}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraDNSCheckHostname(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.note', 'Note')}
										value={zimbraNotes}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraNotes(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

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
								<Container padding={{ all: 'small' }}>
									<Select
										items={domainStatusItems}
										background="gray5"
										label={t('label.status', 'Status')}
										defaultSelection={domainStatusItems[0]}
										showCheckbox={false}
										onChange={onDomainStatusChange}
										selection={domainStatus}
									/>
								</Container>
							</ListRow>

							{/* <ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.admin_help_url', 'Admin Help URL')}
										value={zimbraHelpAdminURL}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraHelpAdminURL(e.target.value);
										}}
									/>
								</Container>
							</ListRow> */}

							{/* <ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.deligated_admin_help_url', 'Deligated Admin Help URL')}
										value={zimbraHelpDelegatedURL}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraHelpDelegatedURL(e.target.value);
										}}
									/>
								</Container>
							</ListRow> */}
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Button
										type="outlined"
										label={t('label.delete_domain', 'Delete Domain')}
										icon="Close"
										color="error"
										size="fill"
										onClick={(): void => {
											setOpenConfirmDialog(true);
										}}
									/>
									<Modal
										title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
										open={openConfirmDialog}
										showCloseIcon
										onClose={(): void => {
											setOpenConfirmDialog(false);
										}}
										customFooter={
											<Container orientation="horizontal" mainAlignment="space-between">
												<Button
													label={t('label.need_help', 'NEED HELP?')}
													type="outlined"
													color="primary"
													isSmall
													onClick={(): void => {
														setOpenConfirmDialog(false);
													}}
												/>
												<Container orientation="horizontal" mainAlignment="flex-end">
													<Padding all="small">
														<Button
															label={t('label.no', 'NO')}
															color="secondary"
															isSmall
															onClick={(): void => {
																setOpenConfirmDialog(false);
															}}
														/>
													</Padding>
													<Button
														label={t('label.delete', 'DELETE')}
														color="error"
														isSmall
														onClick={onDeleteDomain}
														disabled={isRequstInProgress}
													/>
												</Container>
											</Container>
										}
									>
										<Padding all="medium">
											<Text overflow="break-word" weight="regular">
												{t('label.delete_domain_error_msg', {
													domainName,
													defaultValue:
														'You are deleting {{domainName}}. Are you sure you want to delete {{domainName}}?'
												})}
											</Text>
										</Padding>
									</Modal>

									{/* Open Delete Forcefully domains */}

									<Modal
										title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
										open={openDeleteDomainConfirmDialog}
										showCloseIcon
										onClose={(): void => {
											setOpenDeleteDomainConfirmDialog(false);
											setDomainAccounts([]);
										}}
										customFooter={
											<Container orientation="horizontal" mainAlignment="space-between">
												<Button
													label={t('label.need_help', 'NEED HELP?')}
													type="outlined"
													color="primary"
													isSmall
												/>
												<Container orientation="horizontal" mainAlignment="flex-end">
													<Padding all="small">
														<Button
															label={t('label.no', 'NO')}
															color="secondary"
															isSmall
															onClick={(): void => {
																setOpenDeleteDomainConfirmDialog(false);
																setDomainAccounts([]);
															}}
														/>
													</Padding>
													<Button
														label={t('label.force_delete', 'Force Delete')}
														color="error"
														isSmall
														onClick={onDeleteAccountAndDomain}
														disabled={isRequstInProgress}
													/>
												</Container>
											</Container>
										}
									>
										<Padding all="medium">
											<Text overflow="break-word" weight="regular">
												{t('label.delete_domain_with_account_content_msg', {
													domainName,
													domainAccounts: domainAccounts.length,
													defaultValue:
														'{{domainName}} is not empty: contains {{domainAccounts}} system accounts and {{domainAccounts}} regular accounts. Are you sure to continue the deletion'
												})}
											</Text>
										</Padding>
									</Modal>
								</Container>
							</ListRow>
						</Container>
					</Row>
				)}
			</Container>

			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};
export default DomainGeneralSettings;

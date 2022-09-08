/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
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
	Tooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useHistory } from 'react-router-dom';
import { createObjectAttribute } from '../../services/create-object-attribute-service';
import { createDomain } from '../../services/create-domain';
import { createGalSyncAccount } from '../../services/create-gal-sync-service';
import { DOMAINS_ROUTE_ID, MANAGE } from '../../constants';
import ListRow from '../list/list-row';

// eslint-disable-next-line no-shadow
export enum GAL_MODE {
	INTERNAL = 'zimbra',
	EXTERNAL = 'external',
	BOTH = 'both'
}

const CreateDomain: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
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
	const [createObjectAttributeData, setCreateObjectAttributeData] = useState<any>({});
	const [zimbraGalMode, setZimbraGalMode] = useState<string>('Internal');
	const [zimbraPublicServiceHostnameList, setZimbraPublicServiceHostnameList] = useState<any>([]);
	const [zimbraPublisServiceHostname, setZimbraPublisServiceHostname] = useState<any>({});
	const [galSyncAccountName, setGalSyncAccountName] = useState<string>('galsync');
	const [dataSourceName, setDataSourceName] = useState<string>('zimbra');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [domainName, setDomainName] = useState<string>('');
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');

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
			const obj: any = {};
			const allData = data?.setAttrs[0]?.a;
			if (allData && allData.length > 0) {
				allData.map((item: any) => {
					if (item?.default) {
						obj[item?.n] = item.default;
					} else {
						obj[item?.n] = [];
					}
					return '';
				});
				const hostnames = obj?.zimbraPublicServiceHostname[0]?.v;
				if (hostnames && Array.isArray(hostnames)) {
					const hostNameList = hostnames.map((item): any => ({
						label: item?._content,
						value: item?._content
					}));
					setZimbraPublicServiceHostnameList(hostNameList);
				}
				setCreateObjectAttributeData(obj);
			}
		});
	};

	const onPublicServiceProtocolChange = (v: any): any => {
		const item = zimbraPublicServiceHostnameList.find((itemList: any) => itemList.value === v);
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

	const routeToDomain = (resp: any): void => {
		const domainId = resp?.domain[0]?.id;
		if (domainId) {
			replaceHistory(`/${domainId}/general_settings`);
		} else {
			replaceHistory(`/`);
		}
	};

	const onCreate = (): void => {
		const body: any = {};
		let attributes: any[] = [];
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
			n: 'zimbraDomainAggregateQuota',
			_content: zimbraMailDomainQuota
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
						`_${dataSourceName}`,
						domainName,
						zimbraPublisServiceHostname.value,
						account,
						GAL_MODE.INTERNAL,
						attributes
					).then((resp) => {
						showSuccessSnackBar();
						routeToDomain(data);
					});
				} else {
					const domain: any = data?.Body?.CreateDomainResponse?.domain[0];
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
	};

	const onCancel = (): void => {
		history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}`);
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				background="gray6"
				height="58px"
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
				height="calc(100vh - 150px)"
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
							<Text size="small" weight="bold" color="#414141">
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
									onChange={(e: any): any => {
										setDomainName(e.target.value);
									}}
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
									background="gray5"
									value={zimbraDomainMaxAccounts}
									onChange={(e: any): any => {
										setZimbraDomainMaxAccounts(e.target.value);
									}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t(
										'label.max_email_quota_you_can_manage_is',
										'The max email quota you can manage is...'
									)}
									background="gray5"
									value={zimbraMailDomainQuota}
									onChange={(e: any): any => {
										setZimbraMailDomainQuota(e.target.value);
									}}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.note', 'Note')}
									background="gray5"
									value={zimbraNotes}
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</ListRow>
					</Container>
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
							<Text size="small" weight="bold" color="#414141">
								{t('label.gal_settings', 'GAL Settings ')}&nbsp;
							</Text>
							<Tooltip
								placement="top"
								label={t('label.global_address_list', 'Global Address List')}
							>
								<Text size="small" color="#414141" style={{ 'text-decoration': 'underline' }}>
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
									onChange={(e: any): any => {
										setZimbraGalMode(e.target.value);
									}}
									disable
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.gay_sync_account_name', 'GAL Sync Account Name')}
									background="gray5"
									value={galSyncAccountName}
									onChange={(e: any): any => {
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
							<Container padding={{ all: 'small' }}>
								<Input
									label={t(
										'label.datasource_name_for_internal_gal',
										'Datasource name for internal GAL'
									)}
									background="gray5"
									value={dataSourceName}
									onChange={(e: any): any => {
										setDataSourceName(e.target.value);
									}}
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
				height="58px"
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

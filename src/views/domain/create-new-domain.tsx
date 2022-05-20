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
	Divider
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { createObjectAttribute } from '../../services/create-object-attribute-service';
import { DOMAINS_ROUTE_ID } from '../../constants';
import { createDomain } from '../../services/create-domain';
import { createGalSyncAccount } from '../../services/create-gal-sync-service';

const SettingRow: FC<{ children?: any; wrap?: any }> = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
		padding={{ all: 'small' }}
	>
		{children}
	</Row>
);

// eslint-disable-next-line no-shadow
export enum GAL_MODE {
	INTERNAL = 'zimbra',
	EXTERNAL = 'external',
	BOTH = 'both'
}

const CreateDomain: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
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
	const [description, setDescription] = useState<string>('');
	const [domainName, setDomainName] = useState<string>('');

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
		createObjectAttribute(target, domain)
			.then((response) => response.json())
			.then((data) => {
				const obj: any = {};
				const allData = data?.Body?.GetCreateObjectAttrsResponse?.setAttrs[0]?.a;
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
		const domainId = resp?.Body?.CreateDomainResponse?.domain[0]?.id;
		if (domainId) {
			replaceHistory(`/${DOMAINS_ROUTE_ID}/${domainId}/general_settings`);
		} else {
			replaceHistory(`/${DOMAINS_ROUTE_ID}`);
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
			n: 'description',
			_content: description
		});
		attributes.push({
			n: 'zimbraAuthMech',
			_content: GAL_MODE.INTERNAL
		});

		createDomain(domainName, attributes)
			.then((response) => response.json())
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
					)
						.then((response) => response.json())
						.then((resp) => {
							showSuccessSnackBar();
							routeToDomain(data);
						});
				} else {
					showSuccessSnackBar();
					routeToDomain(data);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const onCancel = (): void => {
		replaceHistory(`/${DOMAINS_ROUTE_ID}`);
	};

	return (
		<Container padding={{ all: 'large' }} background="gray5">
			<Container
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				background="gray6"
				height="58px"
			>
				<Row width="100%" mainAlignment="flex-start">
					<Padding all="large">
						<Text size="medium" weight="bold" color="gray0">
							{t('domain.new_domain', 'New Domain')}
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
				height="calc(100vh - 200px)"
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
						<SettingRow>
							<Container padding={{ left: 'small', right: 'small' }}>
								<Input
									label={t('label.domain_name', 'Domain Name')}
									background="gray5"
									value={domainName}
									onChange={(e: any): any => {
										setDomainName(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
						<SettingRow>
							<Container padding={{ left: 'small', right: 'small' }}>
								<Input
									label={t('label.description', 'Description')}
									background="gray5"
									value={description}
									onChange={(e: any): any => {
										setDescription(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
						<SettingRow>
							<Container padding={{ left: 'small', right: 'small' }}>
								<Input
									label={t('label.note', 'Note')}
									background="gray5"
									value={zimbraNotes}
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
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
								{t('label.gal_settings', 'GAL Settings')}
							</Text>
						</Row>
						<SettingRow>
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
						</SettingRow>

						<SettingRow>
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
						</SettingRow>

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
									color="primary"
									onClick={onCancel}
								/>
							</Padding>

							<Button
								label={t('label.create', 'Create')}
								icon="CheckmarkCircle"
								color="secondary"
								disabled={domainName === ''}
								onClick={onCreate}
							/>
						</Container>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};
export default CreateDomain;

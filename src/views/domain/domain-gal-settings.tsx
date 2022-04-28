/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
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
import { getAccount } from '../../services/get-account-service';
import { getDatasource } from '../../services/get-datasource-service';

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
export enum RANGE {
	DAYS = 'days',
	HOURS = 'hours',
	MINUTES = 'minutes',
	SECONDS = 'seconds'
}

const DomainGalSettings: FC<{ domainInformation: any; cosList: any }> = ({
	domainInformation,
	cosList
}) => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [domainData, setDomainData]: any = useState({
		zimbraGalMaxResults: '',
		zimbraGalAccountId: '',
		zimbraGalMode: ''
	});
	const [zimbraGalMaxResults, setZimbraGalMaxResults] = useState<string>('');
	const [zimbraGalAccountId, setZimbraGalAccountId] = useState<string>('');
	const [zimbraGalAccountName, setZimbraGalAccountName] = useState<string>('');
	const [mailServerName, setMailServerName] = useState<string>('');

	const getGalAccount = (accountId: string): void => {
		getAccount(accountId)
			.then((response) => response.json())
			.then((data) => {
				const galAccount: any = data?.Body?.GetAccountResponse?.account[0];
				if (galAccount) {
					setZimbraGalAccountName(galAccount?.name);
					if (galAccount?.a) {
						const obj: any = {};
						galAccount?.a.map((item: any) => {
							obj[item?.n] = item._content;
							return '';
						});
						if (obj?.zimbraMailHost) {
							setMailServerName(obj?.zimbraMailHost);
						} else {
							setMailServerName('');
						}
					}
				}
			});
	};

	const getDomainDataSource = (accountId: string): void => {
		getDatasource(accountId)
			.then((response) => response.json())
			.then((data) => {
				console.log('$$$DataSource$$', data);
			});
	};

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});

			if (obj.zimbraGalMaxResults) {
				setZimbraGalMaxResults(obj.zimbraGalMaxResults);
			} else {
				obj.zimbraGalMaxResults = '';
				setZimbraGalMaxResults('');
			}

			if (obj.zimbraGalAccountId) {
				setZimbraGalAccountId(obj.zimbraGalAccountId);
			} else {
				obj.zimbraGalAccountId = '';
				setZimbraGalAccountId('');
			}

			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation]);

	useEffect(() => {
		if (zimbraGalAccountId !== '') {
			getGalAccount(zimbraGalAccountId);
			getDomainDataSource(zimbraGalAccountId);
		} else {
			setZimbraGalAccountName('');
			setMailServerName('');
		}
	}, [zimbraGalAccountId]);
	const rangeItems = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: RANGE.DAYS
			},
			{
				label: t('label.hours', 'Hours'),
				value: RANGE.HOURS
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: RANGE.MINUTES
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: RANGE.SECONDS
			}
		],
		[t]
	);

	const onCancel = (): void => {
		console.log('On Cancel');
	};

	const onSave = (): void => {
		console.log('On Save');
	};
	return (
		<Container padding={{ all: 'large' }} background="gray5">
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
								{t('domain.gal', 'GAL')}
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
							<Text size="small" weight="bold">
								{t('label.configuration', 'Configuration')}
							</Text>
						</Row>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t(
										'domain.most_result_return_gal_search',
										'Most results returned by GAL search'
									)}
									value={zimbraGalMaxResults}
									defaultValue={zimbraGalMaxResults}
									background="gray6"
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('domain.gal_mode', 'GAL Mode')}
									value={
										!domainData?.zimbraGalMode || domainData?.zimbraGalMode === 'zimbra'
											? t('label.internal', 'Internal')
											: t('label.external', 'External')
									}
									background="gray6"
									disabled
								/>
							</Container>
						</SettingRow>
						<Divider />
						<Container>
							{zimbraGalAccountId !== '' && (
								<>
									<Row
										takeAvwidth="fill"
										mainAlignment="flex-start"
										width="100%"
										background="gray6"
										padding={{ left: 'large', top: 'large' }}
									>
										<Text size="small" weight="bold">
											{t('label.account', 'Account')}
										</Text>
									</Row>
									<SettingRow>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t(
													'domain.account_gal_synchronization',
													'Account Name of GAL Synchronization'
												)}
												value={zimbraGalAccountName}
												background="gray6"
												disabled
											/>
										</Container>
									</SettingRow>

									<SettingRow>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('domain.mail_server', 'Mail Server')}
												value={mailServerName}
												background="gray6"
												disabled
											/>
										</Container>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('domain.source_name_internal_gal', 'Source Name of internal GAL')}
												value={
													!domainData?.zimbraGalMode && domainData?.zimbraGalMode === 'zimbra'
														? t('label.internal_gal', 'InternalGAL')
														: t('label.external_gal', 'ExternalGAL')
												}
												background="gray6"
												disabled
											/>
										</Container>
									</SettingRow>

									<SettingRow>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('domain.internal_gal_received', 'Internal GAL received range')}
												value=""
												background="gray6"
											/>
										</Container>
										<Container padding={{ all: 'small' }}>
											<Select
												items={rangeItems}
												background="gray5"
												label={t('domain.range', 'Range')}
												defaultSelection={rangeItems[0]}
												showCheckbox={false}
											/>
										</Container>
									</SettingRow>
								</>
							)}
						</Container>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default DomainGalSettings;

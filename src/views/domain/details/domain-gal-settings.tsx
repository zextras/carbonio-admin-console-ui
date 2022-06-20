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
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { getAccount } from '../../../services/get-account-service';
import { getDatasource } from '../../../services/get-datasource-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { modifyDataSource } from '../../../services/modify-datasource-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';

// eslint-disable-next-line no-shadow
export enum RANGE {
	DAYS = 'd',
	HOURS = 'h',
	MINUTES = 'm',
	SECONDS = 's'
}

const DomainGalSettings: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
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
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [domainData, setDomainData]: any = useState({
		zimbraGalMaxResults: '',
		zimbraGalAccountId: '',
		zimbraGalMode: '',
		zimbraDataSourcePollingInterval: ''
	});
	const [zimbraGalMaxResults, setZimbraGalMaxResults] = useState<string>('');
	const [zimbraGalAccountId, setZimbraGalAccountId] = useState<string>('');
	const [zimbraGalAccountName, setZimbraGalAccountName] = useState<string>('');
	const [mailServerName, setMailServerName] = useState<string>('');
	const [zimbraDataSourcePollingInterval, setZimbraDataSourcePollingInterval] =
		useState<string>('');
	const [pollingIntervalValue, setPollingIntervalValue] = useState<string>('');
	const [pollingIntervalType, setPollingIntervalType] = useState<any>(rangeItems[0]);
	const [dataSourceId, setDataSourceId] = useState<any>('');
	const setDomain = useDomainStore((state) => state.setDomain);
	const [dataSourceName, setDataSourceName] = useState<string>('');

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
				const dataSource: any = data?.Body?.GetDataSourcesResponse?.dataSource[0];
				if (dataSource && dataSource?.id) {
					setDataSourceId(dataSource?.id);
					if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourcePollingInterval) {
						setZimbraDataSourcePollingInterval(dataSource?._attrs?.zimbraDataSourcePollingInterval);
					}
					if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourceName) {
						setDataSourceName(dataSource?._attrs?.zimbraDataSourceName);
					}
				} else {
					setZimbraDataSourcePollingInterval('');
					setDataSourceName('');
				}
			});
	};

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			setZimbraGalAccountId('');
			setZimbraGalAccountName('');
			setZimbraDataSourcePollingInterval('');
			setDataSourceName('');
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

	useMemo(() => {
		if (zimbraDataSourcePollingInterval !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
			if (rangeType && rangeType !== '') {
				const range = rangeItems.find((item: any) => item.value === rangeType);
				setPollingIntervalType(range);
			}
		} else {
			setPollingIntervalType(rangeItems[0]);
			setPollingIntervalValue('');
		}
	}, [zimbraDataSourcePollingInterval, rangeItems]);

	const onCancel = (): void => {
		setZimbraGalMaxResults(domainData?.zimbraGalMaxResults);
		if (zimbraGalAccountId !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			if (rangeType && rangeType !== '') {
				const range = rangeItems.find((item: any) => item.value === rangeType);
				setPollingIntervalType(range);
			}
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
		}
		setIsDirty(false);
	};

	const onSave = (): void => {
		const requests: any[] = [];
		const body: any = {};
		let attributes: any[] = [];
		body.id = domainData.zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraGalMaxResults',
			_content: zimbraGalMaxResults
		});
		body.a = attributes;
		requests.push(modifyDomain(body));
		if (zimbraGalAccountId !== '' && pollingIntervalValue !== '') {
			const dataSourceBody: any = {};
			dataSourceBody.id = zimbraGalAccountId;
			dataSourceBody._jsns = 'urn:zimbraAdmin';
			attributes = [];
			attributes.push({
				n: 'zimbraDataSourcePollingInterval',
				_content: `${pollingIntervalValue}${pollingIntervalType?.value}`
			});
			dataSourceBody.dataSource = {
				id: dataSourceId,
				a: attributes
			};
			requests.push(modifyDataSource(dataSourceBody));
		}
		Promise.all(requests)
			.then((results) => Promise.all(results.map((r) => r.json())))
			.then((results) => {
				const domain: any = results[0]?.Body?.ModifyDomainResponse?.domain[0];
				if (domain) {
					setDomain(domain);
				}
				setIsDirty(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const onChangeRangeType = (v: any): any => {
		const range = rangeItems.find((item: any) => item.value === v);
		setPollingIntervalType(range);
	};

	const changeIntervalValue = (ev: any): any => {
		setPollingIntervalValue(ev.target.value);
	};

	const onZimbraGalMaxResultChange = (ev: any): any => {
		setZimbraGalMaxResults(ev.target.value);
	};

	useEffect(() => {
		if (domainData?.zimbraGalMaxResults !== zimbraGalMaxResults) {
			setIsDirty(true);
		}
		if (zimbraGalAccountId !== '' && pollingIntervalValue !== '') {
			if (
				zimbraDataSourcePollingInterval !== `${pollingIntervalValue}${pollingIntervalType?.value}`
			) {
				setIsDirty(true);
			}
		}
	}, [
		zimbraGalMaxResults,
		domainData,
		zimbraDataSourcePollingInterval,
		pollingIntervalType,
		pollingIntervalValue,
		zimbraGalAccountId
	]);

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
								{t('label.gal', 'GAL')}
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
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t(
										'domain.most_result_return_gal_search',
										'Most results returned by GAL search'
									)}
									value={zimbraGalMaxResults}
									defaultValue={zimbraGalMaxResults}
									background="gray5"
									onChange={onZimbraGalMaxResultChange}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.gal_mode', 'GAL Mode')}
									value={
										!domainData?.zimbraGalMode || domainData?.zimbraGalMode === 'zimbra'
											? t('label.internal', 'Internal')
											: t('label.external', 'External')
									}
									background="gray6"
									disabled
								/>
							</Container>
						</ListRow>
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
									<ListRow>
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
									</ListRow>

									<ListRow>
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
												value={dataSourceName}
												background="gray6"
												disabled
											/>
										</Container>
									</ListRow>

									<ListRow>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('domain.internal_gal_received', 'Internal GAL received range')}
												value={pollingIntervalValue}
												background="gray6"
												onChange={changeIntervalValue}
											/>
										</Container>
										<Container padding={{ all: 'small' }}>
											<Select
												items={rangeItems}
												background="gray5"
												label={t('domain.range', 'Range')}
												showCheckbox={false}
												onChange={onChangeRangeType}
												selection={pollingIntervalType}
											/>
										</Container>
									</ListRow>
								</>
							)}
						</Container>
					</Container>
				</Row>
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

export default DomainGalSettings;

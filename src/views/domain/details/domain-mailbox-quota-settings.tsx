/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useContext, useCallback } from 'react';

import {
	Container,
	Input,
	Row,
	Text,
	Select,
	Button,
	Padding,
	SnackbarManagerContext,
	Table,
	Divider
} from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import {
	ALLOW_SEND_RECEIVE,
	BLOCK_SEND,
	BLOCK_SEND_RECEIVE,
	BYTE_PER_MB,
	PERCENT_USED,
	TOTAL_USED,
	TRUE
} from '../../../constants';
import { getQuotaUsage } from '../../../services/get-quota-usage-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useDomainStore } from '../../../store/domain/store';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import DownloadCSV from '../../app/shared/download-csv';
import TrackNumberPerPage from '../../app/shared/track-number-per-page';
import { MailBoxQuota } from '../../app/types/mailbox_quota';
import Paging from '../../components/paging';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const DomainMailboxQuotaSetting: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraDomainAggregateQuotaWarnPercent, setZimbraDomainAggregateQuotaWarnPercent] =
		useState<string>('');
	const [
		zimbraDomainAggregateQuotaWarnEmailRecipient,
		setZimbraDomainAggregateQuotaWarnEmailRecipient
	] = useState<string>('');
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();

	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const [domainData, setDomainData]: any = useState({
		zimbraMailDomainQuota: '',
		zimbraDomainMaxAccounts: '',
		zimbraDomainAggregateQuota: '',
		zimbraDomainAggregateQuotaWarnPercent: '',
		zimbraDomainAggregateQuotaWarnEmailRecipient: '',
		zimbraDomainAggregateQuotaPolicy: ALLOW_SEND_RECEIVE
	});
	const [usageQuota, setUsageQuota] = useState<any[]>([]);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(20);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [selectedSortType, setSelectedSortType] = useState<string>('');
	const [isDownloadInProgress, setIsDownloadInProgress] = useState<boolean>(false);

	const quotaPolicy: any = useMemo(
		() => [
			{
				value: ALLOW_SEND_RECEIVE,
				label: t('label.allow_send_receive', 'Allow Send/Receive')
			},
			{
				label: t('label.block_send', 'Block Send'),
				value: BLOCK_SEND
			},
			{
				label: t('label.block_send_receive', 'Block Send/Receive'),
				value: BLOCK_SEND_RECEIVE
			}
		],
		[t]
	);

	const [zimbraDomainAggregateQuotaPolicy, setZimbraDomainAggregateQuotaPolicy] = useState<any>(
		quotaPolicy[0]
	);

	const onSortChange = useCallback(
		(v): any => {
			if (
				v &&
				v.length > 0 &&
				v !== null &&
				domainData?.zimbraDomainName &&
				v[0].value !== selectedSortType
			) {
				setOffset(0);
				setTotalAccount(0);
				setUsageQuota([]);
				setSelectedSortType(v[0].value);
			}
		},
		[domainData?.zimbraDomainName, selectedSortType]
	);

	const headers: any = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '40%',
				bold: true
			},
			{
				id: 'quota',
				label: t('label.mails', 'Mails'),
				width: '55%',
				bold: true,
				items: [
					{ label: t('label.sort_by_total_quota', 'Sort by Total Quota'), value: TOTAL_USED },
					{ label: t('label.sort_by_percentage', 'Sort by Percentage'), value: PERCENT_USED }
				],
				onChange: onSortChange
			}
		],
		[t, onSortChange]
	);

	const [isShowDownload, setIsShowDownload] = useState<boolean>(false);
	const csvHeader: Array<{ label: string; key: string }> = useMemo(
		() => [
			{
				label: t('label.account', 'Account'),
				key: 'name'
			},
			{
				label: t('label.quota_mb', 'Quota (MB)'),
				key: 'quota'
			},
			{
				label: t('label.mails_mb', 'Mails (MB)'),
				key: 'mailSize'
			},
			{
				label: t('label.mail_quota', 'Mails Quota (%)'),
				key: 'quotaUsedPercentage'
			}
		],
		[t]
	);
	const [csvQuotaData, setCsvQuotaData] = useState<Array<MailBoxQuota>>();

	const getQuotaData = useCallback(
		(usedQuota: Array<unknown>): Array<MailBoxQuota> => {
			const quota: Array<MailBoxQuota> = [];
			usedQuota.forEach((item: any, index): void => {
				let diskUsed: any = 0;
				let quotaLimit: any = 0;
				let percentage: any = 0;
				if (item?.used) {
					diskUsed = ((item?.used || 0) / BYTE_PER_MB).toFixed(0);
					if (item?.limit) {
						percentage = ((item.used / item.limit) * 100).toFixed();
					}
				}
				if (item?.limit === 0) {
					quotaLimit = t('label.unlimited', 'Unlimited');
					percentage = 0;
				} else if (item?.limit >= BYTE_PER_MB) {
					quotaLimit = ((item?.limit || 0) / BYTE_PER_MB).toFixed();
				} else {
					quotaLimit = 1;
				}
				quota.push({
					name: item?.name,
					quota: quotaLimit,
					mailSize: diskUsed,
					quotaUsedPercentage: percentage,
					id: item?.id
				});
			});
			return quota;
		},
		[t]
	);

	const getQuotaUsageInformation = useCallback(() => {
		setIsRequestInProgress(true);
		setUsageQuota([]);
		getQuotaUsage(domainData?.zimbraDomainName, offset, limit, selectedSortType).then((data) => {
			setIsRequestInProgress(false);
			const usedQuota: any = data?.account;
			if (usedQuota && Array.isArray(usedQuota)) {
				if (data?.searchTotal) {
					setTotalAccount(data?.searchTotal);
				}
				const quota = getQuotaData(usedQuota);
				if (quota && quota.length > 0) {
					const quotaData: Array<any> = [];
					quota.forEach((item: MailBoxQuota, index) => {
						quotaData.push({
							id: index.toString(),
							columns: [
								<Text color="gray0" weight="regular" key={item?.id}>
									{item?.name}
								</Text>,
								<Text color="gray0" weight="light" key={item?.id}>
									{`${item?.mailSize} MB / ${item?.quotaUsedPercentage} %`}
								</Text>
							]
						});
					});
					setUsageQuota(quotaData);
				}
			}
		});
	}, [offset, limit, selectedSortType, domainData?.zimbraDomainName, getQuotaData]);

	useEffect(() => {
		if (domainData?.zimbraDomainName) {
			getQuotaUsageInformation();
		}
	}, [selectedSortType, getQuotaUsageInformation, domainData?.zimbraDomainName]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			if (obj.zimbraMailDomainQuota) {
				setZimbraMailDomainQuota(obj.zimbraMailDomainQuota);
			} else {
				obj.zimbraMailDomainQuota = '';
				setZimbraMailDomainQuota(obj.zimbraMailDomainQuota);
			}

			if (obj.zimbraDomainMaxAccounts) {
				setZimbraDomainMaxAccounts(obj.zimbraDomainMaxAccounts);
			} else {
				obj.zimbraDomainMaxAccounts = '';
				setZimbraDomainMaxAccounts(obj.zimbraDomainMaxAccounts);
			}

			if (obj.zimbraDomainAggregateQuotaWarnPercent) {
				setZimbraDomainAggregateQuotaWarnPercent(obj.zimbraDomainAggregateQuotaWarnPercent);
			} else {
				obj.zimbraDomainAggregateQuotaWarnPercent = '';
				setZimbraDomainAggregateQuotaWarnPercent(obj.zimbraDomainAggregateQuotaWarnPercent);
			}

			if (obj.zimbraDomainAggregateQuotaWarnEmailRecipient) {
				setZimbraDomainAggregateQuotaWarnEmailRecipient(
					obj.zimbraDomainAggregateQuotaWarnEmailRecipient
				);
			} else {
				obj.zimbraDomainAggregateQuotaWarnEmailRecipient = '';
				setZimbraDomainAggregateQuotaWarnEmailRecipient(
					obj.zimbraDomainAggregateQuotaWarnEmailRecipient
				);
			}

			if (obj.zimbraDomainAggregateQuotaPolicy) {
				setZimbraDomainAggregateQuotaPolicy(
					quotaPolicy.find((item: any) => item.value === obj.zimbraDomainAggregateQuotaPolicy)
				);
			} else {
				obj.zimbraDomainAggregateQuotaPolicy = ALLOW_SEND_RECEIVE;
				setZimbraDomainAggregateQuotaPolicy(quotaPolicy[0]);
			}
			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, quotaPolicy]);

	useEffect(() => {
		if (domainData.zimbraMailDomainQuota !== zimbraMailDomainQuota) {
			setIsDirty(true);
		}
	}, [domainData, zimbraMailDomainQuota]);

	useEffect(() => {
		if (domainData.zimbraDomainMaxAccounts !== zimbraDomainMaxAccounts) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainMaxAccounts]);

	useEffect(() => {
		if (
			domainData.zimbraDomainAggregateQuotaWarnPercent !== zimbraDomainAggregateQuotaWarnPercent
		) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainAggregateQuotaWarnPercent]);

	useEffect(() => {
		if (
			domainData.zimbraDomainAggregateQuotaWarnEmailRecipient !==
			zimbraDomainAggregateQuotaWarnEmailRecipient
		) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainAggregateQuotaWarnEmailRecipient]);

	useEffect(() => {
		if (domainData.zimbraDomainAggregateQuotaPolicy !== zimbraDomainAggregateQuotaPolicy.value) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainAggregateQuotaPolicy]);

	const onCancel = (): void => {
		setZimbraMailDomainQuota(domainData.zimbraMailDomainQuota);
		setZimbraDomainMaxAccounts(domainData.zimbraDomainMaxAccounts);
		setZimbraDomainAggregateQuotaWarnPercent(domainData.zimbraDomainAggregateQuotaWarnPercent);
		setZimbraDomainAggregateQuotaWarnEmailRecipient(
			domainData.zimbraDomainAggregateQuotaWarnEmailRecipient
		);
		setZimbraDomainAggregateQuotaPolicy(
			quotaPolicy.find((item: any) => item.value === domainData.zimbraDomainAggregateQuotaPolicy)
		);
		setIsDirty(false);
	};

	const onSave = (): void => {
		const body: any = {};
		const attributes: any[] = [];
		body.id = domainData.zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraDomainMaxAccounts',
			_content: zimbraDomainMaxAccounts
		});
		if (isGlobalAdmin) {
			attributes.push({
				n: 'zimbraMailDomainQuota',
				_content: zimbraMailDomainQuota
			});
		}
		attributes.push({
			n: 'zimbraDomainAggregateQuotaWarnPercent',
			_content: zimbraDomainAggregateQuotaWarnPercent
		});

		attributes.push({
			n: 'zimbraDomainAggregateQuotaWarnEmailRecipient',
			_content: zimbraDomainAggregateQuotaWarnEmailRecipient
		});

		attributes.push({
			n: 'zimbraDomainAggregateQuotaPolicy',
			_content: zimbraDomainAggregateQuotaPolicy.value
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

	const onZimbraDomainAggregateQuotaPolicy = (v: any): any => {
		const it = quotaPolicy.find((item: any) => item.value === v);
		setZimbraDomainAggregateQuotaPolicy(it);
	};

	const downloadQuotaReport = useCallback(() => {
		setIsDownloadInProgress(true);
		getQuotaUsage(domainData?.zimbraDomainName, 0, totalAccount, selectedSortType)
			.then((data) => {
				setIsDownloadInProgress(false);
				const usedQuota: string = data?.account;
				if (usedQuota && Array.isArray(usedQuota)) {
					const quota = getQuotaData(usedQuota);
					if (quota && quota.length > 0) {
						setCsvQuotaData(quota);
						setIsShowDownload(true);
					}
				}
				setTimeout(() => {
					setIsShowDownload(false);
				}, 100);
			})
			.catch((error: any) => {
				setIsDownloadInProgress(false);
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
	}, [
		domainData?.zimbraDomainName,
		selectedSortType,
		getQuotaData,
		createSnackbar,
		t,
		totalAccount
	]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%">
						<Row
							padding={{ all: 'large' }}
							mainAlignment="flex-start"
							width="50%"
							crossAlignment="flex-start"
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.mailbox_quota', 'Mailbox Quota')}
							</Text>
						</Row>
						<Row
							padding={{ all: 'small' }}
							width="50%"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
						>
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
				height="calc(100vh - 9.375rem)"
			>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Container padding={{ all: 'small' }}>
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('label.domain_quota_settings', 'Domain Quota Settings')}
								</Text>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_mainbox_quota_for_the_mails',
											'Max mailbox quota for the Mails (bytes)'
										)}
										value={zimbraMailDomainQuota}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setZimbraMailDomainQuota(e.target.value);
										}}
										disabled={!isGlobalAdmin}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('domain.mail_space_quota_threshold', 'Mail Space Quota threshold (%)')}
										value={zimbraDomainAggregateQuotaWarnPercent}
										defaultValue={zimbraDomainAggregateQuotaWarnPercent}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setZimbraDomainAggregateQuotaWarnPercent(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={quotaPolicy}
										background="gray5"
										label={t('label.mail_over_quota_criteria', 'Mail Over-quota Criteria')}
										showCheckbox={false}
										selection={zimbraDomainAggregateQuotaPolicy}
										onChange={onZimbraDomainAggregateQuotaPolicy}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'domain.receiver_of_quota_warning_email',
											'Receiver of Quota warning (email)'
										)}
										value={zimbraDomainAggregateQuotaWarnEmailRecipient}
										defaultValue={zimbraDomainAggregateQuotaWarnEmailRecipient}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setZimbraDomainAggregateQuotaWarnEmailRecipient(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
						</Container>

						<Row
							mainAlignment="flex-start"
							width="100%"
							background="gray6"
							padding={{ left: 'large', top: 'large' }}
						>
							<Text size="small" weight="bold">
								{t('label.accounts', 'Accounts')}
							</Text>
						</Row>
						<Container padding={{ all: 'large' }}>
							<ListRow>
								<Container
									mainAlignment="flex-end"
									crossAlignment="flex-end"
									padding={{ all: 'extralarge' }}
								>
									<Button
										type="ghost"
										label={t('label.download_quota_Report', 'Download Quota Report')}
										color="primary"
										onClick={downloadQuotaReport}
										disabled={isDownloadInProgress || totalAccount === 0}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Row>
									<Table
										rows={usageQuota}
										headers={headers}
										showCheckbox={false}
										RowFactory={CustomRowFactory}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										HeaderFactory={CustomHeaderFactory}
									/>
									{isRequestInProgress && (
										<Container
											crossAlignment="center"
											mainAlignment="center"
											height="fit"
											padding={{ top: 'medium' }}
										>
											<Button
												type="ghost"
												color="primary"
												label=""
												loading
												onClick={(): null => null}
											/>
										</Container>
									)}
								</Row>
							</ListRow>
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								padding={{ top: 'medium' }}
							>
								<Divider />
							</Row>
							<Container orientation="horizontal" mainAlignment="space-between" width="100%">
								<Container crossAlignment="flex-start">
									<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
								</Container>
								<Container
									crossAlignment="flex-end"
									orientation="horizontal"
									mainAlignment="flex-end"
									padding={{ top: 'small' }}
								>
									<TrackNumberPerPage pageSize={limit} />
								</Container>
							</Container>
						</Container>
						{isShowDownload && <DownloadCSV data={csvQuotaData} header={csvHeader} />}
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

export default DomainMailboxQuotaSetting;

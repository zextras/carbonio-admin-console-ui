/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
	ALLOW_SEND_RECEIVE,
	BLOCK_SEND,
	BLOCK_SEND_RECEIVE,
	BYTE_PER_MB
} from '../../../constants';
import { modifyDomain } from '../../../services/modify-domain-service';
import { getQuotaUsage } from '../../../services/get-quota-usage-service';
import Paging from '../../components/paging';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';

const DomainMailboxQuotaSetting: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
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

	const headers: any = useMemo(
		() => [
			{
				id: 'index',
				label: '',
				width: '5%',
				bold: true
			},
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '40%',
				bold: true
			},
			{
				id: 'mailboxsize',
				label: t('label.mail_size', 'Mailbox Size'),
				width: '20%',
				bold: true
			},
			{
				id: 'quota',
				label: t('label.quota_used', 'Quota / Quota used'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');
	const [zimbraDomainAggregateQuota, setZimbraDomainAggregateQuota] = useState<string>('');
	const [zimbraDomainAggregateQuotaWarnPercent, setZimbraDomainAggregateQuotaWarnPercent] =
		useState<string>('');
	const [
		zimbraDomainAggregateQuotaWarnEmailRecipient,
		setZimbraDomainAggregateQuotaWarnEmailRecipient
	] = useState<string>('');
	const [zimbraDomainAggregateQuotaPolicy, setZimbraDomainAggregateQuotaPolicy] = useState<any>(
		quotaPolicy[0]
	);
	const [domainData, setDomainData]: any = useState({
		zimbraMailDomainQuota: '',
		zimbraDomainAggregateQuota: '',
		zimbraDomainAggregateQuotaWarnPercent: '',
		zimbraDomainAggregateQuotaWarnEmailRecipient: '',
		zimbraDomainAggregateQuotaPolicy: ALLOW_SEND_RECEIVE
	});
	const [usageQuota, setUsageQuota] = useState<any[]>([]);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(10);
	const [totalAccount, setTotalAccount] = useState<number>(0);

	const getQuotaUsageInformation = useCallback(
		(domainName: string): void => {
			getQuotaUsage(domainName, offset, limit).then((data) => {
				const usedQuota: any = data?.account;
				if (usedQuota && Array.isArray(usedQuota)) {
					const quota: any = [];
					if (data?.Body?.GetQuotaUsageResponse?.searchTotal) {
						setTotalAccount(data?.Body?.GetQuotaUsageResponse?.searchTotal);
					}
					usedQuota.map((item: any, index): any => {
						let diskUsed: any = 0;
						let quotaLimit: any = 0;
						let percentage: any = 0;

						if (item?.used) {
							diskUsed = ((item?.used || 0) / BYTE_PER_MB).toFixed(2);
						}

						if (item?.limit === 0) {
							quotaLimit = t('label.unlimited', 'Unlimited');
							percentage = 0;
						} else {
							if (item?.limit >= BYTE_PER_MB) {
								quotaLimit = ((item?.limit || 0) / BYTE_PER_MB).toFixed();
							} else {
								quotaLimit = 1;
							}
							percentage = ((diskUsed * 100) / quotaLimit).toFixed();
						}
						diskUsed += ` ${t('label.mb', 'MB')}`;
						quotaLimit += ` ${t('label.mb', 'MB')}`;
						percentage += '%';
						quota.push({
							id: index.toString(),
							columns: [
								'',
								<Text size="medium" weight="bold" key={item?.id} color="#828282">
									{item?.name}
								</Text>,
								<Text size="medium" weight="bold" key={item?.id} color="#828282">
									{diskUsed}
								</Text>,
								<Text size="medium" weight="bold" key={item?.id} color="#828282">
									{`${quotaLimit} / ${percentage}`}
								</Text>
							]
						});
						return '';
					});
					setUsageQuota([]);
					setUsageQuota(quota);
				}
			});
		},
		[t, offset, limit]
	);

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			setOffset(0);
			setTotalAccount(0);
			setUsageQuota([]);
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (obj.zimbraMailDomainQuota) {
				setZimbraMailDomainQuota(obj.zimbraMailDomainQuota);
			} else {
				obj.zimbraMailDomainQuota = '';
				setZimbraMailDomainQuota(obj.zimbraMailDomainQuota);
			}

			if (obj.zimbraDomainAggregateQuota) {
				setZimbraDomainAggregateQuota(obj.zimbraDomainAggregateQuota);
			} else {
				obj.zimbraDomainAggregateQuota = '';
				setZimbraDomainAggregateQuota(obj.zimbraDomainAggregateQuota);
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
		if (domainData.zimbraDomainAggregateQuota !== zimbraDomainAggregateQuota) {
			setIsDirty(true);
		}
	}, [domainData, zimbraDomainAggregateQuota]);

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
		setZimbraDomainAggregateQuota(domainData.zimbraDomainAggregateQuota);
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
			n: 'zimbraMailDomainQuota',
			_content: zimbraMailDomainQuota
		});
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

	useEffect(() => {
		if (domainData.zimbraDomainName) {
			getQuotaUsageInformation(domainData.zimbraDomainName);
		}
	}, [domainData, offset, getQuotaUsageInformation]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
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
				height="calc(100vh - 150px)"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Container padding={{ all: 'small' }}>
							<Row
								takeAvwidth="fill"
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
											'domain.single_account_domain_space_byte',
											'Single Account Domain Space (Byte)'
										)}
										value={zimbraMailDomainQuota}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraMailDomainQuota(e.target.value);
										}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('domain.total_domain_space', 'Total Domain Space (Byte)')}
										value={zimbraDomainAggregateQuota}
										defaultValue={zimbraDomainAggregateQuota}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraDomainAggregateQuota(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'domain.warn_when_reach_space_quota',
											'Warn me when I reach this aggregated space quota'
										)}
										value={zimbraDomainAggregateQuotaWarnPercent}
										defaultValue={zimbraDomainAggregateQuotaWarnPercent}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraDomainAggregateQuotaWarnPercent(e.target.value);
										}}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('domain.send_the_warning_to', 'Send the warning to')}
										value={zimbraDomainAggregateQuotaWarnEmailRecipient}
										defaultValue={zimbraDomainAggregateQuotaWarnEmailRecipient}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraDomainAggregateQuotaWarnEmailRecipient(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={quotaPolicy}
										background="gray5"
										label={t('label.aggrigated_space_criteria', 'Aggregated Space Criteria')}
										showCheckbox={false}
										selection={zimbraDomainAggregateQuotaPolicy}
										onChange={onZimbraDomainAggregateQuotaPolicy}
									/>
								</Container>
							</ListRow>
						</Container>

						<Row
							takeAvwidth="fill"
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
								<Table rows={usageQuota} headers={headers} showCheckbox={false} />
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
							<Row orientation="horizontal" mainAlignment="flex-start" width="100%">
								<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
							</Row>
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

export default DomainMailboxQuotaSetting;

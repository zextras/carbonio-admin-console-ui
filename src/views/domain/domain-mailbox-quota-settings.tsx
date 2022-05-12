/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Input,
	Row,
	Text,
	Select,
	Button,
	Padding,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { ALLOW_SEND_RECEIVE, BLOCK_SEND, BLOCK_SEND_RECEIVE } from '../../constants';
import { modifyDomain } from '../../services/modify-domain-service';

const SettingRow: FC<{ children?: any; wrap?: any }> = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);
const DomainMailboxQuotaSetting: FC<{ domainInformation: any }> = ({ domainInformation }) => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
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
	const [isDirty, setIsDirty] = useState<boolean>(false);

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
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
			.then((response) => response.json())
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domainInfo: any = data?.Body?.ModifyDomainResponse?.domain[0]?.a;

				const obj: any = {};
				domainInfo.map((item: any) => {
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
			});
	};

	const onZimbraDomainAggregateQuotaPolicy = (v: any): any => {
		const it = quotaPolicy.find((item: any) => item.value === v);
		setZimbraDomainAggregateQuotaPolicy(it);
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
					<Row orientation="horizontal" width="100%">
						<Row
							padding={{ all: 'small' }}
							mainAlignment="flex-start"
							width="50%"
							crossAlignment="flex-start"
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.mailbox_space', 'Mailbox  Space')}
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
							background="gray5"
							padding={{ left: 'large', top: 'large' }}
						>
							<Text size="small" weight="bold">
								{t('label.domain_quota_settings', 'Domain Quota Settings')}
							</Text>
						</Row>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('domain.domain_space_byte', 'Domain Space (Byte)')}
									value={zimbraMailDomainQuota}
									defaultValue={zimbraMailDomainQuota}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraMailDomainQuota(e.target.value);
									}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('domain.aggregated_domain_space', 'Aggregated Domain Space (Byte)')}
									value={zimbraDomainAggregateQuota}
									defaultValue={zimbraDomainAggregateQuota}
									background="gray5"
									onChange={(e: any): any => {
										setZimbraDomainAggregateQuota(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>

						<SettingRow>
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
						</SettingRow>

						<SettingRow>
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
						</SettingRow>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default DomainMailboxQuotaSetting;

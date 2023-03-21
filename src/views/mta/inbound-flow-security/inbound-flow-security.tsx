/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Padding,
	Button,
	Divider,
	Switch,
	ChipInput,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { isEqual } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MtaInboundSecurity } from '../../../../types';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';

const MTAInboundFlowSecurity: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [blockCommonExtension, setBlockCommonExtension] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const addConfig = useConfigStore((state) => state.addConfig);
	const removeConfigItems = useConfigStore((state) => state.removeConfigItems);
	const [mtaBlockExtension, setMtaBlockExtension] = useState<Array<Record<string, string>>>([]);

	const [mtaInboundSecurityInitialDetail, setMtaInboundSecurityInitialDetail] =
		useState<MtaInboundSecurity>();
	const [mtaInboundSecurityDetail, setMtaInboundSecurityDetail] = useState<MtaInboundSecurity>();

	const setInitialValue = useCallback((key: string, value: any): void => {
		setMtaInboundSecurityInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			const findBlockExtension = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaBlockedExtension'
			);
			if (findBlockExtension && findBlockExtension.length > 0) {
				const allExtensions: Array<Record<string, string>> = [];
				findBlockExtension.forEach((item: Record<string, string>) => {
					allExtensions.push({ label: item?._content });
				});
				setInitialValue(
					'zimbraMtaBlockedExtension',
					findBlockExtension.map((item: Record<string, string>) => item?._content)
				);
				setMtaBlockExtension(allExtensions);
			}
		}
	}, [configInformation, setInitialValue]);

	const setValue = useCallback((key: string, value: any): void => {
		setMtaInboundSecurityDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	useEffect(() => {
		if (
			mtaInboundSecurityDetail &&
			!isEqual(mtaInboundSecurityDetail, mtaInboundSecurityInitialDetail)
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaInboundSecurityDetail, mtaInboundSecurityInitialDetail]);

	const updateGlobalConfig = useCallback(
		(attributes: Array<any>): void => {
			const attributeWithoutExtension = attributes.filter(
				(item: Record<string, string>) => item?.n !== 'zimbraMtaBlockedExtension'
			);
			const attributeWithExtension = attributes.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaBlockedExtension'
			);
			if (attributeWithoutExtension && attributeWithoutExtension.length > 0) {
				attributeWithoutExtension.forEach((ele: any) => {
					updateConfig(ele?.n, ele._content);
				});
			}
			if (attributeWithExtension && attributeWithExtension.length > 0) {
				attributeWithExtension.forEach((item: any) => {
					removeConfigItems(item);
				});
				if (attributeWithExtension.length === 1 && attributeWithExtension[0]?._content === '') {
					removeConfigItems(attributeWithExtension[0]);
				} else {
					addConfig(attributeWithExtension);
				}
			}
		},
		[updateConfig, addConfig, removeConfigItems]
	);

	const modifyConfigRequest = useCallback(
		(attributes: Array<any>): void => {
			modifyConfig(attributes)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					updateGlobalConfig(attributes);
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
		},
		[createSnackbar, t, updateGlobalConfig]
	);

	const onSave = useCallback(() => {
		const attributes: any[] = [];
		if (mtaInboundSecurityDetail?.zimbraMtaBlockedExtension) {
			const blockedExtension = mtaInboundSecurityDetail?.zimbraMtaBlockedExtension;
			if (blockedExtension) {
				if (blockedExtension.length === 0) {
					attributes.push({ n: 'zimbraMtaBlockedExtension', _content: '' });
				} else {
					blockedExtension.forEach((item: string) => {
						attributes.push({ n: 'zimbraMtaBlockedExtension', _content: item });
					});
				}
			}
		}
		modifyConfigRequest(attributes);
	}, [mtaInboundSecurityDetail, modifyConfigRequest]);

	const onCancel = useCallback(() => {
		setIsDirty(false);
		setMtaInboundSecurityDetail(mtaInboundSecurityInitialDetail);
		if (mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtension) {
			const extension = mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtension;
			if (extension) {
				const allExtensions: Array<Record<string, string>> = [];
				extension.forEach((item: string) => {
					allExtensions.push({ label: item });
				});
				setMtaBlockExtension(allExtensions);
			}
		}
	}, [mtaInboundSecurityInitialDetail]);

	useEffect(() => {
		if (blockCommonExtension) {
			if (configInformation && configInformation.length > 0) {
				const findBlockCommonExtension = configInformation.filter(
					(item: Record<string, string>) => item?.n === 'zimbraMtaCommonBlockedExtension'
				);
				if (findBlockCommonExtension && findBlockCommonExtension.length > 0) {
					const allExtensions: Array<Record<string, string>> = [];
					findBlockCommonExtension.forEach((item: Record<string, string>) => {
						allExtensions.push({ label: item?._content });
					});
					setValue(
						'zimbraMtaBlockedExtension',
						findBlockCommonExtension.map((item: Record<string, string>) => item?._content)
					);
					setMtaBlockExtension(allExtensions);
				}
			}
		}
	}, [blockCommonExtension, configInformation, setValue]);

	const onBlockExtensionChange = useCallback(
		(ev) => {
			if (ev && ev.length > 0) {
				const extension = ev.map((item: Record<string, string>) => item?.label);
				if (extension && extension.length > 0) {
					setValue('zimbraMtaBlockedExtension', extension);
					setMtaBlockExtension(ev);
				}
			} else {
				setValue('zimbraMtaBlockedExtension', []);
				setMtaBlockExtension([]);
			}
		},
		[setValue]
	);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="56px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.inbound_flow_and_security', 'Inbound Flow & Security')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										height={36}
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										height={36}
										onClick={onSave}
									/>
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				background="white"
				style={{ overflow: 'auto' }}
			>
				<Container crossAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.settings', 'Settings')}
					</Text>
				</Container>
				<Container crossAlignment="flex-start">
					<ChipInput
						placeholder={t('mta.add_here_any_blocked_extension', 'Add here any Blocked Extension')}
						background="gray5"
						requireUniqueChips
						value={mtaBlockExtension}
						onChange={onBlockExtensionChange}
					/>
				</Container>
				<Row padding={{ top: 'large' }}>
					<Switch
						label={t('mta.block_also_common_extensions', 'Block also common extensions')}
						value={blockCommonExtension}
						onClick={(): void => setBlockCommonExtension(!blockCommonExtension)}
					/>
				</Row>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.notify_admins_about_block_extensions',
								'Notify admins about blocked extensions'
							)}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.notify_users_about_block_extensions',
								'Notify users about blocked extensions'
							)}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.rejection', 'Rejection')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.reject_unlisted_sender', 'Reject unlisted Sender')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.reject_unlisted_recipient', 'Reject unlisted Recipient')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.reject_sender_login_mismatch_or_empty',
								'Reject Sender login mismatch or empty '
							)}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.additional_settings', 'Additional settings')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.enable_antispam', 'Enable Antispam')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.enable_antivirus', 'Enable Antivirus')} />
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.enable_accounting_quota_checks', 'Enable Accounting quota checks')}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.protocol_checks', 'Protocol Checks')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'medium' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.clients_ip_address', 'Client’s IP address')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.client_must_greet_with_resolving_hostname',
								'Client must greet with a resolving hostname'
							)}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.hostname_in_greetings', 'Hostname in greetings')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.senders_domain', 'Sender’s Domain')} />
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.hostname_in_greeting_violates_rfc',
								'Hostname in greeting violates RFC'
							)}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.senders_address_must_fully_qualified',
								'Sender address must be fully qualified'
							)}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.client_must_greet_with_fully_qualified_hostname',
								'Client must greet with a fully qualified hostname'
							)}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAInboundFlowSecurity;

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
import { isEqual, reduce } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MtaInboundSecurity } from '../../../../types';
import { FALSE, TRUE } from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';

const MTAInboundFlowSecurity: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
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

	const setValue = useCallback((key: string, value: any): void => {
		setMtaInboundSecurityDetail((prev: any) => ({ ...prev, [key]: value }));
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
				if (allExtensions) {
					setValue(
						'zimbraMtaBlockedExtension',
						allExtensions.map((item: Record<string, string>) => item?.label)
					);
				}
				setMtaBlockExtension(allExtensions);
			}
			const zimbraMtaBlockedExtensionWarnAdmin = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaBlockedExtensionWarnAdmin'
			);
			const zimbraMtaBlockedExtensionWarnRecipient = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaBlockedExtensionWarnRecipient'
			);

			if (zimbraMtaBlockedExtensionWarnAdmin && zimbraMtaBlockedExtensionWarnAdmin[0]?._content) {
				setInitialValue(
					'zimbraMtaBlockedExtensionWarnAdmin',
					zimbraMtaBlockedExtensionWarnAdmin[0]?._content === 'TRUE'
				);
				setValue(
					'zimbraMtaBlockedExtensionWarnAdmin',
					zimbraMtaBlockedExtensionWarnAdmin[0]?._content === 'TRUE'
				);
			}

			if (
				zimbraMtaBlockedExtensionWarnRecipient &&
				zimbraMtaBlockedExtensionWarnRecipient[0]?._content
			) {
				setInitialValue(
					'zimbraMtaBlockedExtensionWarnRecipient',
					zimbraMtaBlockedExtensionWarnRecipient[0]?._content === 'TRUE'
				);
				setValue(
					'zimbraMtaBlockedExtensionWarnRecipient',
					zimbraMtaBlockedExtensionWarnRecipient[0]?._content === 'TRUE'
				);
			}

			const zimbraMtaSmtpdRejectUnlistedSender = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaSmtpdRejectUnlistedSender'
			);

			if (zimbraMtaSmtpdRejectUnlistedSender && zimbraMtaSmtpdRejectUnlistedSender[0]?._content) {
				setInitialValue(
					'zimbraMtaSmtpdRejectUnlistedSender',
					zimbraMtaSmtpdRejectUnlistedSender[0]?._content === 'yes'
				);
				setValue(
					'zimbraMtaSmtpdRejectUnlistedSender',
					zimbraMtaSmtpdRejectUnlistedSender[0]?._content === 'yes'
				);
			}
			const zimbraMtaSmtpdRejectUnlistedRecipient = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaSmtpdRejectUnlistedRecipient'
			);
			if (
				zimbraMtaSmtpdRejectUnlistedRecipient &&
				zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content
			) {
				setInitialValue(
					'zimbraMtaSmtpdRejectUnlistedRecipient',
					zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content === 'yes'
				);
				setValue(
					'zimbraMtaSmtpdRejectUnlistedRecipient',
					zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content === 'yes'
				);
			}
			const zimbraMtaSmtpdSenderRestrictions = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaSmtpdSenderRestrictions'
			);

			if (zimbraMtaSmtpdSenderRestrictions) {
				setInitialValue(
					'zimbraMtaSmtpdSenderRestrictions',
					zimbraMtaSmtpdSenderRestrictions.length > 0 &&
						zimbraMtaSmtpdSenderRestrictions[0]?._content === 'reject_sender_login_mismatch'
				);
				setValue(
					'zimbraMtaSmtpdSenderRestrictions',

					zimbraMtaSmtpdSenderRestrictions.length > 0 &&
						zimbraMtaSmtpdSenderRestrictions[0]?._content === 'reject_sender_login_mismatch'
				);
			}

			const zimbraMtaRestriction = configInformation.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaRestriction'
			);
			if (zimbraMtaRestriction) {
				const rejectUnknownClientHostname = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_unknown_client_hostname'
				);

				const isRejectUnknownClientHostname =
					rejectUnknownClientHostname &&
					rejectUnknownClientHostname[0] &&
					rejectUnknownClientHostname[0]._content === 'reject_unknown_client_hostname';

				setInitialValue('rejectUnknownClientHostname', isRejectUnknownClientHostname);
				setValue('rejectUnknownClientHostname', isRejectUnknownClientHostname);

				const rejectUnknownReverseClientHostname = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_unknown_reverse_client_hostname'
				);
				const isRejectUnknownReverseClientHostname =
					rejectUnknownReverseClientHostname &&
					rejectUnknownReverseClientHostname[0] &&
					rejectUnknownReverseClientHostname[0]._content ===
						'reject_unknown_reverse_client_hostname';

				setInitialValue('rejectUnknownReverseClientHostname', isRejectUnknownReverseClientHostname);
				setValue('rejectUnknownReverseClientHostname', isRejectUnknownReverseClientHostname);

				const rejectInvalidHeloHostname = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_invalid_helo_hostname'
				);
				const isRejectInvalidHeloHostname =
					rejectInvalidHeloHostname &&
					rejectInvalidHeloHostname[0] &&
					rejectInvalidHeloHostname[0]._content === 'reject_invalid_helo_hostname';

				setInitialValue('rejectInvalidHeloHostname', isRejectInvalidHeloHostname);
				setValue('rejectInvalidHeloHostname', isRejectInvalidHeloHostname);

				const rejectNonFqdnHeloHostname = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_non_fqdn_helo_hostname'
				);
				const isRejectNonFqdnHeloHostname =
					rejectNonFqdnHeloHostname &&
					rejectNonFqdnHeloHostname[0] &&
					rejectNonFqdnHeloHostname[0]._content === 'reject_non_fqdn_helo_hostname';

				setInitialValue('rejectNonFqdnHeloHostname', isRejectNonFqdnHeloHostname);
				setValue('rejectNonFqdnHeloHostname', isRejectNonFqdnHeloHostname);

				const rejectUnknownHeloHostname = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_unknown_helo_hostname'
				);
				const isRejectUnknownHeloHostname =
					rejectUnknownHeloHostname &&
					rejectUnknownHeloHostname[0] &&
					rejectUnknownHeloHostname[0]._content === 'reject_unknown_helo_hostname';

				setInitialValue('rejectUnknownHeloHostname', isRejectUnknownHeloHostname);
				setValue('rejectUnknownHeloHostname', isRejectUnknownHeloHostname);

				const rejectUnknownSenderDomain = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_unknown_sender_domain'
				);
				const isRejectUnknownSenderDomain =
					rejectUnknownSenderDomain &&
					rejectUnknownSenderDomain[0] &&
					rejectUnknownSenderDomain[0]._content === 'reject_unknown_sender_domain';

				setInitialValue('rejectUnknownSenderDomain', isRejectUnknownSenderDomain);
				setValue('rejectUnknownSenderDomain', isRejectUnknownSenderDomain);

				const rejectNonFqdnSender = zimbraMtaRestriction.filter(
					(item: any) => item?._content === 'reject_non_fqdn_sender'
				);
				const isRejectNonFqdnSender =
					rejectNonFqdnSender &&
					rejectNonFqdnSender[0] &&
					rejectNonFqdnSender[0]._content === 'reject_non_fqdn_sender';

				setInitialValue('rejectNonFqdnSender', isRejectNonFqdnSender);
				setValue('rejectNonFqdnSender', isRejectNonFqdnSender);
			}
		}
	}, [configInformation, setInitialValue, setValue]);

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
				(item: Record<string, string>) =>
					item?.n !== 'zimbraMtaBlockedExtension' && item?.n !== 'zimbraMtaRestriction'
			);
			const attributeWithExtension = attributes.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaBlockedExtension'
			);

			const zimbraMtaRestriction = attributes.filter(
				(item: Record<string, string>) => item?.n === 'zimbraMtaRestriction'
			);
			removeConfigItems({ n: 'zimbraMtaRestriction' });
			if (zimbraMtaRestriction && zimbraMtaRestriction.length > 0) {
				addConfig(zimbraMtaRestriction);
			}
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
		attributes.push({
			n: 'zimbraMtaBlockedExtensionWarnAdmin',
			_content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin ? TRUE : FALSE
		});
		attributes.push({
			n: 'zimbraMtaBlockedExtensionWarnRecipient',
			_content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient ? TRUE : FALSE
		});

		attributes.push({
			n: 'zimbraMtaSmtpdRejectUnlistedSender',
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender ? 'yes' : 'no'
		});
		attributes.push({
			n: 'zimbraMtaSmtpdRejectUnlistedRecipient',
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient ? 'yes' : 'no'
		});
		attributes.push({
			n: 'zimbraMtaSmtpdSenderRestrictions',
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
				? 'reject_sender_login_mismatch'
				: ''
		});
		if (mtaInboundSecurityDetail?.rejectUnknownClientHostname) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectUnknownClientHostname
					? 'reject_unknown_client_hostname'
					: ''
			});
		}
		if (mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname
					? 'reject_unknown_reverse_client_hostname'
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectInvalidHeloHostname) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectInvalidHeloHostname
					? 'reject_invalid_helo_hostname'
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname
					? 'reject_non_fqdn_helo_hostname'
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectUnknownHeloHostname) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectUnknownHeloHostname
					? 'reject_unknown_helo_hostname'
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectUnknownSenderDomain) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectUnknownSenderDomain
					? 'reject_unknown_sender_domain'
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectNonFqdnSender) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: mtaInboundSecurityDetail?.rejectNonFqdnSender ? 'reject_non_fqdn_sender' : ''
			});
		}

		if (!attributes.find((item: any) => item?.n === 'zimbraMtaRestriction')) {
			attributes.push({
				n: 'zimbraMtaRestriction',
				_content: ''
			});
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
							value={mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin}
							onClick={(): void =>
								setValue(
									'zimbraMtaBlockedExtensionWarnAdmin',
									!mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.notify_users_about_block_extensions',
								'Notify users about blocked extensions'
							)}
							value={mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient}
							onClick={(): void =>
								setValue(
									'zimbraMtaBlockedExtensionWarnRecipient',
									!mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient
								)
							}
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
						<Switch
							label={t('mta.reject_unlisted_sender', 'Reject unlisted Sender')}
							value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender}
							onClick={(): void =>
								setValue(
									'zimbraMtaSmtpdRejectUnlistedSender',
									!mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.reject_unlisted_recipient', 'Reject unlisted Recipient')}
							value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient}
							onClick={(): void =>
								setValue(
									'zimbraMtaSmtpdRejectUnlistedRecipient',
									!mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.reject_sender_login_mismatch_or_empty',
								'Reject Sender login mismatch or empty '
							)}
							value={mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions}
							onClick={(): void =>
								setValue(
									'zimbraMtaSmtpdSenderRestrictions',
									!mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
								)
							}
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
						<Switch
							label={t('mta.clients_ip_address', 'Client’s IP address')}
							value={mtaInboundSecurityDetail?.rejectUnknownClientHostname}
							onClick={(): void =>
								setValue(
									'rejectUnknownClientHostname',
									!mtaInboundSecurityDetail?.rejectUnknownClientHostname
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.client_must_greet_with_resolving_hostname',
								'Client must greet with a resolving hostname'
							)}
							value={mtaInboundSecurityDetail?.rejectUnknownHeloHostname}
							onClick={(): void =>
								setValue(
									'rejectUnknownHeloHostname',
									!mtaInboundSecurityDetail?.rejectUnknownHeloHostname
								)
							}
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
							label={t('mta.hostname_in_greetings', 'Hostname in greetings')}
							value={mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname}
							onClick={(): void =>
								setValue(
									'rejectUnknownReverseClientHostname',
									!mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.senders_domain', 'Sender’s Domain')}
							value={mtaInboundSecurityDetail?.rejectUnknownSenderDomain}
							onClick={(): void =>
								setValue(
									'rejectUnknownSenderDomain',
									!mtaInboundSecurityDetail?.rejectUnknownSenderDomain
								)
							}
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
								'mta.hostname_in_greeting_violates_rfc',
								'Hostname in greeting violates RFC'
							)}
							value={mtaInboundSecurityDetail?.rejectInvalidHeloHostname}
							onClick={(): void =>
								setValue(
									'rejectInvalidHeloHostname',
									!mtaInboundSecurityDetail?.rejectInvalidHeloHostname
								)
							}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.senders_address_must_fully_qualified',
								'Sender address must be fully qualified'
							)}
							value={mtaInboundSecurityDetail?.rejectNonFqdnSender}
							onClick={(): void =>
								setValue('rejectNonFqdnSender', !mtaInboundSecurityDetail?.rejectNonFqdnSender)
							}
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
							value={mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname}
							onClick={(): void =>
								setValue(
									'rejectNonFqdnHeloHostname',
									!mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname
								)
							}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAInboundFlowSecurity;

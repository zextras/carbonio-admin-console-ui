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
	SnackbarManagerContext,
	Tooltip
} from '@zextras/carbonio-design-system';
import { isEqual, find } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MtaInboundSecurity } from '../../../../types';
import {
	FALSE,
	REJECT_INVALID_HELO_HOSTNAME,
	REJECT_NON_FQDN_HELO_HOSTNAME,
	REJECT_NON_FQDN_SENDER,
	REJECT_SENDER_LOGIN_MISMATCH,
	REJECT_UNKNOWN_CLIENT_HOSTNAME,
	REJECT_UNKNOWN_HELO_HOSTNAME,
	REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME,
	REJECT_UNKNOWN_SENDER_DOMAIN,
	TRUE,
	ZIMBRA_MTA_BLOCKED_EXTENSION,
	ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
	ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
	ZIMBRA_MTA_COMMON_BLOCKED_EXTENSION,
	ZIMBRA_MTA_RESTRICTION,
	ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
	ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
	ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
	_REJECT_UNKNOWN_CLIENT_HOSTNAME,
	CONFIG
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import CustomChip from '../../components/customChip';

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
	const [commonBlockedExtensions, setCommonBlockedExtensions] = useState<Array<string>>([]);
	const rights: Rights = useRightsStore((state) => state.rights);

	const allowSetMTA = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		if (rightsConfig?.all?.[0]?.setAttrs?.[0]?.all) {
			return true;
		}
		return false;
	}, [rights]);

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaInboundSecurityInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaInboundSecurityDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			const findBlockExtension = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION
			);
			if (findBlockExtension && findBlockExtension.length > 0) {
				const allExtensions: Array<Record<string, string>> = [];
				findBlockExtension.forEach((item: Record<string, string>) => {
					allExtensions.push({ label: item?._content });
				});
				setInitialValue(
					ZIMBRA_MTA_BLOCKED_EXTENSION,
					findBlockExtension.map((item: Record<string, string>) => item?._content)
				);
				if (allExtensions) {
					setValue(
						ZIMBRA_MTA_BLOCKED_EXTENSION,
						allExtensions.map((item: Record<string, string>) => item?.label)
					);
				}
				setMtaBlockExtension(allExtensions);
			}
			const findCommonBlockExtension = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_COMMON_BLOCKED_EXTENSION
			);
			if (findCommonBlockExtension && findCommonBlockExtension.length > 0) {
				setCommonBlockedExtensions(findCommonBlockExtension.map((item: any) => item?._content));
			}
			const zimbraMtaBlockedExtensionWarnAdmin = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN
			);
			const zimbraMtaBlockedExtensionWarnRecipient = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT
			);

			if (zimbraMtaBlockedExtensionWarnAdmin && zimbraMtaBlockedExtensionWarnAdmin[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
					zimbraMtaBlockedExtensionWarnAdmin[0]?._content === TRUE
				);
			}

			if (
				zimbraMtaBlockedExtensionWarnRecipient &&
				zimbraMtaBlockedExtensionWarnRecipient[0]?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
					zimbraMtaBlockedExtensionWarnRecipient[0]?._content === TRUE
				);
			}

			const zimbraMtaSmtpdRejectUnlistedSender = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER
			);

			if (zimbraMtaSmtpdRejectUnlistedSender && zimbraMtaSmtpdRejectUnlistedSender[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
					zimbraMtaSmtpdRejectUnlistedSender[0]?._content === 'yes'
				);
			}
			const zimbraMtaSmtpdRejectUnlistedRecipient = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT
			);
			if (
				zimbraMtaSmtpdRejectUnlistedRecipient &&
				zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
					zimbraMtaSmtpdRejectUnlistedRecipient[0]?._content === 'yes'
				);
			}
			const zimbraMtaSmtpdSenderRestrictions = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS
			);

			if (zimbraMtaSmtpdSenderRestrictions) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
					zimbraMtaSmtpdSenderRestrictions.length > 0 &&
						zimbraMtaSmtpdSenderRestrictions[0]?._content === REJECT_SENDER_LOGIN_MISMATCH
				);
			}

			const zimbraMtaRestriction = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RESTRICTION
			);
			if (zimbraMtaRestriction) {
				const rejectUnknownClientHostname = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_UNKNOWN_CLIENT_HOSTNAME
				);

				const isRejectUnknownClientHostname =
					rejectUnknownClientHostname &&
					rejectUnknownClientHostname[0] &&
					rejectUnknownClientHostname[0]._content === REJECT_UNKNOWN_CLIENT_HOSTNAME;

				setInitialAndCurrentValue(_REJECT_UNKNOWN_CLIENT_HOSTNAME, isRejectUnknownClientHostname);

				const rejectUnknownReverseClientHostname = zimbraMtaRestriction.filter(
					(item: Record<string, string>) =>
						item?._content === REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME
				);
				const isRejectUnknownReverseClientHostname =
					rejectUnknownReverseClientHostname &&
					rejectUnknownReverseClientHostname[0] &&
					rejectUnknownReverseClientHostname[0]._content === REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME;

				setInitialAndCurrentValue(
					'rejectUnknownReverseClientHostname',
					isRejectUnknownReverseClientHostname
				);

				const rejectInvalidHeloHostname = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_INVALID_HELO_HOSTNAME
				);
				const isRejectInvalidHeloHostname =
					rejectInvalidHeloHostname &&
					rejectInvalidHeloHostname[0] &&
					rejectInvalidHeloHostname[0]._content === REJECT_INVALID_HELO_HOSTNAME;

				setInitialAndCurrentValue('rejectInvalidHeloHostname', isRejectInvalidHeloHostname);

				const rejectNonFqdnHeloHostname = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_NON_FQDN_HELO_HOSTNAME
				);
				const isRejectNonFqdnHeloHostname =
					rejectNonFqdnHeloHostname &&
					rejectNonFqdnHeloHostname[0] &&
					rejectNonFqdnHeloHostname[0]._content === REJECT_NON_FQDN_HELO_HOSTNAME;

				setInitialAndCurrentValue('rejectNonFqdnHeloHostname', isRejectNonFqdnHeloHostname);

				const rejectUnknownHeloHostname = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_UNKNOWN_HELO_HOSTNAME
				);
				const isRejectUnknownHeloHostname =
					rejectUnknownHeloHostname &&
					rejectUnknownHeloHostname[0] &&
					rejectUnknownHeloHostname[0]._content === REJECT_UNKNOWN_HELO_HOSTNAME;

				setInitialAndCurrentValue('rejectUnknownHeloHostname', isRejectUnknownHeloHostname);

				const rejectUnknownSenderDomain = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_UNKNOWN_SENDER_DOMAIN
				);
				const isRejectUnknownSenderDomain =
					rejectUnknownSenderDomain &&
					rejectUnknownSenderDomain[0] &&
					rejectUnknownSenderDomain[0]._content === REJECT_UNKNOWN_SENDER_DOMAIN;

				setInitialAndCurrentValue('rejectUnknownSenderDomain', isRejectUnknownSenderDomain);

				const rejectNonFqdnSender = zimbraMtaRestriction.filter(
					(item: Record<string, string>) => item?._content === REJECT_NON_FQDN_SENDER
				);
				const isRejectNonFqdnSender =
					rejectNonFqdnSender &&
					rejectNonFqdnSender[0] &&
					rejectNonFqdnSender[0]._content === REJECT_NON_FQDN_SENDER;

				setInitialAndCurrentValue('rejectNonFqdnSender', isRejectNonFqdnSender);
			}
		}
	}, [configInformation, setInitialValue, setValue, setInitialAndCurrentValue]);

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
		(attributes: Array<Record<string, string>>): void => {
			const attributeWithoutExtension = attributes.filter(
				(item: Record<string, string>) =>
					item?.n !== ZIMBRA_MTA_BLOCKED_EXTENSION && item?.n !== ZIMBRA_MTA_RESTRICTION
			);
			const attributeWithExtension = attributes.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_BLOCKED_EXTENSION
			);

			const zimbraMtaRestriction = attributes.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RESTRICTION
			);
			removeConfigItems({ n: ZIMBRA_MTA_RESTRICTION });
			if (zimbraMtaRestriction && zimbraMtaRestriction.length > 0) {
				addConfig(zimbraMtaRestriction);
			}
			if (attributeWithoutExtension && attributeWithoutExtension.length > 0) {
				attributeWithoutExtension.forEach((ele: Record<string, string>) => {
					updateConfig(ele?.n, ele._content);
				});
			}

			if (attributeWithExtension && attributeWithExtension.length > 0) {
				attributeWithExtension.forEach((item: Record<string, string>) => {
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
		(attributes: Array<Record<string, string>>): void => {
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
		const attributes: Array<Record<string, string>> = [];
		if (mtaInboundSecurityDetail?.zimbraMtaBlockedExtension) {
			const blockedExtension = mtaInboundSecurityDetail?.zimbraMtaBlockedExtension;
			if (blockedExtension) {
				if (blockedExtension.length === 0) {
					attributes.push({ n: ZIMBRA_MTA_BLOCKED_EXTENSION, _content: '' });
				} else {
					blockedExtension.forEach((item: string) => {
						attributes.push({ n: ZIMBRA_MTA_BLOCKED_EXTENSION, _content: item });
					});
				}
			}
		}
		attributes.push({
			n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
			_content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin ? TRUE : FALSE
		});
		attributes.push({
			n: ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
			_content: mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient ? TRUE : FALSE
		});

		attributes.push({
			n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender ? 'yes' : 'no'
		});
		attributes.push({
			n: ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient ? 'yes' : 'no'
		});
		attributes.push({
			n: ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
			_content: mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
				? REJECT_SENDER_LOGIN_MISMATCH
				: ''
		});
		if (mtaInboundSecurityDetail?.rejectUnknownClientHostname) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectUnknownClientHostname
					? REJECT_UNKNOWN_CLIENT_HOSTNAME
					: ''
			});
		}
		if (mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname
					? REJECT_UNKNOWN_REVERSE_CLIENT_HOSTNAME
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectInvalidHeloHostname) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectInvalidHeloHostname
					? REJECT_INVALID_HELO_HOSTNAME
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname
					? REJECT_NON_FQDN_HELO_HOSTNAME
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectUnknownHeloHostname) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectUnknownHeloHostname
					? REJECT_UNKNOWN_HELO_HOSTNAME
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectUnknownSenderDomain) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectUnknownSenderDomain
					? REJECT_UNKNOWN_SENDER_DOMAIN
					: ''
			});
		}

		if (mtaInboundSecurityDetail?.rejectNonFqdnSender) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: mtaInboundSecurityDetail?.rejectNonFqdnSender ? REJECT_NON_FQDN_SENDER : ''
			});
		}

		if (!attributes.find((item: Record<string, string>) => item?.n === ZIMBRA_MTA_RESTRICTION)) {
			attributes.push({
				n: ZIMBRA_MTA_RESTRICTION,
				_content: ''
			});
		}
		modifyConfigRequest(attributes);
	}, [mtaInboundSecurityDetail, modifyConfigRequest]);

	const onCancel = useCallback(() => {
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
		setValue(
			ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
			mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtensionWarnAdmin
		);
		setValue(
			ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
			mtaInboundSecurityInitialDetail?.zimbraMtaBlockedExtensionWarnRecipient
		);

		setValue(
			ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
			mtaInboundSecurityInitialDetail?.zimbraMtaSmtpdRejectUnlistedSender
		);
		setValue(
			ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
			mtaInboundSecurityInitialDetail?.zimbraMtaSmtpdRejectUnlistedRecipient
		);
		setValue(
			ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
			mtaInboundSecurityInitialDetail?.zimbraMtaSmtpdSenderRestrictions
		);
		setValue(
			'rejectUnknownClientHostname',
			mtaInboundSecurityInitialDetail?.rejectUnknownClientHostname !== undefined
		);
		setValue(
			'rejectUnknownReverseClientHostname',
			mtaInboundSecurityInitialDetail?.rejectUnknownReverseClientHostname !== undefined
		);
		setValue(
			'rejectInvalidHeloHostname',
			mtaInboundSecurityInitialDetail?.rejectInvalidHeloHostname !== undefined
		);
		setValue(
			'rejectNonFqdnHeloHostname',
			mtaInboundSecurityInitialDetail?.rejectNonFqdnHeloHostname !== undefined
		);
		setValue(
			'rejectUnknownHeloHostname',
			mtaInboundSecurityInitialDetail?.rejectUnknownHeloHostname !== undefined
		);
		setValue(
			'rejectUnknownSenderDomain',
			mtaInboundSecurityInitialDetail?.rejectUnknownSenderDomain !== undefined
		);
		setValue(
			'rejectNonFqdnSender',
			mtaInboundSecurityInitialDetail?.rejectNonFqdnSender !== undefined
		);
		setTimeout(() => {
			setIsDirty(false);
		}, 100);
	}, [mtaInboundSecurityInitialDetail, setValue]);

	const onBlockExtensionChange = useCallback(
		(ev) => {
			if (ev && ev.length > 0) {
				const extension = ev.map((item: Record<string, string>) => item?.label);
				if (extension && extension.length > 0) {
					setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, extension);
					setMtaBlockExtension(ev);
				}
			} else {
				setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, []);
				setMtaBlockExtension([]);
			}
		},
		[setValue]
	);

	const onCommonBlockExtensionAdd = useCallback(() => {
		const allExtension = [
			...mtaBlockExtension.map((item: Record<string, string>) => item?.label),
			...commonBlockedExtensions
		];
		setValue(ZIMBRA_MTA_BLOCKED_EXTENSION, allExtension);
		setMtaBlockExtension(allExtension.map((item: string) => ({ label: item })));
	}, [setValue, mtaBlockExtension, commonBlockedExtensions]);

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
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
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
				style={{ overflow: 'auto' }}
			>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{
						bottom: 'extralarge'
					}}
				>
					<Text size="small">
						<Trans
							i18nKey="mta.important_mta_reboot_information_message"
							defaults="<bold>IMPORTANT: Any changes made on this page will require a reboot of the MTA</bold> for them to take effect. Simply saving the changes will not suffice."
							components={{ bold: <strong /> }}
						/>
					</Text>
				</Container>
				<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
					<Divider />
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'large', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.settings', 'Settings')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						width="70%"
						padding={{ right: 'medium' }}
						style={allowSetMTA ? {} : { pointerEvents: 'none', cursor: 'pointer' }}
					>
						<ChipInput
							placeholder={t(
								'mta.add_here_any_blocked_extension',
								'Add here any Blocked Extension'
							)}
							background="gray5"
							requireUniqueChips
							value={mtaBlockExtension}
							onChange={onBlockExtensionChange}
							disabled={!allowSetMTA}
							ChipComponent={CustomChip}
						/>
					</Container>
					<Container crossAlignment="flex-start" width="30%">
						<Button
							label={t('mta.add_commonly_blocked_extensions', 'Add commonly blocked extensions')}
							color="primary"
							size="medium"
							type="outlined"
							onClick={onCommonBlockExtensionAdd}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.notify_administrators_of_blocked_file_extension_incoming_emails',
								'Notify administrators about blocked file extensions in incoming emails'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.notify_admins_about_block_extensions',
									'Notify admins about blocked extensions'
								)}
								value={mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_ADMIN,
										!mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnAdmin
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start" height="auto">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.notify_recipients_of_blocked_file_extension_incoming_emails',
								'Notify recipients about blocked file extensions in incoming emails'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.notify_external_recipient_about_block_extensions',
									'Notify external recepients about blocked extensions'
								)}
								value={mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_BLOCKED_EXTENSION_WARN_RECIPIENT,
										!mtaInboundSecurityDetail?.zimbraMtaBlockedExtensionWarnRecipient
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container
					crossAlignment="flex-start"
					padding={{ top: 'extralarge', bottom: 'large' }}
					height="auto"
				>
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
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_unlisted_senders',
								'Reject emails from unlisted senders'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.reject_unlisted_sender', 'Reject unlisted Sender')}
								value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
										!mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_addressed_to_unlisted_recipients',
								'Reject emails addressed to unlisted recipients'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.reject_unlisted_recipient', 'Reject unlisted Recipient')}
								value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
										!mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_when_sender_login_does_not_match_authenticated_user',
								`Reject emails when the sender's login does not match the authenticated user`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.reject_sender_login_mismatch_or_empty',
									'Reject Sender login mismatch or empty '
								)}
								value={mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
										!mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container
					crossAlignment="flex-start"
					padding={{ top: 'extralarge', bottom: 'large' }}
					height="auto"
				>
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
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_client_hostnames',
								`Rejects emails from clients with unknown or unresolvable hostnames`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.clients_ip_address', 'Client’s IP address')}
								value={mtaInboundSecurityDetail?.rejectUnknownClientHostname}
								onClick={(): void =>
									setValue(
										_REJECT_UNKNOWN_CLIENT_HOSTNAME,
										!mtaInboundSecurityDetail?.rejectUnknownClientHostname
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_client_with_inresolved_helo_hostnames',
								`Rejects emails from clients with unresolvable HELO/EHLO hostnames`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.client_must_greet_with_resolving_hostname',
									'Client should have a resolving hostname'
								)}
								value={mtaInboundSecurityDetail?.rejectUnknownHeloHostname}
								onClick={(): void =>
									setValue(
										'rejectUnknownHeloHostname',
										!mtaInboundSecurityDetail?.rejectUnknownHeloHostname
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
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
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_client_with_unknown_unresolvable_reverse_hostname',
								`Rejects emails from clients with unknown or unresolvable reverse hostnames`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.check_client_host_name', 'Check Client Hostname')}
								value={mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname}
								onClick={(): void =>
									setValue(
										'rejectUnknownReverseClientHostname',
										!mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_unknown_or_unresolvable_sender_domains',
								`Rejects emails from unknown or unresolvable sender domains`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.senders_domain', 'Sender’s Domain')}
								value={mtaInboundSecurityDetail?.rejectUnknownSenderDomain}
								onClick={(): void =>
									setValue(
										'rejectUnknownSenderDomain',
										!mtaInboundSecurityDetail?.rejectUnknownSenderDomain
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
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
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_with_an_invalid_or_unresolvable_helo_hostname',
								`Reject emails with an invalid or unresolvable HELO hostname`
							)}
							maxWidth="auto"
						>
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
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_with_non_fully_qualified_domain_name_sender_address',
								`Rejects emails with non fully qualified domain name (FQDN) sender addresses`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.senders_address_must_fully_qualified',
									'Sender address must be fully qualified'
								)}
								value={mtaInboundSecurityDetail?.rejectNonFqdnSender}
								onClick={(): void =>
									setValue('rejectNonFqdnSender', !mtaInboundSecurityDetail?.rejectNonFqdnSender)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
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
						<Tooltip
							placement="bottom"
							label={t(
								'mta.reject_emails_from_client_domain_hostname',
								`Rejects emails from clients with non fully qualified domain name (FQDN) in their HELO/EHLO hostname`
							)}
							maxWidth="auto"
						>
							<Switch
								label={t(
									'mta.client_must_greet_with_fully_qualified_hostname',
									'Client should have a quilified hostname'
								)}
								value={mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname}
								onClick={(): void =>
									setValue(
										'rejectNonFqdnHeloHostname',
										!mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname
									)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAInboundFlowSecurity;

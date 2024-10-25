/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';

import {
	Container,
	Row,
	Text,
	Divider,
	Input,
	ChipInput,
	Padding,
	Button,
	Switch,
	ChipItem,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { filter, isEqual, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Attribute, GlobalDisclaimerType } from '../../../../types';
import {
	CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
	FALSE,
	TRUE,
	ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
	ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED
} from '../../../constants';
import { getAllConfig } from '../../../services/get-all-config';
import { modifyConfig } from '../../../services/modify-config';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';
import { isValidEmail } from '../../utility/utils';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const GlobalDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [carbonioNotificationData, setCarbonioNotificationData] = useState<any>({});
	const [initCarbonioNotificationData, setInitCarbonioNotificationData] = useState<{
		[key: string]: string | { label: string }[];
	}>({});
	const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const [globalDisclaimerDetail, setGlobalDisclaimerDetail] = useState<GlobalDisclaimerType>();
	const [globalConfigData, setGlobalConfigData] = useState<Array<any>>([]);
	const [globalDisclaimerInitialDetail, setGlobalDisclaimerInitialDetail] =
		useState<GlobalDisclaimerType>();
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const setGlobalInitialValue = useCallback((key: string, value: unknown): void => {
		setGlobalDisclaimerInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setGlobalDisclaimerDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setGlobalInitialValue(key, value);
			setValue(key, value);
		},
		[setGlobalInitialValue, setValue]
	);

	useEffect(() => {
		if (
			Object.entries(carbonioNotificationData).length !== 0 &&
			carbonioNotificationData.carbonioNotificationFrom !== '' &&
			carbonioNotificationData.carbonioNotificationFrom !== undefined &&
			carbonioNotificationData.carbonioNotificationRecipients?.length !== 0 &&
			carbonioNotificationData.carbonioNotificationRecipients?.length !== undefined
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [
		carbonioNotificationData,
		carbonioNotificationData.carbonioNotificationFrom,
		carbonioNotificationData.carbonioNotificationRecipients?.length
	]);

	useEffect(() => {
		if (!isEqual(carbonioNotificationData, initCarbonioNotificationData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [carbonioNotificationData, initCarbonioNotificationData]);

	useEffect(() => {
		if (globalDisclaimerDetail && !isEqual(globalDisclaimerDetail, globalDisclaimerInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [globalDisclaimerDetail, globalDisclaimerInitialDetail]);

	const handleOnCancel = (): void => {
		setHasCarbonioNotificationFromError(false);
		if (initCarbonioNotificationData) {
			setCarbonioNotificationData(initCarbonioNotificationData);
		} else {
			setCarbonioNotificationData({
				carbonioNotificationFrom: '',
				carbonioNotificationRecipients: []
			});
		}
		setGlobalDisclaimerDetail(globalDisclaimerInitialDetail);
	};

	useEffect(() => {
		if (globalConfigData && globalConfigData.length > 0) {
			const data = globalConfigData;
			const zimbraDomainMandatoryMailSignatureEnabled = data.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED
			);
			if (zimbraDomainMandatoryMailSignatureEnabled[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
					zimbraDomainMandatoryMailSignatureEnabled[0]?._content === TRUE
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED, false);
			}

			const zimbraAmavisOutboundDisclaimersOnly = data.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY
			);
			if (zimbraAmavisOutboundDisclaimersOnly[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
					zimbraAmavisOutboundDisclaimersOnly[0]?._content === TRUE
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY, false);
			}

			const carbonioSearchAllDomainsByFeature = data.filter(
				(item: Record<string, string>) => item?.n === CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE
			);
			if (carbonioSearchAllDomainsByFeature[0]?._content) {
				setInitialAndCurrentValue(
					CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
					carbonioSearchAllDomainsByFeature[0]?._content === TRUE
				);
			} else {
				setInitialAndCurrentValue(CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE, false);
			}
		}
	}, [globalConfigData, setInitialAndCurrentValue]);

	const getAllConfigData = async (): Promise<void> => {
		getAllConfig().then((res) => {
			const propertiesToExtract = ['carbonioNotificationFrom', 'carbonioNotificationRecipients'];

			const obj: { [key: string]: string | { label: string }[] } = {};
			propertiesToExtract.forEach((property) => {
				const items = filter(res.a, { n: property });
				if (property === 'carbonioNotificationRecipients') {
					obj[property] = items.map((item) => ({ label: item._content }));
				} else {
					const item = items[0];
					obj[property] = item?._content;
				}
			});
			setCarbonioNotificationData(obj);
			setInitCarbonioNotificationData(obj);
			if (res?.a) {
				setGlobalConfigData(res?.a);
			}
		});
	};

	const callRequest = useCallback(
		(attributes) => {
			modifyConfig(attributes)
				.then(() => {
					getAllConfigData();
					updateConfig(
						ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
						globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE
					);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});

					if (
						!isEqual(
							globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled,
							globalDisclaimerInitialDetail?.zimbraDomainMandatoryMailSignatureEnabled
						) &&
						globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled
					) {
						setTimeout(() => {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: t(
									'label.mandatory_disclaimer_are_enable_for_all_domain',
									'The mandatory disclaimers are enabled for all domains'
								),
								autoHideTimeout: 2000,
								hideButton: true,
								replace: true
							});
						}, 2000);
					}
					if (
						!isEqual(
							globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly,
							globalDisclaimerInitialDetail?.zimbraAmavisOutboundDisclaimersOnly
						) &&
						globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly
					) {
						setTimeout(() => {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: t(
									'label.mandatory_disclaimer_are_enable_only_for_outbound_deliveries',
									'The mandatory disclaimers are enabled only for outbound deliveries'
								),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						}, 4000);
					}
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[
			createSnackbar,
			globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly,
			globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled,
			globalDisclaimerInitialDetail?.zimbraAmavisOutboundDisclaimersOnly,
			globalDisclaimerInitialDetail?.zimbraDomainMandatoryMailSignatureEnabled,
			t,
			updateConfig
		]
	);

	const handleOnSave = (): void => {
		const attributes: Attribute[] &
			{
				n: string;
				_content: string[];
			}[] = [];
		if (
			isValidEmail(carbonioNotificationData.carbonioNotificationFrom ?? '') ||
			carbonioNotificationData.carbonioNotificationFrom === ''
		) {
			attributes.push({
				n: 'carbonioNotificationFrom',
				_content: carbonioNotificationData.carbonioNotificationFrom
			});
			carbonioNotificationData.carbonioNotificationRecipients.forEach(
				// eslint-disable-next-line array-callback-return
				(item: { label: string }): void => {
					attributes.push({
						n: 'carbonioNotificationRecipients',
						_content: item?.label
					});
				}
			);
			setHasCarbonioNotificationFromError(false);
		} else {
			setHasCarbonioNotificationFromError(true);
		}

		attributes.push({
			n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
			_content: globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
			_content: globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly ? TRUE : FALSE
		});
		if (isAdvanced) {
			attributes.push({
				n: CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
				_content: globalDisclaimerDetail?.carbonioSearchAllDomainsByFeature ? TRUE : FALSE
			});
		}

		if (attributes && attributes.length > 0) {
			callRequest(attributes);
		}
	};

	useEffect(() => {
		getAllConfigData();
	}, []);

	return (
		<RelativeContainer
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflowY: 'auto' }}
			background="white"
		>
			<Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
				<Container orientation="vertical" mainAlignment="space-around" height="1.9rem">
					<Row orientation="horizontal" width="100%">
						<Row mainAlignment="flex-start" width="50%" crossAlignment="center">
							<Text size="extralarge" weight="bold">
								{t('label.settings', 'Settings')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={handleOnCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={handleOnSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>
			<Divider />
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				height="calc(100vh - 12.5rem)"
				padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ top: 'small' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('label.domain_system_notifications', 'Domain System Notifications')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', bottom: 'small' }}
					>
						<Input
							inputName="carbonioNotificationFrom"
							label={t('label.notification_sender', 'Notification Sender')}
							backgroundColor="gray5"
							value={carbonioNotificationData?.carbonioNotificationFrom}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setCarbonioNotificationData({
									...carbonioNotificationData,
									[e.target.name]: e.target.value
								});
							}}
							hasError={hasCarbonioNotificationFromError}
							description={
								hasCarbonioNotificationFromError
									? t('label.notification_error_msg', 'Enter a valid email address.')
									: undefined
							}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', bottom: 'small' }}
					>
						<ChipInput
							placeholder={t('label.send_notifications_to', 'Send notifications to...')}
							background="gray5"
							defaultValue={carbonioNotificationData?.carbonioNotificationRecipients}
							value={carbonioNotificationData?.carbonioNotificationRecipients}
							onChange={(emails: ChipItem[]): void => {
								const data: ChipItem[] = [];
								map(emails, (email) => {
									if (isValidEmail(email.label ?? '')) data.push(email);
								});
								setCarbonioNotificationData({
									...carbonioNotificationData,
									carbonioNotificationRecipients: data
								});
							}}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							top: 'extralarge'
						}}
					>
						<Switch
							label={t(
								'label.enable_disclaimers_for_all_domains',
								'Mandatory disclaimer for all domains'
							)}
							value={globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled}
							onClick={(): void => {
								setValue(
									ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
									!globalDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled
								);
							}}
						/>
					</Container>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							top: 'extralarge'
						}}
					>
						<Switch
							label={t('label.only_allow_outbound_disclaimers', 'Only allow outbound disclaimers')}
							value={globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly}
							onClick={(): void => {
								setValue(
									ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
									!globalDisclaimerDetail?.zimbraAmavisOutboundDisclaimersOnly
								);
							}}
						/>
					</Container>
				</ListRow>
				{isAdvanced && (
					<ListRow>
						<Container
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							height="auto"
							padding={{
								top: 'extralarge'
							}}
						>
							<Switch
								label={t(
									'domain.globalSettings.allowSearchUserFromAllDomains',
									`Allow searching users' information in all domains`
								)}
								value={globalDisclaimerDetail?.carbonioSearchAllDomainsByFeature}
								onClick={(): void => {
									setValue(
										CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
										!globalDisclaimerDetail?.carbonioSearchAllDomainsByFeature
									);
								}}
							/>
						</Container>
					</ListRow>
				)}
			</Container>
		</RelativeContainer>
	);
};

export default GlobalDetailPanel;

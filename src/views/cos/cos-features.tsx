/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Divider,
	Switch,
	Padding,
	Button,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useCosStore } from '../../store/cos/store';
import { modifyCos } from '../../services/modify-cos-service';
import { RouteLeavingGuard } from '../ui-extras/nav-guard';

const CosFeatures: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData]: any = useState({});
	const setCos = useCosStore((state) => state.setCos);
	const [cosFeatures, setCosFeatures] = useState<any>({
		zimbraFeatureMailEnabled: true,
		zimbraFeatureContactsEnabled: true,
		zimbraFeatureCalendarEnabled: true,
		zimbraFeatureTaggingEnabled: true,
		zimbraFeatureHtmlComposeEnabled: true,
		zimbraFeatureWebClientOfflineAccessEnabled: true,
		zimbraFeatureMailPriorityEnabled: true,
		zimbraFeatureOutOfOfficeReplyEnabled: true,
		zimbraFeaturePop3DataSourceEnabled: true,
		zimbraFeatureDistributionListFolderEnabled: true,
		zimbraFeatureGroupCalendarEnabled: true,
		zimbraFeatureCalendarReminderDeviceEmailEnabled: false,
		zimbraFeatureSavedSearchesEnabled: true,
		zimbraFeatureInitialSearchPreferenceEnabled: true,
		zimbraFeatureAdvancedSearchEnabled: false,
		zimbraFeaturePeopleSearchEnabled: false,
		zimbraFeatureSMIMEEnabled: false
	});

	const setSwitchOptionValue = useCallback(
		(key: string, value: boolean): void => {
			setCosFeatures((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosFeatures]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (obj.zimbraFeatureMailEnabled) {
				setSwitchOptionValue('zimbraFeatureMailEnabled', obj.zimbraFeatureMailEnabled === 'TRUE');
			} else {
				obj.zimbraFeatureMailEnabled = false;
				setSwitchOptionValue('zimbraFeatureMailEnabled', false);
			}
			if (obj.zimbraFeatureContactsEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureContactsEnabled',
					obj.zimbraFeatureContactsEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureContactsEnabled = false;
				setSwitchOptionValue('zimbraFeatureContactsEnabled', false);
			}
			if (obj.zimbraFeatureCalendarEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureCalendarEnabled',
					obj.zimbraFeatureCalendarEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureCalendarEnabled = false;
				setSwitchOptionValue('zimbraFeatureCalendarEnabled', false);
			}
			if (obj.zimbraFeatureTaggingEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureTaggingEnabled',
					obj.zimbraFeatureTaggingEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureTaggingEnabled = false;
				setSwitchOptionValue('zimbraFeatureTaggingEnabled', false);
			}
			if (obj.zimbraFeatureHtmlComposeEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureHtmlComposeEnabled',
					obj.zimbraFeatureHtmlComposeEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureHtmlComposeEnabled = false;
				setSwitchOptionValue('zimbraFeatureHtmlComposeEnabled', false);
			}
			if (obj.zimbraFeatureWebClientOfflineAccessEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureWebClientOfflineAccessEnabled',
					obj.zimbraFeatureWebClientOfflineAccessEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureWebClientOfflineAccessEnabled = false;
				setSwitchOptionValue('zimbraFeatureWebClientOfflineAccessEnabled', false);
			}
			if (obj.zimbraFeatureMailPriorityEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureMailPriorityEnabled',
					obj.zimbraFeatureMailPriorityEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureMailPriorityEnabled = false;
				setSwitchOptionValue('zimbraFeatureMailPriorityEnabled', false);
			}
			if (obj.zimbraFeatureOutOfOfficeReplyEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureOutOfOfficeReplyEnabled',
					obj.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureOutOfOfficeReplyEnabled = false;
				setSwitchOptionValue('zimbraFeatureOutOfOfficeReplyEnabled', false);
			}
			if (obj.zimbraFeaturePop3DataSourceEnabled) {
				setSwitchOptionValue(
					'zimbraFeaturePop3DataSourceEnabled',
					obj.zimbraFeaturePop3DataSourceEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeaturePop3DataSourceEnabled = false;
				setSwitchOptionValue('zimbraFeaturePop3DataSourceEnabled', false);
			}
			if (obj.zimbraFeatureDistributionListFolderEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureDistributionListFolderEnabled',
					obj.zimbraFeatureDistributionListFolderEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureDistributionListFolderEnabled = false;
				setSwitchOptionValue('zimbraFeatureDistributionListFolderEnabled', false);
			}
			if (obj.zimbraFeatureGroupCalendarEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureGroupCalendarEnabled',
					obj.zimbraFeatureGroupCalendarEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureGroupCalendarEnabled = false;
				setSwitchOptionValue('zimbraFeatureGroupCalendarEnabled', false);
			}
			if (obj.zimbraFeatureCalendarReminderDeviceEmailEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureCalendarReminderDeviceEmailEnabled',
					obj.zimbraFeatureCalendarReminderDeviceEmailEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureCalendarReminderDeviceEmailEnabled = false;
				setSwitchOptionValue('zimbraFeatureCalendarReminderDeviceEmailEnabled', false);
			}
			if (obj.zimbraFeatureSavedSearchesEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureSavedSearchesEnabled',
					obj.zimbraFeatureSavedSearchesEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureSavedSearchesEnabled = false;
				setSwitchOptionValue('zimbraFeatureSavedSearchesEnabled', false);
			}
			if (obj.zimbraFeatureInitialSearchPreferenceEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureInitialSearchPreferenceEnabled',
					obj.zimbraFeatureInitialSearchPreferenceEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureInitialSearchPreferenceEnabled = false;
				setSwitchOptionValue('zimbraFeatureInitialSearchPreferenceEnabled', false);
			}
			if (obj.zimbraFeatureAdvancedSearchEnabled) {
				setSwitchOptionValue(
					'zimbraFeatureAdvancedSearchEnabled',
					obj.zimbraFeatureAdvancedSearchEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeatureAdvancedSearchEnabled = false;
				setSwitchOptionValue('zimbraFeatureAdvancedSearchEnabled', false);
			}
			if (obj.zimbraFeaturePeopleSearchEnabled) {
				setSwitchOptionValue(
					'zimbraFeaturePeopleSearchEnabled',
					obj.zimbraFeaturePeopleSearchEnabled === 'TRUE'
				);
			} else {
				obj.zimbraFeaturePeopleSearchEnabled = false;
				setSwitchOptionValue('zimbraFeaturePeopleSearchEnabled', false);
			}
			if (obj.zimbraFeatureSMIMEEnabled) {
				setSwitchOptionValue('zimbraFeatureSMIMEEnabled', obj.zimbraFeatureSMIMEEnabled === 'TRUE');
			} else {
				obj.zimbraFeatureSMIMEEnabled = false;
				setSwitchOptionValue('zimbraFeatureSavedSearchesEnabled', false);
			}
			setCosData(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setSwitchOptionValue]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setCosFeatures((prev: any) => ({ ...prev, [key]: !cosFeatures[key] }));
			setIsDirty(true);
		},
		[cosFeatures, setCosFeatures, setIsDirty]
	);

	const onSave = (): void => {
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		const attrList: { n: string; _content: string }[] = [];
		Object.keys(cosFeatures).map((ele: any) =>
			attrList.push({ n: ele, _content: cosFeatures[ele] === true ? 'TRUE' : 'FALSE' })
		);
		body.a = attrList;
		const id = {
			_content: cosData.zimbraId
		};
		body.id = id;
		modifyCos(body)
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
				const cos: any = data?.Body?.ModifyCosResponse?.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
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
		setSwitchOptionValue('zimbraFeatureMailEnabled', cosData.zimbraFeatureMailEnabled);
		setSwitchOptionValue('zimbraFeatureContactsEnabled', cosData.zimbraFeatureContactsEnabled);
		setSwitchOptionValue('zimbraFeatureCalendarEnabled', cosData.zimbraFeatureCalendarEnabled);
		setSwitchOptionValue('zimbraFeatureTaggingEnabled', cosData.zimbraFeatureTaggingEnabled);
		setSwitchOptionValue(
			'zimbraFeatureHtmlComposeEnabled',
			cosData.zimbraFeatureHtmlComposeEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureWebClientOfflineAccessEnabled',
			cosData.zimbraFeatureWebClientOfflineAccessEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureMailPriorityEnabled',
			cosData.zimbraFeatureMailPriorityEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureOutOfOfficeReplyEnabled',
			cosData.zimbraFeatureOutOfOfficeReplyEnabled
		);
		setSwitchOptionValue(
			'zimbraFeaturePop3DataSourceEnabled',
			cosData.zimbraFeaturePop3DataSourceEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureDistributionListFolderEnabled',
			cosData.zimbraFeatureDistributionListFolderEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureGroupCalendarEnabled',
			cosData.zimbraFeatureGroupCalendarEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureCalendarReminderDeviceEmailEnabled',
			cosData.zimbraFeatureCalendarReminderDeviceEmailEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureSavedSearchesEnabled',
			cosData.zimbraFeatureSavedSearchesEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureInitialSearchPreferenceEnabled',
			cosData.zimbraFeatureInitialSearchPreferenceEnabled
		);
		setSwitchOptionValue(
			'zimbraFeatureAdvancedSearchEnabled',
			cosData.zimbraFeatureAdvancedSearchEnabled
		);
		setSwitchOptionValue(
			'zimbraFeaturePeopleSearchEnabled',
			cosData.zimbraFeaturePeopleSearchEnabled
		);
		setSwitchOptionValue('zimbraFeatureSMIMEEnabled', cosData.zimbraFeatureSMIMEEnabled);
		setIsDirty(false);
	};

	return (
		<>
			<Container mainAlignment="flex-start" background="gray6">
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
									{t('cos.features', 'Features')}
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
					mainAlignment="flex-start"
					width="100%"
					orientation="vertical"
					style={{ overflow: 'auto' }}
				>
					<Row
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ all: 'large' }}
						width="100%"
					>
						<Text size="extralarge" weight="bold">
							{t('cos.main_features', 'Main Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureMailEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureMailEnabled')}
									label={t('cos.mail', 'Mail')}
								/>
							</Row>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureCalendarEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureCalendarEnabled')}
									label={t('cos.calendar', 'Calendar')}
								/>
							</Row>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureContactsEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureContactsEnabled')}
									label={t('cos.contacts', 'Contacts')}
								/>
							</Row>
						</Row>

						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.general_features', 'General Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureTaggingEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureTaggingEnabled')}
									label={t('cos.tagging', 'Tagging')}
								/>
							</Row>

							<Row width="25%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureHtmlComposeEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureHtmlComposeEnabled')}
									label={t('cos.html_compose', 'HTML compose')}
								/>
							</Row>

							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureWebClientOfflineAccessEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureWebClientOfflineAccessEnabled')}
									label={t(
										'cos.offline_support_for_advanced_client',
										'Offline support for Advanced (Ajax) client'
									)}
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.mail_features', 'Mail Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureMailPriorityEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureMailPriorityEnabled')}
									label={t('cos.message_priority', 'Message Priority')}
									disabled={!cosFeatures.zimbraFeatureMailEnabled}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="25%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeaturePop3DataSourceEnabled}
									onClick={() => changeSwitchOption('zimbraFeaturePop3DataSourceEnabled')}
									label={t('cos.external_pop_access', 'External POP Access')}
									disabled={!cosFeatures.zimbraFeatureMailEnabled}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureOutOfOfficeReplyEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureOutOfOfficeReplyEnabled')}
									label={t('cos.out_of_the_office_reply', 'Out of the Office Reply')}
									disabled={!cosFeatures.zimbraFeatureMailEnabled}
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.contact_features', 'Contact Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="40%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureDistributionListFolderEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureDistributionListFolderEnabled')}
									label={t('cos.distribution_list_folder', 'Distribution List Folder')}
									disabled={!cosFeatures.zimbraFeatureContactsEnabled}
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.calender_features', 'Calendar Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureGroupCalendarEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureGroupCalendarEnabled')}
									label={t('cos.group_calender', 'Group Calendar')}
									disabled={!cosFeatures.zimbraFeatureCalendarEnabled}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="25%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureCalendarReminderDeviceEmailEnabled}
									onClick={() =>
										changeSwitchOption('zimbraFeatureCalendarReminderDeviceEmailEnabled')
									}
									label={t('cos.sms_reminders', 'SMS Reminders')}
									disabled={!cosFeatures.zimbraFeatureCalendarEnabled}
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.search_features', 'Search Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureAdvancedSearchEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureAdvancedSearchEnabled')}
									label={t('cos.advanced_search', 'Advanced Search')}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureSavedSearchesEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureSavedSearchesEnabled')}
									label={t('cos.saved_searches', 'Saved Searches')}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureInitialSearchPreferenceEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureInitialSearchPreferenceEnabled')}
									label={t('cos.initial_search_preference', 'Initial Search Preference')}
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeaturePeopleSearchEnabled}
									onClick={() => changeSwitchOption('zimbraFeaturePeopleSearchEnabled')}
									label={t('cos.search_for_people', 'Search for People')}
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.s_mime_features', 'S/MIME Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureSMIMEEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureSMIMEEnabled')}
									label={t('cos.enable_smime', 'Enable S/MIME')}
								/>
							</Row>
						</Row>
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
		</>
	);
};

export default CosFeatures;

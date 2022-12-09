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
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';

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
		// zimbraFeatureTaggingEnabled: true,
		// zimbraFeatureHtmlComposeEnabled: true,
		// zimbraFeatureWebClientOfflineAccessEnabled: true,
		// zimbraFeatureMailPriorityEnabled: true,
		// zimbraFeatureOutOfOfficeReplyEnabled: true,
		// zimbraFeaturePop3DataSourceEnabled: true,
		// zimbraFeatureDistributionListFolderEnabled: true,
		// zimbraFeatureGroupCalendarEnabled: true,
		// zimbraFeatureCalendarReminderDeviceEmailEnabled: false,
		// zimbraFeatureSavedSearchesEnabled: true,
		// zimbraFeatureInitialSearchPreferenceEnabled: true,
		// zimbraFeatureAdvancedSearchEnabled: false,
		// zimbraFeaturePeopleSearchEnabled: false,
		// zimbraFeatureSMIMEEnabled: false,
		zimbraFeatureMobileSyncEnabled: false
	});
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const setSwitchOptionValue = useCallback(
		(key: string, value: boolean): void => {
			setCosFeatures((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosFeatures]
	);

	const setInitalValues = useCallback(
		(obj: any) => {
			if (obj) {
				setSwitchOptionValue('zimbraFeatureMailEnabled', obj?.zimbraFeatureMailEnabled === 'TRUE');
				setSwitchOptionValue(
					'zimbraFeatureContactsEnabled',
					obj?.zimbraFeatureContactsEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'zimbraFeatureCalendarEnabled',
					obj?.zimbraFeatureCalendarEnabled === 'TRUE'
				);
				// setSwitchOptionValue(
				// 	'zimbraFeatureTaggingEnabled',
				// 	obj?.zimbraFeatureTaggingEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureHtmlComposeEnabled',
				// 	obj?.zimbraFeatureHtmlComposeEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureWebClientOfflineAccessEnabled',
				// 	obj?.zimbraFeatureWebClientOfflineAccessEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureMailPriorityEnabled',
				// 	obj?.zimbraFeatureMailPriorityEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureOutOfOfficeReplyEnabled',
				// 	obj?.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeaturePop3DataSourceEnabled',
				// 	obj?.zimbraFeaturePop3DataSourceEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureDistributionListFolderEnabled',
				// 	obj?.zimbraFeatureDistributionListFolderEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureGroupCalendarEnabled',
				// 	obj?.zimbraFeatureGroupCalendarEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureCalendarReminderDeviceEmailEnabled',
				// 	obj?.zimbraFeatureCalendarReminderDeviceEmailEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureSavedSearchesEnabled',
				// 	obj?.zimbraFeatureSavedSearchesEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureInitialSearchPreferenceEnabled',
				// 	obj?.zimbraFeatureInitialSearchPreferenceEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureAdvancedSearchEnabled',
				// 	obj?.zimbraFeatureAdvancedSearchEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeaturePeopleSearchEnabled',
				// 	obj?.zimbraFeaturePeopleSearchEnabled === 'TRUE'
				// );
				// setSwitchOptionValue(
				// 	'zimbraFeatureSMIMEEnabled',
				// 	obj?.zimbraFeatureSMIMEEnabled === 'TRUE'
				// );
				setSwitchOptionValue(
					'zimbraFeatureMobileSyncEnabled',
					obj?.zimbraFeatureMobileSyncEnabled === 'TRUE'
				);
			}
		},
		[setSwitchOptionValue]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (!obj.zimbraFeatureMailEnabled) {
				obj.zimbraFeatureMailEnabled = false;
			}
			if (!obj.zimbraFeatureContactsEnabled) {
				obj.zimbraFeatureContactsEnabled = false;
			}
			if (!obj.zimbraFeatureCalendarEnabled) {
				obj.zimbraFeatureCalendarEnabled = false;
			}
			// if (!obj.zimbraFeatureTaggingEnabled) {
			// 	obj.zimbraFeatureTaggingEnabled = false;
			// }
			// if (!obj.zimbraFeatureHtmlComposeEnabled) {
			// 	obj.zimbraFeatureHtmlComposeEnabled = false;
			// }
			// if (!obj.zimbraFeatureWebClientOfflineAccessEnabled) {
			// 	obj.zimbraFeatureWebClientOfflineAccessEnabled = false;
			// }
			// if (!obj.zimbraFeatureMailPriorityEnabled) {
			// 	obj.zimbraFeatureMailPriorityEnabled = false;
			// }
			// if (!obj.zimbraFeatureOutOfOfficeReplyEnabled) {
			// 	obj.zimbraFeatureOutOfOfficeReplyEnabled = false;
			// }
			// if (!obj.zimbraFeaturePop3DataSourceEnabled) {
			// 	obj.zimbraFeaturePop3DataSourceEnabled = false;
			// }
			// if (!obj.zimbraFeatureDistributionListFolderEnabled) {
			// 	obj.zimbraFeatureDistributionListFolderEnabled = false;
			// }
			// if (!obj.zimbraFeatureGroupCalendarEnabled) {
			// 	obj.zimbraFeatureGroupCalendarEnabled = false;
			// }
			// if (!obj.zimbraFeatureCalendarReminderDeviceEmailEnabled) {
			// 	obj.zimbraFeatureCalendarReminderDeviceEmailEnabled = false;
			// }
			// if (!obj.zimbraFeatureSavedSearchesEnabled) {
			// 	obj.zimbraFeatureSavedSearchesEnabled = false;
			// }
			// if (!obj.zimbraFeatureInitialSearchPreferenceEnabled) {
			// 	obj.zimbraFeatureInitialSearchPreferenceEnabled = false;
			// }
			// if (!obj.zimbraFeatureAdvancedSearchEnabled) {
			// 	obj.zimbraFeatureAdvancedSearchEnabled = false;
			// }
			// if (!obj.zimbraFeaturePeopleSearchEnabled) {
			// 	obj.zimbraFeaturePeopleSearchEnabled = false;
			// }
			// if (!obj.zimbraFeatureSMIMEEnabled) {
			// 	obj.zimbraFeatureSMIMEEnabled = false;
			// }
			if (!obj.zimbraFeatureMobileSyncEnabled) {
				obj.zimbraFeatureMobileSyncEnabled = false;
			}
			setCosData(obj);
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitalValues, setSwitchOptionValue]);

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
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
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

	const onCancel = (): void => {
		setInitalValues(cosData);
		setIsDirty(false);
	};

	return (
		<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
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
				padding={{ top: 'large' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.main_features', 'Main Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureMailEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureMailEnabled')}
								label={t('cos.mail', 'Mail')}
								disabled
							/>
						</Row>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureCalendarEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureCalendarEnabled')}
								label={t('cos.calendar', 'Calendar')}
								disabled
							/>
						</Row>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureContactsEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureContactsEnabled')}
								label={t('cos.contacts', 'Contacts')}
								disabled
							/>
						</Row>
						<Row width="20%" mainAlignment="flex-start">
							<Switch value={false} label={t('cos.chats', 'Chats')} disabled />
						</Row>
						<Row width="20%" mainAlignment="flex-start">
							<Switch value={false} label={t('cos.files', 'Files')} disabled />
						</Row>
					</Row>

					<Divider />
				</Row>
				{/* <Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.general_features', 'General Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureTaggingEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureTaggingEnabled')}
								label={t('cos.tagging', 'Tagging')}
								disabled
							/>
						</Row>

						<Row width="25%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureHtmlComposeEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureHtmlComposeEnabled')}
								label={t('cos.html_compose', 'HTML compose')}
								disabled
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
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.mail_features', 'Mail Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureMailPriorityEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureMailPriorityEnabled')}
								label={t('cos.message_priority', 'Message Priority')}
								// disabled={!cosFeatures.zimbraFeatureMailEnabled}
								disabled
							/>
						</Row>
						<Padding right="extralarge" />
						<Row width="25%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeaturePop3DataSourceEnabled}
								onClick={() => changeSwitchOption('zimbraFeaturePop3DataSourceEnabled')}
								label={t('cos.external_pop_access', 'External POP Access')}
								// disabled={!cosFeatures.zimbraFeatureMailEnabled}
								disabled
							/>
						</Row>
						<Padding right="extralarge" />
						<Row width="35%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureOutOfOfficeReplyEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureOutOfOfficeReplyEnabled')}
								label={t('cos.out_of_the_office_reply', 'Out of Office Reply')}
								// disabled={!cosFeatures.zimbraFeatureMailEnabled}
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.contact_features', 'Contact Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="40%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureDistributionListFolderEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureDistributionListFolderEnabled')}
								label={t('cos.distribution_list_folder', 'Distribution List Folder')}
								// disabled={!cosFeatures.zimbraFeatureContactsEnabled}
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.calender_features', 'Calendar Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureGroupCalendarEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureGroupCalendarEnabled')}
								label={t('cos.group_calender', 'Group Calendar')}
								// disabled={!cosFeatures.zimbraFeatureCalendarEnabled}
								disabled
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
								// disabled={!cosFeatures.zimbraFeatureCalendarEnabled}
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.search_features', 'Search Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureAdvancedSearchEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureAdvancedSearchEnabled')}
								label={t('cos.advanced_search', 'Advanced Search')}
								disabled
							/>
						</Row>
						<Padding right="extralarge" />
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureSavedSearchesEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureSavedSearchesEnabled')}
								label={t('cos.saved_searches', 'Saved Searches')}
								disabled
							/>
						</Row>
						<Padding right="extralarge" />
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureInitialSearchPreferenceEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureInitialSearchPreferenceEnabled')}
								label={t('cos.initial_search_preference', 'Initial Search Preference')}
								disabled
							/>
						</Row>
						<Padding right="extralarge" />
						<Row width="20%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeaturePeopleSearchEnabled}
								onClick={() => changeSwitchOption('zimbraFeaturePeopleSearchEnabled')}
								label={t('cos.search_for_people', 'Search for People')}
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
					<Text size="extralarge" weight="bold">
						{t('cos.s_mime_features', 'S/MIME Features')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Row width="100%" mainAlignment="flex-start">
							<Switch
								value={cosFeatures.zimbraFeatureSMIMEEnabled}
								onClick={() => changeSwitchOption('zimbraFeatureSMIMEEnabled')}
								label={t('cos.enable_smime', 'Enable S/MIME')}
								disabled
							/>
						</Row>
					</Row>
					<Divider />
				</Row> */}
				{isAdvanced && (
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('label.active_sync', 'ActiveSync')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<Row width="100%" mainAlignment="flex-start">
								<Switch
									value={cosFeatures.zimbraFeatureMobileSyncEnabled}
									onClick={() => changeSwitchOption('zimbraFeatureMobileSyncEnabled')}
									label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								/>
							</Row>
						</Row>
					</Row>
				)}
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

export default CosFeatures;

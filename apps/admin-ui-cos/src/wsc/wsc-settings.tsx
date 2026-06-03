/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
	Banner,
	BoxLayout,
	Container,
	Input,
	Padding,
	Select,
	SelectItem,
	SettingLayout,
	Switch,
} from '@zextras/ui-components';
import { useIsAdvanced, useLicenseInfo, useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { TRUE } from '../constants';
import { withForm } from '../form/form-hook';
import type { WscCosFormValues } from './types';

export const WscSettings = withForm({
	defaultValues: {} as WscCosFormValues,
	props: {
		readonlyFeatures: false as boolean | undefined,
	},
	render: function Render({ form, readonlyFeatures = false }) {
		const [t] = useTranslation();

		const isAdvanced = useIsAdvanced();
		const userSetting = useUserSettings();

		const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

		const { data: licenseData, isLoading, error } = useLicenseInfo();

		const wscFeature = licenseData?.response?.features?.find(
			(feature) => feature.name === 'wsc_basic',
		);
		const isLicensed = !!wscFeature?.enabled;
		const requiresLicenseCheck = isAdvanced;

		const wscLicenseDisabledWarningLabel = t(
			'wsc.section.license.warning',
			"These settings can't be changed because your Chats license is not valid.",
		);

		const wscEnabled = useSelector(form.store, (s) => s.values.carbonioFeatureWscEnabled);
		const videoCallEnabled = useSelector(
			form.store,
			(s) => s.values.carbonioWscVideoCallEnabled,
		);
		const attachmentUploadEnabled = useSelector(
			form.store,
			(s) => s.values.carbonioWscAttachmentUpload,
		);

		const disableWscSettings =
			wscEnabled === 'FALSE' || readonlyFeatures || (requiresLicenseCheck && !isLicensed);

		const deleteMessageOptions: Array<SelectItem> = (() => {
			const timeLimitLabel = t('wsc.section.content.select.timeLimit', 'minute time limit');
			const userCannotDelete = t(
				'wsc.section.content.select.deleteLimit.zero',
				'User cannot delete sent messages',
			);
			return [
				{ value: '0m', label: userCannotDelete },
				{ value: '5m', label: `5 ${timeLimitLabel}` },
				{ value: '10m', label: `10 ${timeLimitLabel}` },
				{ value: '30m', label: `30 ${timeLimitLabel}` },
			];
		})();

		const editMessageOptions: Array<SelectItem> = (() => {
			const timeLimitLabel = t('wsc.section.content.select.timeLimit', 'minute time limit');
			const userCannotEdit = t(
				'wsc.section.content.select.zero.editLimit',
				'User cannot edit sent messages',
			);
			return [
				{ value: '0m', label: userCannotEdit },
				{ value: '5m', label: `5 ${timeLimitLabel}` },
				{ value: '10m', label: `10 ${timeLimitLabel}` },
				{ value: '30m', label: `30 ${timeLimitLabel}` },
			];
		})();

		if (requiresLicenseCheck && isLoading) {
			return (
				<Container height="fit" padding="large" style={{ userSelect: 'none' }}>
					<ds-spinner />
				</Container>
			);
		}

		return (
			<Container height="fit" gap="2rem" padding="large" style={{ userSelect: 'none' }}>
				{requiresLicenseCheck && !isLoading && !isLicensed && !error && isGlobalAdmin && (
					<Banner description={wscLicenseDisabledWarningLabel} severity="warning" />
				)}
				<BoxLayout
					title={t('wsc.section.header.title.general', 'General Settings')}
					description={t(
						'wsc.section.header.description.general',
						'Manage the activation of core features and applications.',
					)}
					disabled={requiresLicenseCheck && !isLicensed}
				>
					<SettingLayout
						description={t(
							'wsc.section.content.description.enableFeature',
							'Activate to allow messaging, group chats, video calls, and file sharing.',
						)}
					>
						<form.Field name="carbonioFeatureWscEnabled">
							{(field) => (
								<Switch
									value={field.state.value === 'TRUE'}
									onClick={() =>
										field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
									}
									label={t('wsc.section.content.toggle.enableFeature', 'Enable Chat')}
									iconColor="primary"
									disabled={requiresLicenseCheck && !isLicensed}
								/>
							)}
						</form.Field>
					</SettingLayout>
				</BoxLayout>
				<Container orientation="horizontal" height="fit" gap="4rem">
					<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
						<BoxLayout
							title={t('wsc.section.header.title.messaging', 'Messaging & Presence')}
							description={t(
								'wsc.section.header.description.messaging',
								'Manage the visibility of chats and user status.',
							)}
							disabled={disableWscSettings}
						>
							<SettingLayout
								description={t(
									'wsc.section.content.description.readReceipt',
									'Show senders when their messages have been read.',
								)}
							>
								<form.Field name="carbonioWscShowMessageReads">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.readReceipt',
												'Show read receipts',
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.presence',
									"Display users' online status or last seen time.",
								)}
							>
								<form.Field name="carbonioWscShowUsersPresence">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.presence',
												"Show users' online status",
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.deletionLimit',
									'Set the time limit for deleting a sent message.',
								)}
							>
								<form.Field name="carbonioWscMessageDeleteTimeLimit">
									{(field) => (
										<Select
											label={t(
												'wsc.section.content.select.deletionLimit',
												'Message deletion time limit',
											)}
											items={deleteMessageOptions}
											showCheckbox={false}
											selection={
												deleteMessageOptions.find((item) => item.value === field.state.value) ||
												deleteMessageOptions[0]
											}
											onChange={(value): void => {
												const newValue =
													typeof value === 'object' && value !== null && 'value' in value
														? (value as SelectItem).value
														: (value as string);
												field.handleChange(newValue);
											}}
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
								<Padding top="small" />
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.editLimit',
									'Define how long a message can be edited after sending.',
								)}
								descriptionGap
							>
								<form.Field name="carbonioWscMessageEditTimeLimit">
									{(field) => (
										<Select
											label={t(
												'wsc.section.content.select.editLimit',
												'Message editing time limit',
											)}
											items={editMessageOptions}
											showCheckbox={false}
											selection={
												editMessageOptions.find((item) => item.value === field.state.value) ||
												editMessageOptions[0]
											}
											onChange={(value): void => {
												const newValue =
													typeof value === 'object' && value !== null && 'value' in value
														? (value as SelectItem).value
														: (value as string);
												field.handleChange(newValue);
											}}
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
						</BoxLayout>
					</Container>
					<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
						<BoxLayout
							title={t('wsc.section.header.title.chats', 'Private and Group Chats')}
							description={t(
								'wsc.section.header.description.chats',
								'Manage Chats creation and Group settings.',
							)}
							disabled={disableWscSettings}
						>
							<SettingLayout
								description={t(
									'wsc.section.content.description.createPrivate',
									'Allow users to initiate one-on-one conversations.',
								)}
							>
								<form.Field name="carbonioWscPrivateChatCreation">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.createPrivate',
												'Users can start new private chats',
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.createGroup',
									'Allow users to create chats with multiple participants.',
								)}
							>
								<form.Field name="carbonioWscGroupChatCreation">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.createGroup',
												'Users can create group chats',
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.groupMembers',
									'Set the maximum number of users per group.',
								)}
								descriptionGap
							>
								<form.Field name="carbonioWscMaxGroupMembers">
									{(field) => (
										<Input
											type="number"
											label={t(
												'wsc.section.content.input.groupMembers',
												'Maximum number of group members',
											)}
											value={field.state.value}
											onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
												let inputValue = ev.target.value || '0';
												if (/^\d*$/.test(inputValue)) {
													inputValue = inputValue.replace(/^0+/, '') || '0';
													field.handleChange(inputValue);
												}
											}}
											backgroundColor="gray5"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.groupPicture',
									'Limit the file size for group profile pictures.',
								)}
								descriptionGap
							>
								<form.Field name="carbonioWscMaxRoomPictureSize">
									{(field) => (
										<Input
											type="number"
											label={t(
												'wsc.section.content.input.groupPicture',
												'Maximum group picture size in MB',
											)}
											value={field.state.value}
											onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
												let inputValue = ev.target.value || '0';
												if (/^\d*$/.test(inputValue)) {
													inputValue = inputValue.replace(/^0+/, '') || '0';
													field.handleChange(inputValue);
												}
											}}
											backgroundColor="gray5"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
						</BoxLayout>
					</Container>
				</Container>
				<Container orientation="horizontal" height="fit" gap="4rem">
					<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
						<BoxLayout
							title={t('wsc.section.header.title.videocall', 'Video calls')}
							description={t(
								'wsc.section.header.description.videocall',
								'Configure video calls, recording, and virtual backgrounds.',
							)}
							disabled={disableWscSettings}
						>
							<SettingLayout
								description={t(
									'wsc.section.content.description.enableVideoCall',
									'Activate video call functionality in the feature.',
								)}
							>
								<form.Field name="carbonioWscVideoCallEnabled">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.enableVideoCall',
												'Enable video calls',
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							{isAdvanced && (
								<SettingLayout
									description={t(
										'wsc.section.content.description.enableRecording',
										'Permit recording of audio and video calls.',
									)}
								>
									<form.Field name="carbonioWscRecordingEnabled">
										{(field) => (
											<Switch
												value={field.state.value === 'TRUE'}
												onClick={() =>
													field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
												}
												label={t(
													'wsc.section.content.toggle.enableRecording',
													'Allow call recording',
												)}
												iconColor="primary"
												disabled={disableWscSettings || videoCallEnabled === 'FALSE'}
											/>
										)}
									</form.Field>
								</SettingLayout>
							)}
							<SettingLayout
								description={t(
									'wsc.section.content.description.enableVirtualBackground',
									'Allow users to apply virtual backgrounds during video calls.',
								)}
							>
								<form.Field name="carbonioWscVirtualBackgroundEnabled">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.enableVirtualBackground',
												'Enable virtual background',
											)}
											iconColor="primary"
											disabled={disableWscSettings || videoCallEnabled === 'FALSE'}
										/>
									)}
								</form.Field>
							</SettingLayout>
						</BoxLayout>
					</Container>
					<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
						<BoxLayout
							title={t('wsc.section.header.title.attachments', 'Sharing & Attachments')}
							description={t(
								'wsc.section.header.description.attachments',
								'Manage file sharing and attachment limits.',
							)}
							disabled={disableWscSettings}
						>
							<SettingLayout
								description={t(
									'wsc.section.content.description.enableAttachments',
									'Enable the sending of files, images, and documents.',
								)}
							>
								<form.Field name="carbonioWscAttachmentUpload">
									{(field) => (
										<Switch
											value={field.state.value === 'TRUE'}
											onClick={() =>
												field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
											}
											label={t(
												'wsc.section.content.toggle.enableAttachments',
												'Users can upload attachments',
											)}
											iconColor="primary"
											disabled={disableWscSettings}
										/>
									)}
								</form.Field>
							</SettingLayout>
							<SettingLayout
								description={t(
									'wsc.section.content.description.attachmentSize',
									'Define the maximum size for shared files in chats.',
								)}
								descriptionGap
							>
								<form.Field name="carbonioWscMaxAttachmentSize">
									{(field) => (
										<Input
											type="number"
											label={t(
												'wsc.section.content.input.attachmentSize',
												'Maximum attachment size in MB',
											)}
											value={field.state.value}
											onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
												let inputValue = ev.target.value || '0';
												if (/^\d*$/.test(inputValue)) {
													inputValue = inputValue.replace(/^0+/, '') || '0';
													field.handleChange(inputValue);
												}
											}}
											backgroundColor="gray5"
											disabled={disableWscSettings || attachmentUploadEnabled === 'FALSE'}
										/>
									)}
								</form.Field>
							</SettingLayout>
						</BoxLayout>
					</Container>
				</Container>
			</Container>
		);
	},
});

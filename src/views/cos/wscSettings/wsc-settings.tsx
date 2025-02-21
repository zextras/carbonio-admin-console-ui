/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';

import { Container, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { AccountType } from '../../domain/manange/accounts/account-types/account-types';
import { BoxLayout, SettingLayout } from '../../page-layout';
import InheritedInput from '../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../utility/inherited-components/inherited-select';
import InheritedSwitch from '../../utility/inherited-components/inherited-switch';

export const WscSettings: FC<{
	featuresDetail: AccountType;
	setFeaturesDetail: Dispatch<SetStateAction<AccountType>>;
	cosDetail?: AccountType;
	accSpecificDetail?: AccountType;
	setEmptyValue?: CallableFunction;
	readonlyFeatures?: boolean;
}> = ({
	featuresDetail,
	setFeaturesDetail,
	cosDetail,
	accSpecificDetail,
	setEmptyValue,
	readonlyFeatures = false
}) => {
	const [t] = useTranslation();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const changeSwitchOption = useCallback(
		(key: keyof AccountType): void => {
			setFeaturesDetail((prev) => ({
				...prev,
				[key]: featuresDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[featuresDetail, setFeaturesDetail]
	);

	const changeSelectOption = useCallback(
		(key: keyof AccountType) =>
			(value: string): void => {
				setFeaturesDetail((prev) => ({
					...prev,
					[key]: value
				}));
			},
		[setFeaturesDetail]
	);

	const changeInputOption = useCallback(
		(key: keyof AccountType) =>
			(ev: any): void => {
				let inputValue = ev.target.value || '0';
				if (/^\d*$/.test(inputValue)) {
					inputValue = inputValue.replace(/^0+/, '') || '0';
					setFeaturesDetail((prev) => ({
						...prev,
						[key]: inputValue.toString()
					}));
				}
			},
		[setFeaturesDetail]
	);

	const disableWscSettings = useMemo(
		() => featuresDetail?.carbonioFeatureChatsEnabled === 'FALSE' || readonlyFeatures,
		[featuresDetail?.carbonioFeatureChatsEnabled, readonlyFeatures]
	);

	const durationOptions = useMemo(() => {
		const timeLimitLabel = t('wsc.section.content.select.timeLimit', 'minute time limit');
		return [
			{ value: '0m', label: t('wsc.section.content.select.never', 'Never') },
			{ value: '5m', label: `5 ${timeLimitLabel}` },
			{ value: '10m', label: `10 ${timeLimitLabel}` },
			{ value: '30m', label: `30 ${timeLimitLabel}` }
		];
	}, [t]);

	return (
		<Container height="fit" gap="2rem" padding="large" style={{ userSelect: 'none' }}>
			<BoxLayout
				title={t('wsc.section.header.title', 'General Settings')}
				description={t(
					'wsc.section.header.description',
					'Manage the activation of core features and applications.'
				)}
			>
				<SettingLayout
					description={t(
						'wsc.section.content.description.enableFeature',
						'Activate to allow messaging, group chats, video calls, and file sharing.'
					)}
				>
					<InheritedSwitch
						subValue={featuresDetail?.carbonioFeatureChatsEnabled}
						onChange={changeSwitchOption}
						label={t('wsc.section.content.toggle.enableFeature', 'Enable Workstream Collaboration')}
						iconColor="primary"
						inheritedValue={cosDetail?.carbonioFeatureChatsEnabled}
						fromSubValue={accSpecificDetail?.carbonioFeatureChatsEnabled}
						inputName={'carbonioFeatureChatsEnabled'}
						onChangeReset={(): void => setEmptyValue?.('carbonioFeatureChatsEnabled')}
					/>
				</SettingLayout>
			</BoxLayout>
			<Container orientation="horizontal" height="fit" gap="4rem">
				<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
					<BoxLayout
						title={t('wsc.section.header.title.messaging', 'Messaging & Presence')}
						description={t(
							'wsc.section.header.description.messaging',
							'Manage the visibility of chats and user status.'
						)}
					>
						<SettingLayout
							description={t(
								'wsc.section.content.description.readReceipt',
								'Show senders when their messages have been read.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscShowMessageReads}
								onChange={changeSwitchOption}
								label={t('wsc.section.content.toggle.readReceipt', 'Show read receipts')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscShowMessageReads}
								fromSubValue={accSpecificDetail?.carbonioWscShowMessageReads}
								inputName={'carbonioWscShowMessageReads'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscShowMessageReads')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.presence',
								"Display users' online status or last seen time."
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscShowUsersPresence}
								onChange={changeSwitchOption}
								label={t('wsc.section.content.toggle.presence', "Show users' online status")}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscShowUsersPresence}
								fromSubValue={accSpecificDetail?.carbonioWscShowUsersPresence}
								inputName={'carbonioWscShowUsersPresence'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscShowUsersPresence')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.deletionLimit',
								'Set the time limit for deleting a sent message.'
							)}
						>
							<InheritedSelect
								label={t('wsc.section.content.select.deletionLimit', 'Message deletion time limit')}
								items={durationOptions}
								subValue={featuresDetail?.carbonioWscMessageDeleteTimeLimit}
								inheritedValue={cosDetail?.carbonioWscMessageDeleteTimeLimit}
								fromSubValue={accSpecificDetail?.carbonioWscMessageDeleteTimeLimit}
								background="gray5"
								selectName="carbonioWscMessageDeleteTimeLimit"
								onChange={changeSelectOption('carbonioWscMessageDeleteTimeLimit')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMessageDeleteTimeLimit')}
								disabled={disableWscSettings}
							/>
							<Padding top="small" />
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.editLimit',
								'Define how long a message can be edited after sending.'
							)}
							descriptionGap
						>
							<InheritedSelect
								label={t('wsc.section.content.select.editLimit', 'Message editing time limit')}
								items={durationOptions}
								subValue={featuresDetail?.carbonioWscMessageEditTimeLimit}
								inheritedValue={cosDetail?.carbonioWscMessageEditTimeLimit}
								fromSubValue={accSpecificDetail?.carbonioWscMessageEditTimeLimit}
								background="gray5"
								selectName="carbonioWscMessageEditTimeLimit"
								onChange={changeSelectOption('carbonioWscMessageEditTimeLimit')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMessageEditTimeLimit')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
					</BoxLayout>
				</Container>
				<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
					<BoxLayout
						title={t('wsc.section.header.title.chats', 'Private and Group Chats')}
						description={t(
							'wsc.section.header.description.chats',
							'Manage Chats creation and Group settings.'
						)}
					>
						<SettingLayout
							description={t(
								'wsc.section.content.description.createPrivate',
								'Allow users to initiate one-on-one conversations.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscPrivateChatCreation}
								onChange={changeSwitchOption}
								label={t(
									'wsc.section.content.toggle.createPrivate',
									'Users can start new private chats'
								)}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscPrivateChatCreation}
								fromSubValue={accSpecificDetail?.carbonioWscPrivateChatCreation}
								inputName={'carbonioWscPrivateChatCreation'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscPrivateChatCreation')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.createGroup',
								'Allow users to create chats with multiple participants.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscGroupChatCreation}
								onChange={changeSwitchOption}
								label={t('wsc.section.content.toggle.createGroup', 'Users can create group chats')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscGroupChatCreation}
								fromSubValue={accSpecificDetail?.carbonioWscGroupChatCreation}
								inputName={'carbonioWscGroupChatCreation'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscGroupChatCreation')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.groupMembers',
								'Set the maximum number of users per group.'
							)}
							descriptionGap
						>
							<InheritedInput
								label={t(
									'wsc.section.content.input.groupMembers',
									'Maximum number of group members'
								)}
								subValue={featuresDetail?.carbonioWscMaxGroupMembers}
								inheritedValue={cosDetail?.carbonioWscMaxGroupMembers}
								fromSubValue={accSpecificDetail?.carbonioWscMaxGroupMembers}
								background="gray5"
								inputName="carbonioWscMaxGroupMembers"
								onChange={changeInputOption('carbonioWscMaxGroupMembers')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMaxGroupMembers')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.groupPicture',
								'Limit the file size for group profile pictures.'
							)}
							descriptionGap
						>
							<InheritedInput
								label={t(
									'wsc.section.content.input.groupPicture',
									'Maximum group picture size in Kb'
								)}
								subValue={featuresDetail?.carbonioWscMaxRoomPictureSize}
								inheritedValue={cosDetail?.carbonioWscMaxRoomPictureSize}
								fromSubValue={accSpecificDetail?.carbonioWscMaxRoomPictureSize}
								background="gray5"
								inputName="carbonioWscMaxRoomPictureSize"
								onChange={changeInputOption('carbonioWscMaxRoomPictureSize')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMaxRoomPictureSize')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
					</BoxLayout>
				</Container>
			</Container>
			<Container orientation="horizontal" height="fit" gap="4rem">
				<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
					<BoxLayout
						title={t('wsc.section.header.title.videocall', 'Calls & Video')}
						description={t(
							'wsc.section.header.description.videocall',
							'Configure video calls, recording, and virtual backgrounds.'
						)}
					>
						<SettingLayout
							description={t(
								'wsc.section.content.description.enableVideoCall',
								'Activate video call functionality in the feature.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscVideoCallEnabled}
								onChange={changeSwitchOption}
								label={t('wsc.section.content.toggle.enableVideoCall', 'Enable video calls')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscVideoCallEnabled}
								fromSubValue={accSpecificDetail?.carbonioWscVideoCallEnabled}
								inputName={'carbonioWscVideoCallEnabled'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscVideoCallEnabled')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						{isAdvanced && (
							<SettingLayout
								description={t(
									'wsc.section.content.description.enableRecording',
									'Permit recording of audio and video calls.'
								)}
							>
								<InheritedSwitch
									subValue={featuresDetail?.carbonioWscRecordingEnabled}
									onChange={changeSwitchOption}
									label={t('wsc.section.content.toggle.enableRecording', 'Allow call recording')}
									iconColor="primary"
									inheritedValue={cosDetail?.carbonioWscRecordingEnabled}
									fromSubValue={accSpecificDetail?.carbonioWscRecordingEnabled}
									inputName={'carbonioWscRecordingEnabled'}
									onChangeReset={(): void => setEmptyValue?.('carbonioWscRecordingEnabled')}
									disabled={
										disableWscSettings || featuresDetail?.carbonioWscVideoCallEnabled === 'FALSE'
									}
								/>
							</SettingLayout>
						)}
						<SettingLayout
							description={t(
								'wsc.section.content.description.enableVirtualBackground',
								'Allow users to apply virtual backgrounds during video calls.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscVirtualBackgroundEnabled}
								onChange={changeSwitchOption}
								label={t(
									'wsc.section.content.toggle.enableVirtualBackground',
									'Enable virtual background'
								)}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscVirtualBackgroundEnabled}
								fromSubValue={accSpecificDetail?.carbonioWscVirtualBackgroundEnabled}
								inputName={'carbonioWscVirtualBackgroundEnabled'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscVirtualBackgroundEnabled')}
								disabled={
									disableWscSettings || featuresDetail?.carbonioWscVideoCallEnabled === 'FALSE'
								}
							/>
						</SettingLayout>
					</BoxLayout>
				</Container>
				<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
					<BoxLayout
						title={t('wsc.section.header.title.attachments', 'Sharing & Attachments')}
						description={t(
							'wsc.section.header.description.attachments',
							'Manage file sharing and attachment limits.'
						)}
					>
						<SettingLayout
							description={t(
								'wsc.section.content.description.enableAttachments',
								'Enable the sending of files, images, and documents.'
							)}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscAttachmentUpload}
								onChange={changeSwitchOption}
								label={t(
									'wsc.section.content.toggle.enableAttachments',
									'Users can upload attachments'
								)}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscAttachmentUpload}
								fromSubValue={accSpecificDetail?.carbonioWscAttachmentUpload}
								inputName={'carbonioWscAttachmentUpload'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscAttachmentUpload')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t(
								'wsc.section.content.description.attachmentSize',
								'Define the maximum size for shared files in chats.'
							)}
							descriptionGap
						>
							<InheritedInput
								label={t(
									'wsc.section.content.input.attachmentSize',
									'Maximum attachment size in Mb'
								)}
								subValue={featuresDetail?.carbonioWscMaxAttachmentSize}
								inheritedValue={cosDetail?.carbonioWscMaxAttachmentSize}
								fromSubValue={accSpecificDetail?.carbonioWscMaxAttachmentSize}
								background="gray5"
								inputName="carbonioWscMaxAttachmentSize"
								onChange={changeInputOption('carbonioWscMaxAttachmentSize')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMaxAttachmentSize')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
					</BoxLayout>
				</Container>
			</Container>
		</Container>
	);
};

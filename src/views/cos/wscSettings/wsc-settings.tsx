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

	return (
		<Container height="fit" gap="2rem">
			<BoxLayout
				title={t('', 'General Settings')}
				description={t('', 'Manage the activation of core features and applications.')}
			>
				<SettingLayout
					description={t(
						'',
						'Activate to allow messaging, group chats, video calls, and file sharing.'
					)}
				>
					<InheritedSwitch
						subValue={featuresDetail?.carbonioFeatureChatsEnabled}
						onChange={changeSwitchOption}
						label={t('', 'Enable Workstream Collaboration')}
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
						title={t('', 'Messaging & Presence')}
						description={t('', 'Manage the visibility of chats and user status.')}
					>
						<SettingLayout description={t('', 'Show senders when their messages have been read.')}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscShowMessageReads}
								onChange={changeSwitchOption}
								label={t('', 'Show read receipts')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscShowMessageReads}
								fromSubValue={accSpecificDetail?.carbonioWscShowMessageReads}
								inputName={'carbonioWscShowMessageReads'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscShowMessageReads')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout description={t('', "Display users' online status or last seen time.")}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscShowUsersPresence}
								onChange={changeSwitchOption}
								label={t('', "Show users' online status")}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscShowUsersPresence}
								fromSubValue={accSpecificDetail?.carbonioWscShowUsersPresence}
								inputName={'carbonioWscShowUsersPresence'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscShowUsersPresence')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout description={t('', 'Set the time limit for deleting a sent message.')}>
							<InheritedSelect
								label={t('', 'Message deletion time limit')}
								items={[
									{ value: '0', label: t('', 'Never') },
									{ value: '5', label: t('', '5 minutes time limit') },
									{ value: '10', label: t('', '10 minutes time limit') },
									{ value: '30', label: t('', '30 minutes time limit') }
								]}
								subValue={featuresDetail?.carbonioWscMessageDeletionTimeLimit}
								inheritedValue={cosDetail?.carbonioWscMessageDeletionTimeLimit}
								fromSubValue={accSpecificDetail?.carbonioWscMessageDeletionTimeLimit}
								background="gray5"
								selectName="carbonioWscMessageDeletionTimeLimit"
								onChange={changeSelectOption('carbonioWscMessageDeletionTimeLimit')}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscMessageDeletionTimeLimit')}
								disabled={disableWscSettings}
							/>
							<Padding top="small" />
						</SettingLayout>
						<SettingLayout
							description={t('', 'Define how long a message can be edited after sending.')}
							descriptionGap
						>
							<InheritedSelect
								label={t('', 'Message editing time limit')}
								items={[
									{ value: '0', label: t('', 'Never') },
									{ value: '5', label: t('', '5 minutes time limit') },
									{ value: '10', label: t('', '10 minutes time limit') },
									{ value: '30', label: t('', '30 minutes time limit') }
								]}
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
						title={t('', 'Private and Group Chats')}
						description={t('', 'Manage Chats creation and Group settings.')}
					>
						<SettingLayout description={t('', 'Allow users to initiate one-on-one conversations.')}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscSingleCreation}
								onChange={changeSwitchOption}
								label={t('', 'Users can start new private chats')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscSingleCreation}
								fromSubValue={accSpecificDetail?.carbonioWscSingleCreation}
								inputName={'carbonioWscSingleCreation'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscSingleCreation')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t('', 'Allow users to create chats with multiple participants.')}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscGroupCreation}
								onChange={changeSwitchOption}
								label={t('', 'Users can create group chats')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscGroupCreation}
								fromSubValue={accSpecificDetail?.carbonioWscGroupCreation}
								inputName={'carbonioWscGroupCreation'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscGroupCreation')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t('', 'Set the maximum number of users per group.')}
							descriptionGap
						>
							<InheritedInput
								label={t('', 'Maximum number of group members')}
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
							description={t('', 'Limit the file size for group profile pictures.')}
							descriptionGap
						>
							<InheritedInput
								label={t('', 'Maximum group picture size in Kb')}
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
						title={t('', 'Calls & Video')}
						description={t('', 'Configure video calls, recording, and virtual backgrounds.')}
					>
						<SettingLayout description={t('', 'Activate video call functionality in the feature.')}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscVideoCall}
								onChange={changeSwitchOption}
								label={t('', 'Enable video calls')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscVideoCall}
								fromSubValue={accSpecificDetail?.carbonioWscVideoCall}
								inputName={'carbonioWscVideoCall'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscVideoCall')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						{isAdvanced && (
							<SettingLayout description={t('', 'Permit recording of audio and video calls.')}>
								<InheritedSwitch
									subValue={featuresDetail?.carbonioWscVideoCallRecord}
									onChange={changeSwitchOption}
									label={t('', 'Allow call recording')}
									iconColor="primary"
									inheritedValue={cosDetail?.carbonioWscVideoCallRecord}
									fromSubValue={accSpecificDetail?.carbonioWscVideoCallRecord}
									inputName={'carbonioWscVideoCallRecord'}
									onChangeReset={(): void => setEmptyValue?.('carbonioWscVideoCallRecord')}
									disabled={disableWscSettings || featuresDetail?.carbonioWscVideoCall === 'FALSE'}
								/>
							</SettingLayout>
						)}
						<SettingLayout
							description={t('', 'Allow users to apply virtual backgrounds during video calls.')}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscVirtualBackground}
								onChange={changeSwitchOption}
								label={t('', 'Enable virtual background')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscVirtualBackground}
								fromSubValue={accSpecificDetail?.carbonioWscVirtualBackground}
								inputName={'carbonioWscVirtualBackground'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscVirtualBackground')}
								disabled={disableWscSettings || featuresDetail?.carbonioWscVideoCall === 'FALSE'}
							/>
						</SettingLayout>
					</BoxLayout>
				</Container>
				<Container mainAlignment="flex-start" width="calc(50% - 2rem)">
					<BoxLayout
						title={t('', 'Sharing & Attachments')}
						description={t('', 'Manage file sharing and attachment limits.')}
					>
						<SettingLayout
							description={t('', 'Enable the sending of files, images, and documents.')}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioWscAttachmentUpload}
								onChange={changeSwitchOption}
								label={t('', 'Users can upload attachments')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioWscAttachmentUpload}
								fromSubValue={accSpecificDetail?.carbonioWscAttachmentUpload}
								inputName={'carbonioWscAttachmentUpload'}
								onChangeReset={(): void => setEmptyValue?.('carbonioWscAttachmentUpload')}
								disabled={disableWscSettings}
							/>
						</SettingLayout>
						<SettingLayout
							description={t('', 'Define the maximum size for shared files in chats.')}
							descriptionGap
						>
							<InheritedInput
								label={t('', 'Maximum attachment size in Mb')}
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

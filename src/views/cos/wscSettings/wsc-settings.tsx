/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { BoxLayout, SettingLayout } from '../../page-layout';
import InheritedSwitch from '../../utility/inherited-components/inherited-switch';

export const WscSettings: FC<{
	featuresDetail: Record<string, string>;
	setFeaturesDetail: CallableFunction;
	cosDetail?: Record<string, string>;
	accSpecificDetail?: Record<string, string>;
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
		(key: string): void => {
			setFeaturesDetail((prev: Record<string, string>) => ({
				...prev,
				[key]: featuresDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[featuresDetail, setFeaturesDetail]
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
			<Container orientation="horizontal" height="fit" gap="2rem">
				<Container mainAlignment="flex-start" width="calc(50% - 1rem)">
					<BoxLayout
						title={t('', 'Messaging & Presence')}
						description={t('', 'Manage the visibility of chats and user status.')}
					/>
				</Container>
				<Container mainAlignment="flex-start" width="calc(50% - 1rem)">
					<BoxLayout
						title={t('', 'Private and Group Chats')}
						description={t('', 'Manage Chats creation and Group settings.')}
					/>
				</Container>
			</Container>
			<Container orientation="horizontal" height="fit" gap="2rem">
				<Container mainAlignment="flex-start" width="calc(50% - 1rem)">
					<BoxLayout
						title={t('', 'Calls & Video')}
						description={t('', 'Configure video calls, recording, and virtual backgrounds.')}
					/>
				</Container>
				<Container mainAlignment="flex-start" width="calc(50% - 1rem)">
					<BoxLayout
						title={t('', 'Sharing & Attachments')}
						description={t('', 'Manage file sharing and attachment limits.')}
					/>
				</Container>
			</Container>
		</Container>
	);
};

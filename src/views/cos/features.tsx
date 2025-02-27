/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Container, Row, Text, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import InheritedSwitch from '../utility/inherited-components/inherited-switch';

export const Features: FC<{
	featuresDetail: Record<string, string>;
	setFeaturesDetail: CallableFunction;
	cosDetail?: Record<string, string>;
	accSpecificDetail?: Record<string, string>;
	setEmptyValue?: CallableFunction;
	readonlyFeatures?: boolean;
	cosLevelFeaures?: boolean;
}> = ({
	featuresDetail,
	setFeaturesDetail,
	cosDetail,
	accSpecificDetail,
	setEmptyValue,
	readonlyFeatures = false,
	cosLevelFeaures = false
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
		<Container
			mainAlignment="flex-start"
			width="100%"
			height="auto"
			orientation="vertical"
			padding={{ top: 'large' }}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
				width="100%"
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="50%"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.general_lbl', 'General')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureOptionsEnabled}
							onChange={changeSwitchOption}
							label={t('label.can_access_settings', 'Can access Settings')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureOptionsEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureOptionsEnabled}
							inputName={'zimbraFeatureOptionsEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureOptionsEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
				</Container>
				{cosLevelFeaures && (
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="50%"
						orientation="vertical"
						padding={{ bottom: 'large' }}
					>
						<Text size="extralarge" weight="bold">
							{t('label.two_factor_auth', 'Second Factor Authentication')}
						</Text>
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioFeatureOTPMgmtEnabled}
								onChange={changeSwitchOption}
								label={t('label.one_time_password_management', 'One Time Password management')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioFeatureOTPMgmtEnabled}
								fromSubValue={accSpecificDetail?.carbonioFeatureOTPMgmtEnabled}
								inputName={'carbonioFeatureOTPMgmtEnabled'}
								onChangeReset={(): void => setEmptyValue?.('carbonioFeatureOTPMgmtEnabled')}
								disabled={readonlyFeatures}
							/>
						</Row>
					</Container>
				)}
			</Row>
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
				width="100%"
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="50%"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.mail', 'Mail')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.carbonioFeatureMailsAppEnabled}
							onChange={changeSwitchOption}
							// eslint-disable-next-line sonarjs/no-duplicate-string
							label={t('label.mobile_app', 'Mobile App')}
							iconColor="primary"
							inheritedValue={cosDetail?.carbonioFeatureMailsAppEnabled}
							fromSubValue={accSpecificDetail?.carbonioFeatureMailsAppEnabled}
							inputName={'carbonioFeatureMailsAppEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('carbonioFeatureMailsAppEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureSignaturesEnabled}
							onChange={changeSwitchOption}
							label={t('label.mail_signatures', 'Mail Signatures')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureSignaturesEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureSignaturesEnabled}
							inputName={'zimbraFeatureSignaturesEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureSignaturesEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
							onChange={changeSwitchOption}
							label={t('label.out_of_the_office_reply', 'Out of Office Reply')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
							inputName={'zimbraFeatureOutOfOfficeReplyEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureOutOfOfficeReplyEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.zimbraFeatureMobileSyncEnabled}
								onChange={changeSwitchOption}
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								inheritedValue={cosDetail?.zimbraFeatureMobileSyncEnabled}
								fromSubValue={accSpecificDetail?.zimbraFeatureMobileSyncEnabled}
								inputName={'zimbraFeatureMobileSyncEnabled'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('zimbraFeatureMobileSyncEnabled')
								}
								disabled={readonlyFeatures}
							/>
						</Row>
					)}
				</Container>
				{isAdvanced && (
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="50%"
						orientation="vertical"
						padding={{ bottom: 'large' }}
					>
						<Text size="extralarge" weight="bold">
							{t('label.chats', 'Chats')}
						</Text>
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioFeatureTeamEnabled}
								onChange={changeSwitchOption}
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('label.web_feature', 'Web Feature')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioFeatureTeamEnabled}
								fromSubValue={accSpecificDetail?.carbonioFeatureTeamEnabled}
								inputName={'carbonioFeatureTeamEnabled'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('carbonioFeatureTeamEnabled')
								}
								disabled={readonlyFeatures}
							/>
						</Row>
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioFeatureChatsAppEnabled}
								onChange={changeSwitchOption}
								label={t('label.mobile_app', 'Mobile App')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioFeatureChatsAppEnabled}
								fromSubValue={accSpecificDetail?.carbonioFeatureChatsAppEnabled}
								inputName={'carbonioFeatureChatsAppEnabled'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('carbonioFeatureChatsAppEnabled')
								}
								disabled={featuresDetail.carbonioFeatureTeamEnabled !== 'TRUE' || readonlyFeatures}
							/>
						</Row>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<InheritedSwitch
								subValue={featuresDetail?.carbonioFeatureWscEnabled}
								onChange={changeSwitchOption}
								label={t('label.enable_wsc', 'Enable WSC')}
								iconColor="primary"
								inheritedValue={cosDetail?.carbonioFeatureWscEnabled}
								fromSubValue={accSpecificDetail?.carbonioFeatureWscEnabled}
								inputName={'carbonioFeatureWscEnabled'}
								onChangeReset={(): void => setEmptyValue?.('carbonioFeatureWscEnabled')}
							/>
						</Row>
					</Container>
				)}
				<Divider />
			</Row>
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
				width="100%"
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="50%"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.contacts', 'Contacts')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureContactsEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureContactsEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureContactsEnabled}
							inputName={'zimbraFeatureContactsEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureContactsEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.mobileContactFeatureSync}
								onChange={changeSwitchOption}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								inheritedValue={cosDetail?.mobileContactFeatureSync}
								fromSubValue={accSpecificDetail?.mobileContactFeatureSync}
								inputName={'mobileContactFeatureSync'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('mobileContactFeatureSync')
								}
								disabled={
									featuresDetail.zimbraFeatureContactsEnabled !== 'TRUE' || readonlyFeatures
								}
							/>
						</Row>
					)}
				</Container>
				<Container
					mainAlignment="flex-start"
					width="50%"
					crossAlignment="flex-start"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.calendar', 'Calendar')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureCalendarEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureCalendarEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureCalendarEnabled}
							inputName={'zimbraFeatureCalendarEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureCalendarEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<InheritedSwitch
								subValue={featuresDetail?.mobileCalendarFeatureSync}
								onChange={changeSwitchOption}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								inheritedValue={cosDetail?.mobileCalendarFeatureSync}
								fromSubValue={accSpecificDetail?.mobileCalendarFeatureSync}
								inputName={'mobileCalendarFeatureSync'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('mobileCalendarFeatureSync')
								}
								disabled={
									featuresDetail.zimbraFeatureCalendarEnabled !== 'TRUE' || readonlyFeatures
								}
							/>
						</Row>
					)}
				</Container>
				<Divider />
			</Row>
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
				width="100%"
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="50%"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.files', 'Files')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.carbonioFeatureFilesEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							inheritedValue={cosDetail?.carbonioFeatureFilesEnabled}
							fromSubValue={accSpecificDetail?.carbonioFeatureFilesEnabled}
							inputName={'carbonioFeatureFilesEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('carbonioFeatureFilesEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.carbonioFeatureFilesAppEnabled}
							onChange={changeSwitchOption}
							label={t('label.mobile_app', 'Mobile App')}
							iconColor="primary"
							inheritedValue={cosDetail?.carbonioFeatureFilesAppEnabled}
							fromSubValue={accSpecificDetail?.carbonioFeatureFilesAppEnabled}
							inputName={'carbonioFeatureFilesAppEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('carbonioFeatureFilesAppEnabled')
							}
							disabled={featuresDetail.carbonioFeatureFilesEnabled !== 'TRUE' || readonlyFeatures}
						/>
					</Row>
				</Container>
				<Container
					mainAlignment="flex-start"
					width="50%"
					crossAlignment="flex-start"
					orientation="vertical"
					padding={{ bottom: 'large' }}
				>
					<Text size="extralarge" weight="bold">
						{t('label.tasks', 'Tasks')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							subValue={featuresDetail?.zimbraFeatureTasksEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							inheritedValue={cosDetail?.zimbraFeatureTasksEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureTasksEnabled}
							inputName={'zimbraFeatureTasksEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureTasksEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
				</Container>
				{isAdvanced && <Divider />}
			</Row>
		</Container>
	);
};

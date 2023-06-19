/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';
import { Container, Row, Text, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import InheritedSwitch from '../domain/manange/accounts/edit-account/inherited-components/inherited-switch';

export const Features: FC<{
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
						{t('label.mail', 'Mail')}
					</Text>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							accountValue={featuresDetail?.carbonioFeatureMailsAppEnabled}
							onChange={changeSwitchOption}
							label={t('label.mobile_app', 'Mobile App')}
							iconColor="primary"
							cosValue={cosDetail?.carbonioFeatureMailsAppEnabled}
							fromAccount={accSpecificDetail?.carbonioFeatureMailsAppEnabled}
							inputName={'carbonioFeatureMailsAppEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('carbonioFeatureMailsAppEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							accountValue={featuresDetail?.zimbraFeatureSignaturesEnabled}
							onChange={changeSwitchOption}
							label={t('label.mail_signatures', 'Mail Signatures')}
							iconColor="primary"
							cosValue={cosDetail?.zimbraFeatureSignaturesEnabled}
							fromAccount={accSpecificDetail?.zimbraFeatureSignaturesEnabled}
							inputName={'zimbraFeatureSignaturesEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('zimbraFeatureSignaturesEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							accountValue={featuresDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
							onChange={changeSwitchOption}
							label={t('label.out_of_the_office_reply', 'Out of Office Reply')}
							iconColor="primary"
							cosValue={cosDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
							fromAccount={accSpecificDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
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
								accountValue={featuresDetail?.zimbraFeatureMobileSyncEnabled}
								onChange={changeSwitchOption}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								cosValue={cosDetail?.zimbraFeatureMobileSyncEnabled}
								fromAccount={accSpecificDetail?.zimbraFeatureMobileSyncEnabled}
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
								accountValue={featuresDetail?.carbonioFeatureTeamEnabled}
								onChange={changeSwitchOption}
								label={t('label.web_feature', 'Web Feature')}
								iconColor="primary"
								cosValue={cosDetail?.carbonioFeatureTeamEnabled}
								fromAccount={accSpecificDetail?.carbonioFeatureTeamEnabled}
								inputName={'carbonioFeatureTeamEnabled'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('carbonioFeatureTeamEnabled')
								}
								disabled={readonlyFeatures}
							/>
						</Row>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<InheritedSwitch
								accountValue={featuresDetail?.carbonioFeatureChatsAppEnabled}
								onChange={changeSwitchOption}
								label={t('label.mobile_app', 'Mobile App')}
								iconColor="primary"
								cosValue={cosDetail?.carbonioFeatureChatsAppEnabled}
								fromAccount={accSpecificDetail?.carbonioFeatureChatsAppEnabled}
								inputName={'carbonioFeatureChatsAppEnabled'}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue('carbonioFeatureChatsAppEnabled')
								}
								disabled={featuresDetail.carbonioFeatureTeamEnabled !== 'TRUE' || readonlyFeatures}
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
							accountValue={featuresDetail?.zimbraFeatureContactsEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							cosValue={cosDetail?.zimbraFeatureContactsEnabled}
							fromAccount={accSpecificDetail?.zimbraFeatureContactsEnabled}
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
								accountValue={featuresDetail?.mobileContactFeatureSync}
								onChange={changeSwitchOption}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								cosValue={cosDetail?.mobileContactFeatureSync}
								fromAccount={accSpecificDetail?.mobileContactFeatureSync}
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
							accountValue={featuresDetail?.zimbraFeatureCalendarEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							cosValue={cosDetail?.zimbraFeatureCalendarEnabled}
							fromAccount={accSpecificDetail?.zimbraFeatureCalendarEnabled}
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
								accountValue={featuresDetail?.mobileCalendarFeatureSync}
								onChange={changeSwitchOption}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								iconColor="primary"
								cosValue={cosDetail?.mobileCalendarFeatureSync}
								fromAccount={accSpecificDetail?.mobileCalendarFeatureSync}
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
							accountValue={featuresDetail?.carbonioFeatureFilesEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							cosValue={cosDetail?.carbonioFeatureFilesEnabled}
							fromAccount={accSpecificDetail?.carbonioFeatureFilesEnabled}
							inputName={'carbonioFeatureFilesEnabled'}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue('carbonioFeatureFilesEnabled')
							}
							disabled={readonlyFeatures}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<InheritedSwitch
							accountValue={featuresDetail?.carbonioFeatureFilesAppEnabled}
							onChange={changeSwitchOption}
							label={t('label.mobile_app', 'Mobile App')}
							iconColor="primary"
							cosValue={cosDetail?.carbonioFeatureFilesAppEnabled}
							fromAccount={accSpecificDetail?.carbonioFeatureFilesAppEnabled}
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
							accountValue={featuresDetail?.zimbraFeatureTasksEnabled}
							onChange={changeSwitchOption}
							label={t('label.web_feature', 'Web Feature')}
							iconColor="primary"
							cosValue={cosDetail?.zimbraFeatureTasksEnabled}
							fromAccount={accSpecificDetail?.zimbraFeatureTasksEnabled}
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

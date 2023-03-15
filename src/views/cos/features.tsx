/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';
import { Container, Row, Text, Divider, Switch } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';

export const Features: FC<{
	featuresDetail: Record<string, string>;
	setFeaturesDetail: CallableFunction;
}> = ({ featuresDetail, setFeaturesDetail }) => {
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
						<Switch
							value={featuresDetail.carbonioFeatureMailsAppEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('carbonioFeatureMailsAppEnabled')}
							label={t('label.mobile_app', 'Mobile App')}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Switch
							value={featuresDetail.zimbraFeatureSignaturesEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraFeatureSignaturesEnabled')}
							label={t('label.mail_signatures', 'Mail Signatures')}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Switch
							value={featuresDetail.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraFeatureOutOfOfficeReplyEnabled')}
							label={t('label.out_of_the_office_reply', 'Out of Office Reply')}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<Switch
								value={featuresDetail.zimbraFeatureMobileSyncEnabled === 'TRUE'}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onClick={() => changeSwitchOption('zimbraFeatureMobileSyncEnabled')}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
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
							<Switch
								value={featuresDetail.carbonioFeatureChatsEnabled === 'TRUE'}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onClick={() => changeSwitchOption('carbonioFeatureChatsEnabled')}
								label={t('label.web_feature', 'Web Feature')}
							/>
						</Row>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<Switch
								value={featuresDetail.carbonioFeatureChatsAppEnabled === 'TRUE'}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onClick={() => changeSwitchOption('carbonioFeatureChatsAppEnabled')}
								label={t('label.mobile_app', 'Mobile App')}
								disabled={featuresDetail.carbonioFeatureChatsEnabled !== 'TRUE'}
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
						<Switch
							value={featuresDetail.zimbraFeatureContactsEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraFeatureContactsEnabled')}
							label={t('label.web_feature', 'Web Feature')}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<Switch
								value={featuresDetail.mobileContactFeatureSync === 'TRUE'}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onClick={() => changeSwitchOption('mobileContactFeatureSync')}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								disabled={featuresDetail.zimbraFeatureContactsEnabled !== 'TRUE'}
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
						<Switch
							value={featuresDetail.zimbraFeatureCalendarEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraFeatureCalendarEnabled')}
							label={t('label.web_feature', 'Web Feature')}
						/>
					</Row>
					{isAdvanced && (
						<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
							<Switch
								value={featuresDetail.mobileCalendarFeatureSync === 'TRUE'}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onClick={() => changeSwitchOption('mobileCalendarFeatureSync')}
								label={t('cos.activesync_remote_access', 'ActiveSync remote access')}
								disabled={featuresDetail.zimbraFeatureCalendarEnabled !== 'TRUE'}
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
						<Switch
							value={featuresDetail.carbonioFeatureFilesEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('carbonioFeatureFilesEnabled')}
							label={t('label.web_feature', 'Web Feature')}
						/>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Switch
							value={featuresDetail.carbonioFeatureFilesAppEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('carbonioFeatureFilesAppEnabled')}
							label={t('label.mobile_app', 'Mobile App')}
							disabled={featuresDetail.carbonioFeatureFilesEnabled !== 'TRUE'}
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
						<Switch
							value={featuresDetail.zimbraFeatureTasksEnabled === 'TRUE'}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraFeatureTasksEnabled')}
							label={t('label.web_feature', 'Web Feature')}
						/>
					</Row>
				</Container>
				{isAdvanced && <Divider />}
			</Row>
		</Container>
	);
};

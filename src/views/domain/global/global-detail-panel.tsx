/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Divider,
	Input,
	ChipInput,
	Padding,
	Button,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { filter, isEqual, map } from 'lodash';
import ListRow from '../../list/list-row';
import { isValidEmail } from '../../utility/utils';
import { Attribute, CreateSnackbarType } from '../../../../types';
import { modifyConfig } from '../../../services/modify-config';
import { getAllConfig } from '../../../services/get-all-config';
import OverlayDivision from '../../components/overlayDivision';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 70.35rem;
	top: 6.5rem;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const RelativeContainer = styled(Container)`
	position: relative;
`;

const GlobalDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const [carbonioNotificationData, setCarbonioNotificationData] = useState<any>({});
	const [initCarbonioNotificationData, setinitCarbonioNotificationData] = useState<{
		[key: string]: string | { label: string }[];
	}>({});
	const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (
			Object.entries(carbonioNotificationData).length !== 0 &&
			carbonioNotificationData.carbonioNotificationFrom !== ('' || undefined) &&
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
	};

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
			setinitCarbonioNotificationData(obj);
		});
	};

	const handleOnSave = (): void => {
		if (
			isValidEmail(carbonioNotificationData.carbonioNotificationFrom ?? '') ||
			carbonioNotificationData.carbonioNotificationFrom === ''
		) {
			setIsLoading(true);
			setHasCarbonioNotificationFromError(false);
			const attributes: Attribute[] &
				{
					n: string;
					_content: string[];
				}[] = [];
			attributes.push({
				n: 'carbonioNotificationFrom',
				_content: carbonioNotificationData.carbonioNotificationFrom
			});
			carbonioNotificationData.carbonioNotificationRecipients.map(
				// eslint-disable-next-line array-callback-return
				(item: { label: string }): void => {
					attributes.push({
						n: 'carbonioNotificationRecipients',
						_content: item?.label
					});
				}
			);
			modifyConfig(attributes)
				.then(() => {
					getAllConfigData();
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setIsLoading(false);
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setIsLoading(false);
				});
		} else {
			setHasCarbonioNotificationFromError(true);
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
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
				<Container orientation="vertical" mainAlignment="space-around" height="1.9rem">
					<Row orientation="horizontal" width="100%">
						<Row mainAlignment="flex-start" width="50%" crossAlignment="center">
							<Text size="extralarge" weight="bold">
								{t('buckets.global', 'Global')}
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
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={(emails: { label: string }[]): void => {
								const data: { label: string }[] = [];
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
			</Container>
		</RelativeContainer>
	);
};

export default GlobalDetailPanel;

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
	Padding,
	Text,
	Divider,
	Switch,
	Button,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../list/list-row';
import { modifyConfig } from '../../services/modify-config';
import {
	CARBONIO_ALLOW_FEEDBACK,
	CARBONIO_SEND_ANALYTICS,
	CARBONIO_SEND_FULL_ERROR_STACK,
	FALSE,
	TRUE
} from '../../constants';
import { useConfigStore } from '../../store/config/store';

const PrivacyView: FC = () => {
	const [t] = useTranslation();
	const [carbonioAllowFeedback, setCarbonioAllowFeedback] = useState<boolean>(false);
	const [carbonioSendAnalytics, setCarbonioSendAnalytics] = useState<boolean>(false);
	const [carbonioSendFullErrorStack, setCarbonioSendFullErrorStack] = useState<boolean>(false);
	const config = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [lastState, setLastState]: any = useState({
		CARBONIO_SEND_ANALYTICS: false,
		CARBONIO_SEND_FULL_ERROR_STACK: false,
		CARBONIO_ALLOW_FEEDBACK: false
	});

	useEffect(() => {
		if (config && config.length > 0) {
			const analytics = config.find((item: any) => item?.n === CARBONIO_SEND_ANALYTICS);
			if (analytics) {
				setCarbonioSendAnalytics(analytics?._content === 'TRUE');
				setLastState((prev: any) => ({
					...prev,
					CARBONIO_SEND_ANALYTICS: analytics?._content === 'TRUE'
				}));
			}
			const errorStack = config.find((item: any) => item?.n === CARBONIO_SEND_FULL_ERROR_STACK);
			if (errorStack) {
				setCarbonioSendFullErrorStack(errorStack?._content === 'TRUE');
				setLastState((prev: any) => ({
					...prev,
					CARBONIO_SEND_FULL_ERROR_STACK: errorStack?._content === 'TRUE'
				}));
			}

			const feedback = config.find((item: any) => item?.n === CARBONIO_ALLOW_FEEDBACK);
			if (feedback) {
				setCarbonioAllowFeedback(feedback?._content === 'TRUE');
				setLastState((prev: any) => ({
					...prev,
					CARBONIO_ALLOW_FEEDBACK: feedback?._content === 'TRUE'
				}));
			}
		}
	}, [config]);

	const isChangeItem = (key: string, value: boolean): void => {
		setIsDirty(true);
		if (key === CARBONIO_ALLOW_FEEDBACK) {
			setCarbonioAllowFeedback(value);
		}
		if (key === CARBONIO_SEND_ANALYTICS) {
			setCarbonioSendAnalytics(value);
		}
		if (key === CARBONIO_SEND_FULL_ERROR_STACK) {
			setCarbonioSendFullErrorStack(value);
		}
	};

	const onCancel = useCallback(() => {
		setCarbonioAllowFeedback(lastState.CARBONIO_ALLOW_FEEDBACK);
		setCarbonioSendAnalytics(lastState.CARBONIO_SEND_ANALYTICS);
		setCarbonioSendFullErrorStack(lastState.CARBONIO_SEND_FULL_ERROR_STACK);
		setIsDirty(false);
	}, [lastState]);

	const callAllRequest = useCallback(
		(req) => {
			Promise.all(req).then((response) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				updateConfig(CARBONIO_SEND_ANALYTICS, carbonioSendAnalytics ? TRUE : FALSE);
				updateConfig(CARBONIO_ALLOW_FEEDBACK, carbonioAllowFeedback ? TRUE : FALSE);
				updateConfig(CARBONIO_SEND_FULL_ERROR_STACK, carbonioSendFullErrorStack ? TRUE : FALSE);
				setLastState((prev: any) => ({
					...prev,
					CARBONIO_SEND_FULL_ERROR_STACK: carbonioSendFullErrorStack,
					CARBONIO_SEND_ANALYTICS: carbonioSendAnalytics,
					CARBONIO_ALLOW_FEEDBACK: carbonioAllowFeedback
				}));
				setIsDirty(false);
			});
		},
		[
			t,
			createSnackbar,
			carbonioSendFullErrorStack,
			carbonioSendAnalytics,
			carbonioAllowFeedback,
			updateConfig
		]
	);

	const onSave = useCallback(() => {
		let attributes: any[] = [];
		const allRequest: any[] = [];
		attributes.push({
			n: CARBONIO_SEND_ANALYTICS,
			_content: carbonioSendAnalytics ? TRUE : FALSE
		});
		allRequest.push(modifyConfig(attributes));
		attributes = [];
		attributes.push({
			n: CARBONIO_ALLOW_FEEDBACK,
			_content: carbonioAllowFeedback ? TRUE : FALSE
		});
		allRequest.push(modifyConfig(attributes));

		attributes = [];
		attributes.push({
			n: CARBONIO_SEND_FULL_ERROR_STACK,
			_content: carbonioSendFullErrorStack ? TRUE : FALSE
		});
		allRequest.push(modifyConfig(attributes));
		callAllRequest(allRequest);
	}, [carbonioSendAnalytics, carbonioAllowFeedback, carbonioSendFullErrorStack, callAllRequest]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.privacy', 'Privacy')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="large">
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
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 200px)"
			>
				<Container height="fit" background="gray6" padding={{ left: 'small', right: 'small' }}>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioSendFullErrorStack}
								label={t(
									'privacy.send_full_error_data_to_zextras',
									'Send full error data to Zextras'
								)}
								onClick={(): void => {
									isChangeItem(CARBONIO_SEND_FULL_ERROR_STACK, !carbonioSendFullErrorStack);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.full_error_sub_1',
										"We all make mistakes but it's how you deal with them that that changes everything! We want to learn from them so let us know how we can fix them."
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioSendAnalytics}
								label={t('privacy.allow_data_analytics', 'Allow data analytics')}
								onClick={(): void => {
									isChangeItem(CARBONIO_SEND_ANALYTICS, !carbonioSendAnalytics);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.analytics_sub_1',
										'Your data is safe. All information we gather is and will stay anonymous. It will be used by our team to understand how can we improve Carbonio.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioAllowFeedback}
								label={t('privacy.allow_live_survey_feedbacks', 'Allow live survey feedbacks')}
								onClick={(): void => {
									isChangeItem(CARBONIO_ALLOW_FEEDBACK, !carbonioAllowFeedback);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.survey_feedback_sub_1',
										'We promise they will be fast, easy and very useful to understand  how are we doing.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
				</Container>
			</Container>
		</Container>
	);
};

export default PrivacyView;

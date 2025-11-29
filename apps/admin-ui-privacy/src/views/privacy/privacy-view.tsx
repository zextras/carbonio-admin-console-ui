/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch, useAppConfigStore, useCurrentUserRights } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Padding,
	Text,
	Divider,
	Switch,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	CARBONIO_ALLOW_FEEDBACK,
	CARBONIO_SEND_ANALYTICS,
	CARBONIO_SEND_FULL_ERROR_STACK,
	FALSE,
	TRUE,
	CONFIG
} from '../../constants';
import ListRow from '../list/list-row';

const PrivacyView: FC = () => {
	const [t] = useTranslation();
	const { config } = useAppConfigStore((state) => state);
	const allowFeedbackInitialValue = !!(
		config.find((item) => item?.n === CARBONIO_ALLOW_FEEDBACK)?._content === TRUE
	);
	const [allowFeedback, setAllowFeedback] = useState(allowFeedbackInitialValue);
	const sendAnalyticsInitialValue = !!(
		config.find((item) => item?.n === CARBONIO_SEND_ANALYTICS)?._content === TRUE
	);
	const [sendAnalytics, setSendAnalytics] = useState(sendAnalyticsInitialValue);
	const sendErrorInitialValue = !!(
		config.find((item) => item?.n === CARBONIO_SEND_FULL_ERROR_STACK)?.content === TRUE
	);
	const [sendFullError, setSendFullError] = useState(sendErrorInitialValue);

	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();

	const { data: rights } = useCurrentUserRights();
	const allowSetPrivacy = useMemo(() => {
		const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const isChangeItem = (key: string, value: boolean): void => {
		setIsDirty(true);
		if (key === CARBONIO_ALLOW_FEEDBACK) {
			setAllowFeedback(value);
		}
		if (key === CARBONIO_SEND_ANALYTICS) {
			setSendAnalytics(value);
		}
		if (key === CARBONIO_SEND_FULL_ERROR_STACK) {
			setSendFullError(value);
		}
	};

	const onCancel = useCallback(() => {
		setAllowFeedback(allowFeedbackInitialValue);
		setSendAnalytics(sendAnalyticsInitialValue);
		setSendFullError(sendErrorInitialValue);
		setIsDirty(false);
	}, [allowFeedbackInitialValue, sendAnalyticsInitialValue, sendErrorInitialValue]);

	const onSave = useCallback(async () => {
		const response = await soapFetch('Batch', {
			ModifyConfigRequest: [
				{ n: CARBONIO_ALLOW_FEEDBACK, _content: allowFeedback ? TRUE : FALSE },
				{
					n: CARBONIO_SEND_FULL_ERROR_STACK,
					_content: sendFullError ? TRUE : FALSE
				},
				{
					n: CARBONIO_SEND_ANALYTICS,
					_content: sendAnalytics ? TRUE : FALSE
				}
			],
			_jsns: 'urn:zimbra'
		});
		if (response)
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: t('label.change_save_success_msg', 'The change has been saved successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		setIsDirty(false);
	}, [allowFeedback, sendFullError, sendAnalytics, createSnackbar, t]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
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
				padding={{ top: 'extralarge' }}
			>
				<Container height="fit" background="gray6" padding={{ left: 'small', right: 'small' }}>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={sendFullError}
								label={t('privacy.send_full_error_data', 'Send full error data')}
								onClick={(): void => {
									isChangeItem(CARBONIO_SEND_FULL_ERROR_STACK, !sendFullError);
								}}
								iconColor="primary"
								disabled={!allowSetPrivacy}
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
								value={sendAnalytics}
								label={t('privacy.allow_data_analytics', 'Allow data analytics')}
								onClick={(): void => {
									isChangeItem(CARBONIO_SEND_ANALYTICS, !sendAnalytics);
								}}
								iconColor="primary"
								disabled={!allowSetPrivacy}
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
								value={allowFeedback}
								label={t('privacy.allow_live_survey_feedbacks', 'Allow live survey feedbacks')}
								onClick={(): void => {
									isChangeItem(CARBONIO_ALLOW_FEEDBACK, !allowFeedback);
								}}
								iconColor="primary"
								disabled={!allowSetPrivacy}
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

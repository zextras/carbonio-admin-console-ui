/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { soapFetch, useAllConfig, useCurrentUserRights } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Padding,
	Text,
	Divider,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { FC, useCallback, useMemo } from 'react';
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

import { FormSwitch } from './parts/form-switch';

const PrivacyView: FC = () => {
	const [t] = useTranslation();
	const { data: config = [] } = useAllConfig();
	const createSnackbar = useSnackbar();

	const { data: rights } = useCurrentUserRights();
	const allowSetPrivacy = useMemo(() => {
		const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const allowFeedbackInitialValue = !!(
		config.find((item: { n: string }) => item?.n === CARBONIO_ALLOW_FEEDBACK)?._content === TRUE
	);
	const sendAnalyticsInitialValue = !!(
		config.find((item: { n: string }) => item?.n === CARBONIO_SEND_ANALYTICS)?._content === TRUE
	);
	const sendErrorInitialValue = !!(
		config.find((item: { n: string }) => item?.n === CARBONIO_SEND_FULL_ERROR_STACK)?._content ===
		TRUE
	);

	const form = useForm({
		defaultValues: {
			allowFeedback: allowFeedbackInitialValue,
			sendAnalytics: sendAnalyticsInitialValue,
			sendFullError: sendErrorInitialValue
		},
		onSubmit: async ({ value, formApi }) => {
			const response = await soapFetch('Batch', {
				ModifyConfigRequest: [
					{ n: CARBONIO_ALLOW_FEEDBACK, _content: value.allowFeedback ? TRUE : FALSE },
					{
						n: CARBONIO_SEND_FULL_ERROR_STACK,
						_content: value.sendFullError ? TRUE : FALSE
					},
					{
						n: CARBONIO_SEND_ANALYTICS,
						_content: value.sendAnalytics ? TRUE : FALSE
					}
				],
				_jsns: 'urn:zimbra'
			});
			if (response) {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				// Reset form dirty state after successful save
				formApi.reset(value);
			}
		}
	});

	const onCancel = useCallback(() => {
		form.reset();
	}, [form]);

	const onSave = useCallback(() => {
		form.handleSubmit();
	}, [form]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<form.Subscribe selector={(state) => state.isDirty}>
				{(isDirty) => (
					<>
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
										{isDirty && (
											<>
												<Padding right="large">
													<Button
														label={t('label.cancel', 'Cancel')}
														color="secondary"
														onClick={onCancel}
													/>
												</Padding>
												<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
											</>
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
							<Container
								height="fit"
								background="gray6"
								padding={{ left: 'small', right: 'small' }}
							>
								<form.Field name="sendFullError">
									{(field) => (
										<FormSwitch
											fieldValue={field.state.value}
											allowSetPrivacy={allowSetPrivacy}
											onClick={(): void => {
												field.handleChange(!field.state.value);
											}}
										/>
									)}
								</form.Field>
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
								<form.Field name="sendAnalytics">
									{(field) => (
										<FormSwitch
											fieldValue={field.state.value}
											allowSetPrivacy={allowSetPrivacy}
											onClick={(): void => {
												field.handleChange(!field.state.value);
											}}
										/>
									)}
								</form.Field>
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
								<form.Field name="allowFeedback">
									{(field) => (
										<FormSwitch
											fieldValue={field.state.value}
											allowSetPrivacy={allowSetPrivacy}
											onClick={(): void => {
												field.handleChange(!field.state.value);
											}}
										/>
									)}
								</form.Field>
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
					</>
				)}
			</form.Subscribe>
		</Container>
	);
};

export default PrivacyView;

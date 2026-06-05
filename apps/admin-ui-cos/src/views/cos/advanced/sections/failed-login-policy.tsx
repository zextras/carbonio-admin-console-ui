/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Row, Select, Switch } from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../../../types/general';
import { getFieldErrorProps } from '../fields/field-error';
import { CosValidatedInput } from '../fields/validated-input';
import { CosFormApi } from '../types';

type FailedLoginPolicyProps = {
	form: CosFormApi;
	readonlyCOS: boolean;
	timeItems: TimeItems;
};

const COSFailedLoginPolicy = ({ form, readonlyCOS, timeItems }: FailedLoginPolicyProps) => {
	const [t] = useTranslation();
	const isLockoutEnabled = useSelector(
		form.store,
		(s) => s.values.zimbraPasswordLockoutEnabled === 'TRUE',
	);
	const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
	const labels = {
		failedLoginPolicy: t('cos.failed_login_policy', 'Failed Login Policy'),
		timeRange: t('cos.time_range', 'Time Range'),
		passwordLockout: {
			enabled: t('cos.enable_failed_login_lockout', 'Enable failed login lockout'),
			maxFailures: t(
				'cos.number_of_consecutive_failed_login_allowed',
				'Number of consecutive failed logins allowed',
			),
			duration: t('cos.time_to_lockout_account', 'Time to lockout the account'),
			failureLifetime: t(
				'cos.time_window_failed_logins_must_occur_to_lock_account',
				'Time window in which the failed logins must occur to lock the account:',
			),
		},
	};

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<ds-text as="strong" weight="bold">
				{labels.failedLoginPolicy}
			</ds-text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<form.Field name="zimbraPasswordLockoutEnabled">
								{(field) => (
									<Switch
										value={field.state.value === 'TRUE'}
										label={labels.passwordLockout.enabled}
										onClick={() =>
											field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
										}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								)}
							</form.Field>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<CosValidatedInput
								form={form}
								name="zimbraPasswordLockoutMaxFailures"
								label={labels.passwordLockout.maxFailures}
								disabled={!isLockoutEnabled || readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<form.Field name="zimbraPasswordLockoutDuration">
							{(field) => {
								const raw = String(field.state.value ?? '');
								const hasUnit = raw.length >= 2;
								const num = hasUnit ? raw.slice(0, -1) : '';
								const unit = hasUnit ? raw.slice(-1) : '';
								const error = getFieldErrorProps(field, isSubmitted, t);
								return (
									<>
										<Container width="72%" padding={{ right: 'small' }}>
											<Input
												label={labels.passwordLockout.duration}
												value={num}
												backgroundColor={'gray5'}
												inputName="zimbraPasswordLockoutDuration"
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													field.handleChange(e.target.value ? `${e.target.value}${unit}` : '')
												}
												onBlur={() => field.handleBlur()}
												hasError={error.hasError}
												description={error.description}
												disabled={!isLockoutEnabled || readonlyCOS}
											/>
										</Container>
										<Container width="28%" padding={{ left: 'small', right: 'small' }}>
											<Select
												items={timeItems}
												background={'gray5'}
												label={labels.timeRange}
												selection={timeItems.find((item) => item.value === unit) ?? timeItems[0]}
												showCheckbox={false}
												onChange={(newType) => {
													if (newType) field.handleChange(num ? `${num}${newType}` : '');
												}}
												disabled={!isLockoutEnabled || readonlyCOS}
											/>
										</Container>
									</>
								);
							}}
						</form.Field>
						<form.Field name="zimbraPasswordLockoutFailureLifetime">
							{(field) => {
								const raw = String(field.state.value ?? '');
								const hasUnit = raw.length >= 2;
								const num = hasUnit ? raw.slice(0, -1) : '';
								const unit = hasUnit ? raw.slice(-1) : '';
								const error = getFieldErrorProps(field, isSubmitted, t);
								return (
									<>
										<Container width="72%" padding={{ left: 'small', right: 'small' }}>
											<Input
												label={labels.passwordLockout.failureLifetime}
												value={num}
												backgroundColor={'gray5'}
												inputName="zimbraPasswordLockoutFailureLifetime"
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													field.handleChange(e.target.value ? `${e.target.value}${unit}` : '')
												}
												onBlur={() => field.handleBlur()}
												hasError={error.hasError}
												description={error.description}
												disabled={!isLockoutEnabled || readonlyCOS}
											/>
										</Container>
										<Container width="28%" padding={{ left: 'small' }}>
											<Select
												items={timeItems}
												background={'gray5'}
												label={labels.timeRange}
												selection={timeItems.find((item) => item.value === unit) ?? timeItems[0]}
												showCheckbox={false}
												onChange={(newType) => {
													if (newType) field.handleChange(num ? `${num}${newType}` : '');
												}}
												disabled={!isLockoutEnabled || readonlyCOS}
											/>
										</Container>
									</>
								);
							}}
						</form.Field>
					</ListRow>
				</Container>
			</Row>
			<ds-divider></ds-divider>
		</Row>
	);
};

export default COSFailedLoginPolicy;

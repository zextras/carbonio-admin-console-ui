/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { PlainInput } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import { CREATE_DOMAIN_VALIDATION_MESSAGES } from '../schema';
import type { CreateDomainFormApi } from '../types';
import { getImmediateFieldErrorProps } from './field-error';

type NotificationFromFieldProps = {
	form: CreateDomainFormApi;
};

export const NotificationFromField = ({ form }: NotificationFromFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'carbonioNotificationFrom' });

	const error = getImmediateFieldErrorProps(field, t, CREATE_DOMAIN_VALIDATION_MESSAGES);

	return (
		<div className={styles.fieldStart}>
			<PlainInput
				label={t('label.notification_sender', 'Notification Sender')}
				autoComplete="off"
				value={field.state.value ?? ''}
				hasError={error.hasError}
				description={error.description}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

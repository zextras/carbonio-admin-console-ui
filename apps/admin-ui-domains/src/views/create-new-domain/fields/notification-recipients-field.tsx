/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { ChipInput } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import { CREATE_DOMAIN_VALIDATION_MESSAGES } from '../schema';
import type { CreateDomainFormApi } from '../types';
import { getImmediateFieldErrorProps } from './field-error';

type NotificationRecipientsFieldProps = {
	form: CreateDomainFormApi;
};

export const NotificationRecipientsField = ({ form }: NotificationRecipientsFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'carbonioNotificationRecipients' });

	const error = getImmediateFieldErrorProps(field, t, CREATE_DOMAIN_VALIDATION_MESSAGES);

	return (
		<div className={styles.fieldStart}>
			<ChipInput
				placeholder={t('label.send_notifications_to', 'Send notifications to...')}
				background="gray5"
				value={field.state.value}
				onChange={(emails): void => {
					field.handleChange(emails.map((email) => ({ label: email.label ?? '' })));
				}}
				hasError={error.hasError}
				description={error.description}
				maxChips={null}
			/>
		</div>
	);
};

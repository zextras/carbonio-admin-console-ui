/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { ChipInput } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { isValidEmail } from '../../utility/utils';
import styles from '../parts/steps.module.css';
import type { CreateDomainFormApi } from '../types';

type NotificationRecipientsFieldProps = {
	form: CreateDomainFormApi;
};

export const NotificationRecipientsField = ({ form }: NotificationRecipientsFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'carbonioNotificationRecipients' });

	return (
		<div className={styles.fieldStart}>
			<ChipInput
				placeholder={t('label.send_notifications_to', 'Send notifications to...')}
				background="gray5"
				defaultValue={field.state.value}
				value={field.state.value}
				onChange={(emails: Array<{ label?: string }>): void => {
					field.handleChange(
						emails.filter((email) => isValidEmail(email.label ?? '')) as Array<{
							label: string;
						}>,
					);
				}}
				hasError={(field.state.value ?? []).some(
					(item) => (item as { error?: boolean }).error === true,
				)}
				maxChips={null}
			/>
		</div>
	);
};

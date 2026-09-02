/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Input } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import { CREATE_DOMAIN_VALIDATION_MESSAGES } from '../schema';
import type { CreateDomainFormApi } from '../types';
import { getImmediateFieldErrorProps } from './field-error';

type QuotaFieldProps = {
	form: CreateDomainFormApi;
};

export const QuotaField = ({ form }: QuotaFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'domainQuotaGB' });

	const error = getImmediateFieldErrorProps(field, t, CREATE_DOMAIN_VALIDATION_MESSAGES);

	return (
		<div className={styles.fieldStart}>
			<Input
				label={t(
					'label.max_mainbox_quota_for_the_domain_in_gb',
					'Max mailbox quota for the domain (GB) (0=unlimited)',
				)}
				backgroundColor="gray5"
				value={field.state.value}
				hasError={error.hasError}
				description={error.description}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

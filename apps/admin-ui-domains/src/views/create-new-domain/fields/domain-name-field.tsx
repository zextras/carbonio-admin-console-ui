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

type DomainNameFieldProps = {
	form: CreateDomainFormApi;
};

export const DomainNameField = ({ form }: DomainNameFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'domainName' });

	const error = getImmediateFieldErrorProps(field, t, CREATE_DOMAIN_VALIDATION_MESSAGES);

	return (
		<div className={styles.fieldStart}>
			<Input
				label={t('label.type_name_your_domain_will_have', 'Type the name your domain will have')}
				isRequired
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

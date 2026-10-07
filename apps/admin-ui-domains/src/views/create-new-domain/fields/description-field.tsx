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
import type { CreateDomainFormApi } from '../types';

type DescriptionFieldProps = {
	form: CreateDomainFormApi;
};

export const DescriptionField = ({ form }: DescriptionFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'description' });

	return (
		<div className={styles.fieldStart}>
			<PlainInput
				label={t('label.description', 'Description')}
				autoComplete="off"
				value={field.state.value ?? ''}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

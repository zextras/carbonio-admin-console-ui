/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { CustomTextArea } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import type { CreateDomainFormApi } from '../types';

type NotesFieldProps = {
	form: CreateDomainFormApi;
};

export const NotesField = ({ form }: NotesFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'zimbraNotes' });

	return (
		<div className={styles.fieldStart}>
			<CustomTextArea
				label={t('label.notes', 'Notes')}
				backgroundColor="gray5"
				value={field.state.value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

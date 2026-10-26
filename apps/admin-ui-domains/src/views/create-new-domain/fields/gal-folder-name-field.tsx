/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { TextInput } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import type { CreateDomainFormApi } from '../types';

type GalFolderNameFieldProps = {
	form: CreateDomainFormApi;
};

export const GalFolderNameField = ({ form }: GalFolderNameFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'galSyncAccountName' });

	return (
		<div className={styles.fieldStart}>
			<TextInput
				label={t('label.gal_folder_name', 'GAL folder name')}
				autoComplete="off"
				value={field.state.value ?? ''}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

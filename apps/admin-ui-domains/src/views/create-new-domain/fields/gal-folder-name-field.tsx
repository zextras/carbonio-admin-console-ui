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
import type { CreateDomainFormApi } from '../types';

type GalFolderNameFieldProps = {
	form: CreateDomainFormApi;
};

export const GalFolderNameField = ({ form }: GalFolderNameFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'galSyncAccountName' });

	return (
		<div className={styles.fieldStart}>
			<Input
				label={t('label.gal_folder_name', 'GAL folder name')}
				backgroundColor="gray5"
				value={field.state.value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					field.handleChange(e.target.value);
				}}
			/>
		</div>
	);
};

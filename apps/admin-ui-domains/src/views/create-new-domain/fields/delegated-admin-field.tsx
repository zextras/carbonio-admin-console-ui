/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import type { CreateDomainFormApi } from '../types';

type DelegatedAdminFieldProps = {
	form: CreateDomainFormApi;
};

export const DelegatedAdminField = ({ form }: DelegatedAdminFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'isDomainDelegatedAdmin' });

	return (
		<div className={styles.fieldStart}>
			<Switch
				label={t(
					'label.domain_support_delegated_administration',
					'This domain supports delegated administration',
				)}
				value={field.state.value}
				onClick={(): void => {
					field.handleChange(!field.state.value);
				}}
				iconColor="primary"
			/>
		</div>
	);
};

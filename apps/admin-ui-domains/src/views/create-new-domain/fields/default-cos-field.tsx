/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Select,type SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import type { CreateDomainFormApi } from '../types';

type DefaultCosFieldProps = {
	form: CreateDomainFormApi;
	items: Array<SelectItem>;
};

const EMPTY_SELECTION: SelectItem = { label: '', value: '' };

export const DefaultCosField = ({ form, items }: DefaultCosFieldProps) => {
	const [t] = useTranslation();
	const field = useField({ form, name: 'zimbraDomainDefaultCOSId' });

	return (
		<div className={styles.fieldStart}>
			<Select
				items={items}
				background="gray5"
				label={t('label.default_class_of_service', 'Default Class of Service')}
				showCheckbox={false}
				selection={items.find((item) => item.value === field.state.value) ?? EMPTY_SELECTION}
				onChange={(value: string | null): void => {
					field.handleChange(value ?? '');
				}}
			/>
		</div>
	);
};

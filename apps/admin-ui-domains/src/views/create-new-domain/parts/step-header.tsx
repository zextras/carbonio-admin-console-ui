/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './steps.module.css';

export const StepHeader = () => {
	const [t] = useTranslation();
	return (
		<div className={styles.header}>
			<div className={styles.headerTitle}>
				<ds-text as="strong" size="medium" weight="bold" color="gray0">
					{t('label.new_domain', 'New Domain')}
				</ds-text>
			</div>
			<ds-divider></ds-divider>
		</div>
	);
};

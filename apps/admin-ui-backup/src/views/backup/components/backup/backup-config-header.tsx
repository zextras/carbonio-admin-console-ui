/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './backup-config-header.module.css';

type BackupConfigHeaderProps = {
	title: string;
	isDirty: boolean;
	onCancel: () => void;
	onSave: () => void;
};

export const BackupConfigHeader = ({
	title,
	isDirty,
	onCancel,
	onSave,
}: BackupConfigHeaderProps) => {
	const [t] = useTranslation();
	return (
		<>
			<div className={styles.header}>
				<ds-text as="h2" size="medium" weight="bold" color="gray0">
					{title}
				</ds-text>
				{isDirty && (
					<div className={styles.actions}>
						<Button
							label={t('label.cancel', 'Cancel')}
							color="secondary"
							onClick={onCancel}
						/>
						<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
					</div>
				)}
			</div>
			<ds-divider></ds-divider>
		</>
	);
};

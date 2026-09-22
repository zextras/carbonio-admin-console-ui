/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './FieldShell.module.css';

type FieldShellProps = {
	id: string;
	label: string;
	disabled?: boolean;
	children: ReactNode;
};

const FieldShell = ({ id, label, disabled = false, children }: FieldShellProps) => {
	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
			</label>
			<div className={styles.box} data-disabled={disabled || undefined}>
				{children}
			</div>
		</div>
	);
};

export { FieldShell };
export type { FieldShellProps };

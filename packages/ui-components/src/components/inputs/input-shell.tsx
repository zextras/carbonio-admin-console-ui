/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './input-shell.module.css';

type InputShellProps = {
	id: string;
	label: string;
	description: string;
	descriptionId: string;
	disabled?: boolean;
	hasError?: boolean;
	children: ReactNode;
};

const InputShell = ({
	id,
	label,
	description,
	descriptionId,
	disabled = false,
	hasError = false,
	children,
}: InputShellProps) => {
	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
			</label>
			<div
				className={styles.box}
				data-disabled={disabled || undefined}
				data-error={hasError || undefined}
			>
				{children}
			</div>
			<p className={styles.description} id={descriptionId} data-error={hasError || undefined}>
				{description}
			</p>
		</div>
	);
};

export { InputShell };
export type { InputShellProps };

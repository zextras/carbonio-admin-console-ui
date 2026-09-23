/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-icon';

import type { ReactNode } from 'react';

import styles from './input-shell.module.css';

type InputShellProps = {
	id: string;
	label: string;
	description: string;
	descriptionId: string;
	disabled?: boolean;
	required?: boolean;
	hasError?: boolean;
	infoIcon?: boolean;
	children: ReactNode;
};

const InputShell = ({
	id,
	label,
	description,
	descriptionId,
	disabled = false,
	required = false,
	hasError = false,
	infoIcon = false,
	children,
}: InputShellProps) => {
	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
				{required && <span className={styles.requiredMark} aria-hidden="true">*</span>}
			</label>
			<div
				className={styles.box}
				data-disabled={disabled || undefined}
				data-error={hasError || undefined}
			>
				{children}
				{infoIcon && (
					<ds-icon
						icon="InfoOutline"
						size="0.83331rem"
						color="var(--color-gray1-focus)"
						aria-hidden="true"
					/>
				)}
			</div>
			<p className={styles.description} id={descriptionId} data-error={hasError || undefined}>
				{hasError && <ds-icon icon="AlertCircleOutline" size="0.75rem" aria-hidden="true" />}
				{description}
			</p>
		</div>
	);
};

export { InputShell };
export type { InputShellProps };

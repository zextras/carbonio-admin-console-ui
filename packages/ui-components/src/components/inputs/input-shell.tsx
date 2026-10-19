/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-icon';

import type { ReactNode } from 'react';

import { Tooltip } from '../display/Tooltip';
import styles from './input-shell.module.css';

type InputShellProps = {
	id: string;
	label: string;
	description: string;
	descriptionId: string;
	disabled?: boolean;
	required?: boolean;
	hasError?: boolean;
	/** Renders the InfoOutline icon at the right end of the label row with this text as hover tooltip. */
	infoTooltip?: string;
	/** Custom node rendered at the right edge of the field box. */
	icon?: ReactNode;
	/** Lets the box grow with multi-line controls (textarea) instead of the fixed field height. */
	multiline?: boolean;
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
	infoTooltip,
	icon,
	multiline = false,
	children,
}: InputShellProps) => {
	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				<Tooltip label={label} placement="top" overflowTooltip>
					<span className={styles.labelText}>{label}</span>
				</Tooltip>
				{required && <span className={styles.requiredMark} aria-hidden="true">*</span>}
				{infoTooltip && (
					<Tooltip label={infoTooltip} placement="top">
						<ds-icon
							icon="InfoOutline"
							size="0.75rem"
							color="var(--color-gray1-focus)"
							className={styles.labelInfoIcon}
							aria-hidden="true"
						/>
					</Tooltip>
				)}
			</label>
			<div
				className={styles.box}
				data-multiline={multiline || undefined}
				data-disabled={disabled || undefined}
				data-error={hasError || undefined}
			>
				{children}
				{icon}
			</div>
			<p className={styles.description} id={descriptionId} data-error={hasError || undefined}>
				{hasError && description !== '' && (
					<ds-icon icon="AlertCircleOutline" size="0.75rem" color="var(--color-error-hover)" aria-hidden="true" />
				)}
				{description}
			</p>
		</div>
	);
};

export { InputShell };
export type { InputShellProps };

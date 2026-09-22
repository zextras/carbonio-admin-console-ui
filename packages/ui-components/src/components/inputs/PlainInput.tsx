/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useId } from 'react';

import { FieldShell } from './FieldShell';
import styles from './FieldShell.module.css';

type PlainInputProps = React.ComponentPropsWithRef<'input'> & {
	/** Always rendered as a visible <label> above the field. */
	label: string;
};

const PlainInput = ({ label, id, disabled, className, ...rest }: PlainInputProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const inputClassName = [styles.control, className].filter(Boolean).join(' ');

	return (
		<FieldShell id={inputId} label={label} disabled={disabled}>
			<input id={inputId} disabled={disabled} className={inputClassName} {...rest} />
		</FieldShell>
	);
};

export { PlainInput };
export type { PlainInputProps };

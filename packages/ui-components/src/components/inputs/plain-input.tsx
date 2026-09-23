/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useId } from 'react';

import { InputShell } from './input-shell';
import styles from './input-shell.module.css';

type PlainInputProps = React.ComponentPropsWithRef<'input'> & {
	/** Always rendered as a visible <label> above the field. */
	label: string;
	/** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
	description?: string | null;
	/** Marks the field as invalid (aria-invalid) and applies the error styling. Pair with `description` so the invalid state carries a visible and announced explanation. */
	hasError?: boolean;
	/** Renders the InfoOutline icon at the right edge of the field box. */
	infoIcon?: boolean;
};

const PlainInput = ({
	label,
	id,
	disabled,
	required,
	className,
	hasError = false,
	description,
	infoIcon = false,
	'aria-describedby': callerDescribedBy,
	...rest
}: PlainInputProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const descriptionId = useId();
	const resolvedDescription = description ?? '';
	const inputClassName = [styles.control, className].filter(Boolean).join(' ');
	const describedBy = [callerDescribedBy, description ? descriptionId : undefined]
		.filter(Boolean)
		.join(' ');

	return (
		<InputShell
			id={inputId}
			label={label}
			disabled={disabled}
			required={required}
			hasError={hasError}
			description={resolvedDescription}
			descriptionId={descriptionId}
			infoIcon={infoIcon}
		>
			<input
				id={inputId}
				disabled={disabled}
				required={required}
				className={inputClassName}
				aria-invalid={hasError || undefined}
				aria-describedby={describedBy || undefined}
				{...rest}
			/>
		</InputShell>
	);
};

export { PlainInput };
export type { PlainInputProps };

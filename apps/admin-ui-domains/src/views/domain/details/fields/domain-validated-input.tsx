/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { getFieldErrorProps, Input } from '@zextras/ui-components';
import { ChangeEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { DOMAIN_VALIDATION_MESSAGES } from '../schemas/domain-validation-messages';
import { DomainFormApi } from '../schemas/form-types';

type DomainValidatedInputProps<T extends Record<string, unknown>> = {
	form: DomainFormApi<T>;
	name: keyof T & string;
	label: string;
	disabled?: boolean;
};

export const DomainValidatedInput = <T extends Record<string, unknown>>({
	form,
	name,
	label,
	disabled = false
}: DomainValidatedInputProps<T>): ReactElement => {
	const [t] = useTranslation();
	const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

	return (
		<form.Field name={name}>
			{(field) => {
				const error = getFieldErrorProps(field, isSubmitted, t, DOMAIN_VALIDATION_MESSAGES);
				return (
					<Input
						label={label}
						value={(field.state.value as string) ?? ''}
						backgroundColor="gray5"
						inputName={String(name)}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							field.handleChange(e.target.value as any)
						}
						onBlur={() => field.handleBlur()}
						hasError={error.hasError}
						description={error.description}
						disabled={disabled}
					/>
				);
			}}
		</form.Field>
	);
};

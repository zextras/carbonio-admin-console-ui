/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AnyFieldApi } from '@tanstack/react-form';
import type { TFunction } from 'i18next';

type FieldErrorProps = {
	hasError: boolean;
	description?: string;
};

export function getImmediateFieldErrorProps(
	field: AnyFieldApi,
	t: TFunction,
	errorMessages?: Record<string, string>,
): FieldErrorProps {
	const { meta } = field.state;
	const showError = (meta.isTouched || meta.isBlurred) && !meta.isValid;
	if (!showError) {
		return { hasError: false };
	}

	const firstError = meta.errors[0];
	const rawKey = typeof firstError === 'string' ? firstError : firstError?.message;
	const key = typeof rawKey === 'string' ? rawKey : undefined;

	return {
		hasError: true,
		description: key ? t(key, errorMessages?.[key] ?? key) : undefined,
	};
}

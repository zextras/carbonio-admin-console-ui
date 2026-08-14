/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FormAsyncValidateOrFn, FormValidateOrFn } from '@tanstack/form-core';
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type DomainFormApi<T> = ReactFormExtendedApi<
	T,
	undefined | FormValidateOrFn<T>,
	undefined | FormValidateOrFn<T>,
	undefined | FormAsyncValidateOrFn<T>,
	undefined | FormValidateOrFn<T>,
	undefined | FormAsyncValidateOrFn<T>,
	undefined | FormValidateOrFn<T>,
	undefined | FormAsyncValidateOrFn<T>,
	undefined | FormValidateOrFn<T>,
	undefined | FormAsyncValidateOrFn<T>,
	undefined | FormAsyncValidateOrFn<T>,
	unknown
>;

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FormOptions } from '@tanstack/form-core';
import { type ReactFormExtendedApi,useForm } from '@tanstack/react-form';

/**
 * Typed TanStack Form API for forms that do not register validators.
 * Validator generics are `undefined`; submit meta is `never`.
 */
export type AppFormApi<TFormData> = ReactFormExtendedApi<
  TFormData,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  never
>;

type AppFormOptions<TFormData> = FormOptions<
  TFormData,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  never
>;

/**
 * Wrapper around `useForm` that locks validator/submit-meta generics so section
 * props can use `AppFormApi<T>` without `any` or `unknown`.
 */
export function useAppForm<TFormData>(opts: AppFormOptions<TFormData>): AppFormApi<TFormData> {
  return useForm(opts);
}

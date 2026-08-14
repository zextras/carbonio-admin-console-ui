/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DeepKeys, DeepValue } from '@tanstack/react-form';
import type { FunctionComponent, ReactNode } from 'react';

export type FormFieldHandle<TValue> = {
  state: { value: TValue };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
};

/**
 * Structural form surface for section props.
 * Compatible with TanStack `useForm()` without exposing library validator generics.
 */
export type AppFormApi<TFormData> = {
  Field: <TName extends DeepKeys<TFormData>>(props: {
    name: TName;
    children: (field: FormFieldHandle<DeepValue<TFormData, TName>>) => ReactNode;
  }) => ReturnType<FunctionComponent>;
  Subscribe: <TSelected>(props: {
    selector: (state: { values: TFormData }) => TSelected;
    children: ((selected: TSelected) => ReactNode) | ReactNode;
  }) => ReturnType<FunctionComponent>;
  setFieldValue: <TName extends DeepKeys<TFormData>>(
    name: TName,
    value: DeepValue<TFormData, TName>,
  ) => void;
};

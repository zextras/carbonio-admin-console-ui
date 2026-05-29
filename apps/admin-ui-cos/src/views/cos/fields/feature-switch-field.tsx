/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import { InheritedSwitch } from '@zextras/ui-components';
import type { FC } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CosFeaturesFormApi = ReactFormExtendedApi<
  Record<string, string>,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type FeatureSwitchFieldProps = {
  form: CosFeaturesFormApi;
  name: string;
  label: string;
  disabled?: boolean;
};

const FeatureSwitchField: FC<FeatureSwitchFieldProps> = ({ form, name, label, disabled }) => (
  <form.Field name={name}>
    {(field) => (
      <InheritedSwitch
        subValue={field.state.value}
        onChange={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
        onChangeReset={() => {}}
        label={label}
        iconColor="primary"
        inputName={name}
        disabled={disabled}
      />
    )}
  </form.Field>
);

export { FeatureSwitchField, type FeatureSwitchFieldProps };

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Switch } from '@zextras/ui-components';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';

type FeatureSwitchProps = {
  form: CreateCosFormApi;
  name: keyof CreateCosFormValues;
  label: string;
};

export const FeatureSwitch = ({ form, name, label }: FeatureSwitchProps) => (
  <form.Field name={name}>
    {(field) => (
      <Switch
        value={field.state.value === 'TRUE'}
        onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
        label={label}
        iconColor="primary"
      />
    )}
  </form.Field>
);

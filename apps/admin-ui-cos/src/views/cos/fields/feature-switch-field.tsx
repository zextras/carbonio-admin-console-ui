/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Switch } from '@zextras/ui-components';
import type { FC } from 'react';

import type { CosFeaturesFormApi, CosFeaturesFormValues } from '../types';

type FeatureSwitchFieldProps = {
  form: CosFeaturesFormApi;
  name: keyof CosFeaturesFormValues;
  label: string;
  disabled?: boolean;
};

const FeatureSwitchField: FC<FeatureSwitchFieldProps> = ({ form, name, label, disabled }) => (
  <form.Field name={name}>
    {(field) => (
      <Switch
        value={field.state.value === 'TRUE'}
        onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
        label={label}
        iconColor="primary"
        disabled={disabled}
      />
    )}
  </form.Field>
);

export { FeatureSwitchField, type FeatureSwitchFieldProps };

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Switch } from '@zextras/ui-components';
import type { FC } from 'react';

import { useFieldContext } from '../form-context';

type FeatureSwitchFieldProps = {
  label: string;
  disabled?: boolean;
};

export const FeatureSwitchField: FC<FeatureSwitchFieldProps> = ({ label, disabled }) => {
  const field = useFieldContext<string>();
  const onClick = () => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE');

  return (
    <Switch
      value={field.state.value === 'TRUE'}
      onClick={onClick}
      label={label}
      iconColor="primary"
      disabled={disabled}
    />
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createFormHook } from '@tanstack/react-form';

import { FeatureSwitchField } from './field-components/feature-switch-field';
import { QuotaGBField } from './field-components/quota-gb-field';
import { TimeFieldGroup } from './field-components/time-field-group';
import { ValidatedInput } from './field-components/validated-input';
import { fieldContext, formContext } from './form-context';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    ValidatedInput,
    TimeFieldGroup,
    QuotaGBField,
    FeatureSwitchField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow } from '@zextras/ui-components';

import { FeatureSwitch } from '../fields/feature-switch';
import type { CreateCosFormApi, CreateCosFormValues } from '../types';

type FeatureItemProps = {
  form: CreateCosFormApi;
  name: keyof CreateCosFormValues;
  label: string;
  description?: string;
};

export const FeatureItem = ({ form, name, label, description }: FeatureItemProps) => (
  <>
    <ListRow>
      <FeatureSwitch form={form} name={name} label={label} />
    </ListRow>
    {description ? (
      <ds-text as="span" size="small" color="gray1" weight="light">
        {description}
      </ds-text>
    ) : null}
  </>
);

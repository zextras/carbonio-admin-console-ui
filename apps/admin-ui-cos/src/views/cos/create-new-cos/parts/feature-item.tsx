/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow, Switch } from '@zextras/ui-components';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import styles from './steps.module.css';

type FeatureItemProps = {
  form: CreateCosFormApi;
  name: keyof CreateCosFormValues;
  label: string;
  description?: string;
};

export const FeatureItem = ({ form, name, label, description }: FeatureItemProps) => (
  <>
    <ListRow>
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
    </ListRow>
    {description ? (
      <div className={styles.featureDescription}>
        <ds-text as="span" size="small" color="gray1" weight="light">
          {description}
        </ds-text>
      </div>
    ) : null}
  </>
);

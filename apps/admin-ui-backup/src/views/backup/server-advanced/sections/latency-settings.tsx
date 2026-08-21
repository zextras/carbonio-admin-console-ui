/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ServerAdvancedFormApi } from '../types';

type LatencySettingsProps = {
  form: ServerAdvancedFormApi;
  allowSetBackup: boolean;
};

export const LatencySettings = ({ form, allowSetBackup }: LatencySettingsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extralarge' }} height="fit">
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.tuning_options', 'Tuning Options')}
        </ds-text>
      </Container>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'large' }} height="fit">
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.latency', 'Latency')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="50%"
        >
          <form.Field name="backupLatencyHighThreshold">
            {(field) => (
              <Input
                isRequired
                label={t('backup.latency_high_threshold_ms', 'Latency High Threshold (ms)')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="50%"
        >
          <form.Field name="backupLatencyLowThreshold">
            {(field) => (
              <Input
                isRequired
                label={t('backup.latency_low_threshold_ms', 'Latency Low Threshold (ms)')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
    </>
  );
};

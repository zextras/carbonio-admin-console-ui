/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ServerAdvancedFormApi } from '../types';

type WaitingTimeSettingsProps = {
  form: ServerAdvancedFormApi;
  allowSetBackup: boolean;
};

export const WaitingTimeSettings = ({ form, allowSetBackup }: WaitingTimeSettingsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extralarge' }} height="fit">
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.waiting_time', 'Waititng Time')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="100%"
        >
          <form.Field name="backupMaxWaitTime">
            {(field) => (
              <Input
                label={t('backup.max_waiting_time_ms', 'Max Waiting Time (ms)')}
                backgroundColor="gray5"
                borderColor="gray3"
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

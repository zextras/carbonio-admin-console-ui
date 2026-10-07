/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, PlainInput } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ServerAdvancedFormApi } from '../types';

type OtherControlsProps = {
  form: ServerAdvancedFormApi;
  allowSetBackup: boolean;
};

export const OtherControls = ({ form, allowSetBackup }: OtherControlsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="50%"
        >
          <form.Field name="backupMaxOperationPerAccount">
            {(field) => (
              <PlainInput
                required
                label={t('backup.maximum_operation_per_account', 'Maximum Operation per Account')}
                autoComplete="off"
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
          <form.Field name="backupCompressionLevel">
            {(field) => (
              <PlainInput
                required
                label={t('backup.compression_level', 'Compression Level')}
                autoComplete="off"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="50%"
        >
          <form.Field name="backupNumberThreadsForItems">
            {(field) => (
              <PlainInput
                required
                label={t('backup.thread_number_for_items', 'Thread number for items')}
                autoComplete="off"
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
          <form.Field name="backupNumberThreadsForAccounts">
            {(field) => (
              <PlainInput
                required
                label={t('backup.thread_number_for_accounts', 'Thread number for accounts')}
                autoComplete="off"
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

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow } from '@zextras/ui-components';
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
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extralarge' }} height="fit">
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.other_controls', 'Other Controls')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="500%"
        >
          <form.Field name="backupMaxOperationPerAccount">
            {(field) => (
              <Input
                isRequired
                label={t('backup.maximum_operation_per_account', 'Maximum Operation per Account')}
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
          width="500%"
        >
          <form.Field name="backupCompressionLevel">
            {(field) => (
              <Input
                isRequired
                label={t('backup.compression_level', 'Compression Level')}
                backgroundColor="gray5"
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
          width="500%"
        >
          <form.Field name="backupNumberThreadsForItems">
            {(field) => (
              <Input
                isRequired
                label={t('backup.thread_number_for_items', 'Thread number for items')}
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
          width="500%"
        >
          <form.Field name="backupNumberThreadsForAccounts">
            {(field) => (
              <Input
                isRequired
                label={t('backup.thread_number_for_accounts', 'Thread number for accounts')}
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

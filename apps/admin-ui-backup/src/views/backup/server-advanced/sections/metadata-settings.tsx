/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Switch } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ServerAdvancedFormApi } from '../types';

type MetadataSettingsProps = {
  form: ServerAdvancedFormApi;
  allowSetBackup: boolean;
};

export const MetadataSettings = ({ form, allowSetBackup }: MetadataSettingsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extralarge' }} height="fit">
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.metadata', 'Metadata')}
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
          <form.Field name="backupMaxMetaDataSize">
            {(field) => (
              <Input
                isRequired
                label={t('backup.maximum_metadata_size_mb', 'Maximum Metadata Size (MB)')}
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
          width="100%"
        >
          <form.Field name="backupOnTheFlyMetadata">
            {(field) => (
              <Switch
                label={t(
                  'backup.append_metadata_instead_of_rewrite_faster_but_dangerous',
                  'Append metadata instead of rewrite (faster but dangerous)',
                )}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
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
          width="100%"
        >
          <form.Field name="scheduledMetadataArchivingEnabled">
            {(field) => (
              <Switch
                label={t(
                  'backup.archive_user_metadata_folder_in_the_remote_backup',
                  'Archive user metadata folder in the remote backup',
                )}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
    </>
  );
};

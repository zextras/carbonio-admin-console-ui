/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, TextInput, Switch } from '@zextras/ui-components';
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
              <TextInput
                required
                label={t('backup.maximum_metadata_size_mb', 'Maximum Metadata Size (MB)')}
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

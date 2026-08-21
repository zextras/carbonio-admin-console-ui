/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { useCheckLdap } from '../../../../services/use-check-ldap';
import type { ServerAdvancedFormApi } from '../types';

type BackupOptionsProps = {
  form: ServerAdvancedFormApi;
  allowSetBackup: boolean;
};

export const BackupOptions = ({ form, allowSetBackup }: BackupOptionsProps) => {
  const [t] = useTranslation();
  const checkLdapMutation = useCheckLdap();

  return (
    <>
      <ListRow>
        <Container
          padding={{ top: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <form.Field name="ldapDumpEnabled">
            {(field) => (
              <Switch
                label={t('backup.ldap_dump', 'LDAP Dump')}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ top: 'large' }}>
          <form.Field name="serverConfiguration">
            {(field) => (
              <Switch
                label={t('backup.include_server_configuration', 'Include server configuration')}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ top: 'large' }}>
          <form.Field name="purgeOldConfiguration">
            {(field) => (
              <Switch
                label={t('backup.purge_old_configuration', 'Purge old configuration')}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ top: 'large' }}>
          <form.Field name="includeIndex">
            {(field) => (
              <Switch
                label={t('backup.include_index', 'Include index')}
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
          padding={{ top: 'large' }}
          style={{ display: 'block' }}
        >
          <Button
            type="outlined"
            label={t('backup.check_ldap', 'Check ldap')}
            color="primary"
            icon="ActivityOutline"
            iconPlacement="right"
            onClick={() => checkLdapMutation.mutate()}
            disabled={checkLdapMutation.isPending || !allowSetBackup}
            loading={checkLdapMutation.isPending}
            style={{ width: '100%' }}
            width="fill"
            size="large"
          />
        </Container>
      </ListRow>
    </>
  );
};

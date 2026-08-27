/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { useAccountForm, useToggleAccountValue } from '../account-form-context';

export const BackupSettings = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();

  return (
    <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
      <ds-text as="h2" weight="bold">
        {t('label.backup', 'Backup')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <Switch
                value={values?.backupSelfUndeleteAllowed}
                onClick={(): void => toggleAccountValue('backupSelfUndeleteAllowed', true, false)}
                label={t('label.allow_restore_message', 'Allow user to restore messages')}
                iconColor="primary"
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};

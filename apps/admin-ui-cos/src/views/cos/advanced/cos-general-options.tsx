/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED } from '../../../constants';
import { CosFormApi } from './cos-form-api';

const COSGeneralOptions: FC<{
  form: CosFormApi;
  readonlyCOS: boolean;
}> = ({ form, readonlyCOS }) => {
  const [t] = useTranslation();

  const labels = {
    backup: {
      selfUndelete: t('label.allow_restore_message', 'Allow user to restore messages'),
      enableDisable: t('label.backup_enabled', 'Enable / Disable Backup'),
    },
    generalOptions: t('cos.general_options', 'General Options'),
  };
  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {labels.generalOptions}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container mainAlignment="flex-start" style={{ gap: 10 }} orientation="horizontal">
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                width="50%"
                orientation="vertical"
              >
                <form.Field name={BACKUP_ENABLED}>
                  {(field) => (
                    <Switch
                      label={labels.backup.enableDisable}
                      value={field.state.value}
                      onClick={() => field.handleChange(!field.state.value)}
                      iconColor="primary"
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                width="50%"
                orientation="vertical"
              >
                <form.Field name={BACKUP_SELF_UNDELETE_ALLOWED}>
                  {(field) => (
                    <Switch
                      label={labels.backup.selfUndelete}
                      value={field.state.value}
                      onClick={() => field.handleChange(!field.state.value)}
                      iconColor="primary"
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};

export default COSGeneralOptions;

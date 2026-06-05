/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosPreferencesFormApi } from '../types';

type SendingMailsProps = {
  form: CosPreferencesFormApi;
  readonlyCOS: boolean;
};

export const SendingMails = ({ form, readonlyCOS }: SendingMailsProps) => {
  const [t] = useTranslation();

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {t('label.sending_mails', 'Sending Mails')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large', bottom: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <form.Field name="zimbraPrefSaveToSent">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t('cos.save_to_Sent', 'Save to sent')}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container height="fit" crossAlignment="flex-start" background="gray6">
          <ListRow>
            <Container crossAlignment="flex-start">
              <form.Field name="zimbraFeatureReadReceiptsEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.preferences.allowTheUserToAskForAReadReceipt',
                      'Allow the user to ask for a read receipt',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};

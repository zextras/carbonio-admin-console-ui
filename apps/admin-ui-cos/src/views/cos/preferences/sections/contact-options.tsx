/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosPreferencesFormValues } from '../types';

export const ContactOptions = withForm({
  defaultValues: {} as CosPreferencesFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
    const [t] = useTranslation();

    return (
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ all: 'large' }}
        width="100%"
      >
        <ds-text as="strong" weight="bold">
          {t('label.contact_options', 'Contact Options')}
        </ds-text>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background="gray6"
            padding={{ top: 'large', bottom: 'large' }}
          >
            <ListRow>
              <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
                <form.Field name="zimbraPrefAutoAddAddressEnabled">
                  {(field) => (
                    <Switch
                      value={field.state.value === 'TRUE'}
                      onClick={() =>
                        field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                      }
                      label={t('cos.enable_auto_add_contacts', 'Enable auto-add contacts')}
                      iconColor="primary"
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
              <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
                <form.Field name="zimbraPrefGalAutoCompleteEnabled">
                  {(field) => (
                    <Switch
                      value={field.state.value === 'TRUE'}
                      onClick={() =>
                        field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                      }
                      label={t('cos.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
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
  },
});

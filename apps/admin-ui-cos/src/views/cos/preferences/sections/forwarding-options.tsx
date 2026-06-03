/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosPreferencesFormValues } from '../types';

export const ForwardingOptions = withForm({
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
          {t('label.forwarding', 'Forwarding')}
        </ds-text>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large', bottom: 'large' }}
          >
            <ListRow>
              <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
                <form.Field name="zimbraFeatureMailForwardingEnabled">
                  {(field) => (
                    <Switch
                      value={field.state.value === 'TRUE'}
                      onClick={() =>
                        field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                      }
                      label={t(
                        'cos.user_can_specify_forwarding_address',
                        'User can specify forwarding address',
                      )}
                      iconColor="primary"
                      disabled={readonlyCOS}
                    />
                  )}
                </form.Field>
              </Container>
              <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
                <form.Field name="zimbraFeatureMailForwardingInFiltersEnabled">
                  {(field) => (
                    <Switch
                      value={field.state.value === 'TRUE'}
                      onClick={() =>
                        field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                      }
                      label={t(
                        'cos.user_can_specify_mail_forwarding_filter',
                        'User can specify mail forwarding filter',
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
  },
});

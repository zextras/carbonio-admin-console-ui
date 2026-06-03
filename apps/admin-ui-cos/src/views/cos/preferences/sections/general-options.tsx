/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Select, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosPreferencesFormValues } from '../types';

export const GeneralOptions = withForm({
  defaultValues: {} as CosPreferencesFormValues,
  props: {
    readonlyCOS: false as boolean,
    locales: [] as Array<SelectItem>,
  },
  render: function Render({ form, readonlyCOS, locales }) {
    const [t] = useTranslation();

    return (
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <ds-text as="strong" weight="bold">
          {t('label.general_options', 'General Options')}
        </ds-text>

        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large', bottom: 'large' }}
          >
            <ListRow>
              <Container>
                <form.Field name="zimbraPrefLocale">
                  {(field) => (
                    <Select
                      items={locales}
                      background={'gray5'}
                      label={t('label.language', 'Language')}
                      showCheckbox={false}
                      selection={
                        locales.find((item) => item.value === field.state.value) || locales[0]
                      }
                      onChange={(value): void => {
                        const newValue =
                          typeof value === 'object' && value !== null && 'value' in value
                            ? (value as SelectItem).value
                            : (value as string);
                        field.handleChange(newValue);
                      }}
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

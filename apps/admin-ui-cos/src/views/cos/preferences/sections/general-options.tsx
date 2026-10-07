/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, PlainSelect, Row, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosPreferencesFormApi } from '../types';

type GeneralOptionsProps = {
  form: CosPreferencesFormApi;
  readonlyCOS: boolean;
  locales: SelectItem[];
};

export const GeneralOptions = ({ form, readonlyCOS, locales }: GeneralOptionsProps) => {
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
                  <PlainSelect
                    items={locales}
                    label={t('label.language', 'Language')}
                    selection={
                      locales.find((item) => item.value === field.state.value) || locales[0]
                    }
                    onChange={(value): void => {
                      field.handleChange(value);
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
};

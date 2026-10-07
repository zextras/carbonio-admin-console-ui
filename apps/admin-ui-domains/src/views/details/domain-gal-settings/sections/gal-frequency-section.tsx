/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, NumberInput, PlainSelect, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { DomainGalSettingsFormApi } from '../use-domain-gal-form';
import { measureUnitItems } from '../utils';

type GalFrequencySectionProps = {
  form: DomainGalSettingsFormApi;
};

export const GalFrequencySection = ({ form }: GalFrequencySectionProps) => {
  const [t] = useTranslation();
  const unitItems = measureUnitItems(t);

  return (
    <Container
      height="fit"
      crossAlignment="flex-start"
      background="gray6"
      padding={{ top: 'large' }}
    >
      <Row
        mainAlignment="flex-start"
        width="100%"
        background="gray6"
        padding={{ all: 'small' }}
      >
        <ds-text as="h3" size="small" weight="bold">
          {t('label.settings', 'Settings')}
        </ds-text>
      </Row>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="freqDigits">
            {(field) => (
              <NumberInput
                label={t('label.gal_update_frequencey_value', 'GAL Update Frequency (value)')}
                value={field.state.value ?? ''}
                onChange={(value: string): void => {
                  const parsed = Number.parseInt(value, 10);
                  if (value === '' || (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 9)) {
                    field.handleChange(value);
                  }
                }}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ all: 'small' }}>
          <form.Field name="freqUnit">
            {(field) => {
              const selection = unitItems.find((item) => item.value === field.state.value) ?? unitItems[0];
              return (
                <PlainSelect
                  label={t('label.interval', 'Interval')}
                  items={unitItems}
                  selection={selection}
                  onChange={(value: string): void => {
                    field.handleChange(value);
                  }}
                />
              );
            }}
          </form.Field>
        </Container>
      </ListRow>
    </Container>
  );
};

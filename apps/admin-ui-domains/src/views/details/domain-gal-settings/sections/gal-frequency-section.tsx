/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Input, ListRow, Row, Select } from '@zextras/ui-components';
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
              <Input
                label={t('label.gal_update_frequencey_value', 'GAL Update Frequency (value)')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  const val = e.target.value;
                  const parsed = Number.parseInt(val, 10);
                  if (val === '' || (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 9)) {
                    field.handleChange(val);
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
                <Select
                  items={unitItems}
                  background="gray5"
                  label={t('label.interval', 'Interval')}
                  onChange={(value: string | null): void => {
                    field.handleChange(value ?? 'd');
                  }}
                  showCheckbox={false}
                  selection={selection}
                />
              );
            }}
          </form.Field>
        </Container>
      </ListRow>
    </Container>
  );
};

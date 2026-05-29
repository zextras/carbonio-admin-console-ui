/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

type GeneralSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const GeneralSection = ({ form, readonlyCOS }: GeneralSectionProps) => {
  const [t] = useTranslation();

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
      width="100%"
    >
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        width="50%"
        orientation="vertical"
        padding={{ bottom: 'large' }}
      >
        <ds-text as="strong" weight="bold">
          {t('label.general_lbl', 'General')}
        </ds-text>
        <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
          <FeatureSwitchField
            form={form}
            name="zimbraFeatureOptionsEnabled"
            label={t('label.can_access_settings', 'Can access Settings')}
            disabled={readonlyCOS}
          />
        </Row>
      </Container>
    </Row>
  );
};

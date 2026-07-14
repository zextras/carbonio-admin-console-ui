/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, LabeledValue, ListRow, Padding, Tooltip } from '@zextras/ui-components';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import type { Volume } from '../../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';
import { asQueryString } from '../hsm-policy-detail';

export function HSMcreatePolicy() {
  const [t] = useTranslation();
  const { form } = useContext(HSMContext);
  const formValues = useSelector(form.store, (s) => s.values);
  const hsmQuery = asQueryString(formValues);
  const sourceVolumeNames = formValues.sourceVolume.map((item: Volume) => item.name).join();
  const destinationVolumeNames = formValues.destinationVolume
    .map((item: Volume) => item.name)
    .join();

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 300px)"
      background="white"
      style={{ overflow: 'auto' }}
      padding={{ all: 'large' }}
    >
      <ListRow>
        <Padding bottom="large">
          <ds-text as="h2" size="large" weight="bold">
            {t('hsm.new_policy_summary', 'New Policy Summary')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding left="large">
          <ds-text as="span" size="small" weight="regular" color="secondry">
            {t('hsm.parameters', 'Parameters')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Padding top="extrasmall" left="large">
          <Tooltip placement="bottom" label={hsmQuery} maxWidth="auto">
            <ds-text as="p" size="medium" weight="regular" color="gray0">
              {hsmQuery}
            </ds-text>
          </Tooltip>
        </Padding>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'small' }}>
          <ds-divider></ds-divider>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <LabeledValue
            label={t('hsm.source_volume', 'Source Volume')}
            backgroundColor="gray6"
            value={sourceVolumeNames}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <LabeledValue
            label={t('hsm.destination_volume', 'Destination Volume')}
            backgroundColor="gray6"
            value={destinationVolumeNames}
          />
        </Container>
      </ListRow>
    </Container>
  );
}

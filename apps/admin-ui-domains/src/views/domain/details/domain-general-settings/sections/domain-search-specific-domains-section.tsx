/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, Padding } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DomainListChipInput } from '../../parts/domain-list-chip-input';
import type { DomainGeneralSettingsFormApi } from '../use-domain-general-form';

type DomainSearchSpecificDomainsSectionProps = {
  form: DomainGeneralSettingsFormApi;
  domainName: string;
};

export const DomainSearchSpecificDomainsSection = ({
  form,
  domainName,
}: DomainSearchSpecificDomainsSectionProps) => {
  const [t] = useTranslation();

  return (
    <ListRow>
      <Container padding={{ all: 'small' }} mainAlignment="flex-start" crossAlignment="flex-start">
        <ds-text as="h3" size="small" weight="bold">
          {t(
            'domains.generalSettings.AllowSearchUserFromSpecificDomains',
            'Search users in specific domains',
          )}
        </ds-text>
        <Padding top="small" />
        <form.Field name="carbonioSearchSpecifiedDomainsByFeature">
          {(field) => (
            <DomainListChipInput
              domainList={field.state.value}
              setDomainList={(list) => {
                field.handleChange(list.map((item) => ({ label: item.label ?? '' })));
              }}
              domainName={domainName}
            />
          )}
        </form.Field>
      </Container>
    </ListRow>
  );
};

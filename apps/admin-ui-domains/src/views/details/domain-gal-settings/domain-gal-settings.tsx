/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, Padding } from '@zextras/ui-components';
import { useMailstoreServers } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useGalAccountsForDomain } from '../../../services/use-gal-accounts-for-domain';
import type { DomainGalSettingsFormValues } from './schema';
import { GalAuthSection } from './sections/gal-auth-section';
import { GalFrequencySection } from './sections/gal-frequency-section';
import { GalGeneralSection } from './sections/gal-general-section';
import { GalLdapSection } from './sections/gal-ldap-section';
import { GalSyncAccountsSection } from './sections/gal-sync-accounts-section';
import { useDomainGalForm } from './use-domain-gal-form';
import {
  buildDomainAttrMap,
  buildServerGalRows,
  getDefaultGalFormValues,
  getGalAccountIds,
  parsePollingInterval,
} from './utils';

export const DomainGalSettings = () => {
  const [t] = useTranslation();
  const { data: selectedDomain } = useSelectedDomain();
  const { data: allMailstoreList = [] } = useMailstoreServers();

  const domainInformation = selectedDomain?.a;
  const domainName = selectedDomain?.name;

  const domainAttrMap = buildDomainAttrMap(domainInformation);
  const zimbraId = domainAttrMap.zimbraId ?? '';

  const galAccountIds = getGalAccountIds(domainInformation);

  const { data: galAccounts = [] } = useGalAccountsForDomain(galAccountIds);

  const dataSourceIds = galAccounts
    .filter((acc) => !!acc.dataSourceId)
    .map((acc) => ({
      accountId: acc.id,
      dataSourceId: acc.dataSourceId ?? '',
    }));

  const pollingInterval =
    galAccounts.length > 0
      ? parsePollingInterval(galAccounts[0]?.zimbraDataSourceGalPollingInterval ?? '')
      : { digits: '1', unit: 'd' };

  const serverGalRows = buildServerGalRows(
    allMailstoreList,
    galAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      zimbraMailHost: acc.zimbraMailHost,
      zimbraDataSourceGalPollingInterval: acc.zimbraDataSourceGalPollingInterval,
    })),
  );

  const defaultValues: DomainGalSettingsFormValues = getDefaultGalFormValues(
    domainAttrMap,
    pollingInterval,
  );

  const { form, handleSave, handleCancel } = useDomainGalForm({
    defaultValues,
    zimbraId,
    galAccountIds,
    dataSourceIds,
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <Container
      height="calc(100vh - 105px)"
      background="gray6"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto' }}
    >
      <FormPageLayout
        title={t('label.global_address_list', 'Global Address List')}
        unsavedChanges={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <GalSyncAccountsSection serverList={serverGalRows} domainName={domainName} />

        <Padding vertical="medium" />

        <GalGeneralSection form={form} />

        <GalFrequencySection form={form} />

        <GalLdapSection form={form} />

        <GalAuthSection form={form} />
      </FormPageLayout>
    </Container>
  );
};

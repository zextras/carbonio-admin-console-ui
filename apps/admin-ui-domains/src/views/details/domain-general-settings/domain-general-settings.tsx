/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout } from '@zextras/ui-components';
import { useCosList, useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { CosMaxAccountValues } from '../../../../types';
import {
  CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE,
  CLOSED,
  NOT_SET,
  TRUE,
  ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS,
} from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useDomainQuota } from '../../../services/use-domain-quota';
import { BytesToGB, getDateFromStr, getFormatedDate } from '../../utility/utils';
import { DomainCosLink } from './domain-cos-link';
import type { DomainGeneralSettingsFormValues } from './schema';
import { DomainBasicsSection } from './sections/domain-basics-section';
import { DomainDeleteSection } from './sections/domain-delete-section';
import { DomainNotificationsSection } from './sections/domain-notifications-section';
import { DomainQuotaSection } from './sections/domain-quota-section';
import { DomainSearchSpecificDomainsSection } from './sections/domain-search-specific-domains-section';
import { useDomainGeneralForm } from './use-domain-general-form';

export const DomainGeneralSettings = () => {
  const [t] = useTranslation();
  const { domainId } = useParams();
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];
  const isAdvanced = useIsAdvanced();
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const cosItems = cosList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const { data: quotaData } = useDomainQuota(domainId, isAdvanced);

  const domainAttrMap = buildDomainAttrMap(domainInformation);
  const domainName = domainAttrMap.zimbraDomainName ?? '';
  const zimbraId = domainAttrMap.zimbraId ?? '';

  const domainCreationDate = domainAttrMap.zimbraCreateTimestamp
    ? getFormatedDate(getDateFromStr(domainAttrMap.zimbraCreateTimestamp))
    : '';

  const cosMaxAccountList = buildCosMaxAccountList(domainInformation);

  const initialQuotaGB = quotaData?.type === 'success' ? String(BytesToGB(quotaData.limit)) : '';

  const defaultValues: DomainGeneralSettingsFormValues = {
    zimbraDomainStatus: domainAttrMap.zimbraDomainStatus ?? 'active',
    zimbraPublicServiceProtocol: domainAttrMap.zimbraPublicServiceProtocol ?? NOT_SET,
    zimbraPublicServicePort: domainAttrMap.zimbraPublicServicePort ?? '',
    zimbraPublicServiceHostname: domainAttrMap.zimbraPublicServiceHostname ?? '',
    zimbraDNSCheckHostname: domainAttrMap.zimbraDNSCheckHostname ?? '',
    zimbraPrefTimeZoneId: domainAttrMap.zimbraPrefTimeZoneId ?? NOT_SET,
    zimbraNotes: domainAttrMap.zimbraNotes ?? '',
    description: domainAttrMap.description ?? '',
    zimbraHelpAdminURL: domainAttrMap.zimbraHelpAdminURL ?? '',
    zimbraHelpDelegatedURL: domainAttrMap.zimbraHelpDelegatedURL ?? '',
    zimbraDomainDefaultCOSId: domainAttrMap.zimbraDomainDefaultCOSId ?? '',
    zimbraDomainMaxAccounts: domainAttrMap.zimbraDomainMaxAccounts ?? '',
    carbonioNotificationFrom: domainAttrMap.carbonioNotificationFrom ?? '',
    carbonioNotificationRecipients: buildNotificationRecipients(domainInformation),
    carbonioSearchSpecifiedDomainsByFeature: buildDomainsByFeature(domainInformation),
    domainQuotaGB: initialQuotaGB,
  };

  const { form, handleSave, handleCancel } = useDomainGeneralForm({
    defaultValues,
    zimbraId,
    isGlobalAdmin,
    isAdvanced,
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
      title={t('label.general_settings', 'General Settings')}
      unsavedChanges={isDirty}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <DomainBasicsSection
        form={form}
        domainName={domainName}
        domainId={zimbraId}
        domainCreationDate={domainCreationDate}
        cosItems={cosItems}
        isGlobalAdmin={isGlobalAdmin}
      />

      {isAdvanced && (
        <DomainQuotaSection form={form} domainName={domainName} isGlobalAdmin={isGlobalAdmin} />
      )}

      {isAdvanced && <DomainSearchSpecificDomainsSection form={form} domainName={domainName} />}

      <DomainNotificationsSection form={form} />

      <DomainCosLink
        cosMaxAccountList={cosMaxAccountList}
        domainId={zimbraId}
        defaultCosId={defaultValues.zimbraDomainDefaultCOSId}
        domainName={domainName}
      />

      <DomainDeleteSection
        domainId={zimbraId}
        domainName={domainName}
        domainStatusValue={form.state.values.zimbraDomainStatus}
        closedStatusValue={CLOSED}
      />
    </FormPageLayout>
    </Container>
  );
};

function buildDomainAttrMap(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Record<string, string> {
  const obj: Record<string, string> = {};
  if (!domainInformation?.length) return obj;
  domainInformation.forEach((item) => {
    if (!obj[item.n]) {
      obj[item.n] = item._content ?? '';
    }
  });
  return obj;
}

function buildNotificationRecipients(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Array<{ label: string }> {
  if (!domainInformation?.length) return [];
  return domainInformation
    .filter((item) => item.n === 'carbonioNotificationRecipients' && item._content)
    .map((item) => ({ label: item._content ?? '' }));
}

function buildDomainsByFeature(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Array<{ label: string }> {
  if (!domainInformation?.length) return [];
  return domainInformation
    .filter((item) => item.n === CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE && item._content)
    .map((item) => ({ label: item._content ?? '' }));
}

function buildCosMaxAccountList(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Array<CosMaxAccountValues> {
  if (!domainInformation?.length) return [];
  return domainInformation
    .filter((item) => item.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS)
    .map((item) => ({
      id: item._content?.split(':')[0] ?? '',
      value: item._content?.split(':')[1] ?? '-1',
    }));
}


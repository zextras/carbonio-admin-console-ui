/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { domainByIdKey } from '@zextras/ui-shared';
import { useRef } from 'react';

import {
  CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE,
  NOT_SET,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { useModifyDomain } from '../../../services/use-modify-domain';
import { useSetDomainQuota } from '../../../services/use-set-domain-quota';
import { useUnsetDomainQuota } from '../../../services/use-unset-domain-quota';
import { GbToBytes } from '../../utility/utils';
import { type DomainGeneralSettingsFormValues, domainGeneralSettingsSchema } from './schema';

type UseDomainGeneralFormArgs = {
  defaultValues: DomainGeneralSettingsFormValues;
  zimbraId: string;
  isGlobalAdmin: boolean;
  isAdvanced: boolean;
};

export function useDomainGeneralForm({
  defaultValues,
  zimbraId,
  isGlobalAdmin,
  isAdvanced,
}: UseDomainGeneralFormArgs) {
  const saveInFlightRef = useRef(false);
  const queryClient = useQueryClient();
  const modifyDomainMutation = useModifyDomain(zimbraId);
  const setQuotaMutation = useSetDomainQuota(zimbraId);
  const unsetQuotaMutation = useUnsetDomainQuota(zimbraId);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: domainGeneralSettingsSchema,
      onSubmit: domainGeneralSettingsSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const defaults = formApi.options.defaultValues;
      if (!defaults) return;

      const settingsChanged = hasSettingsChanged(value, defaults);
      const quotaChanged = isAdvanced && value.domainQuotaGB !== defaults.domainQuotaGB;

      try {
        if (settingsChanged) {
          await modifyDomainMutation.mutateAsync({
            id: zimbraId,
            _jsns: ZIMBRA_ADMIN_URN,
            a: createAttributes(value, isGlobalAdmin, isAdvanced),
          });
        }

        if (quotaChanged) {
          if (value.domainQuotaGB === '') {
            await unsetQuotaMutation.mutateAsync();
          } else {
            await setQuotaMutation.mutateAsync(GbToBytes(Number(value.domainQuotaGB)));
          }
        }

        formApi.reset(value, { keepDefaultValues: true });
        if (zimbraId) {
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 1) });
          queryClient.invalidateQueries({ queryKey: domainByIdKey(zimbraId, 0) });
          queryClient.invalidateQueries({ queryKey: domainQueryKeys.quota(zimbraId) });
        }
      } catch {
        // Mutation hooks already report errors via snackbar.
      }
    },
  });

  function handleSave(): void {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    void form.handleSubmit().finally(() => {
      saveInFlightRef.current = false;
    });
  }

  function handleCancel(): void {
    form.reset();
  }

  return { form, handleSave, handleCancel };
}

export type DomainGeneralSettingsFormApi = ReturnType<typeof useDomainGeneralForm>['form'];

function hasSettingsChanged(
  values: DomainGeneralSettingsFormValues,
  defaults: DomainGeneralSettingsFormValues,
): boolean {
  const keys: Array<keyof DomainGeneralSettingsFormValues> = [
    'zimbraDomainStatus',
    'zimbraPublicServiceProtocol',
    'zimbraPublicServicePort',
    'zimbraPublicServiceHostname',
    'zimbraDNSCheckHostname',
    'zimbraPrefTimeZoneId',
    'zimbraNotes',
    'description',
    'zimbraHelpAdminURL',
    'zimbraHelpDelegatedURL',
    'zimbraDomainDefaultCOSId',
    'zimbraDomainMaxAccounts',
    'carbonioNotificationFrom',
    'carbonioNotificationRecipients',
    'carbonioSearchSpecifiedDomainsByFeature',
  ];
  return keys.some((key) => JSON.stringify(values[key]) !== JSON.stringify(defaults[key]));
}

function createAttributes(
  values: DomainGeneralSettingsFormValues,
  isGlobalAdmin: boolean,
  isAdvanced: boolean,
): Array<{ n: string; _content: string }> {
  const attributes: Array<{ n: string; _content: string }> = [
    { n: 'zimbraNotes', _content: values.zimbraNotes },
    { n: 'description', _content: values.description },
    { n: 'zimbraDomainStatus', _content: values.zimbraDomainStatus },
    { n: 'zimbraPublicServicePort', _content: values.zimbraPublicServicePort },
    { n: 'zimbraDNSCheckHostname', _content: values.zimbraDNSCheckHostname },
    { n: 'zimbraHelpAdminURL', _content: values.zimbraHelpAdminURL },
    { n: 'zimbraHelpDelegatedURL', _content: values.zimbraHelpDelegatedURL },
    { n: 'zimbraPublicServiceHostname', _content: values.zimbraPublicServiceHostname },
    { n: 'carbonioNotificationFrom', _content: values.carbonioNotificationFrom },
    { n: 'zimbraPublicServiceProtocol', _content: values.zimbraPublicServiceProtocol },
  ];

  if (values.zimbraPrefTimeZoneId !== NOT_SET) {
    attributes.push({ n: 'zimbraPrefTimeZoneId', _content: values.zimbraPrefTimeZoneId });
  }
  if (values.zimbraDomainDefaultCOSId) {
    attributes.push({ n: 'zimbraDomainDefaultCOSId', _content: values.zimbraDomainDefaultCOSId });
  }
  if (isGlobalAdmin) {
    attributes.push({ n: 'zimbraDomainMaxAccounts', _content: values.zimbraDomainMaxAccounts });
  }

  values.carbonioNotificationRecipients.forEach((item) => {
    attributes.push({ n: 'carbonioNotificationRecipients', _content: item.label });
  });

  if (isAdvanced) {
    if (values.carbonioSearchSpecifiedDomainsByFeature.length) {
      values.carbonioSearchSpecifiedDomainsByFeature.forEach((item) => {
        attributes.push({ n: CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE, _content: item.label });
      });
    } else {
      attributes.push({ n: CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE, _content: '' });
    }
  }

  return attributes;
}

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { createResource } from './create-cal-resource-service';
import { createSignature } from './create-signature-service';
import { deleteCalendarResource } from './delete-cal-resource-service';
import { domainQueryKeys } from './domain-query-keys';
import { getCalenderResource } from './get-cal-resource-service';
import { getDelegateAuthRequest } from './get-delegate-auth-request';
import { modifyCalendarResource } from './modify-cal-resource-service';
import { renameCalendarResource } from './rename-cal-resource-service';
import { setPasswordRequest } from './set-password';

const RESOURCE_ATTRS =
  'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraLastLogonTimestamp,zimbraAccountStatus';

export type ResourceListParams = {
  domainName: string | undefined;
  query: string;
  sortBy: string;
  sortOrder: string;
  offset: number;
  limit: number;
};

export type ResourceAttribute = { n: string; _content: string };

export type ResourceEntry = {
  id: string;
  name: string;
  a: Array<ResourceAttribute>;
};

export type ResourceDetail = {
  displayName: string;
  mail: string;
  zimbraCalResType: string;
  zimbraAccountStatus: string;
  zimbraCalResAutoDeclineRecurring: string;
  zimbraCalResAutoAcceptDecline: string;
  zimbraCalResAutoDeclineIfBusy: string;
  zimbraCOSId: string;
  zimbraMailHost: string;
  zimbraCreateTimestamp: string;
  zimbraCalResMaxNumConflictsAllowed: string;
  zimbraCalResMaxPercentConflictsAllowed: string;
  zimbraNotes: string;
  zimbraPrefCalendarForwardInvitesTo: Array<string>;
  [key: string]: string | Array<string>;
};

export type SaveResourceInput = {
  resourceId: string;
  currentMail: string;
  newMail: string;
  password: string;
  attributes: Array<{ n: string; _content: string }>;
};

export type CreateResourceInput = {
  name: string;
  password: string;
  attributes: Array<{ n: string; _content: string }>;
  signatureList: Array<{ name: string; content: Array<{ _content: string }> }>;
  zimbraPrefCalendarAutoAcceptSignatureId: { value: string; label: string };
  zimbraPrefCalendarAutoDeclineSignatureId: { value: string; label: string };
  zimbraPrefCalendarAutoDenySignatureId: { value: string; label: string };
  resourceName: string;
};

export function useCalResourceList(params: ResourceListParams) {
  return useQuery({
    queryKey: domainQueryKeys.calResourceList(
      params.domainName ?? '',
      params.query,
      params.sortBy,
      params.sortOrder,
      params.offset,
      params.limit,
    ),
    queryFn: () =>
      searchDirectory({
        attr: RESOURCE_ATTRS,
        type: 'resources',
        domainName: params.domainName!,
        query: `${params.query}(&(!(zimbraIsSystemAccount=TRUE)))`,
        offset: params.offset,
        limit: params.limit,
        sortBy: params.sortBy,
        sortAscending: params.sortOrder as 'asc' | 'desc',
      }),
    enabled: !!params.domainName,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useCalResource(resourceId: string | undefined) {
  return useQuery({
    queryKey: domainQueryKeys.calResource(resourceId ?? ''),
    queryFn: async () => {
      const data = await getCalenderResource(resourceId!);
      return data?.calresource?.[0] ?? null;
    },
    enabled: !!resourceId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveCalResource(resourceId: string) {
  const queryClient = useQueryClient();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async (input: SaveResourceInput) => {
      const requests: Array<Promise<unknown>> = [];
      if (input.password) {
        requests.push(setPasswordRequest(input.resourceId, input.password));
      }
      if (input.currentMail !== input.newMail) {
        requests.push(renameCalendarResource(input.resourceId, input.newMail));
      }
      requests.push(modifyCalendarResource(input.resourceId, input.attributes));
      await Promise.all(requests);
    },
    onSuccess: () => {
      createSnackbar({
        key: 'save-resource-success',
        severity: 'success',
        label: t('label.changes_have_been_saved', 'The changes have been saved'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.calResource(resourceId) });
      queryClient.invalidateQueries({ queryKey: [...domainQueryKeys.all, 'cal-resource-list'] });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'save-resource-error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}

export function useDeleteCalResource() {
  const queryClient = useQueryClient();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: (resourceId: string) => deleteCalendarResource(resourceId),
    onSuccess: () => {
      createSnackbar({
        key: 'delete-resource-success',
        severity: 'success',
        label: t('label.resource_deleted_successfully_generic', 'Resource has been deleted successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      queryClient.invalidateQueries({ queryKey: [...domainQueryKeys.all, 'cal-resource-list'] });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'delete-resource-error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}

export function useDisableCalResource() {
  const queryClient = useQueryClient();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: (resourceId: string) =>
      modifyCalendarResource(resourceId, [{ n: 'zimbraAccountStatus', _content: 'closed' }]),
    onSuccess: () => {
      createSnackbar({
        key: 'disable-resource-success',
        severity: 'success',
        label: t('label.resource_disabled_successfully_generic', 'Resource has been disabled successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      queryClient.invalidateQueries({ queryKey: [...domainQueryKeys.all, 'cal-resource-list'] });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'disable-resource-error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}

export function useCreateCalResource() {
  const queryClient = useQueryClient();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async (input: CreateResourceInput) => {
      const data = await createResource(input.name, input.password, input.attributes);
      const resourceId: string = data?.calresource?.[0]?.id;
      if (!resourceId) {
        throw new Error('Resource creation returned no ID');
      }

      if (input.signatureList.length > 0) {
        type SignatureResult = { id: string; name: string } | undefined;
        type CreateSignatureResponse = {
          Body?: { CreateSignatureResponse?: { signature?: Array<SignatureResult> } };
        };
        const signatureResponses = await Promise.all(
          input.signatureList.map((sig) =>
            createSignature(resourceId, sig.name, sig.content[0]?._content),
          ),
        );
        const hasSignatureIds =
          input.zimbraPrefCalendarAutoAcceptSignatureId.value ||
          input.zimbraPrefCalendarAutoDeclineSignatureId.value ||
          input.zimbraPrefCalendarAutoDenySignatureId.value;
        if (hasSignatureIds) {
          const sigList = (signatureResponses as Array<CreateSignatureResponse>).map(
            (res) => res?.Body?.CreateSignatureResponse?.signature?.[0],
          );
          const signatureAttrList: Array<{ n: string; _content: string }> = [
            {
              n: 'zimbraPrefCalendarAutoAcceptSignatureId',
              _content: input.zimbraPrefCalendarAutoAcceptSignatureId.value
                ? (sigList.find(
                    (s) => s?.name === input.zimbraPrefCalendarAutoAcceptSignatureId.label,
                  )?.id ?? '')
                : '',
            },
            {
              n: 'zimbraPrefCalendarAutoDeclineSignatureId',
              _content: input.zimbraPrefCalendarAutoDeclineSignatureId.value
                ? (sigList.find(
                    (s) => s?.name === input.zimbraPrefCalendarAutoDeclineSignatureId.label,
                  )?.id ?? '')
                : '',
            },
            {
              n: 'zimbraPrefCalendarAutoDenySignatureId',
              _content: input.zimbraPrefCalendarAutoDenySignatureId.value
                ? (sigList.find(
                    (s) => s?.name === input.zimbraPrefCalendarAutoDenySignatureId.label,
                  )?.id ?? '')
                : '',
            },
          ];
          await modifyCalendarResource(resourceId, signatureAttrList);
        }
      }
      return resourceId;
    },
    onSuccess: (_, input) => {
      createSnackbar({
        key: 'create-resource-success',
        severity: 'success',
        label: t('label.create_resource_success_msg', {
          resourceName: input.resourceName,
          defaultValue: '{{resourceName}} has been created successfully',
        }),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      queryClient.invalidateQueries({ queryKey: [...domainQueryKeys.all, 'cal-resource-list'] });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'create-resource-error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}

export function useDelegateAuth() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: (resourceId: string) => getDelegateAuthRequest(resourceId),
    onSuccess: (data: { authToken?: Array<{ _content: string }> }) => {
      const authToken = data?.authToken?.[0]?._content;
      if (authToken) {
        globalThis.open(
          `https://${globalThis.location.hostname}/service/preauth?authtoken=${authToken}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
          'blank',
        );
      } else {
        createSnackbar({
          key: 'delegate-auth-error',
          severity: 'error',
          label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'delegate-auth-error',
        severity: 'error',
        label:
          error.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}

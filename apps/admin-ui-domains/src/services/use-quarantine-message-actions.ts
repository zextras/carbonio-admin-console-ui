/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { modifyConfigAttributes } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import type { IncompleteMessage } from '../views/global/global-quarantine/quarantine-types';
import { generateRandomString } from '../views/utility/utils';
import { bounceMsgRequest } from './bounce-message';
import { createAccountRequest } from './create-account';
import { deleteAccount } from './delete-account-service';
import { domainQueryKeys } from './domain-query-keys';
import { getAccountRequest } from './get-account';
import { msgActionRequest } from './message-action';
import { removeAttachmentsRequest } from './remove-attachments';

const SNACKBAR_OPTS = {
  autoHideTimeout: 3000,
  hideButton: true,
  replace: true,
} as const;

type QuarantineActionContext = {
  createSnackbar: ReturnType<typeof useSnackbar>;
  t: ReturnType<typeof useTranslation>[0];
};

function onErrorSnackbar({ createSnackbar, t }: QuarantineActionContext) {
  return (error: Error): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label:
        error?.message ||
        t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      ...SNACKBAR_OPTS,
    });
  };
}

export const useDeleteQuarantineMessage = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => msgActionRequest(id, 'delete'),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.message_deleted', 'Message deleted'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

export const useDeliverQuarantineMessage = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (msg: IncompleteMessage) => bounceMsgRequest(msg),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.message_delivered', 'Message delivered'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

export const useRemoveQuarantineAttachment = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, part }: { id: string; part: string }) => removeAttachmentsRequest(id, part),
    onSuccess: () => {
      createSnackbar({
        key: 'info',
        severity: 'info',
        label: t('quarantine.attachment_deleted', 'Attachment deleted'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

const QUARANTINE_ACCOUNT_ATTRIBUTES = {
  givenName: 'virus-quarantine',
  initials: '',
  sn: '',
  amavisBypassSpamChecks: 'TRUE',
  zimbraAttachmentsIndexingEnabled: 'FALSE',
  zimbraIsSystemResource: 'TRUE',
  zimbraHideInGal: 'TRUE',
  zimbraMailMessageLifetime: '7d',
  zimbraMailQuota: 0,
  description: 'System account for Anti-virus quarantine.',
} as const;

export const useRecreateQuarantineAccount = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      previousAccountName,
      defaultDomainName,
    }: {
      previousAccountName: string;
      defaultDomainName: string;
    }): Promise<string> => {
      const data = await createAccountRequest(
        { ...QUARANTINE_ACCOUNT_ATTRIBUTES },
        `virus-quarantine.${generateRandomString()}@${defaultDomainName}`,
        '',
      );
      const newName = data?.account?.[0]?.name;
      if (!newName) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      await modifyConfigAttributes([{ n: 'zimbraAmavisQuarantineAccount', _content: newName }]);
      if (previousAccountName) {
        const res = await getAccountRequest('', previousAccountName, 0);
        const previousId = res?.account?.[0]?.id;
        if (previousId) {
          await deleteAccount(previousId);
        }
      }
      return newName;
    },
    onSuccess: () => {
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.account_created_successfully', 'The account has been created successfully'),
        ...SNACKBAR_OPTS,
      });
      void queryClient.invalidateQueries({ queryKey: ['all-config'] });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineAccount() });
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
    },
    onError: onErrorSnackbar({ createSnackbar, t }),
  });
};

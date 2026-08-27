/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';

import type { useAddAccountAlias } from '../../../services/use-add-account-alias';
import type { useDeleteAccountAlias } from '../../../services/use-delete-account-alias';
import type { useModifyAccountAttributes } from '../../../services/use-modify-account-attributes';
import type { useRemoveDistributionListMember } from '../../../services/use-remove-distribution-list-member';
import type { useRenameAccount } from '../../../services/use-rename-account';
import type { useSetAccountQuota } from '../../../services/use-set-account-quota';
import type { useSetPassword } from '../../../services/use-set-password';

export type SaveDeps = {
  setPassword: ReturnType<typeof useSetPassword>;
  renameAccount: ReturnType<typeof useRenameAccount>;
  addAlias: ReturnType<typeof useAddAccountAlias>;
  deleteAlias: ReturnType<typeof useDeleteAccountAlias>;
  setAccountQuota: ReturnType<typeof useSetAccountQuota>;
  modifyAccountAttributes: ReturnType<typeof useModifyAccountAttributes>;
  removeDistributionListMember: ReturnType<typeof useRemoveDistributionListMember>;
  setCoreAttributes: (body: Record<string, unknown>) => Promise<unknown>;
};

export type SaveContext = {
  t: TFunction;
  successSnackbar: (label: string) => void;
  errorSnackbar: (label: string) => void;
  notifySaveError: (error?: { message?: string }) => void;

  flushAccountCache: () => Promise<void>;
  onSaved: () => void;
  onDomainRenamed: () => void;
  isAdvanced: boolean;
};

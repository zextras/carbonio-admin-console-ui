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

/**
 * Mutation hooks the save handlers orchestrate. Hooks own transport and their
 * own cache invalidation only; every user-facing snackbar is emitted through
 * the {@link SaveContext}.
 */
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

/** User-facing side effects shared by every save handler. */
export type SaveContext = {
  t: TFunction;
  successSnackbar: (label: string) => void;
  errorSnackbar: (label: string) => void;
  notifySaveError: (error?: { message?: string }) => void;
  /** Flushes the admin-side account cache; resolves immediately for non-global admins. */
  flushAccountCache: () => Promise<void>;
  onSaved: () => void;
  onDomainRenamed: () => void;
  isAdvanced: boolean;
};

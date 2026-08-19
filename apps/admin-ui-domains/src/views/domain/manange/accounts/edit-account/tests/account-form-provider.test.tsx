/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { addAccountAliasRequest } from '../../../../../../services/add-account-alias';
import { checkRightRequest } from '../../../../../../services/check-right';
import { deleteAccountAliasRequest } from '../../../../../../services/delete-account-alias';
import { modifyAccountRequest } from '../../../../../../services/modify-account';
import { removeDistributionListMember } from '../../../../../../services/remove-distributionlist-member-service';
import { renameAccountRequest } from '../../../../../../services/rename-account';
import { setAccountQuota } from '../../../../../../services/set-account-quota';
import { setPasswordRequest } from '../../../../../../services/set-password';
import { unsetAccountQuota } from '../../../../../../services/unset-account-quota';
import { useAccountDetail, useAccountSpecificDetail } from '../../../../../../services/use-account-detail';
import { useAccountGrants } from '../../../../../../services/use-account-grants';
import { useAccountMembership } from '../../../../../../services/use-account-membership';
import { useAccountQuota } from '../../../../../../services/use-account-quota';
import { useCosDetail } from '../../../../../../services/use-cos-detail';
import { useCredentialList, useOtpList } from '../../../../../../services/use-otp-credential-list';
import { useSignatures } from '../../../../../../services/use-signatures';
import { useUserSessions } from '../../../../../../services/use-user-sessions';
import { useAccountForm } from '../account-form-context';
import { AccountFormProvider, useIsAccountDirty } from '../account-form-provider';

vi.mock('@zextras/ui-shared', () => ({
  flushCache: vi.fn(),
  setCoreAttributes: vi.fn(),
  useIsAdvanced: () => false,
  useSnackbar: () => vi.fn(),
  useUserAccount: () => ({ name: 'admin@x.com' }),
  useUserSettings: () => ({ attrs: {} }),
}));

vi.mock('../../../../../../services/use-account-detail', () => ({
  useAccountDetail: vi.fn(),
  useAccountSpecificDetail: vi.fn(),
}));

vi.mock('../../../../../../services/use-cos-detail', () => ({ useCosDetail: vi.fn() }));
vi.mock('../../../../../../services/use-signatures', () => ({ useSignatures: vi.fn() }));
vi.mock('../../../../../../services/use-account-membership', () => ({
  useAccountMembership: vi.fn(),
}));
vi.mock('../../../../../../services/use-user-sessions', () => ({ useUserSessions: vi.fn() }));
vi.mock('../../../../../../services/use-otp-credential-list', () => ({
  useOtpList: vi.fn(),
  useCredentialList: vi.fn(),
}));
vi.mock('../../../../../../services/use-account-grants', () => ({
  useAccountGrants: vi.fn(),
}));
vi.mock('../../../../../../services/use-account-quota', () => ({ useAccountQuota: vi.fn() }));

vi.mock('../../../../../../services/modify-account', () => ({
  modifyAccountRequest: vi.fn(),
}));
vi.mock('../../../../../../services/rename-account', () => ({ renameAccountRequest: vi.fn() }));
vi.mock('../../../../../../services/set-password', () => ({ setPasswordRequest: vi.fn() }));
vi.mock('../../../../../../services/set-account-quota', () => ({ setAccountQuota: vi.fn() }));
vi.mock('../../../../../../services/unset-account-quota', () => ({ unsetAccountQuota: vi.fn() }));
vi.mock('../../../../../../services/add-account-alias', () => ({
  addAccountAlias: vi.fn(),
  addAccountAliasRequest: vi.fn(),
}));
vi.mock('../../../../../../services/delete-account-alias', () => ({
  deleteAccountAliasRequest: vi.fn(),
}));
vi.mock('../../../../../../services/remove-distributionlist-member-service', () => ({
  removeDistributionListMember: vi.fn(),
}));
vi.mock('../../../../../../services/check-right', () => ({ checkRightRequest: vi.fn() }));

const ACCOUNT_FIXTURE = {
  zimbraId: 'id-1',
  name: 'jane@example.com',
  sn: 'Smith',
  mail: '',
  uid: 'jane',
  domainName: 'example.com',
  deleteAdministrationRights: [],
};

const setupMocks = (): void => {
  currentAccountData = { ...ACCOUNT_FIXTURE };
  vi.mocked(useAccountDetail).mockImplementation(() => ({ data: currentAccountData } as any));
  vi.mocked(useAccountSpecificDetail).mockReturnValue({ data: {} } as any);
  vi.mocked(useCosDetail).mockReturnValue({ data: {} } as any);
  vi.mocked(useSignatures).mockReturnValue({ data: [] } as any);
  vi.mocked(useAccountMembership).mockReturnValue({ data: [] } as any);
  vi.mocked(useUserSessions).mockReturnValue({ data: [] } as any);
  vi.mocked(useOtpList).mockReturnValue({ data: [] } as any);
  vi.mocked(useCredentialList).mockReturnValue({ data: [] } as any);
  vi.mocked(useAccountGrants).mockReturnValue({ data: undefined, refetch: vi.fn() } as any);
  vi.mocked(useAccountQuota).mockReturnValue({ data: undefined } as any);
  vi.mocked(checkRightRequest).mockResolvedValue({ allow: true });
  vi.mocked(modifyAccountRequest).mockResolvedValue({ account: [] });
  vi.mocked(renameAccountRequest).mockResolvedValue({});
  vi.mocked(setPasswordRequest).mockResolvedValue({});
  vi.mocked(setAccountQuota).mockResolvedValue({ type: 'success' } as any);
  vi.mocked(unsetAccountQuota).mockResolvedValue({ type: 'success' } as any);
  vi.mocked(addAccountAliasRequest).mockResolvedValue({});
  vi.mocked(deleteAccountAliasRequest).mockResolvedValue({});
  vi.mocked(removeDistributionListMember).mockResolvedValue({});
};

const Probe = () => {
  const { form } = useAccountForm();
  const isDirty = useIsAccountDirty();
  return (
    <div>
      <span role="status">{String(isDirty)}</span>
      <button type="button" onClick={() => form.setFieldValue('sn', 'Doe')}>
        edit-sn
      </button>
      <button type="button" onClick={() => void form.handleSubmit()}>
        save
      </button>
    </div>
  );
};

let currentAccountData: Record<string, any> = { ...ACCOUNT_FIXTURE };

const renderProvider = (): { rerender: (node: React.ReactElement) => void } => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const tree = (
    <QueryClientProvider client={queryClient}>
      <AccountFormProvider
        account={{ id: 'id-1', name: 'jane@example.com' }}
        onSaved={vi.fn()}
        onDomainRenamed={vi.fn()}
      >
        <Probe />
      </AccountFormProvider>
    </QueryClientProvider>
  );
  const utils = render(tree);
  return { rerender: (node: React.ReactElement): void => utils.rerender(node) };
};

describe('AccountFormProvider', () => {
  it('starts clean, flips dirty on edit, clears after save', async () => {
    setupMocks();
    const { rerender } = renderProvider();

    expect(screen.getByRole('status').textContent).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'edit-sn' }));
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => {
      expect(modifyAccountRequest).toHaveBeenCalledWith('id-1', { sn: 'Doe' });
    });

    // simulate the post-save refetch returning the persisted values:
    // the provider invalidates accountDetail, the hook returns fresh data,
    // defaults update and isDirty clears (AGENTS.md post-save pattern)
    currentAccountData = { ...ACCOUNT_FIXTURE, sn: 'Doe' };
    rerender(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <AccountFormProvider
          account={{ id: 'id-1', name: 'jane@example.com' }}
          onSaved={vi.fn()}
          onDomainRenamed={vi.fn()}
        >
          <Probe />
        </AccountFormProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('false');
    });
  });

  it('aborts save with surname missing', async () => {
    setupMocks();
    vi.mocked(useAccountDetail).mockReturnValue({
      data: { ...ACCOUNT_FIXTURE, sn: '' },
    } as any);
    renderProvider();

    fireEvent.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => {
      expect(modifyAccountRequest).not.toHaveBeenCalled();
    });
  });
});

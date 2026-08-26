/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TOTAL_COMPUTED_QUOTA_LIMIT } from '../../../constants';
import { saveAliases } from '../save/save-aliases';
import { saveAdministrationRights, saveCoreAttributes, saveRemainingAttributes } from '../save/save-general';
import { savePassword } from '../save/save-password';
import { saveQuota } from '../save/save-quota';
import { saveRename } from '../save/save-rename';
import type { SaveContext, SaveDeps } from '../save/types';

function createDeps(): SaveDeps {
  return {
    setPassword: { mutateAsync: vi.fn().mockResolvedValue({}) },
    renameAccount: { mutateAsync: vi.fn().mockResolvedValue({}) },
    addAlias: { mutateAsync: vi.fn().mockResolvedValue({}) },
    deleteAlias: { mutateAsync: vi.fn().mockResolvedValue({}) },
    setAccountQuota: { mutateAsync: vi.fn().mockResolvedValue({ type: 'success' }) },
    modifyAccountAttributes: { mutateAsync: vi.fn().mockResolvedValue({ ok: true }) },
    removeDistributionListMember: { mutateAsync: vi.fn().mockResolvedValue({ ok: true }) },
    setCoreAttributes: vi.fn().mockResolvedValue({}),
  } as unknown as SaveDeps;
}

function createContext(overrides: Partial<SaveContext> = {}): SaveContext {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: ((key: string, fallback?: string) => fallback ?? key) as any,
    successSnackbar: vi.fn(),
    errorSnackbar: vi.fn(),
    notifySaveError: vi.fn(),
    flushAccountCache: vi.fn().mockResolvedValue(undefined),
    onSaved: vi.fn(),
    onDomainRenamed: vi.fn(),
    isAdvanced: true,
    ...overrides,
  };
}

describe('savePassword', () => {
  let deps: SaveDeps;
  let ctx: SaveContext;

  beforeEach(() => {
    deps = createDeps();
    ctx = createContext();
  });

  it('skips when no password fields are set', async () => {
    const modifiedKeys = ['displayName'];
    const result = await savePassword(
      { password: '', repeatPassword: '' },
      { zimbraId: 'acc-1' },
      modifiedKeys,
      deps,
      ctx,
    );
    expect(result).toBe('skipped');
    expect(deps.setPassword.mutateAsync).not.toHaveBeenCalled();
    expect(modifiedKeys).toEqual(['displayName']);
  });

  it('skips when the password fields are unchanged', async () => {
    const result = await savePassword(
      { password: 'secret123', repeatPassword: 'secret123' },
      { zimbraId: 'acc-1' },
      ['displayName'],
      deps,
      ctx,
    );
    expect(result).toBe('skipped');
    expect(deps.setPassword.mutateAsync).not.toHaveBeenCalled();
  });

  it('is invalid for a password shorter than 6 characters', async () => {
    const result = await savePassword(
      { password: 'abc', repeatPassword: 'abc' },
      { zimbraId: 'acc-1' },
      ['password'],
      deps,
      ctx,
    );
    expect(result).toBe('invalid');
    expect(ctx.errorSnackbar).toHaveBeenCalledWith('Password should be more than 5 character');
    expect(deps.setPassword.mutateAsync).not.toHaveBeenCalled();
  });

  it('is invalid when password and repeat do not match', async () => {
    const result = await savePassword(
      { password: 'secret123', repeatPassword: 'other1234' },
      { zimbraId: 'acc-1' },
      ['password', 'repeatPassword'],
      deps,
      ctx,
    );
    expect(result).toBe('invalid');
    expect(ctx.errorSnackbar).toHaveBeenCalledWith('Passwords do not match');
    expect(deps.setPassword.mutateAsync).not.toHaveBeenCalled();
  });

  it('sets the password and removes the keys from modifiedKeys', async () => {
    const modifiedKeys = ['password', 'repeatPassword', 'displayName'];
    const result = await savePassword(
      { password: 'secret123', repeatPassword: 'secret123' },
      { zimbraId: 'acc-1' },
      modifiedKeys,
      deps,
      ctx,
    );
    expect(result).toBe('changed');
    expect(deps.setPassword.mutateAsync).toHaveBeenCalledWith({
      id: 'acc-1',
      newPassword: 'secret123',
    });
    expect(modifiedKeys).toEqual(['displayName']);
  });
});

describe('saveRename', () => {
  let deps: SaveDeps;
  let ctx: SaveContext;

  beforeEach(() => {
    deps = createDeps();
    ctx = createContext();
  });

  it('does nothing when uid and domain are unchanged', async () => {
    await saveRename(
      { uid: 'user', domainName: 'example.com' },
      { zimbraId: 'acc-1' },
      ['displayName'],
      deps,
      ctx,
    );
    expect(deps.renameAccount.mutateAsync).not.toHaveBeenCalled();
    expect(ctx.onSaved).not.toHaveBeenCalled();
  });

  it('renames to uid@domain, notifies and drops the uid key', async () => {
    const modifiedKeys = ['uid', 'displayName'];
    await saveRename(
      { uid: 'renamed', domainName: 'example.com' },
      { zimbraId: 'acc-1' },
      modifiedKeys,
      deps,
      ctx,
    );
    expect(deps.renameAccount.mutateAsync).toHaveBeenCalledWith({
      id: 'acc-1',
      newName: 'renamed@example.com',
    });
    expect(ctx.successSnackbar).toHaveBeenCalledWith('Changes have been saved successfully');
    expect(ctx.onSaved).toHaveBeenCalledTimes(1);
    expect(ctx.onDomainRenamed).not.toHaveBeenCalled();
    expect(modifiedKeys).toEqual(['displayName']);
  });

  it('calls onDomainRenamed when the domain changed', async () => {
    await saveRename(
      { uid: 'user', domainName: 'new.com' },
      { zimbraId: 'acc-1' },
      ['domainName'],
      deps,
      ctx,
    );
    expect(ctx.onDomainRenamed).toHaveBeenCalledTimes(1);
  });

  it('still calls onSaved when the rename fails', async () => {
    deps.renameAccount.mutateAsync = vi.fn().mockRejectedValue(new Error('rename failed'));
    await saveRename(
      { uid: 'renamed', domainName: 'example.com' },
      { zimbraId: 'acc-1' },
      ['uid'],
      deps,
      ctx,
    );
    expect(ctx.notifySaveError).toHaveBeenCalledWith(new Error('rename failed'));
    expect(ctx.onSaved).toHaveBeenCalledTimes(1);
  });
});

describe('saveAliases', () => {
  let deps: SaveDeps;
  let ctx: SaveContext;

  beforeEach(() => {
    deps = createDeps();
    ctx = createContext();
  });

  it('does nothing when mail is unchanged', () => {
    const modifiedKeys = ['displayName'];
    saveAliases({ mail: 'a@x.com' }, { zimbraId: 'acc-1', mail: 'a@x.com' }, modifiedKeys, deps, ctx);
    expect(deps.addAlias.mutateAsync).not.toHaveBeenCalled();
    expect(deps.deleteAlias.mutateAsync).not.toHaveBeenCalled();
    expect(modifiedKeys).toEqual(['displayName']);
  });

  it('adds new aliases and removes dropped ones', async () => {
    const modifiedKeys = ['mail'];
    saveAliases(
      { mail: 'keep@x.com,new@x.com' },
      { zimbraId: 'acc-1', mail: 'keep@x.com,old@x.com' },
      modifiedKeys,
      deps,
      ctx,
    );
    await vi.waitFor(() => {
      expect(deps.deleteAlias.mutateAsync).toHaveBeenCalledWith({
        id: 'acc-1',
        alias: 'old@x.com',
      });
      expect(deps.addAlias.mutateAsync).toHaveBeenCalledWith({ id: 'acc-1', alias: 'new@x.com' });
    });
    expect(modifiedKeys).toEqual([]);
  });

  it('reports alias failures through notifySaveError', async () => {
    deps.deleteAlias.mutateAsync = vi.fn().mockRejectedValue(new Error('boom'));
    saveAliases(
      { mail: 'keep@x.com' },
      { zimbraId: 'acc-1', mail: 'keep@x.com,old@x.com' },
      ['mail'],
      deps,
      ctx,
    );
    await vi.waitFor(() => {
      expect(ctx.notifySaveError).toHaveBeenCalledWith(new Error('boom'));
    });
  });
});

describe('saveQuota', () => {
  let deps: SaveDeps;
  let ctx: SaveContext;

  beforeEach(() => {
    deps = createDeps();
    ctx = createContext();
  });

  it('sets a limited quota and drops the quota key', async () => {
    const modifiedKeys = [TOTAL_COMPUTED_QUOTA_LIMIT];
    saveQuota(
      { zimbraId: 'acc-1', totalComputedQuotaLimit: { type: 'limited', value: 1024 } },
      modifiedKeys,
      deps,
      ctx,
    );
    expect(deps.setAccountQuota.mutateAsync).toHaveBeenCalledWith({
      accountId: 'acc-1',
      limit: { type: 'limited', value: 1024 },
    });
    expect(modifiedKeys).toEqual([]);
    await vi.waitFor(() => {
      expect(ctx.successSnackbar).toHaveBeenCalledWith('Changes have been saved successfully');
    });
  });

  it('passes an unlimited value so the hook unsets the quota', () => {
    saveQuota(
      { zimbraId: 'acc-1', totalComputedQuotaLimit: { type: 'unlimited' } },
      [TOTAL_COMPUTED_QUOTA_LIMIT],
      deps,
      ctx,
    );
    expect(deps.setAccountQuota.mutateAsync).toHaveBeenCalledWith({
      accountId: 'acc-1',
      limit: { type: 'unlimited' },
    });
  });

  it('is a no-op on non-advanced builds', () => {
    const ctxBasic = createContext({ isAdvanced: false });
    saveQuota(
      { zimbraId: 'acc-1', totalComputedQuotaLimit: { type: 'limited', value: 1024 } },
      [TOTAL_COMPUTED_QUOTA_LIMIT],
      deps,
      ctxBasic,
    );
    expect(deps.setAccountQuota.mutateAsync).not.toHaveBeenCalled();
  });

  it('shows the service error message when the quota save fails', async () => {
    deps.setAccountQuota.mutateAsync = vi.fn().mockRejectedValue(new Error('quota failed'));
    saveQuota(
      { zimbraId: 'acc-1', totalComputedQuotaLimit: { type: 'limited', value: 1024 } },
      [TOTAL_COMPUTED_QUOTA_LIMIT],
      deps,
      ctx,
    );
    await vi.waitFor(() => {
      expect(ctx.errorSnackbar).toHaveBeenCalledWith('quota failed');
    });
  });
});

describe('saveAdministrationRights', () => {
  it('removes one list membership per revoked right', async () => {
    const deps = createDeps();
    const ctx = createContext();
    saveAdministrationRights(
      {
        name: 'user@example.com',
        deleteAdministrationRights: [{ id: 'dl-1' }, { id: 'dl-2' }],
      },
      ['zimbraIsAdminAccount'],
      deps,
      ctx,
    );
    await vi.waitFor(() => {
      expect(deps.removeDistributionListMember.mutateAsync).toHaveBeenCalledWith({
        listId: 'dl-1',
        member: 'user@example.com',
      });
      expect(deps.removeDistributionListMember.mutateAsync).toHaveBeenCalledWith({
        listId: 'dl-2',
        member: 'user@example.com',
      });
    });
  });

  it('does nothing when the admin flag was not modified', () => {
    const deps = createDeps();
    saveAdministrationRights(
      { name: 'user@example.com', deleteAdministrationRights: [{ id: 'dl-1' }] },
      ['displayName'],
      deps,
      createContext(),
    );
    expect(deps.removeDistributionListMember.mutateAsync).not.toHaveBeenCalled();
  });
});

describe('saveCoreAttributes', () => {
  it('builds the core-attributes body only for modified flags', async () => {
    const deps = createDeps();
    const ctx = createContext();
    const modifiedKeys = ['backupSelfUndeleteAllowed', 'displayName'];
    await saveCoreAttributes(
      { zimbraId: 'acc-1', backupSelfUndeleteAllowed: true },
      modifiedKeys,
      deps,
      ctx,
    );
    expect(deps.setCoreAttributes).toHaveBeenCalledWith({
      backupSelfUndeleteAllowed: {
        value: true,
        objectName: 'acc-1',
        configType: 'account',
      },
    });
    expect(ctx.successSnackbar).toHaveBeenCalledWith('Changes have been saved successfully');
    expect(modifiedKeys).toEqual(['displayName']);
  });

  it('skips when no core attribute changed', async () => {
    const deps = createDeps();
    await saveCoreAttributes({ zimbraId: 'acc-1' }, ['displayName'], deps, createContext());
    expect(deps.setCoreAttributes).not.toHaveBeenCalled();
  });
});

describe('saveRemainingAttributes', () => {
  let deps: SaveDeps;
  let ctx: SaveContext;
  let finalize: () => void;

  beforeEach(() => {
    deps = createDeps();
    ctx = createContext();
    finalize = vi.fn();
  });

  it('sends the remaining keys through ModifyAccount and finalizes', async () => {
    const modifiedKeys = ['displayName'];
    await saveRemainingAttributes(
      { displayName: 'New Name' },
      { zimbraId: 'acc-1' },
      modifiedKeys,
      false,
      deps,
      ctx,
      finalize,
    );
    expect(deps.modifyAccountAttributes.mutateAsync).toHaveBeenCalledWith({
      id: 'acc-1',
      modifiedData: { displayName: 'New Name' },
    });
    expect(ctx.successSnackbar).toHaveBeenCalledWith('Changes have been saved successfully');
    expect(finalize).toHaveBeenCalledTimes(1);
  });

  it('masks the password field on a password-only save', async () => {
    const values: Record<string, any> = {};
    await saveRemainingAttributes(values, { zimbraId: 'acc-1' }, [], true, deps, ctx, finalize);
    expect(deps.modifyAccountAttributes.mutateAsync).not.toHaveBeenCalled();
    expect(ctx.successSnackbar).toHaveBeenCalledWith('User password set successfully');
    expect(values.userPassword).toBe('VALUE-BLOCKED');
    expect(values.zimbraPasswordMustChange).toBe('FALSE');
    expect(finalize).toHaveBeenCalledTimes(1);
  });

  it('does not finalize when ModifyAccount fails', async () => {
    deps.modifyAccountAttributes.mutateAsync = vi.fn().mockRejectedValue(new Error('nope'));
    await saveRemainingAttributes(
      { displayName: 'New Name' },
      { zimbraId: 'acc-1' },
      ['displayName'],
      false,
      deps,
      ctx,
      finalize,
    );
    expect(ctx.notifySaveError).toHaveBeenCalledWith(new Error('nope'));
    expect(finalize).not.toHaveBeenCalled();
  });
});

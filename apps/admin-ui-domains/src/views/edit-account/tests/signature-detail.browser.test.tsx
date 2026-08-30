/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

const mockCreateSignature = vi.hoisted(() => vi.fn());
const mockDeleteSignature = vi.hoisted(() => vi.fn());
const mockModifySignature = vi.hoisted(() => vi.fn());

vi.mock('../../../services/create-signature-service', () => ({
  createSignature: mockCreateSignature,
}));
vi.mock('../../../services/delete-signature-service', () => ({
  deleteSignature: mockDeleteSignature,
}));
vi.mock('../../../services/modify-signature-service', () => ({
  modifySignature: mockModifySignature,
}));
// TinyMCE is out of scope: stub the composer with a plain textarea driving
// the same onEditorChange([_, content]) contract
vi.mock('../../../composer/composer', () => ({
  Composer: ({
    onEditorChange,
  }: {
    onEditorChange: (ev: Array<unknown>) => void;
  }): React.ReactElement => (
    <textarea
      aria-label="signature-content"
      onChange={(e): void => onEditorChange([null, e.target.value])}
    />
  ),
}));

import { SignatureDetail } from '../signature-detail/signature-detail';
import { AccountFormTestProvider } from './account-form-test-provider';

const SIGNATURES = [
  {
    id: 'sig-1',
    name: 'work signature',
    content: [{ type: 'text/plain', _content: 'first content' }],
  },
  {
    id: 'sig-2',
    name: 'personal signature',
    content: [{ type: 'text/plain', _content: 'second content' }],
  },
];

function setupTest(): void {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  setupBrowserTest(
    <AccountFormTestProvider values={{ zimbraId: 'acc-1' }}>
      <SignatureDetail isEditable signatureList={SIGNATURES} accountId="acc-1" />
    </AccountFormTestProvider>,
    { queryClient },
  );
}

describe('SignatureDetail (browser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSignature.mockResolvedValue({
      Body: { CreateSignatureResponse: { signature: [{ id: 'sig-new', name: 'new one' }] } },
    });
    mockModifySignature.mockResolvedValue({ Body: { ModifySignatureResponse: {} } });
    mockDeleteSignature.mockResolvedValue({ Body: { DeleteSignatureResponse: {} } });
  });

  it('renders the signature rows from the provided list', async () => {
    setupTest();

    await expect.element(page.getByText('work signature')).toBeVisible();
    await expect.element(page.getByText('personal signature')).toBeVisible();
  });

  it('creates a signature through the dialog', async () => {
    setupTest();

    await page.getByRole('button', { name: 'Add' }).click();
    await expect.element(page.getByText('New Signature')).toBeVisible();

    const saveButton = page.getByRole('button', { name: 'Add to the list' });
    await expect.element(saveButton).toBeDisabled();

    await page
      .getByRole('textbox', { name: 'Name of Signature' })
      .fill('fresh signature');
    await page.getByRole('textbox', { name: 'signature-content' }).fill('fresh body');
    await expect.element(saveButton).toBeEnabled();
    await saveButton.click();

    expect(mockCreateSignature).toHaveBeenCalledWith('acc-1', 'fresh signature', 'fresh body');
    await expect.element(page.getByText('New Signature')).not.toBeInTheDocument();
  });

  it('edits the selected signature with prefilled values', async () => {
    setupTest();

    await page.getByText('work signature').click();

    const editButton = page.getByRole('button', { name: 'Edit' });
    await expect.element(editButton).toBeEnabled();
    await editButton.click();

    await expect.element(page.getByText('Edit Signature')).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Name of Signature' }))
      .toHaveValue('work signature');

    await page
      .getByRole('textbox', { name: 'Name of Signature' })
      .fill('renamed signature');
    await page.getByRole('textbox', { name: 'signature-content' }).fill('edited body');
    await page.getByRole('button', { name: 'Add to the list' }).click();

    expect(mockModifySignature).toHaveBeenCalledWith(
      'acc-1',
      'sig-1',
      'renamed signature',
      'edited body',
    );
    await expect.element(page.getByText('Edit Signature')).not.toBeInTheDocument();
  });

  it('deletes the selected signature', async () => {
    setupTest();

    await page.getByText('personal signature').click();

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await expect.element(deleteButton).toBeEnabled();
    await deleteButton.click();

    expect(mockDeleteSignature).toHaveBeenCalledWith('acc-1', 'sig-2');
  });

  it('resets the editor state when the dialog is cancelled', async () => {
    setupTest();

    await page.getByRole('button', { name: 'Add' }).click();
    await page
      .getByRole('textbox', { name: 'Name of Signature' })
      .fill('should be discarded');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(page.getByText('New Signature')).not.toBeInTheDocument();

    await page.getByRole('button', { name: 'Add' }).click();
    await expect
      .element(page.getByRole('textbox', { name: 'Name of Signature' }))
      .toHaveValue('');
  });

  it('renders the search input and accepts typing', async () => {
    setupTest();

    const searchInput = page.getByRole('textbox', { name: 'Search for a signature' });
    await expect.element(searchInput).toBeEnabled();
    await searchInput.fill('work');
  });
});

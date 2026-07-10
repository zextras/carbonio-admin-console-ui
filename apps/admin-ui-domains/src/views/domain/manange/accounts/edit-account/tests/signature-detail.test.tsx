/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen, waitFor } from '@testing-library/react';
import { setupTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateSnackbar = vi.fn();

vi.mock('@zextras/ui-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-components')>();
  return {
    ...actual,
    useSnackbar: () => mockCreateSnackbar,
    SnackbarManager: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock('../../../../../../composer/composer', () => ({
  default: ({ onEditorChange }: { onEditorChange?: (values: [string, string]) => void }) => (
    <textarea
      data-testid="mock-composer"
      onChange={(e): void => onEditorChange?.([e.target.value, e.target.value])}
    />
  ),
}));

vi.mock('../../../../../../services/create-signature-service', () => ({
  createSignature: vi.fn(),
}));

vi.mock('../../../../../../services/delete-signature-service', () => ({
  deleteSignature: vi.fn(),
}));

vi.mock('../../../../../../services/modify-signature-service', () => ({
  modifySignature: vi.fn(),
}));

import { createSignature } from '../../../../../../services/create-signature-service';
import { deleteSignature } from '../../../../../../services/delete-signature-service';
import { modifySignature } from '../../../../../../services/modify-signature-service';
import { SignatureDetail } from '../signature-detail';

const defaultProps = {
  isEditable: true,
  signatureList: [],
  setSignatureList: vi.fn(),
  signatureItems: [],
  setSignatureItems: vi.fn(),
  accountId: 'test-account-id',
  hideSearchBar: false,
};

describe('SignatureDetail - Create signature API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSnackbar.mockClear();
  });

  it('should show error snackbar when API returns Fault response', async () => {
    const faultResponse = {
      Body: {
        Fault: {
          Reason: {
            Text: 'Signature already exists',
          },
        },
      },
    };
    vi.mocked(createSignature).mockResolvedValue(faultResponse);

    const { user } = setupTest(<SignatureDetail {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Add/i }));

    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.type(nameInput, 'Test Signature');

    const editorContent = screen.getByTestId('mock-composer');
    await user.type(editorContent, 'Test content');

    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    await waitFor(() => {
      expect(mockCreateSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          label: 'Signature already exists',
        }),
      );
    });
  });

  it('should add signature to list when API returns success', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();
    const successResponse = {
      Body: {
        CreateSignatureResponse: {
          signature: [
            {
              id: 'new-sig-id',
              name: 'New Signature',
            },
          ],
        },
      },
    };
    vi.mocked(createSignature).mockResolvedValue(successResponse);

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Add/i }));

    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.type(nameInput, 'New Signature');

    const editorContent = screen.getByTestId('mock-composer');
    await user.type(editorContent, 'Signature content');

    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    await waitFor(() => {
      expect(setSignatureList).toHaveBeenCalled();
      expect(setSignatureItems).toHaveBeenCalled();
    });
  });

  it('should handle undefined signature array in API response gracefully', async () => {
    const setSignatureList = vi.fn();
    const responseWithUndefinedSignature = {
      Body: {
        CreateSignatureResponse: {
          // signature array is undefined
        },
      },
    };
    vi.mocked(createSignature).mockResolvedValue(responseWithUndefinedSignature);

    const { user } = setupTest(
      <SignatureDetail {...defaultProps} setSignatureList={setSignatureList} />,
    );

    await user.click(screen.getByRole('button', { name: /Add/i }));

    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.type(nameInput, 'Test Signature');

    const editorContent = screen.getByTestId('mock-composer');
    await user.type(editorContent, 'Content');

    // Should not crash when clicking - optional chaining handles undefined
    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    // Verify API was called - component doesn't crash with undefined signature
    await waitFor(() => {
      expect(createSignature).toHaveBeenCalled();
    });
  });

  it('should create signature locally when no accountId provided', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        accountId={undefined}
        signatureList={[]}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Add/i }));

    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.type(nameInput, 'Local Signature');

    const editorContent = screen.getByTestId('mock-composer');
    await user.type(editorContent, 'Local content');

    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    await waitFor(() => {
      expect(setSignatureList).toHaveBeenCalled();
      expect(setSignatureItems).toHaveBeenCalled();
    });

    // createSignature should NOT be called when no accountId
    expect(createSignature).not.toHaveBeenCalled();
  });
});

describe('SignatureDetail - Delete signature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call deleteSignature API when deleting with accountId', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();
    const existingSignature = {
      id: 'sig-1',
      name: 'Existing Signature',
      content: [{ type: 'text/plain', _content: 'Content' }],
    };

    vi.mocked(deleteSignature).mockResolvedValue({});

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        signatureList={[existingSignature]}
        signatureItems={[{ label: 'Existing Signature', value: 'sig-1' }]}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    // Click on signature row to select it
    const signatureRow = screen.getByText('Existing Signature');
    await user.click(signatureRow);

    // Click delete button
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSignature).toHaveBeenCalledWith('test-account-id', 'sig-1');
    });
  });

  it('should delete signature locally when no accountId', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();
    const existingSignature = {
      id: 'sig-1',
      name: 'Local Signature',
      content: [{ type: 'text/plain', _content: 'Content' }],
    };

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        accountId={undefined}
        signatureList={[existingSignature]}
        signatureItems={[{ label: 'Local Signature', value: 'sig-1' }]}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    // Click on signature row to select it
    const signatureRow = screen.getByText('Local Signature');
    await user.click(signatureRow);

    // Click delete button
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(setSignatureList).toHaveBeenCalled();
      expect(setSignatureItems).toHaveBeenCalled();
    });

    // deleteSignature should NOT be called when no accountId
    expect(deleteSignature).not.toHaveBeenCalled();
  });
});

describe('SignatureDetail - Modify signature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call modifySignature API when editing with accountId', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();
    const existingSignature = {
      id: 'sig-1',
      name: 'Original Name',
      content: [{ type: 'text/plain', _content: 'Original content' }],
    };

    vi.mocked(modifySignature).mockResolvedValue({
      Body: { ModifySignatureResponse: {} },
    });

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        signatureList={[existingSignature]}
        signatureItems={[{ label: 'Original Name', value: 'sig-1' }]}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    // Click on signature row to select it
    const signatureRow = screen.getByText('Original Name');
    await user.click(signatureRow);

    // Click edit button
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    // Modify signature name
    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Modified Name');

    // Submit
    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    await waitFor(() => {
      expect(modifySignature).toHaveBeenCalled();
    });
  });

  it('should modify signature locally when no accountId', async () => {
    const setSignatureList = vi.fn();
    const setSignatureItems = vi.fn();
    const existingSignature = {
      id: 'sig-1',
      name: 'Original Name',
      content: [{ type: 'text/plain', _content: 'Original content' }],
    };

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        accountId={undefined}
        signatureList={[existingSignature]}
        signatureItems={[{ label: 'Original Name', value: 'sig-1' }]}
        setSignatureList={setSignatureList}
        setSignatureItems={setSignatureItems}
      />,
    );

    // Click on signature row to select it
    const signatureRow = screen.getByText('Original Name');
    await user.click(signatureRow);

    // Click edit button
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    // Modify signature name
    const nameInput = screen.getByRole('textbox', { name: /Name of Signature/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Modified Name');

    // Submit
    await user.click(screen.getByRole('button', { name: /Add to the list/i }));

    await waitFor(() => {
      expect(setSignatureList).toHaveBeenCalled();
    });

    // modifySignature should NOT be called when no accountId
    expect(modifySignature).not.toHaveBeenCalled();
  });
});

describe('SignatureDetail - UI states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when signature list is empty', async () => {
    setupTest(<SignatureDetail {...defaultProps} signatureList={[]} />);

    await waitFor(() => {
      expect(screen.getByText('This list is empty.')).toBeTruthy();
    });
  });

  it('should disable edit button when no signature selected', async () => {
    setupTest(<SignatureDetail {...defaultProps} signatureList={[]} />);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    expect(editButton).toHaveProperty('disabled', true);
  });

  it('should disable delete button when no signature selected', async () => {
    setupTest(<SignatureDetail {...defaultProps} signatureList={[]} />);

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    expect(deleteButton).toHaveProperty('disabled', true);
  });

  it('should filter signatures based on search input', async () => {
    const signature1 = {
      id: 'sig-1',
      name: 'Work Signature',
      content: [{ type: 'text/plain', _content: 'Work content' }],
    };
    const signature2 = {
      id: 'sig-2',
      name: 'Personal Signature',
      content: [{ type: 'text/plain', _content: 'Personal content' }],
    };
    const setSignatureList = vi.fn();

    const { user } = setupTest(
      <SignatureDetail
        {...defaultProps}
        signatureList={[signature1, signature2]}
        setSignatureList={setSignatureList}
      />,
    );

    // Type in search box
    const searchInput = screen.getByRole('textbox', { name: /Search for a signature/i });
    await user.type(searchInput, 'Work');

    // setSignatureList should be called to filter
    await waitFor(() => {
      expect(setSignatureList).toHaveBeenCalled();
    });
  });

  it('should close modal when cancel is clicked', async () => {
    const { user } = setupTest(<SignatureDetail {...defaultProps} />);

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /Add/i }));

    // Verify modal is open
    expect(screen.getByRole('textbox', { name: /Name of Signature/i })).toBeTruthy();

    // Click cancel
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: /Name of Signature/i })).toBeNull();
    });
  });
});

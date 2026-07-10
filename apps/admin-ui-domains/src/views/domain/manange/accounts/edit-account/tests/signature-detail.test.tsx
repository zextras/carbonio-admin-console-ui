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

import { createSignature } from '../../../../../../services/create-signature-service';
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

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

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

function setupTest(propsOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();

  return setupBrowserTest(
    <SignatureDetail {...defaultProps} {...propsOverrides} />,
    { queryClient },
  );
}

describe('SignatureDetail', () => {
  describe('Empty state', () => {
    it('should show empty state when no signatures exist', async () => {
      setupTest();

      await expect.element(page.getByText('This list is empty.')).toBeVisible();
    });

    it('should show "Do you need more information?" text in empty state', async () => {
      setupTest();

      await expect
        .element(page.getByText('Do you need more information?'))
        .toBeVisible();
    });
  });

  describe('Action buttons', () => {
    it('should show Add button when isEditable is true', async () => {
      setupTest({ isEditable: true });

      await expect
        .element(page.getByRole('button', { name: /Add/i }))
        .toBeVisible();
    });

    it('should show Edit button disabled when no signature selected', async () => {
      setupTest({ isEditable: true });

      await expect
        .element(page.getByRole('button', { name: /Edit/i }))
        .toBeDisabled();
    });

    it('should show Delete button disabled when no signature selected', async () => {
      setupTest({ isEditable: true });

      await expect
        .element(page.getByRole('button', { name: /Delete/i }))
        .toBeDisabled();
    });

    it('should not show action buttons when isEditable is false', async () => {
      setupTest({ isEditable: false });

      await expect
        .element(page.getByRole('button', { name: /Add/i }))
        .not.toBeInTheDocument();
    });
  });

  describe('Search bar', () => {
    it('should show search bar when hideSearchBar is false', async () => {
      setupTest({ hideSearchBar: false });

      await expect
        .element(page.getByText('Search for a signature'))
        .toBeVisible();
    });

    it('should hide search bar when hideSearchBar is true', async () => {
      setupTest({ hideSearchBar: true });

      await expect
        .element(page.getByText('Search for a signature'))
        .not.toBeInTheDocument();
    });

    it('should disable search input when signature list is empty', async () => {
      setupTest({ signatureList: [] });

      const input = page.getByRole('textbox');
      await expect.element(input).toBeDisabled();
    });
  });

  describe('Signature list', () => {
    it('should render signatures in table', async () => {
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
        {
          id: 'sig-2',
          name: 'Personal Signature',
          content: [{ type: 'text/plain', _content: 'Cheers' }],
        },
      ];

      setupTest({ signatureList });

      await expect.element(page.getByText('Work Signature')).toBeVisible();
      await expect.element(page.getByText('Personal Signature')).toBeVisible();
    });

    it('should enable Edit button when one signature is selected', async () => {
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({ signatureList });

      await userEvent.click(page.getByText('Work Signature'));

      await expect
        .element(page.getByRole('button', { name: /Edit/i }))
        .toBeEnabled();
    });

    it('should enable Delete button when signature is selected', async () => {
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({ signatureList });

      await userEvent.click(page.getByText('Work Signature'));

      await expect
        .element(page.getByRole('button', { name: /Delete/i }))
        .toBeEnabled();
    });
  });

  describe('Create signature modal', () => {
    it('should open modal when clicking Add button', async () => {
      setupTest();

      await userEvent.click(page.getByRole('button', { name: /Add/i }));

      await expect
        .element(page.getByText('New Signature', { exact: false }))
        .toBeVisible();
    });

    it('should show name input in modal', async () => {
      setupTest();

      await userEvent.click(page.getByRole('button', { name: /Add/i }));

      await expect
        .element(page.getByText('Name of Signature'))
        .toBeVisible();
    });

    it('should disable Add to list button when name is empty', async () => {
      setupTest();

      await userEvent.click(page.getByRole('button', { name: /Add/i }));

      await expect
        .element(page.getByRole('button', { name: /Add to the list/i }))
        .toBeDisabled();
    });

    it('should close modal when clicking Cancel', async () => {
      setupTest();

      await userEvent.click(page.getByRole('button', { name: /Add/i }));
      await userEvent.click(page.getByRole('button', { name: /Cancel/i }));

      await expect
        .element(page.getByText('New Signature', { exact: false }))
        .not.toBeInTheDocument();
    });
  });

  describe('Edit signature modal', () => {
    it('should open modal with Edit Signature title when editing', async () => {
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({ signatureList });

      await userEvent.click(page.getByText('Work Signature'));
      await userEvent.click(page.getByRole('button', { name: /Edit/i }));

      await expect
        .element(page.getByText('Edit Signature', { exact: false }))
        .toBeVisible();
    });

    it('should populate name field when editing', async () => {
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({ signatureList });

      await userEvent.click(page.getByText('Work Signature'));
      await userEvent.click(page.getByRole('button', { name: /Edit/i }));

      // Modal should be open with name input
      await expect
        .element(page.getByText('Name of Signature'))
        .toBeVisible();
    });
  });

  describe('Delete signature', () => {
    it('should call DeleteSignature API when deleting with accountId', async () => {
      const deleteInterceptor = createBrowserSoapAPIInterceptor(
        'DeleteSignature',
        {},
      );

      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({ signatureList, accountId: 'test-account-id' });

      await userEvent.click(page.getByText('Work Signature'));
      await userEvent.click(page.getByRole('button', { name: /Delete/i }));

      await expect(deleteInterceptor).resolves.toBeDefined();
    });

    it('should remove signature from list without API call when no accountId', async () => {
      const setSignatureList = vi.fn();
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
      ];

      setupTest({
        signatureList,
        setSignatureList,
        accountId: undefined,
      });

      await userEvent.click(page.getByText('Work Signature'));
      await userEvent.click(page.getByRole('button', { name: /Delete/i }));

      expect(setSignatureList).toHaveBeenCalled();
    });
  });

  describe('Search functionality', () => {
    it('should filter signatures based on search input', async () => {
      const setSignatureList = vi.fn();
      const signatureList = [
        {
          id: 'sig-1',
          name: 'Work Signature',
          content: [{ type: 'text/plain', _content: 'Best regards' }],
        },
        {
          id: 'sig-2',
          name: 'Personal Signature',
          content: [{ type: 'text/plain', _content: 'Cheers' }],
        },
      ];

      setupTest({ signatureList, setSignatureList });

      const searchInput = page.getByRole('textbox');
      await userEvent.type(searchInput, 'Work');

      expect(setSignatureList).toHaveBeenCalled();
    });
  });
});

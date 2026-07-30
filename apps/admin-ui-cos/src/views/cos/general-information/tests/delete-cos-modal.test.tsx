/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render } from '@testing-library/react';
import { replaceHistory } from '@zextras/ui-shared';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  Modal: ({ children, customFooter, open }: any) =>
    open ? (
      <div>
        <div>{children}</div>
        <div>{customFooter}</div>
      </div>
    ) : null,
  Button: ({ label, onClick, disabled }: any) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  ),
  Container: ({ children }: any) => <div>{children}</div>,
  Padding: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [
    (key: string, opts?: string | { defaultValue?: string }) =>
      typeof opts === 'string' ? opts : (opts?.defaultValue ?? key),
    { i18n: {} },
  ],
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

vi.mock('../../../../services/use-delete-cos', () => ({
  useDeleteCos: () => ({
    mutate: vi.fn((_, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()),
    isPending: false,
  }),
}));

import { DeleteCosModal } from '../delete-cos-modal';

describe('DeleteCosModal', () => {
  it('navigates to the cos list after a successful delete', () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <DeleteCosModal open onClose={onClose} cosName="my-cos" cosId="cos-1" />,
    );

    fireEvent.click(getByText('Yes, Delete'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(replaceHistory).toHaveBeenCalledWith('/cos_list');
  });
});

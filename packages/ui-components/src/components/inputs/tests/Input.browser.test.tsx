/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Input } from '../Input';

const TrimOnPasteInput = ({ trimOnPaste }: { trimOnPaste: boolean }): React.JSX.Element => {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Test"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      trimOnPaste={trimOnPaste}
    />
  );
};

const PrefilledTrimOnPasteInput = (): React.JSX.Element => {
  const [value, setValue] = useState('some pre-existing value');
  return (
    <Input
      label="Test"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      trimOnPaste
    />
  );
};

function dispatchPaste(element: HTMLElement, text: string): void {
  const clipboardData = new DataTransfer();
  clipboardData.setData('text', text);
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData,
  });
  element.dispatchEvent(pasteEvent);
}

describe('Input', () => {
  describe('trimOnPaste', () => {
    it('should trim pasted text when trimOnPaste is true', async () => {
      await render(<TrimOnPasteInput trimOnPaste />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeVisible();
      const element = input.element() as HTMLInputElement;
      element.focus();

      dispatchPaste(element, '  hello world  ');

      await expect.element(input).toHaveValue('hello world');
    });

    it('should replace the value with trimmed pasted text', async () => {
      await render(<PrefilledTrimOnPasteInput />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeVisible();
      const element = input.element() as HTMLInputElement;
      element.focus();

      dispatchPaste(element, '  suffix  ');

      await expect.element(input).toHaveValue('suffix');
    });
  });
});

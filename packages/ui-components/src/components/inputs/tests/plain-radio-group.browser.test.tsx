/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainRadio, type RadioValue } from '../plain-radio';
import { PlainRadioGroup } from '../plain-radio-group';

type EditionGroupProps = {
  onChange?: (value: RadioValue) => void;
  disabled?: boolean;
};

const EditionGroup = ({ onChange, disabled }: EditionGroupProps) => {
  const [value, setValue] = useState<RadioValue>('mail');
  return (
    <PlainRadioGroup
      legend="Edition"
      value={value}
      disabled={disabled}
      onChange={(newValue) => {
        setValue(newValue);
        onChange?.(newValue);
      }}
    >
      <PlainRadio value="mail" label="Email" description="Email and mobile apps" />
      <PlainRadio value="workspace" label="Workspace" />
      <PlainRadio value="custom" label="Custom" />
    </PlainRadioGroup>
  );
};

describe('PlainRadioGroup', () => {
  describe('semantics', () => {
    it('should expose a radiogroup named after the legend', async () => {
      await render(<EditionGroup />);

      await expect.element(page.getByRole('radiogroup', { name: 'Edition' })).toBeInTheDocument();
      await expect.element(page.getByRole('radio', { name: 'Email' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Workspace' })).not.toBeChecked();
    });

    it('should link the radio description via aria-describedby', async () => {
      await render(<EditionGroup />);

      await expect
        .element(page.getByRole('radio', { name: 'Email' }))
        .toHaveAccessibleDescription('Email and mobile apps');
    });

    it('should give every radio of the group the same name', async () => {
      await render(<EditionGroup />);

      const names = page
        .getByRole('radio')
        .elements()
        .map((radio) => radio.getAttribute('name'));
      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should select a radio when its label is clicked', async () => {
      const onChange = vi.fn();
      await render(<EditionGroup onChange={onChange} />);

      await page.getByText('Workspace').click();
      await expect.element(page.getByRole('radio', { name: 'Workspace' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Email' })).not.toBeChecked();
      expect(onChange).toHaveBeenCalledWith('workspace');
    });

    it('should move the selection with Arrow keys', async () => {
      const onChange = vi.fn();
      await render(<EditionGroup onChange={onChange} />);

      await userEvent.tab();
      await expect.element(page.getByRole('radio', { name: 'Email' })).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(page.getByRole('radio', { name: 'Workspace' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Workspace' })).toHaveFocus();
      expect(onChange).toHaveBeenLastCalledWith('workspace');
    });

    it('should enter and leave the group with a single Tab stop', async () => {
      await render(
        <>
          <EditionGroup />
          <button type="button">After</button>
        </>,
      );

      await userEvent.tab();
      await expect.element(page.getByRole('radio', { name: 'Email' })).toHaveFocus();
      await userEvent.tab();
      await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('should disable every radio when the group is disabled', async () => {
      const onChange = vi.fn();
      await render(<EditionGroup disabled onChange={onChange} />);

      await expect.element(page.getByRole('radio', { name: 'Workspace' })).toBeDisabled();
      await page.getByText('Workspace').click({ force: true });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('standalone radio', () => {
    it('should behave as a native radio outside a group', async () => {
      await render(
        <>
          <PlainRadio name="color" value="red" label="Red" defaultChecked />
          <PlainRadio name="color" value="blue" label="Blue" />
        </>,
      );

      await page.getByText('Blue').click();
      await expect.element(page.getByRole('radio', { name: 'Blue' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Red' })).not.toBeChecked();
    });
  });
});

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainSwitch } from '../plain-switch';

const OFF_TRACK = 'rgb(133, 140, 147)';
const ON_TRACK = 'rgb(43, 115, 210)';
const OFF_DISABLED_TRACK = 'rgb(230, 233, 237)';
const ON_DISABLED_TRACK = 'rgb(170, 200, 238)';

function getTrack(name: string): HTMLElement {
  const input = page.getByRole('switch', { name }).element();
  return input.nextElementSibling as HTMLElement;
}

const ControlledSwitch = () => {
  const [checked, setChecked] = useState(false);
  return (
    <PlainSwitch
      label="Enable mail"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

describe('PlainSwitch', () => {
  describe('semantics', () => {
    it('should expose a switch whose accessible name is the label', async () => {
      await render(<PlainSwitch label="Enable mail" />);

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeInTheDocument();
      await expect.element(page.getByText('Enable mail')).toBeVisible();
    });

    it('should keep the description out of the accessible name and link it via aria-describedby', async () => {
      await render(<PlainSwitch label="Enable mail" description="Users can send emails" />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await expect.element(input).toHaveAccessibleDescription('Users can send emails');
      await expect.element(page.getByText('Users can send emails')).toBeVisible();
    });

    it('should merge a caller-provided aria-describedby with the description id', async () => {
      await render(
        <>
          <span id="extra">Extra hint</span>
          <PlainSwitch label="Enable mail" description="Main hint" aria-describedby="extra" />
        </>,
      );

      await expect
        .element(page.getByRole('switch', { name: 'Enable mail' }))
        .toHaveAccessibleDescription('Extra hint Main hint');
    });

    it('should not set aria-describedby without a description', async () => {
      await render(<PlainSwitch label="Enable mail" description={null} />);

      await expect
        .element(page.getByRole('switch', { name: 'Enable mail' }))
        .not.toHaveAttribute('aria-describedby');
    });
  });

  describe('interaction', () => {
    it('should toggle when the label is clicked', async () => {
      await render(<ControlledSwitch />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await expect.element(input).not.toBeChecked();
      await page.getByText('Enable mail').click();
      await expect.element(input).toBeChecked();
    });

    it('should toggle when the track is clicked', async () => {
      await render(<ControlledSwitch />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await input.click();
      await expect.element(input).toBeChecked();
    });

    it('should not toggle when the description is clicked', async () => {
      const onChange = vi.fn();
      await render(
        <PlainSwitch label="Enable mail" description="Users can send emails" onChange={onChange} />,
      );

      await page.getByText('Users can send emails').click();
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).not.toBeChecked();
    });

    it('should toggle with the Space key', async () => {
      await render(<ControlledSwitch />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await userEvent.tab();
      await expect.element(input).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect.element(input).toBeChecked();
      await userEvent.keyboard(' ');
      await expect.element(input).not.toBeChecked();
    });

    it('should toggle uncontrolled when defaultChecked is used', async () => {
      await render(<PlainSwitch label="Enable mail" defaultChecked />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await expect.element(input).toBeChecked();
      await page.getByText('Enable mail').click();
      await expect.element(input).not.toBeChecked();
    });

    it('should keep the controlled value when the caller does not update state', async () => {
      await render(<PlainSwitch label="Enable mail" checked={false} onChange={() => {}} />);

      await page.getByText('Enable mail').click();
      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).not.toBeChecked();
    });

    it('should not be operable when disabled', async () => {
      const onChange = vi.fn();
      await render(<PlainSwitch label="Enable mail" disabled onChange={onChange} />);

      const input = page.getByRole('switch', { name: 'Enable mail' });
      await expect.element(input).toBeDisabled();
      await page.getByText('Enable mail').click({ force: true });
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(input).not.toBeChecked();
    });
  });

  describe('visual states', () => {
    it('should render a 28.8 x 16 track', async () => {
      await render(<PlainSwitch label="Enable mail" />);

      const rect = getTrack('Enable mail').getBoundingClientRect();
      expect(rect.width).toBeCloseTo(28.8, 1);
      expect(rect.height).toBeCloseTo(16, 1);
    });

    it.each([
      ['off', {}, OFF_TRACK],
      ['on', { defaultChecked: true }, ON_TRACK],
      ['off disabled', { disabled: true }, OFF_DISABLED_TRACK],
      ['on disabled', { defaultChecked: true, disabled: true }, ON_DISABLED_TRACK],
    ])('should paint the %s track per spec', async (_state, props, expected) => {
      await render(<PlainSwitch label="Enable mail" {...props} />);

      expect(getComputedStyle(getTrack('Enable mail')).backgroundColor).toBe(expected);
    });

    it('should show a pointer cursor on the title and track, not on the description', async () => {
      await render(<PlainSwitch label="Enable mail" description="Users can send emails" />);

      const input = page.getByRole('switch', { name: 'Enable mail' }).element();
      expect(getComputedStyle(page.getByText('Enable mail').element()).cursor).toBe('pointer');
      expect(getComputedStyle(input).cursor).toBe('pointer');
      expect(getComputedStyle(page.getByText('Users can send emails').element()).cursor).not.toBe(
        'pointer',
      );
    });

    it('should show the default cursor on the title and track when disabled', async () => {
      await render(<PlainSwitch label="Enable mail" disabled />);

      const input = page.getByRole('switch', { name: 'Enable mail' }).element();
      expect(getComputedStyle(page.getByText('Enable mail').element()).cursor).toBe('default');
      expect(getComputedStyle(input).cursor).toBe('default');
    });

    it('should show a focus ring on keyboard focus', async () => {
      await render(<PlainSwitch label="Enable mail" />);

      await userEvent.tab();
      expect(getComputedStyle(getTrack('Enable mail')).outlineStyle).toBe('solid');
    });
  });

  describe('native passthrough', () => {
    it('should forward the ref and native props to the input', async () => {
      const ref = React.createRef<HTMLInputElement>();
      await render(<PlainSwitch label="Enable mail" ref={ref} name="mail" data-testid="mail" />);

      expect(ref.current).toBe(page.getByRole('switch', { name: 'Enable mail' }).element());
      expect(ref.current?.name).toBe('mail');
      expect(ref.current?.dataset.testid).toBe('mail');
    });

    it('should apply className and style to the root', async () => {
      const { container } = await render(
        <PlainSwitch label="Enable mail" className="custom" style={{ marginTop: 4 }} />,
      );

      const root = container.firstElementChild as HTMLElement | null;
      expect(root?.classList.contains('custom')).toBe(true);
      expect(root?.style.marginTop).toBe('4px');
    });
  });
});

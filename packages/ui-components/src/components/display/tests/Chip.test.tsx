/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders the whole chip as a button when clickable without actions', () => {
    const onClick = vi.fn();
    render(<Chip label="label" onClick={onClick} />);

    const chip = screen.getByTestId('chip');
    expect(chip.tagName).toBe('BUTTON');
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not nest the close button inside another button when clickable', () => {
    render(<Chip label="label" onClick={vi.fn()} onClose={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(within(button).queryAllByRole('button')).toHaveLength(0);
    }
  });

  it('triggers only the chip click when the label button is clicked', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(<Chip label="label" onClick={onClick} onClose={onClose} />);

    fireEvent.click(screen.getByText('label'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('triggers only the close action when the close button is clicked', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(<Chip label="label" onClick={onClick} onClose={onClose} />);

    const closeButton = screen
      .getAllByRole('button')
      .find((button) => !button.textContent?.includes('label'));
    fireEvent.click(closeButton as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not trigger the chip click when Enter is pressed on the close button', () => {
    const onClick = vi.fn();
    render(<Chip label="label" onClick={onClick} onClose={vi.fn()} />);

    const closeButton = screen
      .getAllByRole('button')
      .find((button) => !button.textContent?.includes('label'));
    fireEvent.keyDown(closeButton as HTMLElement, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' '])('activates the clickable chip with the "%s" key', (key) => {
    const onClick = vi.fn();
    render(<Chip label="label" onClick={onClick} />);

    fireEvent.keyDown(screen.getByTestId('chip'), { key });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys on the clickable chip', () => {
    const onClick = vi.fn();
    render(<Chip label="label" onClick={onClick} />);

    fireEvent.keyDown(screen.getByTestId('chip'), { key: 'a' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onDoubleClick on double click', () => {
    const onDoubleClick = vi.fn();
    render(<Chip label="label" onDoubleClick={onDoubleClick} />);

    fireEvent.doubleClick(screen.getByTestId('chip'));
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon actions as non-interactive decorations', () => {
    render(
      <Chip
        label="label"
        actions={[{ id: 'info', type: 'icon', icon: 'InfoOutline', label: 'Info' }]}
      />,
    );

    expect(screen.getByTestId('chip').innerHTML).toContain('ds-icon');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('skips actions with an unknown type', () => {
    render(
      <Chip
        label="label"
        actions={[{ id: 'unknown', type: 'unknown', icon: 'InfoOutline' } as never]}
      />,
    );

    expect(screen.getByTestId('chip').innerHTML).not.toContain('ds-icon');
  });

  it('toggles the label tooltip handlers on hover when maxWidth is set', () => {
    render(<Chip label="a very long label" maxWidth="40px" />);

    const label = screen.getByText('a very long label');
    fireEvent.mouseEnter(label);
    fireEvent.mouseLeave(label);
    fireEvent.focus(label);
    fireEvent.blur(label);

    expect(screen.getByText('a very long label')).toBeTruthy();
  });

  it('renders a non-interactive container when no click handlers are provided', () => {
    render(<Chip label="label" />);

    expect(screen.getByTestId('chip').tagName).toBe('DIV');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

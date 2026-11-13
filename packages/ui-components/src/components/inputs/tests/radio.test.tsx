/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';

describe('Radio', () => {
  it('associates the string label with the input', () => {
    render(<Radio label="Option A" value="a" />);

    expect(screen.getByLabelText('Option A')).toBe(screen.getByRole('radio'));
  });

  it('toggles and notifies onChange when uncontrolled', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(<Radio label="Option A" value="a" onChange={onChange} onClick={onClick} />);

    const radio = screen.getByRole<HTMLInputElement>('radio');
    expect(radio.checked).toBe(false);

    fireEvent.click(radio);

    expect(radio.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('starts checked when defaultChecked is set', () => {
    render(<Radio label="Option A" value="a" defaultChecked />);

    expect(screen.getByRole<HTMLInputElement>('radio').checked).toBe(true);
  });

  it('does not change internal state when controlled', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Radio label="Option A" value="a" checked={false} onChange={onChange} onClick={onClick} />,
    );

    fireEvent.click(screen.getByRole('radio'));

    expect(screen.getByRole<HTMLInputElement>('radio').checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks when disabled', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(<Radio label="Option A" value="a" disabled onChange={onChange} onClick={onClick} />);

    // fireEvent bypasses the native disabled check, so the handler guard is exercised
    fireEvent.click(screen.getByRole('radio'));

    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards clicks on an element label to the input', () => {
    const onChange = vi.fn();
    const onLabelClick = vi.fn();
    render(
      <Radio
        value="a"
        onChange={onChange}
        label={
          <button type="button" onClick={onLabelClick}>
            Custom label
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Custom label' }));

    expect(onLabelClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not forward the label click when the label prevents default', () => {
    const onChange = vi.fn();
    render(
      <Radio
        value="a"
        onChange={onChange}
        label={
          <button type="button" onClick={(event): void => event.preventDefault()}>
            Custom label
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Custom label' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('RadioGroup', () => {
  function getRadio(name: string): HTMLInputElement {
    return screen.getByRole<HTMLInputElement>('radio', { name });
  }

  it('selects the clicked radio when uncontrolled', () => {
    render(
      <RadioGroup defaultValue="a">
        {[
          <Radio key="a" label="Option A" value="a" />,
          <Radio key="b" label="Option B" value="b" />,
        ]}
      </RadioGroup>,
    );

    expect(getRadio('Option A').checked).toBe(true);
    expect(getRadio('Option B').checked).toBe(false);

    fireEvent.click(getRadio('Option B'));

    expect(getRadio('Option A').checked).toBe(false);
    expect(getRadio('Option B').checked).toBe(true);
  });

  it('calls onChange with the new value and keeps the controlled value', () => {
    const onChange = vi.fn();
    const onRadioClick = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange}>
        {[
          <Radio key="a" label="Option A" value="a" />,
          <Radio key="b" label="Option B" value="b" onClick={onRadioClick} />,
        ]}
      </RadioGroup>,
    );

    fireEvent.click(getRadio('Option B'));

    expect(onRadioClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(getRadio('Option A').checked).toBe(true);
  });

  it('does not call onChange when clicking the already selected radio', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange}>
        {[
          <Radio key="a" label="Option A" value="a" />,
          <Radio key="b" label="Option B" value="b" />,
        ]}
      </RadioGroup>,
    );

    fireEvent.click(getRadio('Option A'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows the controlled value when it changes', () => {
    const children = [
      <Radio key="a" label="Option A" value="a" />,
      <Radio key="b" label="Option B" value="b" />,
    ];
    const { rerender } = render(<RadioGroup value="a">{children}</RadioGroup>);

    rerender(<RadioGroup value="b">{children}</RadioGroup>);

    expect(getRadio('Option B').checked).toBe(true);
  });

  it('disables every radio when the group is disabled', () => {
    render(
      <RadioGroup disabled>
        {[
          <Radio key="a" label="Option A" value="a" />,
          <Radio key="b" label="Option B" value="b" />,
        ]}
      </RadioGroup>,
    );

    expect(getRadio('Option A').disabled).toBe(true);
    expect(getRadio('Option B').disabled).toBe(true);
  });

  it('keeps an individually disabled radio disabled', () => {
    render(
      <RadioGroup>
        {[
          <Radio key="a" label="Option A" value="a" />,
          <Radio key="b" label="Option B" value="b" disabled />,
        ]}
      </RadioGroup>,
    );

    expect(getRadio('Option A').disabled).toBe(false);
    expect(getRadio('Option B').disabled).toBe(true);
  });
});

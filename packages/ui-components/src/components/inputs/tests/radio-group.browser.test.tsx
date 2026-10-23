/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';

const ControlledGroup = ({ onChange }: { onChange?: (value: string) => void }) => {
  const [value, setValue] = useState('mail');
  return (
    <RadioGroup
      aria-label="Edition"
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        onChange?.(newValue);
      }}
    >
      <Radio value="mail" label="Email" iconColor="primary" />
      <div />
      <Radio value="workspace" label={<span>Workspace</span>} size="small" />
    </RadioGroup>
  );
};

describe('RadioGroup', () => {
  it('should render a radiogroup with the controlled value selected', async () => {
    await render(<ControlledGroup />);

    await expect.element(page.getByRole('radiogroup', { name: 'Edition' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: 'Email' })).toBeChecked();
  });

  it('should select a radio whose label is an element and fire onChange', async () => {
    const onChange = vi.fn();
    await render(<ControlledGroup onChange={onChange} />);

    await page.getByText('Workspace').click();
    await expect.element(page.getByRole('radio', { name: 'Workspace' })).toBeChecked();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('workspace');
  });

  it('should not fire onChange when the selected radio is clicked again', async () => {
    const onChange = vi.fn();
    await render(<ControlledGroup onChange={onChange} />);

    await page.getByText('Email').click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should keep the controlled value when onChange does not update it', async () => {
    await render(
      <RadioGroup aria-label="Edition" value="mail" onChange={vi.fn()}>
        <Radio value="mail" label="Email" />
        <Radio value="workspace" label="Workspace" />
      </RadioGroup>,
    );

    await page.getByText('Workspace').click();
    await expect.element(page.getByRole('radio', { name: 'Email' })).toBeChecked();
  });

  it('should start from defaultValue and update when uncontrolled', async () => {
    await render(
      <RadioGroup aria-label="Edition" defaultValue="workspace">
        <Radio value="mail" label="Email" />
        <Radio value="workspace" label="Workspace" />
      </RadioGroup>,
    );

    await expect.element(page.getByRole('radio', { name: 'Workspace' })).toBeChecked();
    await userEvent.click(page.getByText('Email'));
    await expect.element(page.getByRole('radio', { name: 'Email' })).toBeChecked();
  });

  it('should call the radio onClick inside a group', async () => {
    const onClick = vi.fn();
    await render(
      <RadioGroup aria-label="Edition" value="mail">
        <Radio value="mail" label="Email" />
        <Radio value="workspace" label="Workspace" onClick={onClick} />
      </RadioGroup>,
    );

    await page.getByText('Workspace').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Radio', () => {
  it('should work as a controlled standalone radio through checked and onClick', async () => {
    const StandaloneRadios = () => {
      const [value, setValue] = useState('a');
      return (
        <>
          <Radio label="Option A" checked={value === 'a'} onClick={() => setValue('a')} />
          <Radio label="Option B" checked={value === 'b'} onClick={() => setValue('b')} />
        </>
      );
    };
    await render(<StandaloneRadios />);

    await page.getByText('Option B').click();
    await expect.element(page.getByRole('radio', { name: 'Option B' })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: 'Option A' })).not.toBeChecked();
  });
});

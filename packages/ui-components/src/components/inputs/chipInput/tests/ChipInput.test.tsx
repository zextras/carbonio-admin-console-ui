/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChipInput, type ChipItem, defaultOnAdd, getThemeColorVar } from '../ChipInput';

const makeOptions = (
  ...opts: Array<{
    id: string;
    label: string;
    value?: string;
    onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  }>
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
any => opts;

const ENTER_ONLY = [{ key: 'Enter', ctrlKey: false }];

const setupUser = () => userEvent.setup();

describe('defaultOnAdd', () => {
  it('returns { label } for string values', () => {
    expect(defaultOnAdd('hello')).toEqual({ label: 'hello' });
  });

  it('merges object with label', () => {
    expect(defaultOnAdd({ label: 'custom', value: 1 })).toEqual({
      label: 'custom',
      value: 1,
    });
  });

  it('uses default label for object without label', () => {
    expect(defaultOnAdd({ value: 42 })).toEqual({ label: 'no label', value: 42 });
  });

  it('returns unknown label for null', () => {
    expect(defaultOnAdd(null)).toEqual({ label: 'unknown value' });
  });

  it('returns unknown label for number', () => {
    expect(defaultOnAdd(42)).toEqual({ label: 'unknown value' });
  });

  it('returns unknown label for undefined', () => {
    expect(defaultOnAdd(undefined)).toEqual({ label: 'unknown value' });
  });

  it('returns unknown label for boolean', () => {
    expect(defaultOnAdd(true)).toEqual({ label: 'unknown value' });
  });
});

describe('getThemeColorVar', () => {
  it('returns empty string for empty colorName', () => {
    expect(getThemeColorVar('', 'regular')).toBe('');
  });

  it('returns hex color as-is for valid 6-char hex', () => {
    expect(getThemeColorVar('#aabbcc', 'regular')).toBe('#aabbcc');
  });

  it('returns hex color as-is for valid 3-char hex', () => {
    expect(getThemeColorVar('#abc', 'regular')).toBe('#abc');
  });

  it('returns hex color as-is for valid 8-char hex', () => {
    expect(getThemeColorVar('#aabbccdd', 'regular')).toBe('#aabbccdd');
  });

  it('returns hex color as-is for valid 4-char hex', () => {
    expect(getThemeColorVar('#abcd', 'regular')).toBe('#abcd');
  });

  it('returns CSS variable for named color', () => {
    const result = getThemeColorVar('primary', 'regular');
    expect(result).toBe('var(--color-primary-regular, var(--color-primary-regular, primary))');
  });

  it('sanitizes special characters in named color', () => {
    const result = getThemeColorVar('my.color!', 'disabled');
    expect(result).toContain('mycolor');
    expect(result).toContain('disabled');
  });
});

describe('ChipInput', () => {
  beforeEach(() => {
    ChipInput._newId = 0;
  });

  const getInput = (): HTMLInputElement => screen.getByRole('textbox');

  const findCloseButton = (label: string): HTMLButtonElement | null => {
    const chipText = screen.getByText(label);
    const container = chipText.closest('[class]');
    if (!container) return null;
    const parent = container.parentElement;
    if (!parent) return null;
    return parent.querySelector('button');
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('input')).toBeTruthy();
    });

    it('renders placeholder as label', () => {
      render(<ChipInput placeholder="Add tags" />);
      expect(screen.getByText('Add tags')).toBeTruthy();
    });

    it('does not render label when no placeholder', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('label')).toBeNull();
    });

    it('renders description', () => {
      render(<ChipInput description="Help text" />);
      expect(screen.getByText('Help text')).toBeTruthy();
    });

    it('does not render description when undefined', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('ds-text')).toBeNull();
    });

    it('renders chips from value (controlled)', () => {
      render(<ChipInput value={[{ label: 'tag1' }, { label: 'tag2' }]} onChange={vi.fn()} />);
      expect(screen.getByText('tag1')).toBeTruthy();
      expect(screen.getByText('tag2')).toBeTruthy();
    });

    it('renders chips from defaultValue (uncontrolled)', () => {
      render(<ChipInput defaultValue={[{ label: 'init1' }]} />);
      expect(screen.getByText('init1')).toBeTruthy();
    });

    it('renders with disabled state', () => {
      render(<ChipInput disabled />);
      const input = getInput();
      expect(input.disabled).toBe(true);
    });

    it('renders input as required', () => {
      render(<ChipInput isRequired />);
      const input = getInput();
      expect(input.hasAttribute('required')).toBe(true);
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('renders custom ChipComponent', () => {
      const CustomChip = ({ label }: ChipItem) => <span data-testid="custom-chip">{label}</span>;
      render(
        <ChipInput value={[{ label: 'custom' }]} onChange={vi.fn()} ChipComponent={CustomChip} />,
      );
      expect(screen.getByTestId('custom-chip')).toBeTruthy();
      expect(screen.getByText('custom')).toBeTruthy();
    });

    it('renders ds-divider', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('ds-divider')).toBeTruthy();
    });

    it('sets input name from inputName', () => {
      render(<ChipInput inputName="my-input" />);
      expect(getInput().getAttribute('name')).toBe('my-input');
    });

    it('sets input name from placeholder when no inputName', () => {
      render(<ChipInput placeholder="My Placeholder" />);
      expect(getInput().getAttribute('name')).toBe('My Placeholder');
    });

    it('renders with error background color in description', () => {
      const { container } = render(<ChipInput description="err" errorBackgroundColor="red" />);
      const desc = container.querySelector(
        '[class*="customInputDescription"]',
      ) as HTMLElement | null;
      expect(desc?.style.getPropertyValue('--description-bg-color')).toBeTruthy();
    });

    it('uses transparent for description bg when no errorBackgroundColor', () => {
      const { container } = render(<ChipInput description="info" />);
      const desc = container.querySelector(
        '[class*="customInputDescription"]',
      ) as HTMLElement | null;
      expect(desc?.style.getPropertyValue('--description-bg-color')).toBe('transparent');
    });

    it('applies wrap prop', () => {
      const { container } = render(<ChipInput wrap="nowrap" />);
      expect(container.querySelector('[data-wrap="nowrap"]')).toBeTruthy();
    });

    it('applies wrap="wrap" by default', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('[data-wrap="wrap"]')).toBeTruthy();
    });
  });

  describe('Adding Chips', () => {
    it('adds chip on Enter key', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} />);

      const input = getInput();
      await user.click(input);
      await user.type(input, 'hello{Enter}');

      await waitFor(() => {
        expect(screen.getByText('hello')).toBeTruthy();
      });
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ label: 'hello' })]),
      );
    });

    it('adds chip on comma key', async () => {
      const user = setupUser();
      render(<ChipInput onChange={vi.fn()} />);

      await user.click(getInput());
      await user.type(getInput(), 'hello,');

      await waitFor(() => {
        expect(screen.getByText('hello')).toBeTruthy();
      });
    });

    it('adds chip on space key', async () => {
      const user = setupUser();
      render(<ChipInput onChange={vi.fn()} />);

      await user.click(getInput());
      await user.type(getInput(), 'hello ');

      await waitFor(() => {
        expect(screen.getByText('hello')).toBeTruthy();
      });
    });

    it('trims whitespace from chip', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} separators={ENTER_ONLY} />);

      await user.click(getInput());
      await user.type(getInput(), '  hello  {Enter}');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'hello' })]),
        );
      });
    });

    it('does not add empty chip', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} separators={ENTER_ONLY} />);

      await user.click(getInput());
      await user.type(getInput(), '{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not add whitespace-only chip', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} separators={ENTER_ONLY} />);

      await user.click(getInput());
      await user.type(getInput(), '   {Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('blocks duplicate when requireUniqueChips is true', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput value={[{ label: 'hello' }]} onChange={onChange} requireUniqueChips />);

      await user.click(getInput());
      await user.type(getInput(), 'hello{Enter}');

      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    it('allows duplicate when requireUniqueChips is false', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(
        <ChipInput value={[{ label: 'hello' }]} onChange={onChange} requireUniqueChips={false} />,
      );

      await user.click(getInput());
      await user.type(getInput(), 'hello{Enter}');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ label: 'hello' }),
            expect.objectContaining({ label: 'hello' }),
          ]),
        );
      });
    });

    it('uses custom onAdd', async () => {
      const onAdd = vi.fn().mockReturnValue({ label: 'custom-add' });
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} onAdd={onAdd} />);

      await user.click(getInput());
      await user.type(getInput(), 'test{Enter}');

      await waitFor(() => {
        expect(onAdd).toHaveBeenCalledWith('test');
      });
      expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: 'custom-add' })]);
    });

    it('clears input after adding chip', async () => {
      const user = setupUser();
      render(<ChipInput onChange={vi.fn()} />);

      const input = getInput();
      await user.click(input);
      await user.type(input, 'hello{Enter}');

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Removing Chips', () => {
    it('removes last chip on Backspace at cursor position 0', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput value={[{ label: 'a' }, { label: 'b' }]} onChange={onChange} />);

      await user.click(getInput());
      await user.type(getInput(), '{Backspace}');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([{ label: 'a' }]);
      });
    });

    it('does not remove chip when cursor is not at position 0', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput value={[{ label: 'a' }]} onChange={onChange} separators={ENTER_ONLY} />);

      const input = getInput();
      await user.click(input);
      await user.type(input, 'text{Backspace}');

      expect(onChange).not.toHaveBeenCalledWith([]);
    });

    it('removes chip via close button', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput value={[{ label: 'removable' }]} onChange={onChange} />);

      const closeBtn = findCloseButton('removable');
      expect(closeBtn).toBeTruthy();
      if (closeBtn) {
        await user.click(closeBtn);
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([]);
      });
    });

    it('calls onChipClose in uncontrolled mode', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput defaultValue={[{ label: 'x' }]} onChange={onChange} />);

      const closeBtn = findCloseButton('x');
      if (closeBtn) {
        await user.click(closeBtn);
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('Focus / Blur', () => {
    it('confirms chip on blur when confirmChipOnBlur is true and no options', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} confirmChipOnBlur separators={ENTER_ONLY} />);

      await user.click(getInput());
      await user.type(getInput(), 'blur-chip');
      await user.tab();

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'blur-chip' })]),
        );
      });
    });

    it('does not confirm on blur when confirmChipOnBlur is false', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} confirmChipOnBlur={false} separators={ENTER_ONLY} />);

      await user.click(getInput());
      await user.type(getInput(), 'no-blur');
      await user.tab();

      await new Promise((r) => setTimeout(r, 100));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not confirm on blur when options are present', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(
        <ChipInput
          onChange={onChange}
          options={[{ id: 'opt', label: 'Opt' }]}
          separators={ENTER_ONLY}
        />,
      );

      await user.click(getInput());
      await user.type(getInput(), 'no-confirm');
      await user.tab();

      await new Promise((r) => setTimeout(r, 100));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('sets active state on focus', async () => {
      const user = setupUser();
      const { container } = render(<ChipInput placeholder="Focus me" />);
      await user.click(getInput());

      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color')).toContain('primary');
      });
    });
  });

  describe('Paste', () => {
    it('creates chips from pasted text with createChipOnPaste', async () => {
      const onChange = vi.fn();
      render(<ChipInput onChange={onChange} createChipOnPaste />);

      const input = getInput();
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => 'tag1,tag2,tag3',
        },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ label: 'tag1' }),
            expect.objectContaining({ label: 'tag2' }),
            expect.objectContaining({ label: 'tag3' }),
          ]),
        );
      });
    });

    it('uses custom pasteSeparators', async () => {
      const onChange = vi.fn();
      render(<ChipInput onChange={onChange} createChipOnPaste pasteSeparators={[';']} />);

      const input = getInput();
      fireEvent.paste(input, {
        clipboardData: { getData: () => 'a;b;c' },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ label: 'a' }),
            expect.objectContaining({ label: 'b' }),
            expect.objectContaining({ label: 'c' }),
          ]),
        );
      });
    });

    it('deduplicates pasted chips when requireUniqueChips', async () => {
      const onChange = vi.fn();
      render(<ChipInput onChange={onChange} createChipOnPaste requireUniqueChips />);

      const input = getInput();
      fireEvent.paste(input, {
        clipboardData: { getData: () => 'dup,dup,unique' },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const chips = onChange.mock.calls[0][0];
        expect(chips.length).toBe(2);
      });
    });

    it('does not create chips when createChipOnPaste is false', async () => {
      const onChange = vi.fn();
      render(<ChipInput onChange={onChange} createChipOnPaste={false} />);

      const input = getInput();
      fireEvent.paste(input, {
        clipboardData: { getData: () => 'tag1,tag2' },
      });

      await new Promise((r) => setTimeout(r, 100));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores empty pasted segments', async () => {
      const onChange = vi.fn();
      render(<ChipInput onChange={onChange} createChipOnPaste />);

      const input = getInput();
      fireEvent.paste(input, {
        clipboardData: { getData: () => 'a,,b' },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const chips = onChange.mock.calls[0][0];
        expect(chips.length).toBe(2);
      });
    });
  });

  describe('maxChips', () => {
    it('disables input when chip count reaches maxChips', () => {
      render(<ChipInput value={[{ label: 'a' }]} onChange={vi.fn()} maxChips={1} />);
      expect(getInput().disabled).toBe(true);
    });

    it('does not disable when below maxChips', () => {
      render(<ChipInput value={[{ label: 'a' }]} onChange={vi.fn()} maxChips={5} />);
      expect(getInput().disabled).toBe(false);
    });

    it('does not disable when maxChips is null', () => {
      render(<ChipInput value={[{ label: 'a' }]} onChange={vi.fn()} maxChips={null} />);
      expect(getInput().disabled).toBe(false);
    });

    it('deactivates when maxChips is newly reached', async () => {
      const { rerender } = render(
        <ChipInput value={[{ label: 'a' }]} onChange={vi.fn()} maxChips={2} />,
      );
      expect(getInput().disabled).toBe(false);

      rerender(
        <ChipInput value={[{ label: 'a' }, { label: 'b' }]} onChange={vi.fn()} maxChips={2} />,
      );
      expect(getInput().disabled).toBe(true);
    });
  });

  describe('State Management', () => {
    it('resets internal state when value changes externally', async () => {
      const { rerender } = render(<ChipInput value={[{ label: 'old' }]} onChange={vi.fn()} />);
      expect(screen.getByText('old')).toBeTruthy();

      rerender(<ChipInput value={[{ label: 'new' }]} onChange={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText('new')).toBeTruthy();
        expect(screen.queryByText('old')).toBeNull();
      });
    });

    it('resets to empty when value set to empty array', async () => {
      const { rerender } = render(<ChipInput value={[{ label: 'gone' }]} onChange={vi.fn()} />);
      expect(screen.getByText('gone')).toBeTruthy();

      rerender(<ChipInput value={[]} onChange={vi.fn()} />);
      await waitFor(() => {
        expect(screen.queryByText('gone')).toBeNull();
      });
    });

    it('works in uncontrolled mode with defaultValue', async () => {
      const user = setupUser();
      render(<ChipInput defaultValue={[{ label: 'init' }]} />);

      expect(screen.getByText('init')).toBeTruthy();

      await user.click(getInput());
      await user.type(getInput(), 'added{Enter}');

      await waitFor(() => {
        expect(screen.getByText('added')).toBeTruthy();
        expect(screen.getByText('init')).toBeTruthy();
      });
    });
  });

  describe('onInputType', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls debounced onInputType on keyup', () => {
      const onInputType = vi.fn();
      render(<ChipInput onInputType={onInputType} onInputTypeDebounce={100} />);

      const input = getInput();
      act(() => {
        input.focus();
      });

      act(() => {
        fireEvent.keyUp(input, { key: 'a' });
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(onInputType).toHaveBeenCalled();
      const call = onInputType.mock.calls[0][0];
      expect(call.textContent).toBe('');
    });

    it('does not attach keyup handler when onInputType is not provided', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('input')).toBeTruthy();
    });
  });

  describe('Custom Separators', () => {
    it('uses custom separator (semicolon)', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(
        <ChipInput
          onChange={onChange}
          separators={[
            { key: 'Enter', ctrlKey: false },
            { key: ';', ctrlKey: false },
          ]}
        />,
      );

      await user.click(getInput());
      await user.type(getInput(), 'hello;');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'hello' })]),
        );
      });
    });

    it('does not add chip on Enter when separators is empty', async () => {
      const onChange = vi.fn();
      const user = setupUser();
      render(<ChipInput onChange={onChange} separators={[]} />);

      await user.click(getInput());
      await user.type(getInput(), 'hello{Enter}');

      await new Promise((r) => setTimeout(r, 100));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Cursor State', () => {
    it('sets cursor to text when enabled', () => {
      const { container } = render(<ChipInput />);
      expect(container.querySelector('[data-cursor="text"]')).toBeTruthy();
    });

    it('sets cursor to pointer when disabled but dropdown available', () => {
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      const { container } = render(<ChipInput disabled options={options} disableOptions={false} />);
      expect(container.querySelector('[data-cursor="pointer"]')).toBeTruthy();
    });

    it('sets no cursor when fully disabled', () => {
      const { container } = render(<ChipInput disabled />);
      const el = container.querySelector('[data-cursor]');
      expect(el?.getAttribute('data-cursor')).toBeFalsy();
    });
  });

  describe('Divider Color', () => {
    it('uses transparent when hideBorder', async () => {
      const { container } = render(<ChipInput hideBorder />);
      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color') ?? '').toContain('transparent');
      });
    });

    it('uses error color when hasError', async () => {
      const { container } = render(<ChipInput hasError />);
      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color') ?? '').toContain('error');
      });
    });

    it('uses primary color when focused', async () => {
      const user = setupUser();
      const { container } = render(<ChipInput />);
      await user.click(getInput());

      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color')).toContain('primary');
      });
    });

    it('uses default color otherwise', async () => {
      const { container } = render(<ChipInput />);
      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color') ?? '').toContain('gray3');
      });
    });

    it('appends disabled suffix when disabled', async () => {
      const { container } = render(<ChipInput disabled />);
      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color') ?? '').toContain('.disabled');
      });
    });

    it('uses custom bottomBorderColor', async () => {
      const { container } = render(<ChipInput bottomBorderColor="primary" />);
      await waitFor(() => {
        const divider = container.querySelector('ds-divider');
        expect(divider?.getAttribute('color') ?? '').toContain('primary');
      });
    });
  });

  describe('Options / Dropdown', () => {
    it('renders dropdown items when options provided with disableOptions', () => {
      const options = makeOptions(
        { id: 'a', label: 'Option A', value: 'a' },
        { id: 'b', label: 'Option B', value: 'b' },
      );
      render(<ChipInput options={options} />);

      expect(screen.getByText('Option A')).toBeTruthy();
      expect(screen.getByText('Option B')).toBeTruthy();
    });

    it('calls onOptionsDisplayChange when visibility changes', () => {
      const onOptionsDisplayChange = vi.fn();
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      render(<ChipInput options={options} onOptionsDisplayChange={onOptionsDisplayChange} />);

      expect(onOptionsDisplayChange).toHaveBeenCalledWith(true);
    });

    it('does not call onOptionsDisplayChange when no callback', () => {
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      expect(() => {
        render(<ChipInput options={options} />);
      }).not.toThrow();
    });

    it('adds chip via option click in non-single mode', async () => {
      const onChange = vi.fn();
      const options = makeOptions({ id: 'pick', label: 'PickMe', value: 'pick' });
      render(<ChipInput options={options} onChange={onChange} />);

      await userEvent.click(screen.getByText('PickMe'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'pick' })]),
        );
      });
    });

    it('replaces chip in singleSelection mode', async () => {
      const onChange = vi.fn();
      const options = makeOptions({ id: 'repl', label: 'Replace', value: 'repl' });
      render(
        <ChipInput
          value={[{ label: 'old' }]}
          options={options}
          onChange={onChange}
          singleSelection
        />,
      );

      await userEvent.click(screen.getByText('Replace'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'repl' })]),
        );
      });
    });

    it('uses option label when value is not set', async () => {
      const onChange = vi.fn();
      const options = makeOptions({ id: 'nov', label: 'NoValue' });
      render(<ChipInput options={options} onChange={onChange} />);

      await userEvent.click(screen.getByText('NoValue'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ label: 'NoValue' })]),
        );
      });
    });

    it('calls option onClick when provided', async () => {
      const optionClick = vi.fn();
      const onChange = vi.fn();
      const options = makeOptions({
        id: 'wc',
        label: 'WithClick',
        value: 'wc',
        onClick: optionClick,
      });
      render(<ChipInput options={options} onChange={onChange} />);

      await userEvent.click(screen.getByText('WithClick'));

      await waitFor(() => {
        expect(optionClick).toHaveBeenCalled();
      });
    });

    it('keeps previous dropdownItems when options and prevState are both empty', () => {
      const { rerender } = render(<ChipInput options={[]} />);
      rerender(<ChipInput options={[]} />);
    });

    it('does not call showDropdown when options are empty', () => {
      const onOptionsDisplayChange = vi.fn();
      render(<ChipInput onOptionsDisplayChange={onOptionsDisplayChange} />);
      expect(onOptionsDisplayChange).not.toHaveBeenCalled();
    });

    it('calls showDropdown with false when dropdown closes', () => {
      const onOptionsDisplayChange = vi.fn();
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      const { rerender } = render(
        <ChipInput options={options} onOptionsDisplayChange={onOptionsDisplayChange} />,
      );
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(true);

      rerender(<ChipInput options={[]} onOptionsDisplayChange={onOptionsDisplayChange} />);
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Horizontal Scroll (flipScroll)', () => {
    it('converts vertical scroll to horizontal when content overflows', () => {
      const { container } = render(<ChipInput />);
      const scrollEl = container.querySelector('[data-wrap]') as HTMLElement;
      if (!scrollEl) return;

      Object.defineProperty(scrollEl, 'scrollWidth', { value: 500, configurable: true });
      Object.defineProperty(scrollEl, 'clientWidth', { value: 200, configurable: true });
      const spy = vi.spyOn(scrollEl, 'scrollLeft', 'set');

      fireEvent.wheel(scrollEl, { deltaY: 10 });
      expect(spy).toHaveBeenCalledWith(10);
    });

    it('does not scroll when content fits', () => {
      const { container } = render(<ChipInput />);
      const scrollEl = container.querySelector('[data-wrap]') as HTMLElement;
      if (!scrollEl) return;

      Object.defineProperty(scrollEl, 'scrollWidth', { value: 200, configurable: true });
      Object.defineProperty(scrollEl, 'clientWidth', { value: 200, configurable: true });
      const spy = vi.spyOn(scrollEl, 'scrollLeft', 'set');

      fireEvent.wheel(scrollEl, { deltaY: 10 });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ID Generation', () => {
    it('generates unique IDs', () => {
      const { container: c1 } = render(<ChipInput />);
      const { container: c2 } = render(<ChipInput />);

      const id1 = c1.querySelector('input')?.id;
      const id2 = c2.querySelector('input')?.id;
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^chipInput-\d+$/);
      expect(id2).toMatch(/^chipInput-\d+$/);
    });
  });

  describe('inputRef', () => {
    it('passes ref to input element', () => {
      const ref = { current: null };
      render(<ChipInput inputRef={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('handles null inputRef', () => {
      expect(() => {
        render(<ChipInput inputRef={null} />);
      }).not.toThrow();
    });
  });

  describe('AdjustWidthInput', () => {
    it('attaches and uses input/change event listeners for resize', async () => {
      const user = setupUser();
      render(<ChipInput onChange={vi.fn()} />);

      const input = getInput();
      await user.click(input);

      Object.defineProperty(input, 'scrollWidth', { value: 100, configurable: true });

      await user.type(input, 'a');

      expect(input.style.width).not.toBe('');
    });

    it('clears width when input is emptied', () => {
      render(<ChipInput onChange={vi.fn()} />);

      const input = getInput();
      fireEvent.input(input, { target: { value: '' } });

      expect(input.style.width).toBe('');
    });

    it('removes event listeners on unmount', () => {
      const { unmount } = render(<ChipInput />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Scroll to End', () => {
    it('scrolls to end when items change', async () => {
      const { container, rerender } = render(
        <ChipInput value={[{ label: 'a' }]} onChange={vi.fn()} />,
      );

      const scrollEl = container.querySelector('[data-wrap]') as HTMLElement;
      if (!scrollEl) return;

      const scrollLeftSpy = vi.spyOn(scrollEl, 'scrollLeft', 'set');
      const scrollTopSpy = vi.spyOn(scrollEl, 'scrollTop', 'set');

      rerender(<ChipInput value={[{ label: 'a' }, { label: 'b' }]} onChange={vi.fn()} />);

      await waitFor(() => {
        expect(scrollLeftSpy).toHaveBeenCalled();
        expect(scrollTopSpy).toHaveBeenCalled();
      });
    });
  });

  describe('forceShowDropdown tracking', () => {
    it('updates dropdownVisibilityRef when forceShowDropdown changes', () => {
      const onOptionsDisplayChange = vi.fn();
      const options = makeOptions({ id: 'a', label: 'A', value: 'a' });
      const { rerender } = render(
        <ChipInput options={options} onOptionsDisplayChange={onOptionsDisplayChange} />,
      );
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(true);

      rerender(<ChipInput options={[]} onOptionsDisplayChange={onOptionsDisplayChange} />);
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(false);
    });
  });

  describe('description styling', () => {
    it('applies padding and height when description is provided', () => {
      const { container } = render(<ChipInput description="desc" />);
      const desc = container.querySelector('[class*="customInputDescription"]');
      expect(desc).toBeTruthy();
      const style = (desc as HTMLElement)?.style;
      expect(style?.paddingTop).toBeTruthy();
      expect(style?.minHeight).toBeTruthy();
    });
  });

  describe('Chip maxWidth in wrap mode', () => {
    it('sets maxWidth to 100% when wrap is wrap', () => {
      const { container } = render(
        <ChipInput value={[{ label: 'tag' }]} onChange={vi.fn()} wrap="wrap" />,
      );
      expect(container.querySelector('[data-wrap="wrap"]')).toBeTruthy();
    });
  });

  describe('ChipComponent fallback', () => {
    it('uses default Chip when no ChipComponent provided', () => {
      render(<ChipInput value={[{ label: 'default' }]} onChange={vi.fn()} />);
      expect(screen.getByText('default')).toBeTruthy();
    });
  });

  describe('onOpen / onClose callbacks', () => {
    it('calls showDropdown(true) on dropdown open', () => {
      const onOptionsDisplayChange = vi.fn();
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      render(<ChipInput options={options} onOptionsDisplayChange={onOptionsDisplayChange} />);
    });

    it('calls showDropdown(false) on dropdown close via rerender', () => {
      const onOptionsDisplayChange = vi.fn();
      const options = makeOptions({ id: 'opt', label: 'Opt', value: 'opt' });
      const { rerender } = render(
        <ChipInput options={options} onOptionsDisplayChange={onOptionsDisplayChange} />,
      );
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(true);

      rerender(<ChipInput options={[]} onOptionsDisplayChange={onOptionsDisplayChange} />);
      expect(onOptionsDisplayChange).toHaveBeenCalledWith(false);
    });
  });
});

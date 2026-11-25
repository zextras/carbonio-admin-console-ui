/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { KeyboardPresetObj } from '../../../../hooks/useKeyboard';
import {
  type DropdownItem,
  findTypeaheadIndex,
  getNextRovingIndex,
  getPopperListStyle,
  getRovingItems,
  getTriggerKeyboardPreset,
  isEditableTarget,
  isOutsideMenu,
  resolveInitialFocusRank,
  resolveItemRole,
  resolveMenuKeyAction,
  resolveTabStopIndex,
} from '../dropdown-logic';

const NO_MODIFIERS = { ctrlKey: false, metaKey: false, altKey: false };
const CTRL = { ctrlKey: true, metaKey: false, altKey: false };

const item = (id: string, extra: Partial<DropdownItem> = {}): DropdownItem => ({
  id,
  label: id,
  ...extra,
});
const divider = (id: string): DropdownItem => ({ id, type: 'divider' });

describe('dropdown-logic', () => {
  describe('resolveTabStopIndex', () => {
    it('gives the tab stop to the active item', () => {
      const items = [item('a'), item('b'), item('c')];
      expect(resolveTabStopIndex(items, 2)).toBe(2);
    });

    it('falls back to the first enabled item when nothing is active', () => {
      const items = [divider('d'), item('a'), item('b')];
      expect(resolveTabStopIndex(items, null)).toBe(1);
    });

    it('never leaves the tab stop on a divider or a disabled item', () => {
      const items = [divider('d'), item('a', { disabled: true }), item('b'), item('c')];
      expect(resolveTabStopIndex(items, 0)).toBe(2);
      expect(resolveTabStopIndex(items, 1)).toBe(2);
    });

    it('returns -1 when no item can take focus', () => {
      expect(resolveTabStopIndex([divider('d')], 0)).toBe(-1);
      expect(resolveTabStopIndex([], null)).toBe(-1);
    });
  });

  describe('resolveInitialFocusRank', () => {
    const items = [divider('d1'), item('a'), item('b', { selected: true }), divider('d2'), item('c')];

    it('focuses the selected item when opening from the top', () => {
      expect(resolveInitialFocusRank(items, 'first')).toBe(1);
    });

    it('focuses the first enabled item when nothing is selected', () => {
      expect(resolveInitialFocusRank([divider('d'), item('a'), item('b')], 'first')).toBe(0);
    });

    it('skips a selected item that cannot take focus', () => {
      const list = [item('a', { selected: true, disabled: true }), item('b')];
      expect(resolveInitialFocusRank(list, 'first')).toBe(0);
    });

    it('focuses the last enabled item when opening from the bottom', () => {
      expect(resolveInitialFocusRank(items, 'last')).toBe(2);
    });

    it('returns -1 when no item can take focus', () => {
      expect(resolveInitialFocusRank([divider('d')], 'first')).toBe(-1);
      expect(resolveInitialFocusRank([], 'last')).toBe(-1);
    });
  });

  describe('getNextRovingIndex', () => {
    it('steps forward and backward', () => {
      expect(getNextRovingIndex(3, 0, 1)).toBe(1);
      expect(getNextRovingIndex(3, 2, -1)).toBe(1);
    });

    it('wraps around at both ends', () => {
      expect(getNextRovingIndex(3, 2, 1)).toBe(0);
      expect(getNextRovingIndex(3, 0, -1)).toBe(2);
    });

    it('falls back to an end when nothing is focused', () => {
      expect(getNextRovingIndex(3, -1, 1)).toBe(0);
      expect(getNextRovingIndex(3, -1, -1)).toBe(2);
    });

    it('returns -1 when there are no items', () => {
      expect(getNextRovingIndex(0, -1, 1)).toBe(-1);
    });
  });

  describe('findTypeaheadIndex', () => {
    const labels = ['Apple', 'Banana', 'Cherry'];

    it('finds the next matching label after the current one', () => {
      expect(findTypeaheadIndex(labels, 0, 'c')).toBe(2);
    });

    it('ignores case and surrounding whitespace', () => {
      expect(findTypeaheadIndex([' Apple ', 'Banana'], 1, 'a')).toBe(0);
    });

    it('wraps around to the start', () => {
      expect(findTypeaheadIndex(labels, 2, 'a')).toBe(0);
    });

    it('starts from the first item when nothing is focused', () => {
      expect(findTypeaheadIndex(labels, -1, 'b')).toBe(1);
    });

    it('stays on the current item when it is the only match', () => {
      expect(findTypeaheadIndex(labels, 2, 'c')).toBe(2);
    });

    it('returns -1 when nothing matches or the list is empty', () => {
      expect(findTypeaheadIndex(labels, 0, 'z')).toBe(-1);
      expect(findTypeaheadIndex([], -1, 'a')).toBe(-1);
    });
  });

  describe('resolveItemRole', () => {
    it('keeps plain menuitems for items without a selection state', () => {
      expect(resolveItemRole(undefined, false)).toBe('menuitem');
    });

    it('uses menuitemradio for single selection', () => {
      expect(resolveItemRole(true, false)).toBe('menuitemradio');
    });

    it('uses menuitemcheckbox for multiple selection', () => {
      expect(resolveItemRole(false, true)).toBe('menuitemcheckbox');
    });
  });

  describe('resolveMenuKeyAction', () => {
    it.each([
      ['ArrowUp', NO_MODIFIERS, 'previous'],
      ['ArrowUp', CTRL, 'first'],
      ['ArrowDown', NO_MODIFIERS, 'next'],
      ['ArrowDown', CTRL, 'last'],
      ['Home', NO_MODIFIERS, 'first'],
      ['End', NO_MODIFIERS, 'last'],
      ['Enter', NO_MODIFIERS, 'activate'],
      [' ', NO_MODIFIERS, 'activate'],
      ['Escape', NO_MODIFIERS, 'close'],
      ['Tab', NO_MODIFIERS, 'close'],
      ['c', NO_MODIFIERS, 'typeahead'],
      ['F5', NO_MODIFIERS, 'none'],
      ['c', CTRL, 'none'],
    ] as const)('maps %s (%j) to %s', (key, modifiers, expected) => {
      expect(resolveMenuKeyAction(key, modifiers)).toBe(expected);
    });
  });

  describe('isEditableTarget', () => {
    it('is true for text inputs, textareas and selects', () => {
      expect(isEditableTarget(document.createElement('input'))).toBe(true);
      expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
      expect(isEditableTarget(document.createElement('select'))).toBe(true);
    });

    it('is false for buttons, plain elements and missing targets', () => {
      expect(isEditableTarget(document.createElement('button'))).toBe(false);
      expect(isEditableTarget(document.createElement('div'))).toBe(false);
      expect(isEditableTarget(null)).toBe(false);
    });
  });

  describe('isOutsideMenu', () => {
    it('is false for a target inside the menu', () => {
      const menu = document.createElement('div');
      const item = document.createElement('button');
      menu.append(item);
      const trigger = document.createElement('button');

      expect(isOutsideMenu(item, menu, trigger)).toBe(false);
    });

    it('is false for a target inside the trigger', () => {
      const trigger = document.createElement('div');
      const button = document.createElement('button');
      trigger.append(button);

      expect(isOutsideMenu(button, document.createElement('div'), trigger)).toBe(false);
    });

    it('is true for a target elsewhere in the document', () => {
      const elsewhere = document.createElement('button');

      expect(isOutsideMenu(elsewhere, document.createElement('div'), document.createElement('div'))).toBe(
        true,
      );
    });

    it('is true when the menu is not mounted', () => {
      expect(isOutsideMenu(document.createElement('div'), null, null)).toBe(true);
    });
  });

  describe('getRovingItems', () => {
    it('returns only the enabled dropdown items, in DOM order', () => {
      const container = document.createElement('div');
      container.innerHTML = [
        '<button data-dropdown-item>a</button>',
        '<button data-dropdown-item disabled>b</button>',
        '<div data-dropdown-item aria-disabled="true"></div>',
        '<div data-dropdown-item>c</div>',
        '<span>not an item</span>',
      ].join('');

      expect(getRovingItems(container).map((item) => item.textContent)).toEqual(['a', 'c']);
    });

    it('returns an empty list without a container', () => {
      expect(getRovingItems(null)).toEqual([]);
    });
  });

  describe('getPopperListStyle', () => {
    it('sizes the menu like the trigger when width is 100%', () => {
      expect(getPopperListStyle('100%', '18.75rem', '50vh', 300)).toEqual({
        width: '300px',
        maxWidth: '100%',
        '--popper-max-height': '50vh',
      });
    });

    it('keeps the configured width otherwise', () => {
      expect(getPopperListStyle('auto', '18.75rem', '50vh', 300)).toEqual({
        width: 'auto',
        maxWidth: '18.75rem',
        '--popper-max-height': '50vh',
      });
      expect(getPopperListStyle('100%', '18.75rem', '50vh', undefined)).toEqual({
        width: '100%',
        maxWidth: '100%',
        '--popper-max-height': '50vh',
      });
    });
  });

  describe('getTriggerKeyboardPreset', () => {
    const pressOn = (
      target: Element,
      type: 'keydown' | 'keyup',
      init: KeyboardEventInit,
    ): KeyboardEvent => {
      const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init });
      target.dispatchEvent(event);
      return event;
    };

    const presetFor = (
      presets: Array<KeyboardPresetObj>,
      type: string,
      key: string,
    ): KeyboardPresetObj => {
      const preset = presets.find(
        (candidate) =>
          candidate.type === type &&
          candidate.keys.some((matcher) => (matcher.key ?? matcher.code) === key),
      );
      if (!preset) {
        throw new Error(`No ${type} preset for ${key}`);
      }
      return preset;
    };

    const createHarness = () => {
      const toggleOpen = vi.fn();
      const stepIntoMenu = vi.fn();
      const closeOpenMenu = vi.fn();
      const spaceKeyDown = { current: false };
      return {
        toggleOpen,
        stepIntoMenu,
        closeOpenMenu,
        spaceKeyDown,
        presets: getTriggerKeyboardPreset(toggleOpen, stepIntoMenu, closeOpenMenu, spaceKeyDown),
      };
    };

    it('wires each key to its event type', () => {
      const { presets } = createHarness();

      expect(
        presets.map((preset) => [preset.type, preset.keys[0]?.key ?? preset.keys[0]?.code]),
      ).toEqual([
        ['keydown', 'Enter'],
        ['keydown', 'Space'],
        ['keyup', 'Space'],
        ['keydown', 'ArrowDown'],
        ['keydown', 'ArrowUp'],
        ['keydown', 'Escape'],
        ['keydown', 'Tab'],
      ]);
    });

    it('toggles on Enter unless the key was typed in an editable trigger', () => {
      const { presets, toggleOpen } = createHarness();
      const onEnter = presetFor(presets, 'keydown', 'Enter').callback;

      onEnter(pressOn(document.createElement('button'), 'keydown', { key: 'Enter' }));
      onEnter(pressOn(document.createElement('input'), 'keydown', { key: 'Enter' }));

      expect(toggleOpen).toHaveBeenCalledTimes(1);
    });

    it('stops Space from scrolling and arms its keyup on the trigger', () => {
      const { presets, spaceKeyDown } = createHarness();
      const onButton = pressOn(document.createElement('button'), 'keydown', {
        key: ' ',
        code: 'Space',
      });

      presetFor(presets, 'keydown', 'Space').callback(onButton);

      expect(onButton.defaultPrevented).toBe(true);
      expect(spaceKeyDown.current).toBe(true);
    });

    it('leaves a Space typed in an editable trigger alone', () => {
      const { presets, spaceKeyDown, toggleOpen } = createHarness();
      const onInput = pressOn(document.createElement('input'), 'keydown', {
        key: ' ',
        code: 'Space',
      });

      presetFor(presets, 'keydown', 'Space').callback(onInput);

      expect(onInput.defaultPrevented).toBe(false);
      expect(spaceKeyDown.current).toBe(false);
      expect(toggleOpen).not.toHaveBeenCalled();
    });

    it('toggles on Space keyup only when its keydown landed on the trigger', () => {
      const unarmed = createHarness();
      presetFor(unarmed.presets, 'keyup', 'Space').callback(
        pressOn(document.createElement('button'), 'keyup', { key: ' ', code: 'Space' }),
      );
      expect(unarmed.toggleOpen).not.toHaveBeenCalled();

      const armed = createHarness();
      presetFor(armed.presets, 'keydown', 'Space').callback(
        pressOn(document.createElement('button'), 'keydown', { key: ' ', code: 'Space' }),
      );
      presetFor(armed.presets, 'keyup', 'Space').callback(
        pressOn(document.createElement('button'), 'keyup', { key: ' ', code: 'Space' }),
      );
      expect(armed.toggleOpen).toHaveBeenCalledTimes(1);
      expect(armed.spaceKeyDown.current).toBe(false);
    });

    it('steps into the menu with the arrow keys, without moving the caret of editable triggers', () => {
      const { presets, stepIntoMenu } = createHarness();
      const down = pressOn(document.createElement('button'), 'keydown', { key: 'ArrowDown' });
      const up = pressOn(document.createElement('button'), 'keydown', { key: 'ArrowUp' });

      presetFor(presets, 'keydown', 'ArrowDown').callback(down);
      presetFor(presets, 'keydown', 'ArrowUp').callback(up);
      presetFor(presets, 'keydown', 'ArrowDown').callback(
        pressOn(document.createElement('input'), 'keydown', { key: 'ArrowDown' }),
      );

      expect(down.defaultPrevented).toBe(true);
      expect(up.defaultPrevented).toBe(true);
      expect(stepIntoMenu).toHaveBeenCalledTimes(2);
      expect(stepIntoMenu).toHaveBeenNthCalledWith(1, 'first');
      expect(stepIntoMenu).toHaveBeenNthCalledWith(2, 'last');
    });

    it('closes the open menu on Escape and Tab', () => {
      const { presets, closeOpenMenu } = createHarness();

      presetFor(presets, 'keydown', 'Escape').callback(
        pressOn(document.createElement('button'), 'keydown', { key: 'Escape' }),
      );
      presetFor(presets, 'keydown', 'Tab').callback(
        pressOn(document.createElement('button'), 'keydown', { key: 'Tab' }),
      );

      expect(closeOpenMenu).toHaveBeenCalledTimes(2);
    });
  });
});

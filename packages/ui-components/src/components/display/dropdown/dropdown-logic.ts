/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CSSProperties, type RefObject } from 'react';

import type { KeyboardPresetObj } from '../../../hooks/useKeyboard';
import { resolveThemeColor } from '../../../theme/theme-utils';
import { AnyColor } from '../../../types/utils';
import type { IconName } from '../../../web-components/icon-registry';

export type ItemClickHandler = (event: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;

export type DropdownItem = {
  type?: 'divider';
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: ItemClickHandler;
  selected?: boolean;
  disabled?: boolean;
  tooltipLabel?: string;
};

/** Item background custom properties consumed by dropdown.module.css. */
export type DropdownItemStyleVars = CSSProperties & {
  '--dropdown-item-bg': string;
  '--dropdown-item-bg-hover': string;
  '--dropdown-item-bg-focus': string;
  '--dropdown-item-bg-active': string;
};

export type MenuItemRole = 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';

/** What the open menu should do for a pressed key. */
export type MenuKeyAction =
  | 'previous'
  | 'next'
  | 'first'
  | 'last'
  | 'activate'
  | 'close'
  | 'typeahead'
  | 'none';

type KeyModifiers = Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey'>;

/** Index of the item to focus when moving by `offset` from `currentIndex`; -1 when there is none. */
export function getNextRovingIndex(count: number, currentIndex: number, offset: number): number {
  if (count === 0) {
    return -1;
  }
  if (currentIndex === -1) {
    return offset > 0 ? 0 : count - 1;
  }
  return (currentIndex + offset + count) % count;
}

/** Index of the first item after the current one (wrapping) whose label starts with `char`; -1 when none. */
export function findTypeaheadIndex(
  labels: Array<string>,
  currentIndex: number,
  char: string,
): number {
  const wanted = char.toLowerCase();
  const candidateIndexes = Array.from(
    { length: labels.length },
    (_, step) => (currentIndex + step + 1 + labels.length) % labels.length,
  );
  const match = candidateIndexes.find((index) =>
    labels[index].trim().toLowerCase().startsWith(wanted),
  );
  return match ?? -1;
}

/** Whether a dropdown item can receive focus. */
function isItemEnabled(item: HTMLElement): boolean {
  return (
    !(item instanceof HTMLButtonElement && item.disabled) &&
    item.getAttribute('aria-disabled') !== 'true'
  );
}

/** Enabled, focusable items of a dropdown list in DOM order (dividers excluded). */
export function getRovingItems(container: HTMLElement | null): Array<HTMLElement> {
  if (!container) {
    return [];
  }
  return Array.from(container.querySelectorAll<HTMLElement>('[data-dropdown-item]')).filter(
    isItemEnabled,
  );
}

/**
 * Whether a real pointer click activated an item. Keyboard activation clicks the item
 * programmatically, and those clicks carry `detail === 0`.
 */
export function isPointerActivation(event: React.SyntheticEvent | KeyboardEvent): boolean {
  if (event instanceof KeyboardEvent) {
    return false;
  }
  const nativeEvent = event.nativeEvent;
  return nativeEvent instanceof MouseEvent && nativeEvent.detail > 0;
}

/** Whether the event target is an editable control: typing in it must never toggle the menu. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement) {
    return true;
  }
  if (target instanceof HTMLTextAreaElement) {
    return true;
  }
  if (target instanceof HTMLSelectElement) {
    return true;
  }
  return target instanceof HTMLElement && target.isContentEditable === true;
}

/** True when `target` lies outside both the menu and its trigger. */
export function isOutsideMenu(
  target: Node,
  menu: HTMLElement | null,
  trigger: HTMLElement | null,
): boolean {
  const insideMenu = menu?.contains(target) ?? false;
  const insideTrigger = trigger?.contains(target) ?? false;
  return !insideMenu && !insideTrigger;
}

/** The ARIA role that exposes an item's selection state. */
export function resolveItemRole(selected: boolean | undefined, multiple: boolean): MenuItemRole {
  if (selected === undefined) {
    return 'menuitem';
  }
  return multiple ? 'menuitemcheckbox' : 'menuitemradio';
}

/** Whether a dropdown item can receive focus (dividers and disabled items cannot). */
function isEnabledItem(item: DropdownItem): boolean {
  return item.type !== 'divider' && !item.disabled;
}

/** Index in `items` of the entry owning the menu's tab stop: the active item, else the first one that can take focus. */
export function resolveTabStopIndex(
  items: Array<DropdownItem>,
  activeIndex: number | null,
): number {
  if (activeIndex !== null) {
    const activeItem = items[activeIndex];
    if (activeItem !== undefined && isEnabledItem(activeItem)) {
      return activeIndex;
    }
  }
  return items.findIndex(isEnabledItem);
}

/** Position among the focusable items of the item to focus when the menu opens; -1 when none can. */
export function resolveInitialFocusRank(
  items: Array<DropdownItem>,
  edge: 'first' | 'last',
): number {
  const enabledItems = items.filter(isEnabledItem);
  if (enabledItems.length === 0) {
    return -1;
  }
  if (edge === 'last') {
    return enabledItems.length - 1;
  }
  const selectedRank = enabledItems.findIndex((item) => item.selected === true);
  return selectedRank === -1 ? 0 : selectedRank;
}

/** Maps a pressed key to the action the open menu should perform. */
export function resolveMenuKeyAction(key: string, modifiers: KeyModifiers): MenuKeyAction {
  if (key === 'ArrowUp') {
    return modifiers.ctrlKey ? 'first' : 'previous';
  }
  if (key === 'ArrowDown') {
    return modifiers.ctrlKey ? 'last' : 'next';
  }
  if (key === 'Home') {
    return 'first';
  }
  if (key === 'End') {
    return 'last';
  }
  if ((key === 'Enter' || key === ' ') && !modifiers.ctrlKey) {
    return 'activate';
  }
  if (key === 'Escape' && !modifiers.ctrlKey) {
    return 'close';
  }
  if (key === 'Tab') {
    return 'close';
  }
  if (key.length === 1 && !modifiers.ctrlKey && !modifiers.metaKey && !modifiers.altKey) {
    return 'typeahead';
  }
  return 'none';
}

/** Item background variables for the regular, hover, focus and active states. */
export function getItemStyleVars(
  selected: boolean | undefined,
  selectedBackgroundColor?: AnyColor,
): DropdownItemStyleVars {
  const bgColor = selected && selectedBackgroundColor ? selectedBackgroundColor : 'gray5';
  return {
    '--dropdown-item-bg': resolveThemeColor(String(bgColor), 'regular'),
    '--dropdown-item-bg-hover': resolveThemeColor(String(bgColor), 'hover'),
    '--dropdown-item-bg-focus': resolveThemeColor(String(bgColor), 'focus'),
    '--dropdown-item-bg-active': resolveThemeColor(String(bgColor), 'active'),
  };
}

/** The menu's inline size: a `100%` width tracks the trigger's measured width. */
export function getPopperListStyle(width: string, triggerWidth: number | undefined): CSSProperties {
  if (width !== '100%') {
    return { width };
  }
  return triggerWidth
    ? { width: `${triggerWidth}px`, maxWidth: '100%' }
    : { width: '100%', maxWidth: '100%' };
}

/**
 * Keyboard support for the trigger, enabled by default.
 * Editable targets are skipped for Enter/Space/arrows (no toggle, no preventDefault) so typing keeps working.
 */
export function getTriggerKeyboardPreset(
  toggleOpen: (event: KeyboardEvent) => void,
  stepIntoMenu: (edge: 'first' | 'last') => void,
  closeOpenMenu: (event: KeyboardEvent) => void,
  spaceKeyDownOnTriggerRef: RefObject<boolean>,
): KeyboardPresetObj[] {
  const guardedToggle = (event: KeyboardEvent): void => {
    if (isEditableTarget(event.target)) {
      return;
    }
    toggleOpen(event);
  };
  const preventSpaceScroll = (event: KeyboardEvent): void => {
    if (isEditableTarget(event.target)) {
      return;
    }
    event.preventDefault();
    spaceKeyDownOnTriggerRef.current = true;
  };
  const guardedSpaceToggle = (event: KeyboardEvent): void => {
    // A Space keyup must pair with a Space keydown that landed on the trigger: activating an
    // item with Space closes the menu, restores focus to the trigger and would re-open it here.
    if (!spaceKeyDownOnTriggerRef.current) {
      return;
    }
    spaceKeyDownOnTriggerRef.current = false;
    guardedToggle(event);
  };
  const guardedStepInto =
    (edge: 'first' | 'last') =>
    (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) {
        return;
      }
      event.preventDefault();
      stepIntoMenu(edge);
    };
  return [
    {
      type: 'keydown',
      callback: guardedToggle,
      keys: [{ key: 'Enter', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: preventSpaceScroll,
      keys: [{ code: 'Space', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keyup',
      callback: guardedSpaceToggle,
      keys: [{ code: 'Space', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: guardedStepInto('first'),
      keys: [{ key: 'ArrowDown', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: guardedStepInto('last'),
      keys: [{ key: 'ArrowUp', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: closeOpenMenu,
      keys: [{ key: 'Escape', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: closeOpenMenu,
      keys: [{ key: 'Tab' }],
      haveToPreventDefault: false,
    },
  ];
}

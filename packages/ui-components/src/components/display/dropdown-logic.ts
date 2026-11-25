/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CSSProperties } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';

/** Item background custom properties consumed by dropdown.module.css. */
export type DropdownItemStyleVars = CSSProperties & {
  '--dropdown-item-bg': string;
  '--dropdown-item-bg-hover': string;
  '--dropdown-item-bg-focus': string;
  '--dropdown-item-bg-active': string;
};

/** Popper sizing custom property consumed by dropdown.module.css. */
export type PopperListStyleVars = CSSProperties & { '--popper-max-height': string };

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

/** Popper sizing: a `100%` width tracks the trigger's measured width. */
export function getPopperListStyle(
  width: string,
  maxWidth: string,
  maxHeight: string,
  triggerWidth: number | undefined,
): PopperListStyleVars {
  return {
    width: width === '100%' && triggerWidth ? `${triggerWidth}px` : width,
    maxWidth: width === '100%' ? '100%' : maxWidth,
    '--popper-max-height': maxHeight,
  };
}

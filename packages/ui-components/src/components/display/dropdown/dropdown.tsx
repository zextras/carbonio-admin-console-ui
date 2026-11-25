/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, { HTMLAttributes, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { clickNodeWithFocus, useKeyboard } from '../../../hooks/useKeyboard';
import { setupFloating } from '../../../utils/floating-ui';
import { FOCUSABLE_SELECTOR } from '../../constants';
import { Portal } from '../../utilities/Portal';
import styles from './dropdown.module.css';
import { type ItemTextSize } from './dropdown-item-content';
import { DropdownItemList } from './dropdown-item-list';
import {
  type DropdownItem,
  findTypeaheadIndex,
  getNextRovingIndex,
  getPopperListStyle,
  getRovingItems,
  getTriggerKeyboardPreset,
  isEditableTarget,
  isOutsideMenu,
  type ItemClickHandler,
  type MenuKeyAction,
  resolveInitialFocusRank,
  resolveMenuKeyAction,
  resolveTabStopIndex,
} from './dropdown-logic';

/** Props the dropdown reads from, and injects into, its trigger element. */
type DropdownTriggerProps = React.AriaAttributes & {
  id?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  ref?: React.Ref<HTMLElement>;
};

export type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'contextMenu'> & {
  disabled?: boolean;
  items: Array<DropdownItem>;
  display?: 'block' | 'inline-block';
  width?: string;
  disableRestoreFocus?: boolean;
  disableAutoFocus?: boolean;
  multiple?: boolean;
  /** Fired whenever the menu opens or closes, in both modes. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled open state. When set, the menu follows it and only reports intent. */
  open?: boolean;
  children: React.ReactElement<DropdownTriggerProps>;
  placement?: Placement;
  itemTextSize?: ItemTextSize;
};

/** How the list moves focus into its items when it opens. */
type FocusOnOpen = 'none' | 'first' | 'last';

export const Dropdown = ({
  disabled = false,
  items,
  placement = 'bottom-start',
  display = 'inline-block',
  width = 'auto',
  disableRestoreFocus = false,
  disableAutoFocus = false,
  multiple = false,
  onOpenChange,
  open: openProp,
  children,
  itemTextSize = 'medium',
  ...rest
}: DropdownProps) => {
  // With `open` set the parent owns the state and the menu only reports intent.
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const open = isControlled ? openProp : internalOpen;
  // Null until an item is focused: the tab stop then belongs to the first item that can take it.
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const listId = useId();
  // Menus opened without a trigger interaction use this default.
  const focusOnOpenRef = useRef<FocusOnOpen>('first');
  const autoFocusedNodeRef = useRef<HTMLElement | null>(null);
  const spaceKeyDownOnTriggerRef = useRef<boolean>(false);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const innerTriggerRef = useRef<HTMLElement | null>(null);

  const getEnabledItems = (): Array<HTMLElement> => getRovingItems(popperItemsRef.current);

  const restoreTriggerFocus = (): void => {
    const triggerElement = innerTriggerRef.current;
    if (triggerElement?.matches(FOCUSABLE_SELECTOR)) {
      triggerElement.focus();
      return;
    }
    triggerElement?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  };

  const closePopper = (event?: React.SyntheticEvent | KeyboardEvent): void => {
    event?.preventDefault();
    if (!isControlled) {
      setInternalOpen(false);
    }
    setActiveItemIndex(null);
    onOpenChange?.(false);
    if (!disableRestoreFocus) {
      restoreTriggerFocus();
    }
  };

  const openPopper = (focusMode: FocusOnOpen): void => {
    focusOnOpenRef.current = focusMode;
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  };

  // Every open moves focus into the menu, so the arrow keys work right away in any browser:
  // not all of them focus a button on click. The caller opts out for editable triggers.
  const toggleOpen = (
    event: React.SyntheticEvent | KeyboardEvent,
    focusMode: FocusOnOpen = 'first',
  ): void => {
    if (open) {
      event.preventDefault();
      closePopper();
    } else if (!disabled) {
      event.preventDefault();
      openPopper(focusMode);
    }
  };

  /** Arrow keys on the trigger: open the menu (first/last item) or step into an open one. */
  const stepIntoMenu = (edge: 'first' | 'last'): void => {
    if (disabled) {
      return;
    }
    if (!open) {
      openPopper(edge);
      return;
    }
    const enabledItems = getEnabledItems();
    const targetIndex = edge === 'last' ? enabledItems.length - 1 : 0;
    enabledItems[targetIndex]?.focus({ preventScroll: true });
  };

  const closeOpenMenuFromTrigger = (event: KeyboardEvent): void => {
    if (open) {
      closePopper(event);
    }
  };

  // A click inside an editable trigger (a combobox-style input) keeps focus there so typing goes on.
  const handleTriggerClick: React.MouseEventHandler<HTMLElement> = (event) => {
    children.props.onClick?.(event);
    toggleOpen(event, isEditableTarget(event.target) ? 'none' : 'first');
  };

  const triggerEvents = getTriggerKeyboardPreset(
    (event) => toggleOpen(event, 'first'),
    stepIntoMenu,
    closeOpenMenuFromTrigger,
    spaceKeyDownOnTriggerRef,
  );
  useKeyboard(innerTriggerRef, triggerEvents);

  useLayoutEffect(() => {
    const reference = innerTriggerRef.current;
    const floatingElement = dropdownRef.current;
    if (!open || !reference || !floatingElement) {
      return undefined;
    }
    return setupFloating(reference, floatingElement, {
      placement,
      middleware: [flip(), shift({ limiter: limitShift() })],
      strategy: 'fixed',
    });
  }, [open, placement, dropdownRef, innerTriggerRef]);

  const setPopperItemsRefAndFocus: React.RefCallback<HTMLDivElement | null> = (node) => {
    popperItemsRef.current = node;
    // Focus only on a freshly mounted list: re-attach of the same node happens on every render
    // (ref identity churn) and must not steal focus back from the item the user navigated to.
    const focusMode = focusOnOpenRef.current;
    if (
      !node ||
      !open ||
      disableAutoFocus ||
      focusMode === 'none' ||
      autoFocusedNodeRef.current === node
    ) {
      return;
    }
    autoFocusedNodeRef.current = node;
    // Dividers and disabled items cannot take focus: pick by rank among the focusable items.
    const edge = focusMode === 'last' ? 'last' : 'first';
    getRovingItems(node)[resolveInitialFocusRank(items, edge)]?.focus();
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const closeOnOutsideClick = (event: Event): void => {
      const target = event.target;
      if (
        target instanceof Node &&
        isOutsideMenu(target, dropdownRef.current, innerTriggerRef.current)
      ) {
        closePopper();
      }
    };
    window.document.addEventListener('click', closeOnOutsideClick, true);
    return (): void => {
      window.document.removeEventListener('click', closeOnOutsideClick, true);
    };
  }, [open, closePopper, dropdownRef, innerTriggerRef]);

  const createItemClickHandler =
    (onClick: DropdownItem['onClick']): ItemClickHandler =>
    (event): void => {
      if (!event.defaultPrevented) {
        onClick?.(event);
      }
      if (multiple) {
        event.stopPropagation();
        return;
      }
      closePopper();
    };

  const runMenuKeyAction = (
    action: MenuKeyAction,
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    const enabledItems = getEnabledItems();
    const currentIndex = enabledItems.findIndex((item) => item === document.activeElement);
    const focusItem = (index: number): void => {
      enabledItems[index]?.focus({ preventScroll: true });
    };
    switch (action) {
      case 'previous':
        focusItem(getNextRovingIndex(enabledItems.length, currentIndex, -1));
        break;
      case 'next':
        focusItem(getNextRovingIndex(enabledItems.length, currentIndex, 1));
        break;
      case 'first':
        focusItem(0);
        break;
      case 'last':
        focusItem(enabledItems.length - 1);
        break;
      case 'activate':
        clickNodeWithFocus(popperItemsRef);
        break;
      case 'close':
        closePopper(event);
        break;
      case 'typeahead': {
        const labels = enabledItems.map((item) => item.textContent ?? '');
        focusItem(findTypeaheadIndex(labels, currentIndex, event.key));
        break;
      }
      default:
        break;
    }
  };

  const handleListKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    runMenuKeyAction(resolveMenuKeyAction(event.key, event), event);
  };

  // Focus follows the pointer, so hover and focus are one item (mouse-initiated focus shows no ring).
  const focusItemUnderPointer: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const item = target.closest<HTMLElement>('[data-dropdown-item]');
    if (item && item !== document.activeElement && getEnabledItems().includes(item)) {
      item.focus({ preventScroll: true });
    }
  };

  const tabStopIndex = resolveTabStopIndex(items, activeItemIndex);

  const triggerId = children.props.id ?? `${listId}-trigger`;
  const triggerComponent = React.cloneElement(children, {
    ref: innerTriggerRef,
    id: triggerId,
    onClick: handleTriggerClick,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    ...(open ? { 'aria-controls': listId } : {}),
  });

  const popperListStyle = getPopperListStyle(width, innerTriggerRef.current?.clientWidth);

  return (
    <div className={styles.popperDropdownWrapper} data-display={display} {...rest}>
      {triggerComponent}
      <Portal show={open}>
        <div
          ref={dropdownRef}
          id={listId}
          aria-labelledby={triggerId}
          className={clsx(styles.popperList, open && styles.open)}
          style={popperListStyle}
          role="menu"
          tabIndex={-1}
          onClick={(event) => event.preventDefault()}
          onMouseMove={focusItemUnderPointer}
          onKeyDown={handleListKeyDown}
        >
          <div ref={setPopperItemsRefAndFocus}>
            <DropdownItemList
              items={items}
              tabStopIndex={tabStopIndex}
              multiple={multiple}
              itemTextSize={itemTextSize}
              createClickHandler={createItemClickHandler}
              onItemFocus={setActiveItemIndex}
            />
          </div>
        </div>
      </Portal>
    </div>
  );
};

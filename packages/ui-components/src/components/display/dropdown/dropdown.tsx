/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, {
  HTMLAttributes,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../../hooks/useCombinedRefs';
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
  isPointerActivation,
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
  multiple?: boolean;
  /** Fired whenever the menu opens or closes, in both modes. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled open state. When set, the menu follows it and only reports intent. */
  open?: boolean;
  children: React.ReactElement<DropdownTriggerProps>;
  placement?: Placement;
  itemTextSize?: ItemTextSize;
  /**
   * Keep focus where it is when the menu opens. For combobox-style triggers, where the user
   * keeps typing in an input while the options are shown.
   */
  disableAutoFocus?: boolean;
  /** Leave focus alone when the menu closes, instead of moving it back to the trigger. */
  disableRestoreFocus?: boolean;
  /**
   * Don't add `aria-haspopup`, `aria-expanded`, `aria-controls` and `id` to the trigger.
   * For triggers whose focusable element is nested: the consumer puts the semantics there.
   */
  disableTriggerAria?: boolean;
  /**
   * Id of the menu element, generated when omitted. Set it to reference the menu from
   * elsewhere, e.g. `aria-controls` on a nested input when `disableTriggerAria` is set.
   */
  menuId?: string;
};

/** How the list moves focus into its items when it opens. */
type FocusOnOpen = 'none' | 'first' | 'last';

export const Dropdown = ({
  disabled = false,
  items,
  placement = 'bottom-start',
  display = 'inline-block',
  width = 'auto',
  multiple = false,
  onOpenChange,
  open: openProp,
  children,
  itemTextSize = 'medium',
  disableAutoFocus = false,
  disableRestoreFocus = false,
  disableTriggerAria = false,
  menuId,
  ...rest
}: DropdownProps) => {
  // With `open` set the parent owns the state and the menu only reports intent.
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const open = isControlled ? openProp : internalOpen;
  // Null until an item is focused: the tab stop then belongs to the first item that can take it.
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const generatedListId = useId();
  const listId = menuId ?? generatedListId;
  // One-shot: only a trigger interaction arms a focus move into the menu. A parent opening
  // the menu through `open` leaves focus where it is.
  const pendingFocusRef = useRef<FocusOnOpen>('none');
  // The committed open state, read after a controlled open request to see if it was honoured.
  const openRef = useRef<boolean>(open);
  const spaceKeyDownOnTriggerRef = useRef<boolean>(false);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // The trigger's own ref (e.g. one a consumer forwards) stays attached alongside ours.
  const innerTriggerRef = useCombinedRefs<HTMLElement>(children.props.ref);

  useLayoutEffect(() => {
    openRef.current = open;
  });

  function getEnabledItems(): Array<HTMLElement> {
    return getRovingItems(popperItemsRef.current);
  }

  function restoreTriggerFocus(): void {
    if (disableRestoreFocus) {
      return;
    }
    const triggerElement = innerTriggerRef.current;
    if (triggerElement?.matches(FOCUSABLE_SELECTOR)) {
      triggerElement.focus();
      return;
    }
    triggerElement?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }

  function closePopper(
    event?: React.SyntheticEvent | KeyboardEvent,
    { restoreFocus = true }: { restoreFocus?: boolean } = {},
  ): void {
    event?.preventDefault();
    if (!isControlled) {
      setInternalOpen(false);
    }
    setActiveItemIndex(null);
    onOpenChange?.(false);
    if (restoreFocus) {
      restoreTriggerFocus();
    }
  }

  function openPopper(focusMode: FocusOnOpen): void {
    pendingFocusRef.current = disableAutoFocus ? 'none' : focusMode;
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
    if (isControlled) {
      // The parent may ignore the request. Its state update, if any, is flushed before this
      // microtask: a request that didn't open the menu must not move focus on a later open.
      queueMicrotask(() => {
        if (!openRef.current) {
          pendingFocusRef.current = 'none';
        }
      });
    }
  }

  // Every open moves focus into the menu, so the arrow keys work right away in any browser:
  // not all of them focus a button on click. The caller opts out for editable triggers.
  function toggleOpen(
    event: React.SyntheticEvent | KeyboardEvent,
    focusMode: FocusOnOpen = 'first',
  ): void {
    if (open) {
      event.preventDefault();
      closePopper();
    } else if (!disabled) {
      event.preventDefault();
      openPopper(focusMode);
    }
  }

  /** Arrow keys on the trigger: open the menu (first/last item) or step into an open one. */
  function stepIntoMenu(edge: 'first' | 'last'): void {
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
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (open) {
      closePopper(event);
    }
  }

  // Tab from the trigger moves on in the page: close without cancelling it or pulling focus back.
  function closeOnTab(): void {
    if (open) {
      closePopper(undefined, { restoreFocus: false });
    }
  }

  // A click inside an editable trigger (a combobox-style input) keeps focus there so typing goes on.
  function handleTriggerClick(event: React.MouseEvent<HTMLElement>): void {
    children.props.onClick?.(event);
    toggleOpen(event, isEditableTarget(event.target) ? 'none' : 'first');
  }

  const triggerEvents = getTriggerKeyboardPreset({
    triggerRef: innerTriggerRef,
    toggleOpen,
    stepIntoMenu,
    closeOnEscape,
    closeOnTab,
    spaceKeyDownOnTriggerRef,
  });
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

  function setPopperItemsRefAndFocus(node: HTMLDivElement | null): void {
    popperItemsRef.current = node;
    const focusMode = pendingFocusRef.current;
    if (!node || focusMode === 'none') {
      return;
    }
    // Consume it once: ref identity churn re-attaches the same node on every render, which
    // must not steal focus back from the item the user navigated to.
    pendingFocusRef.current = 'none';
    // Dividers and disabled items cannot take focus: pick by rank among the focusable items.
    const edge = focusMode === 'last' ? 'last' : 'first';
    getRovingItems(node)[resolveInitialFocusRank(items, edge)]?.focus();
  }

  // An effect event reads the latest closePopper without re-subscribing on every render.
  const closeOnOutsideClick = useEffectEvent((event: Event): void => {
    const target = event.target;
    if (
      target instanceof Node &&
      isOutsideMenu(target, dropdownRef.current, innerTriggerRef.current)
    ) {
      // The click already put focus where the user wanted it; don't yank it back.
      closePopper(undefined, { restoreFocus: false });
    }
  });

  useEffect(() => {
    if (!open) {
      pendingFocusRef.current = 'none';
      return undefined;
    }
    function handleDocumentClick(event: Event): void {
      closeOnOutsideClick(event);
    }
    globalThis.document.addEventListener('click', handleDocumentClick, true);
    return (): void => {
      globalThis.document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [open]);

  function createItemClickHandler(onClick: DropdownItem['onClick']): ItemClickHandler {
    return function handleItemClick(event): void {
      if (!event.defaultPrevented) {
        onClick?.(event);
      }
      if (multiple) {
        event.stopPropagation();
        return;
      }
      // A mouse user doesn't need focus back on the trigger; keyboard users do (WAI-ARIA).
      closePopper(undefined, { restoreFocus: !isPointerActivation(event) });
    };
  }

  function runMenuKeyAction(
    action: MenuKeyAction,
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void {
    const enabledItems = getEnabledItems();
    const focusedItem = document.activeElement;
    const currentIndex =
      focusedItem instanceof HTMLElement ? enabledItems.indexOf(focusedItem) : -1;
    function focusItem(index: number): void {
      enabledItems[index]?.focus({ preventScroll: true });
    }
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
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    runMenuKeyAction(resolveMenuKeyAction(event.key, event), event);
  }

  // Focus follows the pointer, so hover and focus are one item (mouse-initiated focus shows no ring).
  function focusItemUnderPointer(event: React.MouseEvent<HTMLDivElement>): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const item = target.closest<HTMLElement>('[data-dropdown-item]');
    if (item && item !== document.activeElement && getEnabledItems().includes(item)) {
      item.focus({ preventScroll: true });
    }
  }

  const tabStopIndex = resolveTabStopIndex(items, activeItemIndex);

  const triggerId = disableTriggerAria
    ? children.props.id
    : children.props.id ?? `${listId}-trigger`;
  const triggerAria: DropdownTriggerProps = disableTriggerAria
    ? {}
    : {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        ...(open ? { 'aria-controls': listId } : {}),
      };
  const triggerComponent = React.cloneElement(children, {
    ref: innerTriggerRef,
    onClick: handleTriggerClick,
    ...triggerAria,
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

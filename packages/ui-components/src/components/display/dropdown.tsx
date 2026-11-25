/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-divider';

import { flip, limitShift, Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, { HTMLAttributes, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { clickNodeWithFocus, KeyboardPresetObj, useKeyboard } from '../../hooks/useKeyboard';
import { AnyColor } from '../../types/utils';
import { setupFloating } from '../../utils/floating-ui';
import { IconName } from '../../web-components/icon-registry';
import { FOCUSABLE_SELECTOR, TIMERS } from '../constants';
import { Portal } from '../utilities/Portal';
import styles from './dropdown.module.css';
import {
  findTypeaheadIndex,
  getItemStyleVars,
  getNextRovingIndex,
  getPopperListStyle,
  getRovingItems,
  isEditableTarget,
  isOutsideMenu,
  type MenuKeyAction,
  resolveItemRole,
  resolveMenuKeyAction,
} from './dropdown-logic';
import { Tooltip } from './Tooltip';

type ItemTextSize = React.ComponentPropsWithRef<'ds-text'>['size'];

type ItemClickHandler = (event: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;

export type DropdownItem = {
  type?: 'divider';
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: ItemClickHandler;
  selected?: boolean;
  disabled?: boolean;
  items?: Array<DropdownItem>;
  tooltipLabel?: string;
};

type ListItemContentProps = {
  icon?: IconName;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  itemTextSize: ItemTextSize;
  tooltipLabel?: string;
};

type PopperListItemProps = ListItemContentProps &
  React.ComponentPropsWithRef<'button'> & {
    onClick?: ItemClickHandler;
    selectedBackgroundColor?: AnyColor;
  };

type NestListItemProps = ListItemContentProps &
  React.ComponentPropsWithRef<'div'> & {
    onClick?: ItemClickHandler;
    selectedBackgroundColor?: AnyColor;
    items: Array<DropdownItem>;
    onOpen?: () => void;
    onClose?: () => void;
  };

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
  maxWidth?: string;
  maxHeight?: string;
  handleTriggerEvents?: boolean;
  disableRestoreFocus?: boolean;
  disableAutoFocus?: boolean;
  multiple?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  /** Controlled open state. When set, the menu follows it and reports intent via onOpenChange. */
  open?: boolean;
  /** Uncontrolled initial state. */
  defaultOpen?: boolean;
  /** Fired whenever the menu wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement<DropdownTriggerProps>;
  triggerRef?: React.Ref<HTMLElement> | null;
  placement?: Placement;
  disablePortal?: boolean;
  forceOpen?: boolean;
  itemTextSize?: ItemTextSize;
  dropdownListRef?: React.ForwardedRef<HTMLDivElement> | null;
};

/** How the list moves focus into its items when it opens. */
type FocusOnOpen = 'none' | 'default' | 'last';

type ItemRenderContext = {
  activeItemIndex: number;
  multiple: boolean;
  itemTextSize: ItemTextSize;
  createClickHandler: (onClick: DropdownItem['onClick']) => ItemClickHandler;
  onItemFocus: (index: number) => void;
};

/**
 * Keyboard support for the trigger, enabled by default.
 * Editable targets are skipped for Enter/Space/arrows (no toggle, no preventDefault) so typing keeps working.
 */
function getTriggerKeyboardPreset(
  toggleOpen: (event: KeyboardEvent) => void,
  stepIntoMenu: (edge: 'first' | 'last') => void,
  closeOpenMenu: (event: KeyboardEvent) => void,
  spaceKeyDownOnTriggerRef: React.RefObject<boolean>,
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
  const guardedStepInto = (edge: 'first' | 'last') => (event: KeyboardEvent): void => {
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

/** Builds the element for one dropdown item: a divider, a submenu row or a leaf item. */
function buildItemElement(
  item: DropdownItem,
  index: number,
  context: ItemRenderContext,
): React.ReactNode {
  const { id, icon, label, onClick, selected, items: subItems, disabled, type, ...itemProps } =
    item;
  if (type === 'divider') {
    return <ds-divider key={id}></ds-divider>;
  }
  const rovingTabIndex = index === context.activeItemIndex ? 0 : -1;
  const handleFocus = (): void => context.onItemFocus(index);
  if (subItems) {
    return (
      <NestListItem
        icon={icon}
        label={label ?? ''}
        aria-haspopup="menu"
        aria-disabled={disabled ? true : undefined}
        onClick={context.createClickHandler(onClick)}
        selected={selected}
        key={id}
        disabled={disabled}
        items={subItems}
        itemTextSize={context.itemTextSize}
        data-dropdown-item=""
        tabIndex={rovingTabIndex}
        onFocus={handleFocus}
        {...itemProps}
      />
    );
  }
  return (
    <PopperListItem
      icon={icon}
      label={label ?? ''}
      role={resolveItemRole(selected, context.multiple)}
      aria-checked={selected}
      aria-disabled={disabled ? true : undefined}
      onClick={context.createClickHandler(onClick)}
      selected={selected}
      key={id}
      disabled={disabled}
      itemTextSize={context.itemTextSize}
      data-dropdown-item=""
      tabIndex={rovingTabIndex}
      onFocus={handleFocus}
      {...itemProps}
    />
  );
}

const ListItemContent = ({
  icon,
  label,
  selected,
  disabled,
  itemTextSize,
  tooltipLabel,
}: Readonly<ListItemContentProps>) => (
  <Tooltip disabled={!disabled || !tooltipLabel} label={tooltipLabel} placement="bottom-end">
    <div className={styles.rowLayout}>
      {icon && (
        <ds-icon
          className={styles.itemIcon}
          icon={icon}
          size="medium"
          color={disabled ? 'secondary' : 'text'}
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        ></ds-icon>
      )}
      <ds-text
        as="span"
        size={itemTextSize}
        weight={selected ? 'bold' : 'regular'}
        color={disabled ? 'secondary' : 'text'}
        disabled={disabled}
      >
        {label}
      </ds-text>
    </div>
  </Tooltip>
);

const PopperListItem = ({
  icon,
  label,
  onClick,
  selected,
  disabled = false,
  selectedBackgroundColor,
  itemTextSize,
  tooltipLabel,
  ...rest
}: Readonly<PopperListItemProps>) => (
  <button
    type="button"
    className={clsx(
      styles.containerEl,
      styles.itemButton,
      disabled && styles.disabled,
      selected && 'zapp-selected',
    )}
    style={getItemStyleVars(selected, selectedBackgroundColor)}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    {...rest}
  >
    <ListItemContent
      icon={icon}
      label={label}
      selected={selected}
      disabled={disabled}
      itemTextSize={itemTextSize}
      tooltipLabel={tooltipLabel}
    />
  </button>
);

const NestListItem = ({
  icon,
  label,
  onClick,
  selected,
  disabled = false,
  items,
  selectedBackgroundColor,
  itemTextSize,
  tooltipLabel,
  onOpen,
  onClose,
  ...rest
}: Readonly<NestListItemProps>) => {
  const [open, setOpen] = useState(false);
  const [submenuListElement, setSubmenuListElement] = useState<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelPendingClose = (): void => {
    if (closeTimeoutRef.current !== undefined) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
  };

  const openSubmenu = (): void => {
    cancelPendingClose();
    setOpen(true);
    onOpen?.();
  };

  const closeSubmenu = (): void => {
    cancelPendingClose();
    const focusIsOnChild = itemRef.current?.contains(document.activeElement);
    setOpen(false);
    onClose?.();
    if (focusIsOnChild) {
      itemRef.current?.focus({ preventScroll: true });
    }
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight' && !event.ctrlKey) {
      event.preventDefault();
      openSubmenu();
    }
  };

  // Escape/ArrowLeft must stay a native listener on the row: it has to stop the real event
  // propagation before it reaches the parent menu's close handler, which React's synthetic
  // delegation (at the root) cannot do in time.
  const submenuCloseKeyEvents: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: (event): void => {
        closeSubmenu();
        event.stopPropagation();
      },
      keys: [
        { key: 'Escape', ctrlKey: false },
        { key: 'ArrowLeft', ctrlKey: false },
      ],
    },
  ];

  const scheduleCloseWhenPointerLeaves = (event: Event): void => {
    if (!(event.target instanceof Node)) {
      return;
    }
    const pointerIsOnRow = itemRef.current?.contains(event.target);
    const pointerIsOnSubmenu = submenuListElement?.contains(event.target);
    if (pointerIsOnRow || pointerIsOnSubmenu) {
      cancelPendingClose();
      return;
    }
    closeTimeoutRef.current ??= setTimeout(closeSubmenu, TIMERS.DROPDOWN.CLOSE_NESTED);
  };

  useEffect(() => cancelPendingClose, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    window.addEventListener('mouseover', scheduleCloseWhenPointerLeaves);
    return (): void => {
      window.removeEventListener('mouseover', scheduleCloseWhenPointerLeaves);
    };
  }, [scheduleCloseWhenPointerLeaves, open]);

  useKeyboard(itemRef, submenuCloseKeyEvents, open);

  return (
    <div
      ref={itemRef}
      role="menuitem"
      className={clsx(
        styles.containerEl,
        styles.rowLayout,
        disabled && styles.disabled,
        selected && 'zapp-selected',
      )}
      style={getItemStyleVars(selected, selectedBackgroundColor)}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={disabled ? -1 : 0}
      onMouseEnter={openSubmenu}
      {...rest}
    >
      <Dropdown
        display="block"
        items={items}
        forceOpen={open}
        placement="right-start"
        itemTextSize={itemTextSize}
        dropdownListRef={setSubmenuListElement}
        disablePortal
      >
        <div className={styles.nestTrigger}>
          <ListItemContent
            icon={icon}
            label={label}
            selected={selected}
            disabled={disabled}
            itemTextSize={itemTextSize}
            tooltipLabel={tooltipLabel}
          />
          <ds-icon size="medium" icon="ChevronRight" aria-hidden="true"></ds-icon>
        </div>
      </Dropdown>
    </div>
  );
};

export const Dropdown = ({
  forceOpen = false,
  disabled = false,
  items,
  placement = 'bottom-start',
  display = 'inline-block',
  width = 'auto',
  maxWidth = '18.75rem',
  maxHeight = '50vh',
  handleTriggerEvents = true,
  disableRestoreFocus = false,
  disableAutoFocus = false,
  multiple = false,
  onOpen,
  onClose,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  triggerRef = null,
  disablePortal = false,
  itemTextSize = 'medium',
  dropdownListRef = null,
  ...rest
}: DropdownProps) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen || forceOpen);
  const open = openProp ?? (forceOpen || internalOpen);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const listId = useId();
  // 'default' keeps nested submenus (opened through forceOpen) focusing their first item.
  const focusOnOpenRef = useRef<FocusOnOpen>('default');
  const autoFocusedNodeRef = useRef<HTMLElement | null>(null);
  const spaceKeyDownOnTriggerRef = useRef<boolean>(false);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useCombinedRefs<HTMLDivElement>(dropdownListRef);
  const innerTriggerRef = useCombinedRefs(triggerRef);

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
    if (openProp === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    if (!disableRestoreFocus) {
      restoreTriggerFocus();
    }
    onClose?.();
  };

  const openPopper = (focusMode: FocusOnOpen): void => {
    focusOnOpenRef.current = focusMode;
    if (openProp !== undefined) {
      onOpenChange?.(true);
      return;
    }
    setInternalOpen(true);
    onOpen?.();
    onOpenChange?.(true);
  };

  // A pointer click must not move focus into the menu; only keyboard opens enter it.
  const toggleOpen = (
    event: React.SyntheticEvent | KeyboardEvent,
    focusMode: FocusOnOpen = 'none',
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
      openPopper(edge === 'last' ? 'last' : 'default');
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

  const handleTriggerClick: React.MouseEventHandler<HTMLElement> = (event) => {
    children.props.onClick?.(event);
    toggleOpen(event);
  };

  const triggerEvents = handleTriggerEvents
    ? getTriggerKeyboardPreset(
        (event) => toggleOpen(event, 'default'),
        stepIntoMenu,
        closeOpenMenuFromTrigger,
        spaceKeyDownOnTriggerRef,
      )
    : [];
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
    const enabledItems = getRovingItems(node);
    const itemToFocus =
      focusMode === 'last'
        ? enabledItems[enabledItems.length - 1]
        : (node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstChild);
    if (itemToFocus instanceof HTMLElement) {
      itemToFocus.focus();
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const closeOnOutsideClick = (event: Event): void => {
      const target = event.target;
      if (target instanceof Node && isOutsideMenu(target, dropdownRef.current, innerTriggerRef.current)) {
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

  const popperListItems =
    items?.map(
      (item, index) =>
        buildItemElement(item, index, {
          activeItemIndex,
          multiple,
          itemTextSize,
          createClickHandler: createItemClickHandler,
          onItemFocus: setActiveItemIndex,
        }),
      ) ?? null;

  const triggerId = children.props.id ?? `${listId}-trigger`;
  const triggerComponent = React.cloneElement(children, {
    ref: innerTriggerRef,
    id: triggerId,
    onClick: handleTriggerClick,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    ...(open ? { 'aria-controls': listId } : {}),
  });

  const popperListStyle = getPopperListStyle(
    width,
    maxWidth,
    maxHeight,
    innerTriggerRef.current?.clientWidth,
  );

  return (
    <div className={styles.popperDropdownWrapper} data-display={display} {...rest}>
      {triggerComponent}
      <Portal show={open} disablePortal={disablePortal}>
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
          <div ref={setPopperItemsRefAndFocus}>{popperListItems}</div>
        </div>
      </Portal>
    </div>
  );
};

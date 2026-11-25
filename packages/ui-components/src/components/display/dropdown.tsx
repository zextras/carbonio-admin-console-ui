/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-divider';

import { flip, limitShift, Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, {
  CSSProperties,
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { clickNodeWithFocus, KeyboardPresetObj, useKeyboard } from '../../hooks/useKeyboard';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { setupFloating } from '../../utils/floating-ui';
import { IconName } from '../../web-components/icon-registry';
import { FOCUSABLE_SELECTOR, TIMERS } from '../constants';
import { Portal } from '../utilities/Portal';
import styles from './dropdown.module.css';
import { Tooltip } from './Tooltip';

type ListItemContentProps = {
  icon?: IconName;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  itemTextSize: React.ComponentProps<'ds-text'>['size'];
  tooltipLabel?: string;
};

function ListItemContent({
  icon,
  label,
  selected,
  disabled,
  itemTextSize,
  tooltipLabel,
}: Readonly<ListItemContentProps>): React.JSX.Element {
  return (
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
}

/** Item background custom properties consumed by dropdown.module.css. */
type DropdownItemStyleVars = CSSProperties & {
  '--dropdown-item-bg': string;
  '--dropdown-item-bg-hover': string;
  '--dropdown-item-bg-focus': string;
  '--dropdown-item-bg-active': string;
};

function useContainerElStyle(
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

/** Focusable, enabled items of a dropdown list, in DOM order (dividers excluded). */
function getRovingItems(container: HTMLElement | null): Array<HTMLElement> {
  if (!container) {
    return [];
  }
  return Array.from(container.querySelectorAll<HTMLElement>('[data-dropdown-item]')).filter(
    (item) =>
      !(item instanceof HTMLButtonElement && item.disabled) &&
      item.getAttribute('aria-disabled') !== 'true',
  );
}

/** Move focus between items, wrapping; falls back to an end when nothing is focused. */
function focusRovingItem(items: Array<HTMLElement>, current: Element | null, offset: number): void {
  if (items.length === 0) {
    return;
  }
  const currentIndex = current instanceof HTMLElement ? items.indexOf(current) : -1;
  const nextIndex =
    currentIndex === -1
      ? offset > 0
        ? 0
        : items.length - 1
      : (currentIndex + offset + items.length) % items.length;
  items[nextIndex]?.focus({ preventScroll: true });
}

/** Typeahead: focus the next item whose label starts with the pressed character, wrapping. */
function focusTypeaheadItem(
  items: Array<HTMLElement>,
  current: Element | null,
  char: string,
): void {
  if (items.length === 0) {
    return;
  }
  const startIndex = current instanceof HTMLElement ? items.indexOf(current) : -1;
  for (let step = 1; step <= items.length; step += 1) {
    const candidate = items[(startIndex + step + items.length) % items.length];
    if ((candidate.textContent ?? '').trim().toLowerCase().startsWith(char.toLowerCase())) {
      candidate.focus({ preventScroll: true });
      return;
    }
  }
}

/** Keys typed into editable trigger content (e.g. an embedded input) must never toggle the menu. */
function isEditableEventTarget(event: Event): boolean {
  const target = event.target;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/** How the list should move focus into its items when it opens. */
type FocusOnOpen = 'none' | 'default' | 'last';

/**
 * Keyboard support for the trigger, enabled by default.
 * Editable targets are skipped for Enter/Space/arrows (no toggle, no preventDefault) so typing keeps working.
 */
function getTriggerKeyboardPreset(
  toggleOpen: (event: KeyboardEvent) => void,
  stepIntoMenu: (edge: 'first' | 'last') => void,
  closeOpenMenu: (event: KeyboardEvent) => void,
  spaceKeyDownOnTriggerRef: React.MutableRefObject<boolean>,
): KeyboardPresetObj[] {
  const guardedToggle = (event: KeyboardEvent): void => {
    if (isEditableEventTarget(event)) {
      return;
    }
    toggleOpen(event);
  };
  const preventSpaceScroll = (event: KeyboardEvent): void => {
    if (!isEditableEventTarget(event)) {
      event.preventDefault();
      spaceKeyDownOnTriggerRef.current = true;
    }
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
      if (isEditableEventTarget(event)) {
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

type PopperListItemProps = ListItemContentProps &
  React.ComponentPropsWithRef<'button'> & {
    onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
    selectedBackgroundColor?: AnyColor;
  };

function PopperListItem({
  icon,
  label,
  onClick,
  selected,
  disabled = false,
  selectedBackgroundColor,
  itemTextSize,
  tooltipLabel,
  ...rest
}: Readonly<PopperListItemProps>): React.JSX.Element {
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);
  return (
    <button
      type="button"
      className={clsx(
        styles.containerEl,
        styles.itemButton,
        disabled && styles.disabled,
        selected && 'zapp-selected',
      )}
      style={containerStyle}
      onClick={(!disabled && onClick) || undefined}
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
}

type NestListItemProps = ListItemContentProps &
  React.ComponentPropsWithRef<'div'> & {
    onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
    selectedBackgroundColor?: AnyColor;
    items: Array<DropdownItem>;
    onOpen?: () => void;
    onClose?: () => void;
  };

function NestListItem({
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
}: Readonly<NestListItemProps>): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [innerDropdownListElement, setInnerDropdownListElement] = useState<HTMLDivElement | null>(
    null,
  );
  const setDropdownListRef: React.RefCallback<HTMLDivElement> = (node) => {
    setInnerDropdownListElement(node);
  };
  const closeNestedDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);

  useEffect(
    () => () => {
      if (closeNestedDropdownTimeoutRef.current !== undefined) {
        clearTimeout(closeNestedDropdownTimeoutRef.current);
      }
    },
    [],
  );

  const openNestedDropdown = () => {
    if (closeNestedDropdownTimeoutRef.current !== undefined) {
      clearTimeout(closeNestedDropdownTimeoutRef.current);
      closeNestedDropdownTimeoutRef.current = undefined;
    }
    setOpen(true);
    onOpen?.();
  };

  const closeNestedDropdown = () => {
    if (closeNestedDropdownTimeoutRef.current !== undefined) {
      clearTimeout(closeNestedDropdownTimeoutRef.current);
      closeNestedDropdownTimeoutRef.current = undefined;
    }
    const focusIsOnChild = itemRef.current?.contains(document.activeElement);
    setOpen(false);
    onClose?.();
    if (focusIsOnChild) {
      itemRef.current?.focus({ preventScroll: true });
    }
  };

  const itemKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight' && !event.ctrlKey) {
      event.preventDefault();
      openNestedDropdown();
    }
  };

  // Escape/ArrowLeft must stay a native listener on the row: it has to stop the real event
  // propagation before it reaches the parent menu's close handler, which React's synthetic
  // delegation (at the root) cannot do in time.
  const dropdownKeyEvents: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: (event): void => {
        closeNestedDropdown();
        event.stopPropagation();
      },
      keys: [
        { key: 'Escape', ctrlKey: false },
        { key: 'ArrowLeft', ctrlKey: false },
      ],
    },
  ];

  useKeyboard(itemRef, dropdownKeyEvents, open);

  const closeOnMouseLeave = (event: Event) => {
    if (event.target instanceof Node) {
      const eventIsOnTrigger = itemRef.current?.contains(event.target);
      const eventIsOnDropdown = innerDropdownListElement?.contains(event.target);
      if (!eventIsOnDropdown && !eventIsOnTrigger) {
        if (closeNestedDropdownTimeoutRef.current === undefined) {
          closeNestedDropdownTimeoutRef.current = setTimeout(() => {
            closeNestedDropdown();
          }, TIMERS.DROPDOWN.CLOSE_NESTED);
        }
      } else if (closeNestedDropdownTimeoutRef.current !== undefined) {
        clearTimeout(closeNestedDropdownTimeoutRef.current);
        closeNestedDropdownTimeoutRef.current = undefined;
      }
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener('mouseover', closeOnMouseLeave);
    }
    return (): void => {
      window.removeEventListener('mouseover', closeOnMouseLeave);
    };
  }, [closeOnMouseLeave, open]);

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
      style={containerStyle}
      onClick={disabled ? undefined : onClick}
      onKeyDown={itemKeyDownHandler}
      tabIndex={disabled ? -1 : 0}
      onMouseEnter={openNestedDropdown}
      {...rest}
    >
      <Dropdown
        display="block"
        items={items}
        forceOpen={open}
        placement="right-start"
        itemTextSize={itemTextSize}
        dropdownListRef={setDropdownListRef}
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
}

interface DropdownItem {
  type?: 'divider';
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
  selected?: boolean;
  disabled?: boolean;
  items?: Array<DropdownItem>;
  tooltipLabel?: string;
}

type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'contextMenu'> & {
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
  children: React.ReactElement;
  triggerRef?: React.Ref<HTMLElement> | null;
  placement?: Placement;
  disablePortal?: boolean;
  forceOpen?: boolean;
  itemTextSize?: React.ComponentPropsWithRef<'ds-text'>['size'];
  dropdownListRef?: React.ForwardedRef<HTMLDivElement> | null;
};

const Dropdown = ({
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
  const open = openProp !== undefined ? openProp : forceOpen || internalOpen;
  const listId = React.useId();
  // 'default' keeps nested submenus (opened through forceOpen) focusing their first item.
  const focusOnOpenRef = useRef<FocusOnOpen>('default');
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const autoFocusedNodeRef = useRef<HTMLElement | null>(null);
  const spaceKeyDownOnTriggerRef = useRef<boolean>(false);

  const dropdownRef = useCombinedRefs<HTMLDivElement>(dropdownListRef);
  const innerTriggerRef = useCombinedRefs(triggerRef);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const nestedDropdownsRef = useRef<Array<React.RefObject<HTMLDivElement | null>>>([]);

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

  const closePopper = (e?: React.SyntheticEvent | KeyboardEvent) => {
    e?.preventDefault();
    if (openProp === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    if (!disableRestoreFocus) {
      const triggerElement = innerTriggerRef.current;
      if (triggerElement) {
        if (triggerElement.matches(FOCUSABLE_SELECTOR)) {
          triggerElement.focus();
        } else {
          triggerElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
        }
      }
    }
    onClose?.();
  };

  // A pointer click must not move focus into the menu; only keyboard opens enter it.
  const toggleOpen = (
    e: React.SyntheticEvent | KeyboardEvent,
    focusMode: FocusOnOpen = 'none',
  ): void => {
    if (open) {
      e.preventDefault();
      closePopper();
    } else if (!disabled) {
      e.preventDefault();
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
    const enabledItems = rovingItems();
    const target = edge === 'last' ? enabledItems[enabledItems.length - 1] : enabledItems[0];
    target?.focus({ preventScroll: true });
  };

  const closeOpenMenuFromTrigger = (event: KeyboardEvent): void => {
    if (open) {
      closePopper(event);
    }
  };

  const triggerComponentLeftClickHandler: React.ReactEventHandler = (e) => {
    if (React.isValidElement(children)) {
      (children.props as { onClick?: (e: React.SyntheticEvent) => void }).onClick?.(e);
    }
    toggleOpen(e);
  };

  const clickOutsidePopper = (e: Event) => {
    const clickedOnDropdown =
      dropdownRef.current &&
      (e.target === dropdownRef.current || dropdownRef.current.contains(e.target as Node | null));
    const clickedOnTrigger =
      innerTriggerRef.current &&
      (e.target === innerTriggerRef.current ||
        innerTriggerRef.current?.contains(e.target as Node | null));
    const clickedOnNestedItem = nestedDropdownsRef.current?.some((nestedItemRef) =>
      nestedItemRef.current?.contains(e.target as Node | null),
    );
    if (!clickedOnDropdown && !clickedOnTrigger && !clickedOnNestedItem) {
      closePopper();
    }
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

  const rovingItems = (): Array<HTMLElement> => getRovingItems(popperItemsRef.current);

  useLayoutEffect(() => {
    let cleanup: ReturnType<typeof setupFloating>;
    if (open) {
      const popperReference = innerTriggerRef.current;
      if (popperReference && dropdownRef.current) {
        cleanup = setupFloating(popperReference, dropdownRef.current, {
          placement,
          middleware: [flip(), shift({ limiter: limitShift() })],
          strategy: 'fixed',
        });
      }
    }
    return (): void => {
      cleanup?.();
    };
  }, [open, placement, dropdownRef, innerTriggerRef]);

  const setPopperItemsRefAndFocus: React.RefCallback<HTMLDivElement | null> = (node) => {
    popperItemsRef.current = node;
    // Focus only on a freshly mounted list: re-attach of the same node happens on every render
    // (ref identity churn) and must not steal focus back from the item the user navigated to.
    const focusMode = focusOnOpenRef.current;
    if (
      node &&
      open &&
      !disableAutoFocus &&
      focusMode !== 'none' &&
      autoFocusedNodeRef.current !== node
    ) {
      autoFocusedNodeRef.current = node;
      const enabledItems = getRovingItems(node);
      const itemToFocus =
        focusMode === 'last'
          ? enabledItems[enabledItems.length - 1]
          : node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstChild;
      if (itemToFocus instanceof HTMLElement) {
        itemToFocus.focus();
      }
    }
  };

  useEffect(() => {
    if (open) {
      window.document.addEventListener('click', clickOutsidePopper, true);
    }

    return (): void => {
      window.document.removeEventListener('click', clickOutsidePopper, true);
      window.document.removeEventListener('contextmenu', clickOutsidePopper, true);
    };
  }, [open, closePopper, clickOutsidePopper]);

  const listItemClickHandler =
    (
      onClick: PopperListItemProps['onClick'],
    ): ((event: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void) =>
    (event): void => {
      if (!event.defaultPrevented) {
        onClick?.(event);
      }
      if (!multiple) {
        closePopper();
      } else {
        event.stopPropagation();
      }
    };

  nestedDropdownsRef.current = [];
  const popperListItems = items
    ? items.map(
        (
          {
            id,
            icon,
            label,
            onClick,
            selected,
            items: subItems,
            disabled: itemDisabled,
            type,
            ...itemProps
          },
          index,
        ) => {
          const nestedRef = React.createRef<HTMLDivElement>();
          nestedDropdownsRef.current.push(nestedRef);
          const itemRole =
            selected === undefined ? 'menuitem' : multiple ? 'menuitemcheckbox' : 'menuitemradio';
          const itemRovingTabIndex = index === activeItemIndex ? 0 : -1;
          const itemFocusHandler = (): void => {
            setActiveItemIndex(index);
          };
          return (
            (type === 'divider' && <ds-divider key={id}></ds-divider>) ||
            (subItems && (
              <NestListItem
                icon={icon}
                label={label ?? ''}
                aria-haspopup="menu"
                aria-disabled={itemDisabled ? true : undefined}
                onClick={listItemClickHandler(onClick)}
                selected={selected}
                key={id}
                disabled={itemDisabled}
                items={subItems}
                itemTextSize={itemTextSize}
                data-dropdown-item=""
                tabIndex={itemRovingTabIndex}
                onFocus={itemFocusHandler}
                {...itemProps}
              />
            )) || (
              <PopperListItem
                icon={icon}
                label={label ?? ''}
                role={itemRole}
                aria-checked={selected}
                aria-disabled={itemDisabled ? true : undefined}
                onClick={listItemClickHandler(onClick)}
                selected={selected}
                key={id}
                disabled={itemDisabled}
                itemTextSize={itemTextSize}
                data-dropdown-item=""
                tabIndex={itemRovingTabIndex}
                onFocus={itemFocusHandler}
                {...itemProps}
              />
            )
          );
        },
      )
    : null;

  const popperListPreventDefaultHandler: React.MouseEventHandler = (event) => {
    event?.preventDefault?.();
  };

  // Focus follows the pointer, so hover and focus are one item (mouse-initiated focus shows no ring).
  const popperListMouseMoveHandler: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const item = (event.target as Element).closest<HTMLElement>('[data-dropdown-item]');
    if (item && item !== document.activeElement && rovingItems().includes(item)) {
      item.focus({ preventScroll: true });
    }
  };

  // Single keydown handler for the open menu. The submenu rows' native listeners (Escape,
  // ArrowLeft) stop the real event before it reaches this React handler, so the parent menu
  // stays open when only the submenu should close.
  const popperListKeyDownHandler: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    const enabledItems = rovingItems();
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (event.ctrlKey) {
          enabledItems[0]?.focus({ preventScroll: true });
        } else {
          focusRovingItem(enabledItems, document.activeElement, -1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (event.ctrlKey) {
          enabledItems[enabledItems.length - 1]?.focus({ preventScroll: true });
        } else {
          focusRovingItem(enabledItems, document.activeElement, 1);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        clickNodeWithFocus(popperItemsRef);
        break;
      case 'Escape':
      case 'Tab':
        closePopper(event);
        break;
      case 'Home':
        event.preventDefault();
        enabledItems[0]?.focus({ preventScroll: true });
        break;
      case 'End':
        event.preventDefault();
        enabledItems[enabledItems.length - 1]?.focus({ preventScroll: true });
        break;
      default:
        event.preventDefault();
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          focusTypeaheadItem(enabledItems, document.activeElement, event.key);
        }
        break;
    }
  };

  const triggerElementProps = children.props as { id?: string };
  const triggerId = triggerElementProps.id ?? `${listId}-trigger`;

  const triggerComponent = React.cloneElement(children, {
    ref: innerTriggerRef,
    id: triggerId,
    onClick: triggerComponentLeftClickHandler,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    ...(open ? { 'aria-controls': listId } : {}),
  } as unknown as Partial<React.HTMLAttributes<HTMLElement>>);

  const triggerWidth = innerTriggerRef.current?.clientWidth;
  const popperListStyle = {
    width: width === '100%' && triggerWidth ? `${triggerWidth}px` : width,
    maxWidth: width === '100%' ? '100%' : maxWidth,
    '--popper-max-height': maxHeight,
  } as CSSProperties;

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
          onClick={popperListPreventDefaultHandler}
          onMouseMove={popperListMouseMoveHandler}
          onKeyDown={popperListKeyDownHandler}
        >
          <div ref={setPopperItemsRefAndFocus}>{popperListItems}</div>
        </div>
      </Portal>
    </div>
  );
};

export { Dropdown, type DropdownItem, type DropdownProps };

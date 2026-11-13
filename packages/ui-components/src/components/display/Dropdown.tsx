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
import {
  clickNodeWithFocus,
  focusOnFirstNode,
  focusOnLastNode,
  focusOnNextNode,
  focusOnPreviousNode,
  getKeyboardPreset,
  KeyboardPresetObj,
  useKeyboard,
} from '../../hooks/useKeyboard';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { setupFloating } from '../../utils/floating-ui';
import { IconName } from '../../web-components/icon-registry';
import { FOCUSABLE_SELECTOR, TIMERS } from '../constants';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Portal } from '../utilities/Portal';
import styles from './Dropdown.module.css';
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
      <Container orientation="horizontal" mainAlignment="flex-start">
        {icon && (
          <Padding right="small">
            <ds-icon
              icon={icon}
              size="medium"
              color={disabled ? 'secondary' : 'text'}
              style={{ pointerEvents: 'none' }}
            ></ds-icon>
          </Padding>
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
      </Container>
    </Tooltip>
  );
}

function useContainerElStyle(
  selected: boolean | undefined,
  selectedBackgroundColor?: AnyColor,
): CSSProperties {
  const bgColor = selected && selectedBackgroundColor ? selectedBackgroundColor : 'gray5';
  return {
    '--dropdown-item-bg': resolveThemeColor(String(bgColor), 'regular'),
    '--dropdown-item-bg-hover': resolveThemeColor(String(bgColor), 'hover'),
    '--dropdown-item-bg-focus': resolveThemeColor(String(bgColor), 'focus'),
    '--dropdown-item-bg-active': resolveThemeColor(String(bgColor), 'active'),
  } as CSSProperties;
}

type PopperListItemProps = ListItemContentProps &
  HTMLAttributes<HTMLDivElement> & {
    onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
    customComponent?: React.ReactNode;
    selectedBackgroundColor?: AnyColor;
    keepOpen?: boolean;
  };

function PopperListItem({
  icon,
  label,
  onClick,
  selected,
  customComponent,
  disabled = false,
  selectedBackgroundColor,
  itemTextSize,
  keepOpen,
  tooltipLabel,
  ...rest
}: Readonly<PopperListItemProps>): React.JSX.Element {
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);
  return (
    <Container
      data-keep-open={keepOpen}
      className={clsx(styles.containerEl, disabled && styles.disabled, selected && 'zapp-selected')}
      style={containerStyle}
      orientation="horizontal"
      mainAlignment="flex-start"
      padding={{ vertical: 'small', horizontal: 'large' }}
      background={selected && selectedBackgroundColor ? selectedBackgroundColor : undefined}
      onClick={(!disabled && onClick) || undefined}
      tabIndex={disabled ? -1 : 0}
      data-testid={'dropdown-item'}
      {...rest}
    >
      {customComponent || (
        <ListItemContent
          icon={icon}
          label={label}
          selected={selected}
          disabled={disabled}
          itemTextSize={itemTextSize}
          tooltipLabel={tooltipLabel}
        />
      )}
    </Container>
  );
}

type NestListItemProps = PopperListItemProps & Pick<DropdownProps, 'onOpen' | 'onClose' | 'items'>;

function NestListItem({
  icon,
  label,
  onClick,
  selected,
  customComponent,
  disabled = false,
  items,
  selectedBackgroundColor,
  itemTextSize,
  keepOpen,
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
  const closeNestedDropdownTimeoutRef = useRef<number>(undefined);
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

  const itemKeyEvents: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: openNestedDropdown,
      keys: [{ key: 'ArrowRight', ctrlKey: false }],
    },
  ];

  useKeyboard(itemRef, itemKeyEvents);

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
          }, TIMERS.DROPDOWN.CLOSE_NESTED) as unknown as number;
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
    <Container
      data-keep-open={keepOpen}
      ref={itemRef}
      className={clsx(styles.containerEl, disabled && styles.disabled, selected && 'zapp-selected')}
      style={containerStyle}
      orientation="horizontal"
      mainAlignment="flex-start"
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? undefined : 0}
      data-testid={'dropdown-item'}
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
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ vertical: 'small', horizontal: 'large' }}
        >
          {customComponent || (
            <ListItemContent
              icon={icon}
              label={label}
              selected={selected}
              disabled={disabled}
              itemTextSize={itemTextSize}
              tooltipLabel={tooltipLabel}
            />
          )}
          <ds-icon size="medium" icon="ChevronRight"></ds-icon>
        </Container>
      </Dropdown>
    </Container>
  );
}

interface DropdownItem {
  type?: 'divider';
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
  selected?: boolean;
  customComponent?: React.ReactNode;
  disabled?: boolean;
  items?: Array<DropdownItem>;
  keepOpen?: boolean;
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
  children: React.ReactElement;
  triggerRef?: React.Ref<HTMLElement> | null;
  placement?: Placement;
  disablePortal?: boolean;
  forceOpen?: boolean;
  preventDefault?: boolean;
  itemTextSize?: React.ComponentPropsWithRef<'ds-text'>['size'];
  dropdownListRef?: React.ForwardedRef<HTMLDivElement> | null;
};

const Dropdown = ({
  forceOpen = false,
  disabled = false,
  items,
  placement = 'bottom-start' as const,
  display = 'inline-block',
  width = 'auto',
  maxWidth = '18.75rem',
  maxHeight = '50vh',
  handleTriggerEvents = false,
  disableRestoreFocus = false,
  disableAutoFocus = false,
  multiple = false,
  onOpen,
  onClose,
  children,
  triggerRef = null,
  disablePortal = false,
  itemTextSize = 'medium',
  dropdownListRef = null,
  ...rest
}: DropdownProps) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(forceOpen);
  const open = forceOpen || internalOpen;
  const openRef = useRef<boolean>(open);

  useLayoutEffect(() => {
    openRef.current = open;
  }, [open]);
  const dropdownRef = useCombinedRefs<HTMLDivElement>(dropdownListRef);
  const innerTriggerRef = useCombinedRefs(triggerRef);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const startSentinelRef = useRef<HTMLButtonElement | null>(null);
  const endSentinelRef = useRef<HTMLButtonElement | null>(null);
  const nestedDropdownsRef = useRef<Array<React.RefObject<HTMLDivElement | null>>>([]);

  const openPopper = () => {
    setInternalOpen(true);
    openRef.current = true;
    onOpen?.();
  };

  const closePopper = (e?: React.SyntheticEvent | KeyboardEvent) => {
    e?.preventDefault();
    setInternalOpen(false);
    openRef.current = open;
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

  const toggleOpen = (e: React.SyntheticEvent | KeyboardEvent): void => {
    if (openRef.current) {
      e.preventDefault();
      closePopper();
    } else if (!disabled) {
      e.preventDefault();
      openPopper();
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
    if (
      !clickedOnDropdown &&
      !clickedOnTrigger &&
      !clickedOnNestedItem &&
      !e
        .composedPath?.()
        ?.some((el) => el instanceof Element && el.hasAttribute?.('data-keep-open'))
    ) {
      closePopper();
    }
  };

  const onStartSentinelFocus = () => {
    const lastChild = popperItemsRef.current?.querySelector<HTMLElement>('[tabindex]:last-child');
    lastChild?.focus();
  };
  const onEndSentinelFocus = () => {
    const lastChild = popperItemsRef.current?.querySelector<HTMLElement>('[tabindex]:first-child');
    lastChild?.focus();
  };

  const triggerEvents = handleTriggerEvents ? getKeyboardPreset('button', toggleOpen) : [];
  useKeyboard(innerTriggerRef, triggerEvents);

  const listEvents: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: (event): void => {
        if (event.defaultPrevented) {
          return;
        }
        focusOnPreviousNode(popperItemsRef);
        event.preventDefault();
      },
      keys: [{ key: 'ArrowUp', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: (event): void => {
        if (event.defaultPrevented) {
          return;
        }
        focusOnNextNode(popperItemsRef);
        event.preventDefault();
      },
      keys: [{ key: 'ArrowDown', ctrlKey: false }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: (event): void => {
        if (event.defaultPrevented) {
          return;
        }
        focusOnFirstNode(popperItemsRef);
        event.preventDefault();
      },
      keys: [{ key: 'ArrowUp', ctrlKey: true }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: (event): void => {
        if (event.defaultPrevented) {
          return;
        }
        focusOnLastNode(popperItemsRef);
        event.preventDefault();
      },
      keys: [{ key: 'ArrowDown', ctrlKey: true }],
      haveToPreventDefault: false,
    },
    {
      type: 'keydown',
      callback: (event): void => {
        if (event.defaultPrevented) {
          return;
        }
        clickNodeWithFocus(popperItemsRef);
        event.preventDefault();
      },
      keys: [{ key: 'Enter', ctrlKey: false }],
      haveToPreventDefault: false,
    },
  ];

  useKeyboard(popperItemsRef, listEvents, open);

  const escapeEvent: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: closePopper,
      keys: [{ key: 'Escape', ctrlKey: false }],
    },
  ];

  useKeyboard(dropdownRef, escapeEvent, open);

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
    if (node && !disableAutoFocus) {
      const itemToFocus = node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstChild;
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

  useEffect(() => {
    const startSentinelRefElement = startSentinelRef.current;
    const endSentinelRefElement = endSentinelRef.current;
    if (open && !disableAutoFocus) {
      startSentinelRefElement?.addEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.addEventListener('focus', onEndSentinelFocus);
    }
    return (): void => {
      startSentinelRefElement?.removeEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.removeEventListener('focus', onEndSentinelFocus);
    };
  }, [
    open,
    startSentinelRef,
    endSentinelRef,
    onStartSentinelFocus,
    onEndSentinelFocus,
    disableAutoFocus,
  ]);

  const listItemClickHandler = (
    onClick: PopperListItemProps['onClick'],
    keepOpen?: boolean,
  ): ((event: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void) =>
    (event): void => {
      if (!event.defaultPrevented) {
        onClick?.(event);
      }
      if (!multiple && !keepOpen) {
        closePopper();
      } else {
        event.stopPropagation();
      }
    };

  nestedDropdownsRef.current = [];
  const popperListItems = items
    ? items.map(
        ({
          id,
          icon,
          label,
          onClick,
          selected,
          customComponent,
          items: subItems,
          disabled: itemDisabled,
          type,
          keepOpen,
          ...itemProps
        }) => {
          const nestedRef = React.createRef<HTMLDivElement>();
          nestedDropdownsRef.current.push(nestedRef);
          return (
            (type === 'divider' && <ds-divider key={id}></ds-divider>) ||
            (subItems && (
              <NestListItem
                icon={icon}
                label={label ?? ''}
                role="menuitem"
                aria-haspopup="menu"
                onClick={listItemClickHandler(onClick, keepOpen)}
                keepOpen={keepOpen}
                selected={selected}
                key={id}
                customComponent={customComponent}
                disabled={itemDisabled}
                items={subItems}
                itemTextSize={itemTextSize}
                {...itemProps}
              />
            )) || (
              <PopperListItem
                icon={icon}
                label={label ?? ''}
                role="menuitem"
                onClick={listItemClickHandler(onClick, keepOpen)}
                keepOpen={keepOpen}
                selected={selected}
                key={id}
                customComponent={customComponent}
                disabled={itemDisabled}
                itemTextSize={itemTextSize}
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

  const popperListKeyDownHandler: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event?.preventDefault?.();
  };

  const triggerComponent = React.cloneElement(
    children,
    {
      ref: innerTriggerRef,
      onClick: triggerComponentLeftClickHandler,
    } as unknown as Partial<React.HTMLAttributes<HTMLElement>>,
  );

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
          className={clsx(styles.popperList, open && styles.open)}
          style={popperListStyle}
          data-testid="dropdown-popper-list"
          role="menu"
          tabIndex={-1}
          onClick={popperListPreventDefaultHandler}
          onKeyDown={popperListKeyDownHandler}
        >
          <button type="button" ref={startSentinelRef} className={styles.focusSentinel} />
          <div ref={setPopperItemsRefAndFocus}>{popperListItems}</div>
          <button type="button" ref={endSentinelRef} className={styles.focusSentinel} />
        </div>
      </Portal>
    </div>
  );
};

export { Dropdown, type DropdownItem, type DropdownProps };

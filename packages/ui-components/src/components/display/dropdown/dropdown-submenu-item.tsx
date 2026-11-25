/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { KeyboardPresetObj, useKeyboard } from '../../../hooks/useKeyboard';
import { AnyColor } from '../../../types/utils';
import { TIMERS } from '../../constants';
import { Dropdown } from './dropdown';
import styles from './dropdown.module.css';
import { DropdownItemContent, type DropdownItemContentProps } from './dropdown-item-content';
import { type DropdownItem, getItemStyleVars, type ItemClickHandler } from './dropdown-logic';

type DropdownSubmenuItemProps = DropdownItemContentProps &
  React.ComponentPropsWithRef<'div'> & {
    onClick?: ItemClickHandler;
    selectedBackgroundColor?: AnyColor;
    items: Array<DropdownItem>;
    onOpen?: () => void;
    onClose?: () => void;
  };

// Renders a nested <Dropdown>, which in turn renders submenu rows: a deliberate, recursive
// import cycle. Nothing is read at module top level across it, so both evaluation orders are safe.
export const DropdownSubmenuItem = ({
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
}: Readonly<DropdownSubmenuItemProps>) => {
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

  useEffect(() => {
    return (): void => {
      cancelPendingClose();
    };
  }, []);

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
          <DropdownItemContent
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

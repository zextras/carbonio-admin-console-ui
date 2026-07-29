/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { flip, limitShift, offset, type Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { setupFloating } from '../../utils/floating-ui';
import styles from './breadcrumb-menu.module.css';

export type BreadcrumbMenuItem = {
  id: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
};

type BreadcrumbMenuProps = {
  items: Array<BreadcrumbMenuItem>;
  triggerLabel: string;
  placement?: Placement;
  anchorRef?: React.RefObject<HTMLElement | null>;
  header?: string;
};

type PopoverElement = HTMLDivElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

export function BreadcrumbMenu({
  items,
  triggerLabel,
  placement = 'bottom-start',
  anchorRef,
  header,
}: Readonly<BreadcrumbMenuProps>) {
  const triggerId = useId();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<PopoverElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const focusItem = (index: number) => {
    const count = items.length;
    if (count === 0) return;
    const safe = ((index % count) + count) % count;
    setActiveIndex(safe);
    itemRefs.current[safe]?.focus();
  };

  const closeMenu = () => setOpen(false);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const selectedIndex = items.findIndex((item) => item.selected);
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const activate = (index: number) => {
    items[index]?.onClick();
    closeMenu();
  };

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;
    const reference = anchorRef?.current ?? triggerRef.current;
    const supportsPopover =
      typeof menu.showPopover === 'function' && typeof menu.hidePopover === 'function';

    if (open) {
      menu.style.display = 'block';
      if (supportsPopover && !menu.matches(':popover-open')) {
        menu.showPopover?.();
      }
      if (reference) {
        return setupFloating(reference, menu, {
          placement,
          middleware: [offset(8), flip(), shift({ limiter: limitShift() })],
          strategy: 'fixed',
        });
      }
      return undefined;
    }

    if (supportsPopover && menu.matches(':popover-open')) {
      menu.hidePopover?.();
    }
    menu.style.display = 'none';
    return undefined;
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    if (event.newState === 'closed') {
      setOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(activeIndex);
        break;
      case 'Tab':
        closeMenu();
        break;
      default: {
        if (event.key.length === 1) {
          const lower = event.key.toLowerCase();
          const count = items.length;
          for (let offset = 1; offset <= count; offset += 1) {
            const next = (activeIndex + offset) % count;
            if (items[next]?.label.toLowerCase().startsWith(lower)) {
              event.preventDefault();
              focusItem(next);
              break;
            }
          }
        }
      }
    }
  };

  return (
    <span className={styles.wrapper}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className={clsx(styles.caret, open && styles.caretOpen)}
        id={triggerId}
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        <ds-icon color="gray1" icon={open ? 'ChevronUp' : 'ChevronDown'} size="large" />
      </button>
      <div
        aria-labelledby={triggerId}
        className={styles.menu}
        id={menuId}
        onKeyDown={handleKeyDown}
        onToggle={handleToggle}
        popover="auto"
        ref={menuRef}
        role="menu"
        tabIndex={-1}
      >
        {header && <div className={styles.menuHeader}>{header}</div>}
        {items.map((item, index) => (
          <button
            aria-checked={item.selected ? 'true' : 'false'}
            className={clsx(styles.menuItem, item.selected && styles.menuItemSelected)}
            key={item.id}
            onClick={() => activate(index)}
            onMouseEnter={() => focusItem(index)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="menuitemradio"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            <ds-text as="span" size="small" weight="regular">
              {item.label}
            </ds-text>
            {item.selected && <ds-icon color="primary" icon="Checkmark" size="large" />}
          </button>
        ))}
      </div>
    </span>
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './data-table.module.css';
import type { DataTableRowAction } from './types';

type MenuPosition = {
  top: number;
  right: number;
};

type DataTableRowActionsProps = {
  rowLabel: string;
  actions: Array<DataTableRowAction>;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (action: DataTableRowAction) => void;
};

function getMenuPosition(button: HTMLButtonElement): MenuPosition {
  const rect = button.getBoundingClientRect();
  return {
    top: rect.bottom + 4,
    right: globalThis.innerWidth - rect.right,
  };
}

export const DataTableRowActions = ({
  rowLabel,
  actions,
  open,
  onToggle,
  onClose,
  onSelect,
}: DataTableRowActionsProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const lastDangerIndex = actions.reduce(
    (last, action, index) => (action.danger ? index : last),
    -1,
  );
  const resolvedPosition = open ? menuPosition : null;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function updatePosition(): void {
      if (!buttonRef.current) {
        return;
      }
      setMenuPosition(getMenuPosition(buttonRef.current));
    }

    // Refresh after open in case layout shifted; listeners keep the portal aligned.
    const frameId = globalThis.requestAnimationFrame(updatePosition);
    globalThis.addEventListener('resize', updatePosition);
    document.addEventListener('scroll', updatePosition, true);
    return () => {
      globalThis.cancelAnimationFrame(frameId);
      globalThis.removeEventListener('resize', updatePosition);
      document.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handlePointerDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      onClose();
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div ref={rootRef} className={clsx(styles.rowActions, open && styles.rowActionsOpen)}>
      <button
        ref={buttonRef}
        type="button"
        className={clsx(styles.kebabButton, open && styles.kebabButtonOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${rowLabel}`}
        onClick={(event) => {
          event.stopPropagation();
          if (!open && buttonRef.current) {
            setMenuPosition(getMenuPosition(buttonRef.current));
          }
          onToggle();
        }}
      >
        ⋮
      </button>
      {resolvedPosition &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.rowActionsMenu}
            role="menu"
            aria-label={`Actions for ${rowLabel}`}
            style={{ top: resolvedPosition.top, right: resolvedPosition.right }}
          >
            {actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className={clsx(
                  styles.rowActionItem,
                  action.danger && styles.rowActionItemDanger,
                  action.danger &&
                    index === lastDangerIndex &&
                    index === actions.length - 1 &&
                    styles.rowActionItemDangerLast,
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(action);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

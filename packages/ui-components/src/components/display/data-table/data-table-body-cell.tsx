/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './data-table.module.css';
import { DataTableCopyCell } from './data-table-copy-cell';
import { DataTableEditTrigger, DataTableInlineEdit } from './data-table-inline-edit';
import type { DataTableEditingState } from './types';

type DataTableChromeCellProps = {
  displayValue: string;
  columnLabel: string;
  rowLabel: string;
  editable: boolean;
  copyable: boolean;
  editing: DataTableEditingState;
  isEditing: boolean;
  saveLabel: string;
  cancelLabel: string;
  onStartEdit: () => void;
  onEditingValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onCopy: () => void;
  children: ReactNode;
};

export const DataTableChromeCell = ({
  displayValue,
  columnLabel,
  rowLabel,
  editable,
  copyable,
  editing,
  isEditing,
  saveLabel,
  cancelLabel,
  onStartEdit,
  onEditingValueChange,
  onSaveEdit,
  onCancelEdit,
  onCopy,
  children,
}: DataTableChromeCellProps) => {
  if (isEditing && editing) {
    return (
      <DataTableInlineEdit
        editing={editing}
        columnLabel={columnLabel}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        onValueChange={onEditingValueChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />
    );
  }

  if (!editable && !copyable) {
    return children;
  }

  const valueNode = copyable ? (
    <DataTableCopyCell value={displayValue} onCopy={onCopy}>
      {children}
    </DataTableCopyCell>
  ) : (
    children
  );

  return (
    <span className={styles.editableCell}>
      {valueNode}
      {editable && (
        <DataTableEditTrigger
          ariaLabel={`Edit ${columnLabel.toLowerCase()} for ${rowLabel}`}
          onClick={onStartEdit}
        />
      )}
    </span>
  );
};

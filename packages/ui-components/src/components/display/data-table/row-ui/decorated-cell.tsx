/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { DataTableCopyCell } from './copy-cell';
import { DataTableEditTrigger, DataTableInlineEdit } from './inline-edit';

type DataTableDecoratedCellProps = {
  displayValue: string;
  columnLabel: string;
  rowLabel: string;
  editable: boolean;
  copyable: boolean;
  isEditing: boolean;
  editInitialValue: string;
  requiredMessage: string;
  saveLabel: string;
  cancelLabel: string;
  onStartEdit: () => void;
  onCommitEdit: (value: string) => void;
  onCancelEdit: () => void;
  onCopy: () => void;
  children: ReactNode;
};

export const DataTableDecoratedCell = ({
  displayValue,
  columnLabel,
  rowLabel,
  editable,
  copyable,
  isEditing,
  editInitialValue,
  requiredMessage,
  saveLabel,
  cancelLabel,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onCopy,
  children,
}: DataTableDecoratedCellProps) => {
  const { t } = useTranslation();

  if (isEditing) {
    return (
      <DataTableInlineEdit
        initialValue={editInitialValue}
        columnLabel={columnLabel}
        requiredMessage={requiredMessage}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        onSave={onCommitEdit}
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
          ariaLabel={t('data_table.edit', 'Edit {{column}} for {{row}}', {
            column: columnLabel.toLowerCase(),
            row: rowLabel,
          })}
          onClick={onStartEdit}
        />
      )}
    </span>
  );
};

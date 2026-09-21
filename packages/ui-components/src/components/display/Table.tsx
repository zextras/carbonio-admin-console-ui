/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { HTMLAttributes, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { NonEmptyArray, SingleItemArray } from '../../types/utils';
import { MultipleSelectionOnChange, SelectProps } from '../inputs/Select';
import { DefaultHeaderFactory } from './default-header-factory';
import { DefaultRowFactory, TRowProps } from './default-row-factory';
import styles from './Table.module.css';

type THeaderProps = {
  headers: THeader[];
  onChange: () => void;
  allSelected: boolean;
  selectionMode: boolean;
  multiSelect: boolean;
  showCheckbox: boolean;
};

const SELECT_ACTION = {
  TOGGLE: 'toggle',
  ADD_ALL: 'addAll',
  RESET: 'reset',
  SET: 'set',
} as const;

type SelectReducerAction =
  | { type: typeof SELECT_ACTION.TOGGLE; multiSelect: boolean; id: string }
  | { type: typeof SELECT_ACTION.ADD_ALL; rows: Array<{ id: string }> }
  | { type: typeof SELECT_ACTION.RESET }
  | { type: typeof SELECT_ACTION.SET; ids: string[] };

function selectedReducer(state: string[], action: SelectReducerAction): string[] {
  switch (action.type) {
    case 'toggle': {
      if (!action.multiSelect) {
        return state.includes(action.id) ? [] : [action.id];
      }
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    }
    case 'addAll': {
      return [...action.rows.map((row) => row.id)];
    }
    case 'reset': {
      return [];
    }
    case 'set': {
      return [...action.ids];
    }
    default: {
      return state;
    }
  }
}

type TRow = {
  id: string;
  /** Each column can be a string or a React component */
  columns: Array<string | React.ReactElement>;
  /** Whether to highlight this row */
  highlight?: boolean;
  /** Whether the row is clickable */
  clickable?: boolean;
  /** Row click callback */
  onClick?: React.ReactEventHandler;
  /** Index/counter of the row shown as first column when checkboxes are hidden */
  index?: number;
};

type THeader = {
  id: string;
  label: string;
  /** th align attribute */
  align?: React.ThHTMLAttributes<HTMLTableHeaderCellElement>['align'];
  /** th width attribute */
  width?: string;
  /** Select 'All' label translation */
  i18nAllLabel?: string;
  /** Whether the label should be bold */
  bold?: boolean;
} & (
  | {
      items?: never;
      onChange?: never;
    }
  | {
      /** Items for the Select component of the header */
      items: NonEmptyArray<SelectProps['items'][number]>;
      /** De/Select all rows callback */
      onChange: MultipleSelectionOnChange;
    }
);

type ControlledTableProps = {
  defaultSelection?: never;
} & (
  | {
      /** Array of the selected rows (Array of rows ids). To use only if you want the table to be in controlled mode. */
      selectedRows: SingleItemArray<string>;
      /** Whether multiple rows are selectable. */
      multiSelect: false;
    }
  | {
      /** Array of the selected rows (Array of rows ids). To use only if you want the table to be in controlled mode. */
      selectedRows: string[];
      /** Whether multiple rows are selectable. */
      multiSelect?: true;
    }
);

type UncontrolledTableProps = {
  selectedRows?: never;
} & (
  | {
      /** Row selected by default in the table (Array of rows ids). */
      defaultSelection?: SingleItemArray<string>;
      /** Whether multiple rows are selectable. */
      multiSelect: false;
    }
  | {
      /** Row selected by default in the table (Array of rows ids). */
      defaultSelection?: string[];
      /** Whether multiple rows are selectable. */
      multiSelect?: true;
    }
);

type TableProps = HTMLAttributes<HTMLDivElement> & {
  /** Table rows */
  rows?: TRow[];
  /** Table headers */
  headers?: THeader[];
  /** Whether the table should show checkboxes */
  showCheckbox?: boolean;
  /** Function to generate the single row */
  RowFactory?: React.ComponentType<TRowProps>;
  /** Function to generate the table head section */
  HeaderFactory?: React.ComponentType<THeaderProps>;
  /** Callback function, called when user changes selection of rows in table (in both controlled and uncontrolled mode). */
  onSelectionChange?: (ids: string[]) => void;

  ref?: React.Ref<HTMLDivElement>;
} & (ControlledTableProps | UncontrolledTableProps);

const Table = ({
  rows = [],
  headers = [],
  showCheckbox = true,
  RowFactory = DefaultRowFactory,
  HeaderFactory = DefaultHeaderFactory,
  onSelectionChange,
  defaultSelection,
  selectedRows,
  multiSelect = true,
  ref,
  ...rest
}: TableProps) => {
  const [selected, dispatchSelected] = useReducer(
    selectedReducer,
    defaultSelection || selectedRows || [],
  );

  const controlledMode = useMemo(() => selectedRows !== undefined, [selectedRows]);

  const controlledOnToggle = useCallback(
    (id: string) => {
      if (onSelectionChange) {
        if (multiSelect) {
          onSelectionChange(
            selected.includes(id) ? selected.filter((_id) => _id !== id) : [...selected, id],
          );
        } else {
          onSelectionChange(selected.includes(id) ? [] : [id]);
        }
      }
    },
    [onSelectionChange, selected, multiSelect],
  );

  const uncontrolledOnToggle = useCallback(
    (id: string) => dispatchSelected({ type: SELECT_ACTION.TOGGLE, id, multiSelect }),
    [multiSelect],
  );

  const controlledOnToggleAll = useCallback(() => {
    if (onSelectionChange) {
      selected.length === rows.length
        ? onSelectionChange([])
        : onSelectionChange([...rows.map((row) => row.id)]);
    }
  }, [selected, rows, onSelectionChange]);

  const uncontrolledOnToggleAll = useCallback(() => {
    selected.length === rows.length
      ? dispatchSelected({ type: SELECT_ACTION.RESET })
      : dispatchSelected({ type: SELECT_ACTION.ADD_ALL, rows });
  }, [selected, rows]);

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!controlledMode) {
      if (!isFirstRun.current) {
        onSelectionChange && onSelectionChange(selected);
      } else {
        isFirstRun.current = false;
      }
    }
  }, [selected, controlledMode, onSelectionChange]);

  useEffect(() => {
    if (controlledMode) {
      if (!isFirstRun.current) {
        dispatchSelected({ type: SELECT_ACTION.SET, ids: selectedRows || [] });
      } else {
        isFirstRun.current = false;
      }
    }
  }, [controlledMode, selectedRows]);

  return (
    <div {...rest} ref={ref} className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <HeaderFactory
            headers={headers}
            onChange={controlledMode ? controlledOnToggleAll : uncontrolledOnToggleAll}
            allSelected={selected.length === rows.length}
            selectionMode={selected.length > 0}
            multiSelect={multiSelect}
            showCheckbox={showCheckbox}
          />
        </thead>
        <tbody>
          {rows &&
            rows.map((row, index) => (
              <RowFactory
                key={row.id}
                index={row.index ?? index + 1}
                row={row}
                onChange={controlledMode ? controlledOnToggle : uncontrolledOnToggle}
                selected={selected.includes(row.id)}
                selectionMode={selected.length > 0}
                multiSelect={multiSelect}
                showCheckbox={showCheckbox}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
};

export { Table, type TableProps, type THeader, type THeaderProps, type TRow };

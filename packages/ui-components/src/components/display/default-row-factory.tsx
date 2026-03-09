/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useCallback, useMemo, useRef } from 'react';

import { Text } from '../basic/text/Text';
import { Checkbox } from '../inputs/Checkbox';
import { Row } from '../layout/Row';
import { TRow } from './Table';
import styles from './Table.module.css';

export type TRowProps = {
  index: number;
  row: TRow;
  onChange: (id: string) => void;
  selected: boolean;
  selectionMode: boolean;
  multiSelect: boolean;
  showCheckbox: boolean;
};

export const DefaultRowFactory = ({
  index,
  row,
  onChange,
  selected,
  selectionMode,
  multiSelect,
  showCheckbox,
}: TRowProps): React.JSX.Element => {
  const ckbRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<HTMLTableRowElement>(null);
  const clickableRow = useMemo(
    () => (!showCheckbox && row.clickable === undefined) || row.clickable,
    [showCheckbox, row.clickable],
  );

  const _onChange = (): void => {
    !clickableRow && onChange(row.id);
  };

  const onClick = useCallback<React.ReactEventHandler>(
    (e) => {
      showCheckbox &&
        ckbRef.current &&
        e.target !== ckbRef.current &&
        !ckbRef.current.contains(e.target as Node | null) &&
        row.onClick &&
        row.onClick(e);
      clickableRow && onChange(row.id);
    },
    [row, onChange, clickableRow, showCheckbox],
  );

  const rowData = useMemo(
    () =>
      row.columns.map((column, i) => (
        <td key={i}>{typeof column === 'string' ? <Text>{column}</Text> : column}</td>
      )),
    [row.columns],
  );

  const displayBlockCheckbox = useMemo(
    () => selected || (selectionMode && multiSelect),
    [multiSelect, selected, selectionMode],
  );

  const isClickable =
    row.clickable === true || (typeof row.clickable === 'undefined' && !showCheckbox);

  return (
    <tr
      ref={trRef}
      onClick={onClick}
      className={clsx(
        styles.bodyRow,
        selected && styles.selected,
        row.highlight && styles.highlight,
        isClickable && styles.clickable,
      )}
    >
      <td>
        <Row mainAlignment="center">
          {showCheckbox && (
            <Checkbox
              ref={ckbRef}
              className={clsx(styles.checkbox, displayBlockCheckbox && styles.show)}
              size="small"
              value={selected}
              onClick={_onChange}
              iconColor={displayBlockCheckbox ? 'primary' : 'text'}
            />
          )}
          {(!showCheckbox || !displayBlockCheckbox) && (
            <Text className={clsx(styles.text, displayBlockCheckbox && styles.hidden)}>
              {index}
            </Text>
          )}
        </Row>
      </td>
      {rowData}
    </tr>
  );
};

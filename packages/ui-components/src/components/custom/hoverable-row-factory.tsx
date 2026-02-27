/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {
  FunctionComponent,
  ReactElement,
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Text } from '../basic/text/Text';
import { Checkbox } from '../inputs/Checkbox';
import styles from './hoverable-row-factory.module.css';

export type TRow = {
  id: string;
  columns: Array<string | ReactElement>;
  highlight?: boolean;
  clickable?: boolean;
  onClick?: ReactEventHandler;
  index?: number;
};

export interface HoverableRowProps {
  index: number;
  row: TRow;
  onChange: (id: string) => void;
  selected: boolean;
  selectionMode: boolean;
  multiSelect: boolean;
  showCheckbox: boolean;
  showCheckboxOnHover?: boolean;
  hoverDelay?: number;
  renderIndex?: (index: number) => React.ReactNode;
  CheckboxComponent?: FunctionComponent<any>;
  rowClassName?: string;
  cellClassName?: string | ((colIndex: number) => string);
}

function getTableRowClassNames(
  selected?: boolean,
  highlight?: boolean,
  showCheckbox?: boolean,
  clickable?: boolean,
  customClass?: string,
) {
  const classNames = [styles.tableRow];

  if (selected || highlight) {
    classNames.push(styles.selected);
  }
  if (clickable === true || (typeof clickable === 'undefined' && showCheckbox === false)) {
    classNames.push(styles.clickable);
  }
  if (customClass) {
    classNames.push(customClass);
  }

  return classNames.join(' ');
}

function getTableCellClassName(
  defaultClassName: string,
  customClassName?: string | ((colIndex: number) => string),
  colIndex?: number,
) {
  if (typeof customClassName === 'function') {
    return customClassName(colIndex || 0);
  }
  if (typeof customClassName === 'string') {
    return `${defaultClassName} ${customClassName}`;
  }
  return defaultClassName;
}

const HoverableRowFactory = ({
  index,
  row,
  onChange,
  selected,
  selectionMode,
  multiSelect,
  showCheckbox,
  showCheckboxOnHover = true,
  hoverDelay = 0,
  renderIndex,
  CheckboxComponent,
  rowClassName,
  cellClassName,
}: HoverableRowProps): React.JSX.Element => {
  const trRef = useRef<HTMLTableRowElement>(null);
  const ckbRef = useRef<HTMLDivElement>(null);
  const [showCkb, setShowCkb] = useState<boolean>(selected || selectionMode);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const clickableRow = useMemo(
    () => (!showCheckbox && typeof row.clickable === 'undefined') || row.clickable,
    [showCheckbox, row.clickable],
  );

  const _onChange = (): void => {
    !clickableRow && onChange(row.id);
  };

  const onClick = useCallback<ReactEventHandler>(
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

  const displayCheckbox = useCallback(() => {
    if (hoverDelay > 0) {
      const timer = setTimeout(() => setShowCkb(true), hoverDelay);
      setHoverTimer(timer);
    } else {
      setShowCkb(true);
    }
  }, [hoverDelay]);

  const hideCheckbox = useCallback(() => {
    if (hoverTimer !== null) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setShowCkb(false);
  }, [hoverTimer]);

  useEffect(() => {
    if (!showCheckboxOnHover) {
      setShowCkb(true);
      return;
    }

    const refSave = trRef.current;
    if (refSave && showCheckbox) {
      refSave.addEventListener('mouseenter', displayCheckbox);
      refSave.addEventListener('mouseleave', hideCheckbox);
      refSave.addEventListener('focus', displayCheckbox);
      refSave.addEventListener('blur', hideCheckbox);
    }
    return (): void => {
      if (hoverTimer !== null) {
        clearTimeout(hoverTimer);
      }
      if (refSave) {
        refSave.removeEventListener('mouseenter', displayCheckbox);
        refSave.removeEventListener('mouseleave', hideCheckbox);
        refSave.removeEventListener('focus', displayCheckbox);
        refSave.removeEventListener('blur', hideCheckbox);
      }
    };
  }, [displayCheckbox, hideCheckbox, showCheckbox, showCheckboxOnHover, hoverDelay, hoverTimer]);

  const rowData = useMemo(
    () =>
      row.columns.map((column, i) => (
        <td className={getTableCellClassName(styles.tableRowCell, cellClassName, i)} key={i}>
          {typeof column === 'string' ? <Text>{column}</Text> : column}
        </td>
      )),
    [row.columns, cellClassName],
  );

  const CheckboxComponentToRender = CheckboxComponent || Checkbox;
  const displayBlockCheckbox = useMemo(
    () => !showCheckboxOnHover || selected || (multiSelect && selectionMode),
    [showCheckboxOnHover, selected, multiSelect, selectionMode],
  );

  return (
    <tr
      ref={trRef}
      onClick={onClick}
      className={getTableRowClassNames(
        selected,
        row.highlight,
        showCheckbox,
        row.clickable,
        rowClassName,
      )}
    >
      <td width="1.875rem" height="1.875rem" align="center">
        {showCheckbox && (showCkb || displayBlockCheckbox) ? (
          <CheckboxComponentToRender
            ref={ckbRef}
            size={'small'}
            value={selected}
            onClick={_onChange}
            iconColor={(multiSelect && selectionMode) || selected ? 'primary' : 'text'}
            aria-label={`Select row ${index}`}
          />
        ) : (
          <span>
            {typeof renderIndex === 'function' ? (
              renderIndex(index)
            ) : (
              <Text size="small" weight="light">
                {index}
              </Text>
            )}
          </span>
        )}
      </td>
      {rowData}
    </tr>
  );
};

export default HoverableRowFactory;

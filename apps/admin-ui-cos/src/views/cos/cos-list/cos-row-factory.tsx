/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Checkbox } from '@zextras/ui-components';
import {
  FunctionComponent,
  ReactElement,
  ReactEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './cos-row-factory.module.css';

export type CosRow = {
  id: string;
  columns: Array<string | ReactElement>;
  highlight?: boolean;
  clickable?: boolean;
  onClick?: ReactEventHandler;
  index?: number;
};

export interface CosRowFactoryProps {
  index: number;
  row: CosRow;
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
  if (clickable === true || (clickable === undefined && showCheckbox === false)) {
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

const CosRowFactory = ({
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
}: CosRowFactoryProps): React.JSX.Element => {
  const ckbRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCkb, setShowCkb] = useState<boolean>(selected || selectionMode);
  const clickableRow = useMemo(
    () => (!showCheckbox && row.clickable === undefined) || row.clickable,
    [showCheckbox, row.clickable],
  );

  const _onChange = (): void => {
    !clickableRow && onChange(row.id);
  };

  const onClick = useCallback<ReactEventHandler>(
    (e) => {
      const clickedOnCheckbox =
        showCheckbox &&
        ckbRef.current &&
        (e.target === ckbRef.current || ckbRef.current.contains(e.target as Node | null));
      if (!clickedOnCheckbox && row.onClick) {
        row.onClick(e);
      }
      clickableRow && onChange(row.id);
    },
    [row, onChange, clickableRow, showCheckbox],
  );

  const displayCheckbox = () => {
    if (hoverDelay > 0) {
      hoverTimerRef.current = setTimeout(() => setShowCkb(true), hoverDelay);
    } else {
      setShowCkb(true);
    }
  };

  const hideCheckbox = () => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowCkb(false);
  };

  const rowData = useMemo(
    () =>
      row.columns.map((column, i) => (
        <td className={getTableCellClassName(styles.tableRowCell, cellClassName, i)} key={`${row.id}-col-${i}`}>
          {typeof column === 'string' ? <ds-text as="span">{column}</ds-text> : column}
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
      onClick={onClick}
      onMouseEnter={showCheckboxOnHover && showCheckbox ? displayCheckbox : undefined}
      onMouseLeave={showCheckboxOnHover && showCheckbox ? hideCheckbox : undefined}
      onFocus={showCheckboxOnHover && showCheckbox ? displayCheckbox : undefined}
      onBlur={showCheckboxOnHover && showCheckbox ? hideCheckbox : undefined}
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
              <ds-text as="span" size="small" weight="light">
                {index}
              </ds-text>
            )}
          </span>
        )}
      </td>
      {rowData}
    </tr>
  );
};

export default CosRowFactory;

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {
  FunctionComponent,
  ReactElement,
  ReactEventHandler,
  useRef,
  useState,
} from 'react';

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
  const [hovered, setHovered] = useState<boolean>(false);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const showCkb = !showCheckboxOnHover || selected || selectionMode || hovered;
  const clickableRow = (!showCheckbox && row.clickable === undefined) || row.clickable;

  const _onChange = (): void => {
    if (!clickableRow) {
      onChange(row.id);
    }
  };

  const onClick: ReactEventHandler = (e) => {
    if (
      showCheckbox &&
      ckbRef.current &&
      e.target !== ckbRef.current &&
      !ckbRef.current.contains(e.target as Node | null) &&
      row.onClick
    ) {
      row.onClick(e);
    }
    if (clickableRow) {
      onChange(row.id);
    }
  };

  const displayCheckbox = () => {
    if (hoverDelay > 0) {
      const timer = setTimeout(() => setHovered(true), hoverDelay);
      setHoverTimer(timer);
    } else {
      setHovered(true);
    }
  };

  const hideCheckbox = () => {
    if (hoverTimer !== null) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setHovered(false);
  };

  const hoverHandlersEnabled = showCheckboxOnHover && showCheckbox;

  const rowData = row.columns.map((column, i) => (
    <td className={getTableCellClassName(styles.tableRowCell, cellClassName, i)} key={i}>
      {typeof column === 'string' ? <ds-text as="span">{column}</ds-text> : column}
    </td>
  ));

  const CheckboxComponentToRender = CheckboxComponent || Checkbox;
  const displayBlockCheckbox = !showCheckboxOnHover || selected || (multiSelect && selectionMode);

  return (
    <tr
      ref={trRef}
      onClick={onClick}
      onMouseEnter={hoverHandlersEnabled ? displayCheckbox : undefined}
      onMouseLeave={hoverHandlersEnabled ? hideCheckbox : undefined}
      onFocus={hoverHandlersEnabled ? displayCheckbox : undefined}
      onBlur={hoverHandlersEnabled ? hideCheckbox : undefined}
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

export default HoverableRowFactory;

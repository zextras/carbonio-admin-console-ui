/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Checkbox, Container, Row, Select, Text } from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ASC = 'asc';
const DESC = 'desc';

type THeader = {
  id: string;
  label: string;
  align?: React.ThHTMLAttributes<HTMLTableHeaderCellElement>['align'];
  width?: string;
  i18nAllLabel?: string;
  bold?: boolean;
  items?: any;
  onChange: () => void;
  onSortChange: (id: string, order: typeof ASC | typeof DESC) => void;
  sortable?: boolean;
};

export const CustomHeaderFactory: FC<any> = ({
  headers,
  onChange,
  allSelected,
  selectionMode,
  multiSelect,
  showCheckbox,
}): React.JSX.Element => {
  const trRef = useRef<HTMLTableRowElement>(null);
  const [showCkb, setShowCkb] = useState(false);
  const [sortedColumn, setSortedColumn] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);

  const handleSortChange = useCallback(
    (id: string) => {
      const newOrder = id === sortedColumn && sortOrder === ASC ? DESC : ASC;
      setSortedColumn(id);
      setSortOrder(newOrder);
      headers.forEach((header: any) => {
        if (header.id === id) {
          header.onSortChange(id, newOrder);
        }
      });
    },
    [headers, sortedColumn, sortOrder],
  );

  const renderSortingIcon = useCallback(
    (column: THeader) => {
      if (column.id === sortedColumn) {
        return sortOrder === ASC ? (
          <icon-wc icon="ChevronSortUpOutline" size="large"></icon-wc>
        ) : (
          <icon-wc icon="ChevronSortDownOutline" size="large"></icon-wc>
        );
      }
      return <icon-wc icon="ChevronSortEmptyOutline" size="large"></icon-wc>;
    },
    [sortedColumn, sortOrder],
  );

  const LabelFactory = useCallback(
    ({ label, open, focus, bold, size }: any) => (
      <Container
        orientation="horizontal"
        width="fill"
        crossAlignment="center"
        mainAlignment="space-between"
        borderRadius="half"
        padding={{
          vertical: 'small',
        }}
      >
        <Row
          takeAvailableSpace
          mainAlignment="unset"
          style={{ display: 'inline-table' }}
          width="auto"
        >
          <Text
            size={size || 'medium'}
            weight={bold ? 'bold' : 'regular'}
            color={open || focus ? 'primary' : 'text'}
          >
            {label}
          </Text>
        </Row>
        <Container>
          <icon-wc
            size="medium"
            icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
            color={open || focus ? 'primary' : 'text'}
            style={{ alignSelf: 'center' }}
          ></icon-wc>
        </Container>
      </Container>
    ),
    [],
  );

  const displayCheckbox = useCallback(() => {
    setShowCkb(true);
  }, []);

  const hideCheckbox = useCallback(() => {
    setShowCkb(false);
  }, []);

  useEffect(() => {
    const refSave = trRef.current;
    if (refSave && showCheckbox) {
      refSave.addEventListener('mouseenter', displayCheckbox);
      refSave.addEventListener('mouseleave', hideCheckbox);
      refSave.addEventListener('focus', displayCheckbox);
      refSave.addEventListener('blur', hideCheckbox);
    }
    return (): void => {
      if (refSave) {
        refSave.removeEventListener('mouseenter', displayCheckbox);
        refSave.removeEventListener('mouseleave', hideCheckbox);
        refSave.removeEventListener('focus', displayCheckbox);
        refSave.removeEventListener('blur', hideCheckbox);
      }
    };
  }, [displayCheckbox, hideCheckbox, showCheckbox]);

  const headerData = useMemo(
    () =>
      headers.map((column: any) => {
        const hasItems = !isEmpty(column.items);
        const isSortable = column.sortable === true;
        return (
          <th
            key={column.id}
            align={column.align || 'left'}
            style={{ width: column?.width, height: '2.625rem' }}
            onClick={isSortable ? (): void => handleSortChange(column.id) : undefined}
          >
            {hasItems && (
              <Container width="4rem">
                <Select
                  label={column.label}
                  multiple
                  items={column.items}
                  i18nAllLabel={column.i18nAllLabel || 'All'}
                  dropdownWidth="auto"
                  onChange={column.onChange}
                  display={column.align ? 'inline-block' : 'block'}
                  LabelFactory={(props: any): React.JSX.Element =>
                    LabelFactory({ ...props, bold: column.bold, size: 'small' })
                  }
                />
              </Container>
            )}
            {!hasItems && (
              <Text weight={column.bold ? 'bold' : 'regular'} size="small">
                <Container orientation="horizontal" mainAlignment="flex-start">
                  <Row style={{ cursor: isSortable ? 'pointer' : 'default' }}>
                    {column.label}
                    {isSortable && renderSortingIcon(column)}
                  </Row>
                </Container>
              </Text>
            )}
          </th>
        );
      }),
    [headers, renderSortingIcon, handleSortChange, LabelFactory],
  );
  return (
    <tr ref={trRef} style={{ height: '3rem' }}>
      <th align="center" style={{ width: '30px' }}>
        {showCheckbox && multiSelect && (showCkb || selectionMode || allSelected) && (
          <Checkbox
            size="small"
            value={allSelected}
            onClick={onChange}
            iconColor={selectionMode ? 'primary' : 'text'}
          />
        )}
      </th>
      {headerData}
    </tr>
  );
};

import clsx from 'clsx';
import { useCallback, useMemo, useRef } from 'react';

import { Text } from '../basic/text/Text';
import { Checkbox } from '../inputs/Checkbox';
import { Select } from '../inputs/Select';
import { Container } from '../layout/Container';
import { Row } from '../layout/Row';
import { THeaderProps } from './Table';
import styles from './Table.module.css';

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type LabelFactoryProps = {
  label?: string;
  open?: boolean;
  focus?: boolean;
  bold?: boolean;
};

export const DefaultHeaderFactory = ({
  headers,
  onChange,
  allSelected,
  selectionMode,
  multiSelect,
  showCheckbox,
}: THeaderProps): React.JSX.Element => {
  const trRef = useRef<HTMLTableRowElement>(null);

  const LabelFactory = useCallback(
    ({ label, open, focus, bold }: LabelFactoryProps) => (
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
        <Row takeAvailableSpace mainAlignment="unset">
          <Text
            size="medium"
            weight={bold ? 'bold' : 'regular'}
            color={open || focus ? 'primary' : 'text'}
          >
            {label}
          </Text>
        </Row>
        <icon-wc
          size="medium"
          icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
          color={open || focus ? 'primary' : 'text'}
          style={{ alignSelf: 'center' }}
        ></icon-wc>
      </Container>
    ),
    [],
  );

  const headerData = useMemo(
    () =>
      headers.map((column) => {
        const hasItems = column.items !== undefined && column.items.length > 0;
        return (
          <th key={column.id} align={column.align || 'left'}>
            {hasItems && (
              <Select
                label={column.label}
                multiple
                items={column.items}
                i18nAllLabel={column.i18nAllLabel || 'All'}
                dropdownWidth="auto"
                onChange={column.onChange}
                display={column.align ? 'inline-block' : 'block'}
                LabelFactory={(props): React.JSX.Element =>
                  LabelFactory({ ...props, bold: column.bold })
                }
              />
            )}
            {!hasItems && <Text weight={column.bold ? 'bold' : 'regular'}>{column.label}</Text>}
          </th>
        );
      }),
    [LabelFactory, headers],
  );

  return (
    <tr ref={trRef} className={styles.headerRow}>
      <th align="center">
        {showCheckbox && multiSelect && (
          <Checkbox
            className={clsx(styles.checkbox, selectionMode && styles.show)}
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

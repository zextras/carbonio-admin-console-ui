/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '../display/Tooltip';
import { IconCheckbox } from '../inputs/IconCheckbox';
import { Select, SelectItem } from '../inputs/Select';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';

type InheritedSelectProps = {
  label: string;
  items: Array<SelectItem>;
  subValue?: string | boolean;
  inheritedValue?: string | boolean;
  background?: string;
  selectName: string;
  onChange: (value: any) => void;
  onChangeReset: () => void;
  fromSubValue?: boolean | string;
  disabled?: boolean;
  onClick?: () => void;
};

const InheritedSelect: FC<InheritedSelectProps> = ({
  label,
  items,
  subValue,
  inheritedValue,
  background = 'gray5',
  selectName,
  onChange,
  onChangeReset,
  fromSubValue,
  disabled = false,
  onClick,
}) => {
  const [t] = useTranslation();
  const selectedValue = useMemo(() => {
    let selectValue = subValue;
    if (!subValue) {
      selectValue = inheritedValue;
    }
    const stringValue = selectValue !== undefined ? String(selectValue) : undefined;
    return (
      items.find((item: SelectItem) => item.value === selectValue) || {
        label: stringValue ?? '',
        value: selectValue,
      }
    );
  }, [subValue, inheritedValue, items]);
  return (
    <Container orientation="horizontal" data-testid={`inherited-${selectName}`}>
      <Row takeAvailableSpace>
        <Select
          label={label}
          items={items}
          showCheckbox={false}
          selection={selectedValue}
          background={background}
          onChange={onChange}
          disabled={disabled}
          onClick={onClick}
        />
      </Row>
      {fromSubValue ? (
        <Tooltip
          label={
            <>
              <Row mainAlignment="flex-start" takeAvailableSpace width="fill">
                <ds-text as="label" weight="bold">
                  {t('account_details.inherited_value_was', 'The inherited value was')} :
                </ds-text>
                <ds-text as="span">{`  ${
                  items.find((item) => item.value === inheritedValue)?.label || ''
                }`}</ds-text>
              </Row>
              <Padding top="small">
                <ds-text as="label" weight="bold">
                  {t('account_details.click_to_revert', 'Click to revert.')}
                </ds-text>
              </Padding>
            </>
          }
        >
          <IconCheckbox
            icon="RefreshOutline"
            value={false}
            size="large"
            onClick={onChangeReset}
            style={{ cursor: 'pointer' }}
            onChange={(): null => null}
            data-testid={`reset-${selectName}`}
          />
        </Tooltip>
      ) : null}
    </Container>
  );
};

export { InheritedSelect, type InheritedSelectProps };

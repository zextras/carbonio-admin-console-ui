/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Dropdown, IconName, Input } from '@zextras/ui-components';

import { IconSize } from '../../web-components/icon-wc';

type DropDownInputType = {
  items: any;
  placement?:
    | 'bottom-start'
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | undefined;
  maxWidth?: string;
  disableAutoFocus?: boolean;
  width?: string;
  dropdownOnClick?: any;
  inputLabel: string;
  onChange: any;
  inputValue: any;
  size?: string;
  backgroundColor?: string;
  hasError?: boolean;
  inputDisabled?: boolean;
  isCustomIcon: boolean;
  customIconDetail?: {
    icon: IconName;
    size?: IconSize | string;
    color?: string;
    onClick?: (e: Event) => void;
  };
};

export const DropDownInput = ({
  items,
  maxWidth,
  width,
  disableAutoFocus,
  dropdownOnClick,
  inputLabel,
  onChange,
  inputValue,
  backgroundColor,
  hasError,
  inputDisabled,
  isCustomIcon,
  customIconDetail,
}: DropDownInputType) => (
  <Dropdown
    items={items}
    maxWidth={maxWidth || '300px'}
    disableAutoFocus={disableAutoFocus || true}
    width={width || '265px'}
    style={{
      width: '100%',
    }}
    onClick={dropdownOnClick}
  >
    <div>
      <Input
        label={inputLabel}
        onChange={onChange}
        CustomIcon={() =>
          isCustomIcon ? (
            <icon-wc
              icon={customIconDetail?.icon || 'GlobeOutline'}
              size={customIconDetail?.size || 'large'}
              color={customIconDetail?.color || 'primary'}
              clickHandler={customIconDetail?.onClick}
            ></icon-wc>
          ) : (
            ''
          )
        }
        value={inputValue}
        backgroundColor={backgroundColor || 'gray5'}
        hasError={hasError}
        disabled={inputDisabled || false}
      />
    </div>
  </Dropdown>
);

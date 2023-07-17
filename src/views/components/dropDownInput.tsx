/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Input, Dropdown, Icon } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';

interface DropDownInputType {
	items: any;
	placement?: string;
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
	customIconDetail?: any;
}

const DropDownInput: FC<DropDownInputType> = ({
	items,
	placement,
	maxWidth,
	width,
	disableAutoFocus,
	dropdownOnClick,
	inputLabel,
	onChange,
	size,
	inputValue,
	backgroundColor,
	hasError,
	inputDisabled,
	isCustomIcon,
	customIconDetail
}) => (
	<Dropdown
		items={items}
		placement={placement || 'bottom-start'}
		maxWidth={maxWidth || '300px'}
		disableAutoFocus={disableAutoFocus || true}
		width={width || '265px'}
		style={{
			width: '100%'
		}}
		onClick={dropdownOnClick}
	>
		<div>
			<Input
				label={inputLabel}
				onChange={onChange}
				size={size}
				CustomIcon={(): React.ReactChild =>
					isCustomIcon ? (
						<Icon
							icon={customIconDetail?.icon || 'GlobeOutline'}
							size={customIconDetail?.size || 'large'}
							color={customIconDetail?.color || 'primary'}
							onClick={customIconDetail?.onClick}
							style={customIconDetail?.style}
						/>
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
export default DropDownInput;

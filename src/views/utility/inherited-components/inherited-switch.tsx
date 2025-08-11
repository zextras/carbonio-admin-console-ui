/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import {
	Switch,
	Tooltip,
	IconCheckbox,
	Text,
	Row,
	Container,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const InheritedSwitch: FC<{
	label: any;
	subValue: any;
	inheritedValue: any;
	inputName: string;
	onChange: any;
	onChangeReset: any;
	fromSubValue: any;
	iconColor: string;
	disabled?: boolean;
	onFocus?: any;
}> = ({
	label,
	subValue,
	inheritedValue,
	inputName,
	onChange,
	onChangeReset,
	fromSubValue,
	iconColor,
	disabled = false,
	onFocus
}) => {
	const [t] = useTranslation();

	return (
		<Container
			data-testid={`inherited-${inputName}`}
			mainAlignment="flex-start"
			orientation="horizontal"
		>
			<Row mainAlignment="flex-start">
				<Switch
					value={subValue ? subValue === 'TRUE' : inheritedValue === 'TRUE'}
					onClick={(): void => onChange(inputName)}
					label={label}
					iconColor={iconColor}
					disabled={disabled}
					onFocus={onFocus}
				/>
			</Row>
			{fromSubValue ? (
				<Tooltip
					label={
						<>
							<Row mainAlignment="flex-start" takeAvailableSpace width="fill">
								<Text weight="bold">
									{t('account_details.inherited_value_was', 'The inherited value was')} :
								</Text>
								<Text>{`  ${
									inheritedValue === 'TRUE' ? t('label.true', 'true') : t('label.false', 'false')
								}`}</Text>
							</Row>
							<Padding top="small">
								<Text weight="bold">
									{t('account_details.click_to_revert', 'Click to revert.')}
								</Text>
							</Padding>
						</>
					}
				>
					<IconCheckbox
						data-testid={`reset-inherited-${inputName}`}
						icon="RefreshOutline"
						value={false}
						onClick={onChangeReset}
						style={{ cursor: 'pointer', pointerEvents: disabled ? 'none' : 'all' }}
						onChange={(): null => null}
						disabled={disabled}
					/>
				</Tooltip>
			) : (
				<></>
			)}
		</Container>
	);
};
export default InheritedSwitch;

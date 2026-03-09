/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	IconCheckbox,
	Padding,
	Row,
	Switch,
	Text,
	Tooltip,
} from '@zextras/ui-components';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

type InheritedSwitchProps = {
	label: string;
	subValue?: string | boolean;
	inheritedValue?: string | boolean;
	inputName: string;
	onChange: (...args: Array<any>) => void;
	onChangeReset: (...args: Array<any>) => void;
	fromSubValue?: string | boolean;
	iconColor: string;
	disabled?: boolean;
	onFocus?: () => void;
};

const InheritedSwitch: FC<InheritedSwitchProps> = ({
	label,
	subValue,
	inheritedValue,
	inputName,
	onChange,
	onChangeReset,
	fromSubValue,
	iconColor,
	disabled = false,
	onFocus,
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
					iconColor={iconColor as 'primary' | 'text' | 'gray0' | 'error' | 'warning' | 'success'}
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
						icon="RefreshOutline"
						value={false}
						onClick={onChangeReset}
						style={{ cursor: 'pointer', pointerEvents: disabled ? 'none' : 'all' }}
						onChange={(): null => null}
						disabled={disabled}
						data-testid={`reset-${inputName}`}
					/>
				</Tooltip>
			) : null}
		</Container>
	);
};

export { InheritedSwitch, type InheritedSwitchProps };

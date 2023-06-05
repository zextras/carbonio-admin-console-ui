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
	Container
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const InheritedSwitch: FC<{
	label: any;
	accountValue: any;
	cosValue: any;
	inputName: string;
	onChange: any;
	onChangeReset: any;
	fromAccount: any;
	iconColor: string;
	disabled?: boolean;
}> = ({
	label,
	accountValue,
	cosValue,
	inputName,
	onChange,
	onChangeReset,
	fromAccount,
	iconColor,
	disabled = false
}) => {
	const [t] = useTranslation();
	return (
		<Container mainAlignment="flex-start" orientation="horizontal">
			<Row mainAlignment="flex-start">
				<Switch
					value={accountValue ? accountValue === 'TRUE' : cosValue === 'TRUE'}
					onClick={(): void => onChange(inputName)}
					label={label}
					iconColor={iconColor}
					disabled={disabled}
				/>
			</Row>
			{fromAccount ? (
				<Tooltip
					label={
						<>
							<Row mainAlignment="flex-start" takeAvailableSpace width="fill">
								<Text weight="bold">
									{t('account_details.inherited_value_was', 'The inherited value was')} :
								</Text>
								<Text>{`  ${
									cosValue === 'TRUE' ? t('label.true', 'true') : t('label.false', 'false')
								}`}</Text>
							</Row>
							<Text weight="bold">{t('account_details.click_to_revert', 'Click to revert.')}</Text>
						</>
					}
				>
					<IconCheckbox
						icon="RefreshOutline"
						value={false}
						onClick={onChangeReset}
						style={{ cursor: 'pointer' }}
					/>
				</Tooltip>
			) : (
				<></>
			)}
		</Container>
	);
};
export default InheritedSwitch;

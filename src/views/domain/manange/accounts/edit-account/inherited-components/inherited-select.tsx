/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';
import {
	Select,
	Tooltip,
	IconCheckbox,
	Text,
	Row,
	Container,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const InheritedSelect: FC<{
	label: any;
	items: any[];
	accountValue: any;
	cosValue: any;
	background: any;
	selectName: any;
	onChange: any;
	onChangeReset: any;
	fromAccount: any;
	disabled?: boolean;
}> = ({
	label,
	items,
	accountValue,
	cosValue,
	background,
	selectName,
	onChange,
	onChangeReset,
	fromAccount,
	disabled = false
}) => {
	const [t] = useTranslation();
	const selectedValue = useMemo(() => {
		let selectValue = accountValue;
		if (!accountValue) {
			selectValue = cosValue;
		}
		return items.find((item: any) => item.value === selectValue);
	}, [accountValue, cosValue, items]);
	return (
		<Container orientation="horizontal">
			<Row takeAvailableSpace>
				<Select
					label={label}
					items={items}
					showCheckbox={false}
					selection={selectedValue}
					padding={{ right: 'medium' }}
					background={background}
					selectName={selectName}
					onChange={onChange}
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
									items.find((item: any) => item.value === cosValue)?.label || ''
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
						size="large"
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
export default InheritedSelect;

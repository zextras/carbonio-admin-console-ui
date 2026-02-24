/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	IconCheckbox,
	Padding,
	Row,
	Select,
	type SelectItem,
	Text,
	Tooltip,
} from '@zextras/ui-components';
import { type FC,useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
								<Text weight="bold">
									{t('account_details.inherited_value_was', 'The inherited value was')} :
								</Text>
								<Text>{`  ${
									items.find((item) => item.value === inheritedValue)?.label || ''
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
						onChange={(): null => null}
						data-testid={`reset-${selectName}`}
					/>
				</Tooltip>
			) : null}
		</Container>
	);
};

export { InheritedSelect, type InheritedSelectProps };

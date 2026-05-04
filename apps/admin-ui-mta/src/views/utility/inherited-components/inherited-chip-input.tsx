/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ChipInput,
	Container,
	IconCheckbox,
	Padding,
	Row,
	Tooltip,
} from '@zextras/ui-components';
import { map } from 'lodash-es';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type ChipValue = Array<{ label?: string }> | string | undefined;

function normalizeChipValue(value: ChipValue): Array<{ label?: string }> {
	if (Array.isArray(value)) {
		return value;
	}
	if (typeof value === 'string' && value.length > 0) {
		return [{ label: value }];
	}
	return [];
}

const InheritedChipInput: FC<{
	subValue: ChipValue;
	inheritedValue: ChipValue;
	background?: string;
	onChange: (value: Array<{ label?: string }>) => void;
	onChangeReset: () => void;
	fromSubValue: string | boolean | undefined;
	disabled?: boolean;
	hasError?: boolean;
	requireUniqueChips?: boolean;
	pref?: Record<string, unknown>;
	description?: string;
	placeholder?: string;
	ChipComponent?: FC;
}> = ({
	placeholder,
	requireUniqueChips,
	subValue,
	inheritedValue,
	background = 'gray5',
	onChange,
	onChangeReset,
	fromSubValue,
	disabled = false,
	hasError = false,
	pref = {},
	description,
	ChipComponent
}) => {
	const [t] = useTranslation();

	return (
		<Container orientation="horizontal">
			<Row takeAvailableSpace>
				<ChipInput
					placeholder={placeholder}
					requireUniqueChips={requireUniqueChips}
					value={
						subValue === undefined || normalizeChipValue(subValue).length === 0
							? normalizeChipValue(inheritedValue)
							: normalizeChipValue(subValue)
					}
					background={background}
					onChange={onChange}
					disabled={disabled}
					hasError={hasError}
					ChipComponent={ChipComponent}
					maxChips={null}
					description={description}
					{...pref}
				/>
			</Row>
			{fromSubValue ? (
				<Tooltip
					label={
						<>
							<Row>
								<ds-text as="label" weight="bold">
									{t('account_details.inherited_value_was', 'The inherited value was')} :
								</ds-text>
								<ds-text as="span">{`  ${
									Array.isArray(inheritedValue)
										? map(inheritedValue, 'label')
										: inheritedValue || ''
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
					/>
				</Tooltip>
			) : (
				<></>
			)}
		</Container>
	);
};
export default InheritedChipInput;

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
	Text,
	Tooltip} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const InheritedChipInput: FC<{
	subValue: any;
	inheritedValue: any;
	background?: any;
	onChange: any;
	onChangeReset: any;
	fromSubValue: any;
	disabled?: boolean;
	hasError?: boolean;
	requireUniqueChips?: boolean;
	pref?: any;
	description?: any;
	placeholder?: any;
	ChipComponent?: any;
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
	const CustomIcon = useCallback(
		() => (
			<Tooltip
				label={
					<>
						<Row>
							<Text weight="bold">
								{t('account_details.inherited_value_was', 'The inherited value was')} :
							</Text>
							<Text>{`  ${inheritedValue || ''}`}</Text>
						</Row>
						<Padding top="small">
							<Text weight="bold">{t('account_details.click_to_revert', 'Click to revert.')}</Text>
						</Padding>
					</>
				}
			>
				<IconCheckbox
					icon="RefreshOutline"
					onClick={onChangeReset}
					style={{ cursor: 'pointer' }}
					onChange={(): null => null}
				/>
			</Tooltip>
		),
		[inheritedValue, onChangeReset, t]
	);
	return (
		<Container orientation="horizontal">
			<Row takeAvailableSpace>
				<ChipInput
					placeholder={placeholder}
					requireUniqueChips={requireUniqueChips}
					value={subValue === undefined || !subValue?.length ? inheritedValue || '' : subValue}
					background={background}
					onChange={onChange}
					disabled={disabled}
					hasError={hasError}
					ChipComponent={ChipComponent}
					maxChips={null}
					CustomIcon={CustomIcon}
					description={description}
					{...pref}
				/>
			</Row>
			{fromSubValue ? (
				<Tooltip
					label={
						<>
							<Row>
								<Text weight="bold">
									{t('account_details.inherited_value_was', 'The inherited value was')} :
								</Text>
								<Text>{`  ${inheritedValue ? map(inheritedValue, 'label') : ''}`}</Text>
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
					/>
				</Tooltip>
			) : (
				<></>
			)}
		</Container>
	);
};
export default InheritedChipInput;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import {
	ChipInput,
	Tooltip,
	IconCheckbox,
	Text,
	Row,
	Padding,
	Container
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

interface InheritedChipInputProps {
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
	ChipComponent?: any;
	placeholder?: string;
}

const InheritedChipInput: FC<InheritedChipInputProps> = ({
	subValue,
	inheritedValue,
	background = 'gray5',
	onChange,
	onChangeReset,
	fromSubValue,
	disabled = false,
	hasError = false,
	requireUniqueChips,
	pref = {},
	description,
	ChipComponent,
	placeholder
}) => {
	const [t] = useTranslation();
	return (
		<Container orientation="horizontal">
			<Row takeAvailableSpace>
				<ChipInput
					placeholder={placeholder}
					requireUniqueChips={requireUniqueChips}
					value={subValue === undefined ? inheritedValue || '' : subValue}
					background={background}
					onChange={onChange}
					disabled={disabled}
					hasError={hasError}
					ChipComponent={ChipComponent}
					maxChips={null}
					CustomIcon={(): any => (
						<Tooltip
							label={
								<>
									<Row>
										<Text weight="bold">
											{t('account_details.inherited_value_was', 'The inherited value was')} :
										</Text>
										<Text overflow={'break-word'}>{`  ${inheritedValue || ''}`}</Text>
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
								onClick={onChangeReset}
								style={{ cursor: 'pointer' }}
								onChange={(): null => null}
							/>
						</Tooltip>
					)}
					description={description}
					{...pref}
				/>
			</Row>
			{fromSubValue?.length ? (
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

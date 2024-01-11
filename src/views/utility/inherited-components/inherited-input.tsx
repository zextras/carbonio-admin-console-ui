/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Input, Tooltip, IconCheckbox, Text, Row, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const InheritedInput: FC<{
	label: any;
	subValue: any;
	inheritedValue: any;
	background?: any;
	inputName: any;
	onChange: any;
	onChangeReset: any;
	fromSubValue: any;
	disabled?: boolean;
	hasError?: boolean;
	pref?: any;
}> = ({
	label,
	subValue,
	inheritedValue,
	background = 'gray5',
	inputName,
	onChange,
	onChangeReset,
	fromSubValue,
	disabled = false,
	hasError = false,
	pref = {}
}) => {
	const [t] = useTranslation();
	return (
		<>
			<Input
				label={label}
				value={subValue === undefined ? inheritedValue || '' : subValue}
				background={background}
				inputName={inputName}
				onChange={onChange}
				disabled={disabled}
				hasError={hasError}
				CustomIcon={(): any => (
					<>
						{fromSubValue ? (
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
						) : (
							<></>
						)}
					</>
				)}
				{...pref}
			/>
		</>
	);
};
export default InheritedInput;

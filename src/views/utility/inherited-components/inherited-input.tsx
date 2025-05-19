/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';

import { Input, Tooltip, IconCheckbox, Text, Row, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface InheritedInputProps {
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
	onClick?: any;
	onFocus?: any;
	onBlur?: any;
	description?: any;
	focus?: boolean;
	highlighted?: boolean;
}

const HighlightedInput = styled(Input)<InheritedInputProps>`
	background-color: ${({ highlighted }): any => (highlighted ? '#D5E3F6' : 'gray5')};
	transition: background-color 3s ease;
`;
const InheritedInput: FC<InheritedInputProps> = ({
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
	pref = {},
	onClick,
	onFocus,
	onBlur,
	description,
	focus = false,
	highlighted = false
}) => {
	const [t] = useTranslation();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [highlight, setHighlight] = useState(false);

	// Effect to reset the highlight after a transition
	useEffect(() => {
		if (highlight) {
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const transitionEndHandler = () => {
				setHighlight(false);
			};

			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const handleTransitionEnd = () => {
				document.removeEventListener('transitionend', transitionEndHandler);
				transitionEndHandler();
			};

			document.addEventListener('transitionend', handleTransitionEnd, { once: true });
		}
	}, [highlight]);

	useEffect(() => {
		if (highlighted) {
			setHighlight(true);
		}
	}, [highlighted]);

	useEffect(() => {
		if (focus && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [focus, inputRef]);

	const InputComponent = highlighted ? HighlightedInput : Input;

	return (
		<InputComponent
			data-testid={`inherited-${inputName}`}
			label={label}
			value={subValue === undefined ? inheritedValue || '' : subValue}
			background={background}
			inputName={inputName}
			onChange={onChange}
			disabled={disabled}
			hasError={hasError}
			onClick={(): void => {
				disabled && onClick && onClick();
			}}
			onFocus={(): void => {
				!disabled && onFocus && onFocus();
			}}
			onBlur={(): void => {
				!disabled && onBlur?.();
			}}
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
			description={description}
			{...pref}
			inputRef={inputRef}
			highlighted={highlight}
		/>
	);
};
export default InheritedInput;

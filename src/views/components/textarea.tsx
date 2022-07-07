/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';

const ContainerEl = styled(Container)`
	${(props): FlattenSimpleInterpolation | string =>
		(props.disabled &&
			css`
				opacity: 0.5;
			`) ||
		''};
	${({ theme, background, disabled }): FlattenSimpleInterpolation | string =>
		(!disabled &&
			css`
				transition: background 0.2s ease-out;
				&:focus {
					outline: none;
					background: ${theme.palette[background].focus};
				}
				&:hover {
					outline: none;
					background: ${theme.palette[background].hover};
				}
				&:active {
					outline: none;
					background: ${theme.palette[background].active};
				}
			`) ||
		''};
`;

const TextAreaEl = styled.textarea`
	border: none !important;
	height: auto !important;
	width: 100%;
	outline: 0;
	resize: none;
	background: transparent !important;
	font-size: ${({ theme }): string => theme.sizes.font.medium};
	font-weight: ${({ theme }): number => theme.fonts.weight.regular};
	font-family: ${({ theme }): string => theme.fonts.default};
	border-top: 16px solid transparent !important;
	transition: background 0.2s ease-out;
	padding: ${({ theme }): string =>
		`calc(${theme.sizes.padding.large} + ${theme.sizes.padding.extrasmall}) ${theme.sizes.padding.large} ${theme.sizes.padding.small}`}!important;
	&::placeholder {
		color: transparent;
	}
`;

const Label = styled.label<{ hasError: boolean; hasFocus: boolean }>`
	position: absolute;
	top: 20%;
	left: ${({ theme }): string => theme.sizes.padding.large};
	font-size: ${({ theme }): string => theme.sizes.font.medium};
	font-weight: ${({ theme }): number => theme.fonts.weight.regular};
	font-family: ${({ theme }): string => theme.fonts.default};
	color: ${({ theme, hasError, hasFocus }): string =>
		theme.palette[(hasError && 'error') || (hasFocus && 'primary') || 'secondary'].regular};
	transform: translateY(-50%);
	transition: transform 150ms ease-out, font-size 150ms ease-out, top 150ms ease-out,
		left 150ms ease-out;
	pointer-events: none;
	user-select: none;
	max-width: calc(100% - ${({ theme }): string => `${theme.sizes.padding.large} * 2`});
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	${TextAreaEl}:focus + &,
    ${TextAreaEl}:not(:placeholder-shown) + & {
		top: ${({ theme }): string => `calc(${theme.sizes.padding.small} - 1px)`};
		transform: translateY(0);
		font-size: ${({ theme }): string => theme.sizes.font.small};
	}
`;

export interface TextareaProps {
	/** Textarea's background color */
	backgroundColor?: string;
	/** whether to disable the Textarea or not */
	disabled?: boolean;

	/** Label of the Textarea, will act (graphically) as placeholder when the Textarea is not focused */
	label: string;
	/** Textarea change callback */
	onChange?: (e: React.SyntheticEvent) => void;
	/** value of the Textarea */
	value?: string | number;
	/** default value of the Textarea */
	defaultValue?: string | number;
	/** Whether or not the Textarea has an error */
	hasError?: boolean;
	/** Whether or not the Textarea should focus on load */
	autoFocus?: boolean;
	/** Textarea autocompletion type (HTML Textarea attribute) */
	autoComplete?: string;
	/** HTML Textarea name */
	inputName?: string;
	/** on Enter key callback */
	onEnter?: (e: KeyboardEvent) => void;
	rows?: number;
}

type TextArea = React.ForwardRefExoticComponent<
	TextareaProps & React.RefAttributes<HTMLDivElement>
> & {
	_newId?: number;
};

const Textarea: any = React.forwardRef<HTMLDivElement, TextareaProps>(function TextareaFn(
	{
		autoFocus = false,
		autoComplete = 'off',
		backgroundColor = 'gray6',
		defaultValue,
		disabled = false,
		label,
		value,
		onChange,
		hasError = false,
		inputName,
		onEnter,
		rows = 3,
		...rest
	},
	ref
) {
	const [hasFocus, setHasFocus] = useState(false);
	const [id] = useState(() => {
		if (!Textarea._newId) {
			Textarea._newId = 0;
		}
		// eslint-disable-next-line no-plusplus
		return `textarea-${Textarea._newId++}`;
	});

	const onTextAreaFocus = useCallback(() => {
		if (!disabled) {
			setHasFocus(true);
		}
	}, [setHasFocus, disabled]);

	const onTextAreaBlur = useCallback(() => setHasFocus(false), [setHasFocus]);

	return (
		<ContainerEl
			ref={ref}
			orientation="horizontal"
			width="fill"
			height="fit"
			borderRadius="half"
			background={backgroundColor}
			style={{
				cursor: 'text',
				position: 'relative'
			}}
			onClick={onTextAreaFocus}
			disabled={disabled}
			{...rest}
		>
			<TextAreaEl
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={autoFocus || undefined}
				autoComplete={autoComplete || 'off'} // This one seems to be a React quirk, 'off' doesn't really work
				onFocus={onTextAreaFocus}
				onBlur={onTextAreaBlur}
				id={id}
				name={inputName || label}
				defaultValue={defaultValue}
				value={value}
				onChange={onChange}
				disabled={disabled}
				placeholder={label}
				rows={rows}
			/>
			<Label htmlFor={id} hasFocus={hasFocus} hasError={hasError}>
				{label}
			</Label>
		</ContainerEl>
	);
});

Textarea._newId = 0;

export default Textarea;

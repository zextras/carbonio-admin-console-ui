/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from 'react';
import styled, { css, DefaultTheme, SimpleInterpolation } from 'styled-components';

import { getPadding, isThemeSize, useTheme } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { Button, ButtonProps } from '../basic/button/Button';

const StyledIconButton = styled(Button)<{
	$iconSize?: string;
	$paddingSize?: string;
	$borderRadius?: 'regular' | 'round';
}>`
	min-width: fit-content;
	border-radius: ${({ $borderRadius }): string =>
		($borderRadius === 'round' && '3.125rem') || '0.25rem'};
	${({ $iconSize }): SimpleInterpolation =>
		$iconSize &&
		css`
			svg {
				width: ${$iconSize};
				min-width: ${$iconSize};
				height: ${$iconSize};
				min-height: ${$iconSize};
			}
		`};
	${({ $paddingSize }): SimpleInterpolation =>
		$paddingSize &&
		css`
			padding: ${$paddingSize};
		`};
`;

type IconButtonProps = ButtonProps & {
	/** Color of the icon */
	iconColor?: AnyColor;
	/** Color of the button */
	backgroundColor?: AnyColor;
	/** whether to disable the IconButton or not */
	disabled?: boolean;
	/** button size */
	size?: ButtonProps['size'];
	/** Custom button size */
	customSize?: {
		iconSize: string | keyof DefaultTheme['sizes']['icon'];
		paddingSize: 0 | string | keyof DefaultTheme['sizes']['padding'];
	};
	/** icon name */
	icon: keyof DefaultTheme['icons'];
	/** IconButton border radius */
	borderRadius?: 'regular' | 'round';
	/** Click callback */
	onClick: (e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>) => void;
	/**
	 * Custom icon color
	 * @deprecated use iconColor instead
	 */
	customIconColor?: string;
	secondaryAction?: never;
};

/** @deprecated use Button with just the icon instead */
const IconButton = ({
	iconColor = 'text',
	backgroundColor = 'transparent',
	disabled = false,
	customSize,
	size = 'medium',
	icon,
	borderRadius = 'regular',
	onClick,
	customIconColor,
	type = 'default',
	...rest
}: IconButtonProps) => {
	const theme = useTheme();

	const { iconSize, paddingSize } = useMemo(
		() =>
			customSize
				? {
						iconSize: isThemeSize(String(customSize.iconSize), theme.sizes.icon)
							? String(
									theme.sizes.icon[
										customSize.iconSize as keyof typeof theme.sizes.icon
									]
							  )
							: String(customSize.iconSize),
						paddingSize: getPadding(String(customSize.paddingSize), theme)
					}
				: {},
		[customSize, theme]
	);

	const handleClick = useCallback(
		(e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>) => !disabled && onClick(e),
		[disabled, onClick]
	);

	return (
		<StyledIconButton
			onClick={handleClick}
			icon={icon}
			$iconSize={iconSize}
			$paddingSize={paddingSize}
			$borderRadius={borderRadius}
			backgroundColor={backgroundColor}
			labelColor={customIconColor || iconColor}
			size={size}
			disabled={disabled}
			type={type}
			{...rest}
		/>
	);
};

export type { IconButtonProps };
export { IconButton };

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';
import styled from 'styled-components';

import { getKeyboardPreset, useKeyboard } from '../../hooks/useKeyboard';
import { getColor } from '../../theme/theme-utils';
import { Text, TextProps } from './text/Text';

const StyledLink = styled(Text).attrs(() => ({
	forwardedAs: 'a'
}))<{
	$underlined: boolean;
}>`
	cursor: pointer;
	text-decoration: ${({ $underlined }): string => (!$underlined ? 'none' : 'underline')};

	&:hover,
	&:focus {
		color: ${({ color, theme }): string => getColor(`${color}.hover`, theme)};
		outline: none;
		text-decoration: underline;
	}
`;

type LinkProps = {
	/** Whether the link should be underlined */
	underlined?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement> &
	TextProps;

const Link = ({ children, underlined = false, color = 'primary', ...rest }: LinkProps) => {
	const keyPress = useCallback(() => null, []);
	useKeyboard(undefined, getKeyboardPreset('button', keyPress));

	return (
		<StyledLink $underlined={underlined} color={color} tabIndex={0} {...rest}>
			{children}
		</StyledLink>
	);
};

export type { LinkProps };
export { Link };

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HTMLAttributes, useContext } from 'react';
import { ThemeContext } from 'styled-components';

import { getColor } from '../../../theme/theme-utils';
import { AnyColor } from '../../../types/utils';
import styles from './Text.module.css';

type TextOverflow = 'ellipsis' | 'break-word';

type TextProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
	/** Text color */
	color?: AnyColor;
	/** Text size */
	size?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
	/** Text weight */
	weight?: 'light' | 'regular' | 'medium' | 'bold';
	/** Overflow handling */
	overflow?: TextOverflow;
	/** Disabled status */
	disabled?: boolean;
	/** Italic Font style of the text */
	italic?: boolean;
	/** Alignment of the text */
	textAlign?: React.CSSProperties['textAlign'];
	/** Line Height of the text */
	lineHeight?: number;
	/** Ref for the div element */
	ref?: React.Ref<HTMLDivElement>;
};

const Text = ({
	children,
	color = 'text',
	size = 'medium',
	weight = 'regular',
	overflow = 'ellipsis',
	disabled = false,
	italic = false,
	textAlign,
	lineHeight,
	className,
	style,
	ref,
	...rest
}: TextProps) => {
	const theme = useContext(ThemeContext);

	const textColor = getColor(`${color}.${disabled ? 'disabled' : 'regular'}`, theme);
	const fontSize = theme.sizes.font[size];
	const fontWeight = theme.fonts.weight[weight];

	const overflowClass = overflow === 'break-word' ? 'break-word' : 'ellipsis';

	return (
		<div
			ref={ref}
			className={`${styles.text} ${styles[overflowClass]}${className ? ` ${className}` : ''}`}
			style={{
				'--text-color': textColor,
				'--text-font-family': theme.fonts.default,
				'--text-font-size': fontSize,
				'--text-font-weight': fontWeight,
				'--text-font-style': italic ? 'italic' : undefined,
				'--text-align': textAlign,
				'--text-line-height': lineHeight,
				...style,
			} as React.CSSProperties}
			{...rest}
		>
			{children}
		</div>
	);
};

export type { TextProps };
export { Text };

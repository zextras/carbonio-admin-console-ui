/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HTMLAttributes } from 'react';

import { getColor, useTheme } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { Container } from '../layout/Container';

type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
	color: AnyColor;
};

const spinnerStyle = (color: string): React.CSSProperties => ({
	width: '0.75rem',
	height: '0.75rem',
	color,
	border: '0.125rem solid currentColor',
	borderRightColor: 'transparent',
	borderRadius: '50%',
	animation: 'spinner-rotate 0.75s linear infinite'
});

const Spinner = ({ color = 'primary', ...rest }: SpinnerProps) => {
	const theme = useTheme();
	const colorValue = getColor(color, theme);

	return (
		<>
			<style>{`
				@keyframes spinner-rotate {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
			<Container>
				<div data-testid="spinner" style={spinnerStyle(colorValue)} {...rest} />
			</Container>
		</>
	);
};

export { Spinner };

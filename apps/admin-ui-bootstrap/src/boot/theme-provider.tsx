/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	generateColorSet,
	ThemeProvider as UIThemeProvider,
	ThemeProviderProps as UIThemeProviderProps
} from '@zextras/carbonio-design-system';
import { reduce } from 'lodash';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { DefaultTheme } from 'styled-components';

import { ThemeExtension } from '../../types';
import { useUserSettings } from '../react-query/use-account';

type CustomTheme = Partial<Omit<DefaultTheme, 'palette'>> & {
	palette?: Partial<DefaultTheme['palette']>;
};

const paletteExtension =
	(customTheme: CustomTheme = {}) =>
	(theme: DefaultTheme): DefaultTheme => ({
		...theme,
		...customTheme,
		palette: {
			...theme.palette,
			...customTheme.palette,
			shared: {
				regular: '#FFB74D',
				hover: '#FFA21A',
				active: '#FFA21A',
				focus: '#FF9800',
				disabled: '#FFD699'
			},
			linked: {
				regular: '#AB47BC',
				hover: '#8B3899',
				active: '#8B3899',
				focus: '#7A3187',
				disabled: '#DDB4E4'
			}
		}
	});

const iconExtension: ThemeExtension = (theme) => ({
	...theme,
	icons: {
		...theme.icons,
		Shared: theme.icons.ArrowCircleRight,
		Linked: theme.icons.ArrowCircleLeft
	}
});

const themeSizes = (
	size: 'small' | 'normal' | 'large' | 'larger' | 'default' | string
): ThemeExtension => {
	switch (size) {
		case 'small': {
			return (t: any): any => {
				t.sizes.font = {
					extrasmall: '10px',
					small: '12px',
					medium: '14px',
					large: '16px'
				};
				return t;
			};
		}
		case 'large': {
			return (t: any): any => {
				t.sizes.font = {
					extrasmall: '14px',
					small: '16px',
					medium: '18px',
					large: '20px'
				};
				return t;
			};
		}
		case 'larger': {
			return (t: any): any => {
				t.sizes.font = {
					extrasmall: '16px',
					small: '18px',
					medium: '20px',
					large: '22px'
				};
				return t;
			};
		}
		case 'default':
		case 'normal':
		default: {
			return (t: any): any => {
				t.sizes.font = {
					extrasmall: '12px',
					small: '14px',
					medium: '16px',
					large: '18px'
				};
				return t;
			};
		}
	}
};
interface ThemeProviderProps {
	children?: React.ReactNode | React.ReactNode[];
}
export const ThemeProvider = ({ children }: ThemeProviderProps): React.JSX.Element => {
	const settings = useUserSettings();
	const zimbraPrefFontSize = settings?.prefs?.zimbraPrefFontSize as string;
	const [extensions, setExtensions] = useState<Partial<Record<keyof DefaultTheme, ThemeExtension>>>(
		{
			fonts: (theme) => {
				theme.sizes.font = {
					extrasmall: '0.75rem',
					small: '0.875rem',
					medium: '1rem',
					large: '1.125rem'
				};
				return theme;
			}
		}
	);

	useEffect(() => {
		setExtensions((e) => ({
			...e,
			fonts: themeSizes(zimbraPrefFontSize)
		}));
	}, [zimbraPrefFontSize]);

	useLayoutEffect(() => {
		const customThemePalette: Partial<DefaultTheme['palette']> = {
			primary: generateColorSet({ regular: '#2b73d2' })
		};
		setExtensions((extension) => ({
			...extension,
			palette: paletteExtension({
				palette: customThemePalette
			}),
			icons: iconExtension
		}));
	}, []);

	const aggregatedExtensions = useCallback<NonNullable<(typeof UIThemeProviderProps)['extension']>>(
		(theme: any) =>
			reduce(
				extensions,
				(themeAccumulator, themeExtensionFn) => {
					if (themeExtensionFn) {
						return themeExtensionFn(themeAccumulator);
					}
					return themeAccumulator;
				},
				theme
			),
		[extensions]
	);

	return <UIThemeProvider extension={aggregatedExtensions}>{children}</UIThemeProvider>;
};

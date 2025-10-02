/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, useCallback, useEffect, useLayoutEffect, useState } from 'react';

import {
	generateColorSet,
	ThemeProvider as UIThemeProvider,
	ThemeProviderProps as UIThemeProviderProps
} from '@zextras/carbonio-design-system';
import { auto, disable, enable, setFetchMethod } from 'darkreader';
import { reduce } from 'lodash';
import { createGlobalStyle, DefaultTheme } from 'styled-components';

import { useGetPrimaryColor } from './use-get-primary-color';
import { DarkReaderPropValues, ThemeExtension } from '../../types';
import { darkReaderDynamicThemeFixes } from '../constants';
import { useAccountStore } from '../store/account/store';

setFetchMethod(window.fetch);

interface ThemeCallbacks {
	addExtension: (newExtension: ThemeExtension, id: string) => void;
	setDarkReaderState: (newState: DarkReaderPropValues) => void;
}

export const ThemeCallbacksContext = createContext<ThemeCallbacks>({
	addExtension: () => {
		throw Error('Not implemented');
	},
	setDarkReaderState: () => {
		throw Error('not implemented');
	}
});

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

interface GlobalStyledProps {
	baseFontSize: number;
}

const GlobalStyle = createGlobalStyle<GlobalStyledProps>`
  html {
    font-size: ${({ baseFontSize }): string => `${baseFontSize}%`};
  }
`;

const themeSizes = (
	size: 'small' | 'normal' | 'large' | 'larger' | 'default' | string
): ThemeExtension => {
	switch (size) {
		case 'small': {
			return (t: any): any => {
				// eslint-disable-next-line no-param-reassign
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
				// eslint-disable-next-line no-param-reassign
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
				// eslint-disable-next-line no-param-reassign
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
				// eslint-disable-next-line no-param-reassign
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
export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
	const zimbraPrefFontSize = useAccountStore((s) => s.settings.prefs?.zimbraPrefFontSize as string);
	const [extensions, setExtensions] = useState<Partial<Record<keyof DefaultTheme, ThemeExtension>>>(
		{
			fonts: (theme) => {
				// eslint-disable-next-line no-param-reassign
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

	const primaryColor = useGetPrimaryColor();

	useLayoutEffect(() => {
		const customThemePalette: Partial<DefaultTheme['palette']> = primaryColor
			? { primary: generateColorSet({ regular: primaryColor }) }
			: {};
		setExtensions((extension) => ({
			...extension,
			palette: paletteExtension({
				palette: customThemePalette
			}),
			icons: iconExtension
		}));
	}, [primaryColor]);

	const [darkReaderState, setDarkReaderState] = useState<DarkReaderPropValues>('disabled');

	useEffect(() => {
		switch (darkReaderState) {
			case 'disabled':
				auto(false);
				disable();
				break;
			case 'enabled':
				auto(false);
				enable(
					{
						sepia: -50
					},
					darkReaderDynamicThemeFixes
				);
				break;
			case 'auto':
			default:
				auto(
					{
						sepia: -50
					},
					darkReaderDynamicThemeFixes
				);
				break;
		}
	}, [darkReaderState]);

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

	const addExtension = useCallback<ThemeCallbacks['addExtension']>((newExtension, id) => {
		setExtensions((ext) => ({ ...ext, [id]: newExtension }));
	}, []);

	/* In future we need to do admin UI's font support auto scalling feature */
	// const baseFontSize = useMemo<GlobalStyledProps['baseFontSize']>(
	// 	() => getAutoScalingFontSize(),
	// 	[]
	// );

	return (
		<UIThemeProvider extension={aggregatedExtensions}>
			<ThemeCallbacksContext.Provider value={{ addExtension, setDarkReaderState }}>
				{/* Just commented for now in future if apply font size via settings
				<GlobalStyle baseFontSize={baseFontSize} />
				*/}
				{children}
			</ThemeCallbacksContext.Provider>
		</UIThemeProvider>
	);
};

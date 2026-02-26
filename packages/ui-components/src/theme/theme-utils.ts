/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { reduce } from 'lodash-es';
import { darken, lighten, parseToHsl, setLightness, toColorString } from 'polished';
import { HslColor } from 'polished/lib/types/color';
import { useContext } from 'react';
import {
  css,
  DefaultTheme,
  FlattenSimpleInterpolation,
  SimpleInterpolation,
  ThemeContext,
} from 'styled-components';

import type { ThemeColorObj, ThemeSizeObj } from './theme';

type ColorSet = Record<'light' | 'dark', Record<keyof ThemeColorObj, (color: string) => string>>;

function isThemeVariant(
  variant: string,
  theme: DefaultTheme,
  color: string = 'primary',
): variant is keyof ThemeColorObj {
  return variant in theme.palette[color as keyof typeof theme.palette];
}

export function isThemeColor(color: string, theme: DefaultTheme): color is string {
  return color in theme.palette;
}

export function isThemeSize(size: string, sizeObj: ThemeSizeObj): size is keyof ThemeSizeObj {
  return size in sizeObj;
}

const colorsSet: ColorSet = {
  light: {
    regular: (color) => color,
    hover: (color) => darken(0.1, color),
    focus: (color) => darken(0.1, color),
    active: (color) => darken(0.15, color),
    disabled: (color) => setLightness(0.8, color),
  },
  dark: {
    regular: (color) => color,
    hover: (color) => lighten(0.1, color),
    focus: (color) => lighten(0.1, color),
    active: (color) => lighten(0.15, color),
    disabled: (color) => setLightness(0.8, color),
  },
};

const getVariantColor = (color: string, variant: keyof ThemeColorObj, dark = false): string =>
  colorsSet[dark ? 'dark' : 'light'][variant] && colorsSet[dark ? 'dark' : 'light'][variant](color);

const generateColorSet = (
  {
    regular,
    hover,
    active,
    disabled,
    focus,
  }: Pick<ThemeColorObj, 'regular'> & Partial<Omit<ThemeColorObj, 'regular'>>,
  dark = false,
): ThemeColorObj => ({
  regular,
  hover: hover ?? colorsSet[dark ? 'dark' : 'light'].hover(regular),
  focus: focus ?? colorsSet[dark ? 'dark' : 'light'].focus(regular),
  active: active ?? colorsSet[dark ? 'dark' : 'light'].active(regular),
  disabled: disabled ?? colorsSet[dark ? 'dark' : 'light'].disabled(regular),
});

function calcHighlight(fromColor: string): string {
  const fromHsl = parseToHsl(fromColor);
  const highlightRegular: HslColor = {
    hue: Math.round(fromHsl.hue) + 1,
    saturation: (Math.round(fromHsl.saturation * 100) - 1) / 100,
    lightness: Math.min(Math.round(fromHsl.lightness * 100 + 40), 90) / 100,
  };
  return toColorString(highlightRegular);
}
function generateHighlightSet(fromColorSet: Parameters<typeof generateColorSet>[0]): ThemeColorObj {
  const highlightPartialSet = reduce(
    fromColorSet,
    (accumulator, colorValue, colorKey) => {
      if (colorValue) {
        accumulator[colorKey as keyof typeof fromColorSet] = calcHighlight(colorValue);
      }
      return accumulator;
    },
    {} as typeof fromColorSet,
  );

  return generateColorSet(highlightPartialSet);
}

function getColor(color: string, theme: DefaultTheme): string {
  const variants = Object.keys(colorsSet.light);
  const splitRegexp = RegExp(`.(${variants.join('|')})`, 'g');
  const [iColor, iVariant = 'regular'] = color.split(splitRegexp);
  return (
    (isThemeColor(iColor, theme) &&
      isThemeVariant(iVariant, theme, iColor) &&
      theme.palette[iColor as keyof typeof theme.palette][iVariant]) ||
    (isThemeVariant(iVariant, theme) && getVariantColor(iColor, iVariant)) ||
    iColor
  );
}

type PaddingString = `${string | string}`;
type PaddingStringComposition =
  | PaddingString // all
  | `${PaddingString} | ${PaddingString}` // vertical horizontal
  | `${PaddingString} ${PaddingString} ${PaddingString}` // top horizontal bottom
  | `${PaddingString} ${PaddingString} ${PaddingString} ${PaddingString}`; // top right bottom left
/**
 * Given a string for the css padding, where there are both css dimensions and theme tokens,
 * it replaces theme tokens with the theme value
 */
const simpleParsePadding = (size: PaddingStringComposition, theme: DefaultTheme): string => {
  const explodedSizes = size.split(' ');
  explodedSizes.forEach((padding, index) => {
    explodedSizes[index] =
      (isThemeSize(padding, theme.sizes.padding) && theme.sizes.padding[padding]) || padding;
  });
  return explodedSizes.join(' ');
};

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type PaddingObj =
  | {
      value: string | keyof DefaultTheme['sizes']['padding'] | 0;
    }
  | {
      all: string | keyof DefaultTheme['sizes']['padding'] | 0;
    }
  | RequireAtLeastOne<{
      vertical: string | keyof DefaultTheme['sizes']['padding'] | 0;
      horizontal: string | keyof DefaultTheme['sizes']['padding'] | 0;
    }>
  | RequireAtLeastOne<{
      top: string | keyof DefaultTheme['sizes']['padding'] | 0;
      right: string | keyof DefaultTheme['sizes']['padding'] | 0;
      bottom: string | keyof DefaultTheme['sizes']['padding'] | 0;
      left: string | keyof DefaultTheme['sizes']['padding'] | 0;
    }>;

function getPadding(
  padding: PaddingStringComposition | PaddingObj,
): (args: { theme: DefaultTheme }) => string;
function getPadding(padding: PaddingStringComposition | PaddingObj, theme: DefaultTheme): string;
function getPadding(
  padding: PaddingStringComposition | PaddingObj,
  theme?: DefaultTheme,
): string | ((args: { theme: DefaultTheme }) => string);
function getPadding(
  padding: PaddingStringComposition | PaddingObj,
  theme?: DefaultTheme,
): string | ((args: { theme: DefaultTheme }) => string) {
  if (typeof padding === 'string') {
    if (!theme) return ({ theme: iTheme }): string => simpleParsePadding(padding, iTheme);
    return simpleParsePadding(padding, theme);
  }
  if ('value' in padding && padding.value) {
    return getPadding(String(padding.value), theme);
  }
  if ('all' in padding && padding.all) {
    return getPadding(String(padding.all), theme);
  }
  const p = ['0', '0', '0', '0'];
  if ('vertical' in padding && padding.vertical) {
    p[0] = String(padding.vertical);
    p[2] = String(padding.vertical);
  }
  if ('horizontal' in padding && padding.horizontal) {
    p[1] = String(padding.horizontal);
    p[3] = String(padding.horizontal);
  }
  if ('top' in padding && padding.top) {
    p[0] = String(padding.top);
  }
  if ('right' in padding && padding.right) {
    p[1] = String(padding.right);
  }
  if ('bottom' in padding && padding.bottom) {
    p[2] = String(padding.bottom);
  }
  if ('left' in padding && padding.left) {
    p[3] = String(padding.left);
  }
  return getPadding(p.join(' '), theme);
}

function pseudoClasses(
  theme: DefaultTheme,
  color: string,
  cssProperty = 'background',
  options: { transition?: boolean; outline?: boolean } = {},
): FlattenSimpleInterpolation {
  const optionsWithDefault = { transition: true, outline: false, ...options };
  function buildPseudoRule(
    pseudoStatus: 'focus' | 'disabled' | 'active' | 'hover',
  ): SimpleInterpolation {
    return css`
      ${!optionsWithDefault.outline &&
      css`
        outline: none;
      `};
      ${cssProperty}: ${getColor(`${color}.${pseudoStatus}`, theme)};
    `;
  }
  return css`
    ${optionsWithDefault.transition &&
    css`
      transition: ${cssProperty} 0.2s ease-out;
    `};
    ${cssProperty}: ${getColor(color, theme)};
    &:focus {
      ${buildPseudoRule('focus')};
    }
    &:hover {
      ${buildPseudoRule('hover')};
    }
    &:active {
      ${buildPseudoRule('active')};
    }
    &:disabled {
      ${buildPseudoRule('disabled')};
    }
  `;
}

export function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replace(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

const useTheme = (): DefaultTheme => useContext(ThemeContext);

export type { PaddingObj };
export {
  calcHighlight,
  generateColorSet,
  generateHighlightSet,
  getColor,
  getPadding,
  getPadding as parsePadding,
  pseudoClasses,
  useTheme,
};

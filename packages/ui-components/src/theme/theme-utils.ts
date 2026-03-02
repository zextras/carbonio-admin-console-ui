/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultTheme } from 'styled-components';

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

export function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replace(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

type PaddingVarObj =
  | {
      value: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }
  | {
      all: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }
  | RequireAtLeastOne<{
      vertical: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      horizontal: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }>
  | RequireAtLeastOne<{
      top: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      right: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      bottom: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      left: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }>;

const paddingSizeTokens = ['extrasmall', 'small', 'medium', 'large', 'extralarge'] as const;
type PaddingSizeToken = (typeof paddingSizeTokens)[number];

function isPaddingSizeToken(value: string): value is PaddingSizeToken {
  return paddingSizeTokens.includes(value as PaddingSizeToken);
}

function paddingTokenToVar(padding: string): string {
  if (isPaddingSizeToken(padding)) {
    return `var(--padding-size-${padding})`;
  }
  return padding;
}

function simpleParsePaddingVar(size: string): string {
  const explodedSizes = size.split(' ');
  explodedSizes.forEach((padding, index) => {
    explodedSizes[index] = paddingTokenToVar(padding);
  });
  return explodedSizes.join(' ');
}

export function getPaddingVar(padding: string | PaddingVarObj | 0): string | undefined {
  if (padding === 0 || padding === '0') return '0';
  if (typeof padding === 'string') {
    return simpleParsePaddingVar(padding);
  }
  if ('value' in padding && padding.value !== undefined && padding.value !== '') {
    return getPaddingVar(padding.value);
  }
  if ('all' in padding && padding.all !== undefined && padding.all !== '') {
    return getPaddingVar(padding.all);
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
  return p.map((val) => paddingTokenToVar(val)).join(' ');
}

export type { PaddingObj, PaddingVarObj };

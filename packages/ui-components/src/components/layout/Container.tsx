/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React, { CSSProperties, HTMLAttributes, useMemo } from 'react';

import {
  getPaddingVar,
  getThemeColorVar,
  PaddingObj,
  PaddingVarObj,
} from '../../theme/theme-utils';
import { AnyColor, LiteralUnion } from '../../types/utils';
import styles from './Container.module.css';

type ContainerElProps = {
  /** The Container orientation (css flex-direction prop or 'vertical' or 'horizontal') */
  orientation?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Type of the Container's corners */
  borderRadius?: 'regular' | 'round' | 'half' | 'none';
  borderColor?: AnyColor | Partial<Record<'top' | 'right' | 'bottom' | 'left', AnyColor>>;
  /** Container background color */
  background?: AnyColor;
  /** Container height: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  height?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container minHeight: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  minHeight?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container maxHeight: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  maxHeight?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container width: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  width?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container minWidth: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  minWidth?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container maxWidth: <br/>
   *  	`fit`: shorthand for fit-content
   *  	`fill`: semantic alternative for `100%`
   *  	number: measure in px
   *  	string: any measure in CSS syntax
   */
  maxWidth?: LiteralUnion<'fit' | 'fill', string> | number;
  /** Container flex alignment along the main axis */
  mainAlignment?:
    | 'stretch'
    | 'center'
    | 'baseline'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'unset';
  /** Container flex alignment along the cross axis */
  crossAlignment?: 'stretch' | 'center' | 'baseline' | 'flex-start' | 'flex-end' | 'unset';
  /** Whether the Container items should wrap or not */
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | 'unset';
  /** an object specifying the Container padding */
  padding?: PaddingObj | PaddingVarObj | string | 0;
  /** Gap flex css property */
  gap?: string;
  /** Flex grow css property */
  flexGrow?: string | number;
  /** Flex shrink css property */
  flexShrink?: string | number;
  /** Flex basis css property */
  flexBasis?: string;
  /** Margin css property */
  margin?: { left?: string; right?: string };
  ref?: React.Ref<HTMLDivElement>;
};

function resolveDimension(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === 'fill') return '100%';
  if (value === 'fit') return 'fit-content';
  if (typeof value === 'number') return `${value}px`;
  return value;
}

const COLOR_VARIANTS = ['regular', 'hover', 'focus', 'active', 'disabled'] as const;
const COLOR_SPLIT_REGEXP = RegExp(`.(${COLOR_VARIANTS.join('|')})`);

function resolveColorVar(color: string): string {
  const [, variant] = color.split(COLOR_SPLIT_REGEXP);
  const state = variant || 'regular';
  const baseColor = color.replace(COLOR_SPLIT_REGEXP, '');
  return getThemeColorVar(baseColor, state);
}

type ContainerProps = Omit<ContainerElProps, 'orientation'> &
  Omit<HTMLAttributes<HTMLDivElement>, keyof ContainerElProps> & {
    orientation?: 'vertical' | 'horizontal' | ContainerElProps['orientation'];
    children?: React.ReactNode | React.ReactNode[];
  };

const Container = ({
  orientation = 'vertical',
  borderRadius = 'regular',
  borderColor,
  background,
  height = 'fill',
  minHeight = 'unset',
  maxHeight = 'unset',
  width = 'fill',
  minWidth = 'unset',
  maxWidth = 'unset',
  mainAlignment = 'center',
  crossAlignment = 'center',
  wrap = 'nowrap',
  padding,
  gap,
  flexGrow,
  flexShrink,
  flexBasis,
  margin,
  children,
  ref,
  style,
  className,
  ...rest
}: ContainerProps) => {
  const direction = useMemo<ContainerElProps['orientation']>(
    () =>
      orientation
        .replace('horizontal', 'row')
        .replace('vertical', 'column') as ContainerElProps['orientation'],
    [orientation],
  );

  const containerStyle = useMemo<CSSProperties>(() => {
    const styleObj: Record<string, string | number | undefined> = {};

    styleObj.flexDirection = direction;
    styleObj.alignItems = crossAlignment;
    styleObj.justifyContent = mainAlignment;
    styleObj.flexWrap = wrap;
    if (flexGrow !== undefined) {
      styleObj.flexGrow = flexGrow;
    }
    if (flexShrink !== undefined) {
      styleObj.flexShrink = flexShrink;
    }
    if (flexBasis !== undefined) {
      styleObj.flexBasis = flexBasis;
    }
    if (width !== 'fill') {
      styleObj.width = resolveDimension(width);
    }
    if (minWidth !== 'unset') {
      styleObj.minWidth = resolveDimension(minWidth);
    }

    if (maxWidth !== 'unset') {
      styleObj.maxWidth = resolveDimension(maxWidth);
    }

    if (height !== 'fill') {
      styleObj.height = resolveDimension(height);
    }

    if (minHeight !== 'unset') {
      styleObj.minHeight = resolveDimension(minHeight);
    }

    if (maxHeight !== 'unset') {
      styleObj.maxHeight = resolveDimension(maxHeight);
    }

    if (gap !== undefined) {
      styleObj.gap = gap;
    }

    if (borderRadius === 'round') {
      styleObj.borderRadius = '50%';
    } else if (borderRadius === 'half') {
      styleObj.borderRadius = 'var(--border-radius) var(--border-radius) 0 0';
    } else if (borderRadius === 'none') {
      styleObj.borderRadius = '0';
    }

    if (padding !== undefined) {
      styleObj.padding = getPaddingVar(padding);
    }

    if (background) {
      styleObj.background = resolveColorVar(background);
    }

    if (margin?.left !== undefined) {
      styleObj.marginLeft = margin.left;
    }

    if (margin?.right !== undefined) {
      styleObj.marginRight = margin.right;
    }

    if (borderColor) {
      if (typeof borderColor === 'string') {
        styleObj.border = `0.0625rem solid ${resolveColorVar(borderColor)}`;
      } else {
        if (borderColor.top)
          styleObj.borderTop = `0.0625rem solid ${resolveColorVar(borderColor.top)}`;
        if (borderColor.right)
          styleObj.borderRight = `0.0625rem solid ${resolveColorVar(borderColor.right)}`;
        if (borderColor.bottom)
          styleObj.borderBottom = `0.0625rem solid ${resolveColorVar(borderColor.bottom)}`;
        if (borderColor.left)
          styleObj.borderLeft = `0.0625rem solid ${resolveColorVar(borderColor.left)}`;
      }
    }

    return { ...styleObj, ...style } as CSSProperties;
  }, [
    direction,
    crossAlignment,
    mainAlignment,
    wrap,
    flexGrow,
    flexShrink,
    flexBasis,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    padding,
    gap,
    borderRadius,
    background,
    margin,
    borderColor,
    style,
  ]);

  return (
    <div ref={ref} className={clsx(styles.container, className)} style={containerStyle} {...rest}>
      {children}
    </div>
  );
};

export { Container };
export type { ContainerProps };

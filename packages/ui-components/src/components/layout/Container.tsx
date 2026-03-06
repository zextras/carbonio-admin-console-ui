/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React, { CSSProperties, HTMLAttributes, useMemo } from 'react';

import { getPaddingVar, PaddingVarObj, resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor, LiteralUnion } from '../../types/utils';
import styles from './Container.module.css';

type Dimension = LiteralUnion<'fit' | 'fill', string> | number;
type BorderSides = 'top' | 'right' | 'bottom' | 'left';

type ContainerElProps = {
  orientation?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  borderRadius?: 'regular' | 'round' | 'half' | 'none';
  borderColor?: AnyColor | Partial<Record<BorderSides, AnyColor>>;
  background?: AnyColor;
  height?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
  width?: Dimension;
  minWidth?: Dimension;
  maxWidth?: Dimension;
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
  crossAlignment?: 'stretch' | 'center' | 'baseline' | 'flex-start' | 'flex-end' | 'unset';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | 'unset';
  padding?: PaddingVarObj | string | 0;
  gap?: string;
  flexGrow?: string | number;
  flexShrink?: string | number;
  flexBasis?: string;
  margin?: { left?: string; right?: string };
  ref?: React.Ref<HTMLDivElement>;
};

export type ContainerProps = Omit<ContainerElProps, 'orientation'> &
  Omit<HTMLAttributes<HTMLDivElement>, keyof ContainerElProps> & {
    orientation?: 'vertical' | 'horizontal' | ContainerElProps['orientation'];
    children?: React.ReactNode | React.ReactNode[];
  };

const COLOR_VARIANTS = ['regular', 'hover', 'focus', 'active', 'disabled'] as const;
const COLOR_SPLIT_REGEXP = new RegExp(`.(${COLOR_VARIANTS.join('|')})`);

function resolveDimension(value: Dimension | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === 'fill') return '100%';
  if (value === 'fit') return 'fit-content';
  if (typeof value === 'number') return `${value}px`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return undefined;
  return value;
}

function resolveColorVar(color: string): string {
  const [, variant] = color.split(COLOR_SPLIT_REGEXP);
  return resolveThemeColor(color.replace(COLOR_SPLIT_REGEXP, ''), variant ?? 'regular');
}

const BORDER = (color: string) => `0.0625rem solid ${resolveColorVar(color)}`;

const BORDER_RADIUS: Record<string, string> = {
  round: '50%',
  half: 'var(--border-radius) var(--border-radius) 0 0',
  none: '0',
};

function resolveOrientation(o: string): ContainerElProps['orientation'] {
  return o
    .replace('horizontal', 'row')
    .replace('vertical', 'column') as ContainerElProps['orientation'];
}

export const Container = ({
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
  const containerStyle = useMemo<CSSProperties>(() => {
    const inlineStile: Record<string, string | number | undefined> = {
      flexDirection: resolveOrientation(orientation),
      alignItems: crossAlignment,
      justifyContent: mainAlignment,
      flexWrap: wrap,
      flexGrow,
      flexShrink,
      flexBasis,
      gap,
      padding: padding !== undefined ? getPaddingVar(padding) : undefined,
      background: background ? resolveColorVar(background) : undefined,
      marginLeft: margin?.left,
      marginRight: margin?.right,
      width: resolveDimension(width),
      minWidth: minWidth !== 'unset' ? resolveDimension(minWidth) : undefined,
      maxWidth: maxWidth !== 'unset' ? resolveDimension(maxWidth) : undefined,
      height: resolveDimension(height),
      minHeight: minHeight !== 'unset' ? resolveDimension(minHeight) : undefined,
      maxHeight: maxHeight !== 'unset' ? resolveDimension(maxHeight) : undefined,
      borderRadius: BORDER_RADIUS[borderRadius],
    };

    if (borderColor) {
      if (typeof borderColor === 'string') {
        inlineStile.border = BORDER(borderColor);
      } else {
        const sides: BorderSides[] = ['top', 'right', 'bottom', 'left'];
        for (const side of sides) {
          const c = borderColor[side];
          if (c) inlineStile[`border${side.charAt(0).toUpperCase()}${side.slice(1)}`] = BORDER(c);
        }
      }
    }

    return { ...inlineStile, ...style } as CSSProperties;
  }, [
    orientation,
    crossAlignment,
    mainAlignment,
    wrap,
    flexGrow,
    flexShrink,
    flexBasis,
    gap,
    padding,
    background,
    margin,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    borderRadius,
    borderColor,
    style,
  ]);

  return (
    <div ref={ref} className={clsx(styles.container, className)} style={containerStyle} {...rest}>
      {children}
    </div>
  );
};

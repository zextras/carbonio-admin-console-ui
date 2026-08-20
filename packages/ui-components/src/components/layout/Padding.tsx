/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { omit } from 'lodash-es';
import React, { HTMLAttributes } from 'react';

import { PaddingVarObj } from '../../theme/theme-utils';
import { AllKeys } from '../../types/utils';
import styles from './Padding.module.css';

type PaddingComponentProps = {
  width?: string;
  height?: string;
  children?: React.ReactNode | React.ReactNode[];
  ref?: React.Ref<HTMLDivElement>;
} & PaddingVarObj;

type PaddingProps = PaddingComponentProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof PaddingComponentProps>;

const PADDING_CSS_VARS: Record<string, string> = {
  extrasmall: 'var(--padding-size-extrasmall)',
  small: 'var(--padding-size-small)',
  medium: 'var(--padding-size-medium)',
  large: 'var(--padding-size-large)',
  extralarge: 'var(--padding-size-extralarge)',
};

function parsePaddingToken(token: string): string {
  return PADDING_CSS_VARS[token] ?? token;
}

function getPaddingCssVars(padding: string): string {
  return padding.split(' ').map(parsePaddingToken).join(' ');
}

function resolvePaddingObj(props: PaddingVarObj): string {
  if ('value' in props && props.value !== undefined) {
    return getPaddingCssVars(String(props.value));
  }
  if ('all' in props && props.all !== undefined) {
    return getPaddingCssVars(String(props.all));
  }

  const p = ['0', '0', '0', '0'];

  if ('vertical' in props && props.vertical) {
    const v = parsePaddingToken(String(props.vertical));
    p[0] = v;
    p[2] = v;
  }
  if ('horizontal' in props && props.horizontal) {
    const h = parsePaddingToken(String(props.horizontal));
    p[1] = h;
    p[3] = h;
  }
  if ('top' in props && props.top) {
    p[0] = parsePaddingToken(String(props.top));
  }
  if ('right' in props && props.right) {
    p[1] = parsePaddingToken(String(props.right));
  }
  if ('bottom' in props && props.bottom) {
    p[2] = parsePaddingToken(String(props.bottom));
  }
  if ('left' in props && props.left) {
    p[3] = parsePaddingToken(String(props.left));
  }

  return p.join(' ');
}

const paddingObjKeys = Object.keys({
  value: undefined,
  all: undefined,
  bottom: undefined,
  left: undefined,
  top: undefined,
  right: undefined,
  horizontal: undefined,
  vertical: undefined,
} satisfies Record<AllKeys<PaddingVarObj>, undefined>);

const Padding = ({
  children,
  width = 'fit-content',
  height = 'fit-content',
  ref,
  ...props
}: PaddingProps) => {
  const rest = omit(props, paddingObjKeys);
  const paddingValue = resolvePaddingObj(props as PaddingVarObj);

  return (
    <div
      ref={ref}
      className={styles.padding}
      style={
        {
          '--padding-height': height,
          '--padding-width': width,
          '--padding-value': paddingValue,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};

export { Padding };
export type { PaddingProps };

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HTMLAttributes } from 'react';

import { AnyColor } from '../../../types/utils';

type TextOverflow = 'ellipsis' | 'break-word';

export type TextProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  color?: AnyColor;
  size?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  overflow?: TextOverflow;
  disabled?: boolean;
  italic?: boolean;
  textAlign?: React.CSSProperties['textAlign'];
  lineHeight?: number;
  ref?: React.Ref<HTMLDivElement>;
};

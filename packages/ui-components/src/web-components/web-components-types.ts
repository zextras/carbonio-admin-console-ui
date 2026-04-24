/* eslint-disable @typescript-eslint/no-namespace */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { DetailedHTMLProps, HTMLAttributes, RefAttributes } from 'react';

import type { DsBadgeProps } from './ds-badge';
import type { DsDividerProps } from './ds-divider';
import type { DsIconProps } from './ds-icon';
import type { DsSpinnerProps } from './ds-spinner';
import { DsTagIconProps } from './ds-tag-icon';
import type { DsTextProps } from './ds-text';

type WebComponentElement<P extends Record<string, unknown>> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & P,
  HTMLElement
> &
  RefAttributes<HTMLElement>;

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'ds-spinner': WebComponentElement<DsSpinnerProps>;
        'ds-divider': WebComponentElement<DsDividerProps>;
        'ds-icon': WebComponentElement<DsIconProps>;
        'ds-badge': WebComponentElement<DsBadgeProps>;
        'ds-tag-icon': WebComponentElement<DsTagIconProps>;
        'ds-text': WebComponentElement<DsTextProps>;
      }
    }
  }
}

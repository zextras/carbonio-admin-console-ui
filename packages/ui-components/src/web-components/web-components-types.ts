/* eslint-disable @typescript-eslint/no-namespace */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TextOverflow, TextSize, TextTag, TextWeight } from './ds-text';
import type { IconName } from './icon-registry';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'ds-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'ds-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'ds-icon': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            icon?: IconName;
            color?: string;
            size?: string;
            disabled?: boolean;
            clickHandler?: (e: Event) => void;
          },
          HTMLElement
        >;
        'ds-badge': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            color?: string;
          },
          HTMLElement
        >;
        'ds-text': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            color?: string;
            size?: TextSize;
            weight?: TextWeight;
            overflow?: TextOverflow;
            disabled?: boolean;
            as?: TextTag;
          },
          HTMLElement
        >;
      }
    }
  }
}

/* eslint-disable @typescript-eslint/no-namespace */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { IconName } from './icon-registry';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'spinner-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'divider-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'icon-wc': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            icon?: IconName;
            color?: string;
            size?: string;
            disabled?: boolean;
            clickHandler?: (e: Event) => void;
          },
          HTMLElement
        >;
      }
    }
  }
}

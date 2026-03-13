/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import React from 'react';

import { IconName, IconSize } from './icon-registry';

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
            size?: IconSize;
            disabled?: boolean;
            clickHandler?: (e: Event) => void;
          },
          HTMLElement
        >;
      }
    }
  }
}

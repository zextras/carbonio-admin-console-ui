/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line unused-imports/no-unused-imports, simple-import-sort/imports
import React from 'react';

import '@zextras/ui-components';

declare module '*.jsx';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  const BASE_PATH: string;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'ds-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
}

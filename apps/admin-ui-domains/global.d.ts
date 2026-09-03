/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/// <reference types="vite/client" />

// eslint-disable-next-line unused-imports/no-unused-imports, simple-import-sort/imports
import React from 'react';

import '@zextras/ui-components';

declare module '*.jsx';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare global {
  const BASE_PATH: string;
}

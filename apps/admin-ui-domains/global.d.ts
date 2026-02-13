/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/// <reference types="vite/client" />

import '@zextras/ui-components';

declare module '*.jsx';

declare module '*.svg' {
  const content: string;
  export default content;
}

declare global {
  const BASE_PATH: string;
}

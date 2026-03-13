/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@zextras/ui-components';

declare module '*.jsx';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  const BASE_PATH: string;
}

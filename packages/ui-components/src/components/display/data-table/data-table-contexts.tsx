/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createTableHookContexts } from '@tanstack/react-table';

import type { dataTableFeatures } from './features';

const dataTableContexts = createTableHookContexts<typeof dataTableFeatures>();

const useDataTableContext = dataTableContexts.useTableContext;

export { dataTableContexts, useDataTableContext };

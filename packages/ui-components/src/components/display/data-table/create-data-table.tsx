/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createTableHook } from '@tanstack/react-table';

import { dataTableContexts } from './data-table-contexts';
import { dataTableFeatures } from './features';

const { useAppTable, createAppColumnHelper } = createTableHook({
	features: dataTableFeatures,
	tableContext: dataTableContexts.tableContext,
	cellContext: dataTableContexts.cellContext,
	headerContext: dataTableContexts.headerContext,
});

const useDataTable = useAppTable;

const createDataTableColumnHelper = createAppColumnHelper;

export { createDataTableColumnHelper, useDataTable };

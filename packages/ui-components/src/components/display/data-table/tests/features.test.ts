/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { dataTableFeatures } from '../features';

describe('dataTableFeatures', () => {
	it('registers all stock feature flags', () => {
		expect(dataTableFeatures.rowSortingFeature).toBeDefined();
		expect(dataTableFeatures.rowSelectionFeature).toBeDefined();
		expect(dataTableFeatures.rowPaginationFeature).toBeDefined();
		expect(dataTableFeatures.rowExpandingFeature).toBeDefined();
		expect(dataTableFeatures.rowPinningFeature).toBeDefined();
		expect(dataTableFeatures.rowAggregationFeature).toBeDefined();
		expect(dataTableFeatures.columnFilteringFeature).toBeDefined();
		expect(dataTableFeatures.columnGroupingFeature).toBeDefined();
		expect(dataTableFeatures.columnOrderingFeature).toBeDefined();
		expect(dataTableFeatures.columnPinningFeature).toBeDefined();
		expect(dataTableFeatures.columnResizingFeature).toBeDefined();
		expect(dataTableFeatures.columnSizingFeature).toBeDefined();
		expect(dataTableFeatures.columnVisibilityFeature).toBeDefined();
		expect(dataTableFeatures.columnFacetingFeature).toBeDefined();
		expect(dataTableFeatures.globalFilteringFeature).toBeDefined();
		expect(dataTableFeatures.cellSelectionFeature).toBeDefined();
		expect(dataTableFeatures.cellSpanningFeature).toBeDefined();
	});

	it('registers all row models and fn registries', () => {
		expect(dataTableFeatures.coreRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.sortedRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.filteredRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.paginatedRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.groupedRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.expandedRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.facetedRowModel).toBeTypeOf('function');
		expect(dataTableFeatures.sortFns).toBeTypeOf('object');
		expect(dataTableFeatures.filterFns).toBeTypeOf('object');
		expect(dataTableFeatures.aggregationFns).toBeTypeOf('object');
	});
});

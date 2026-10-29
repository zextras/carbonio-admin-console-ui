/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CSSProperties } from 'react';

import type { DataTableColumnMeta } from './models/types';

/**
 * Fixed width for the leading selection column and trailing actions
 * column. Shared by CSS, colgroup, and the pinned primary offset so
 * chrome columns stay stable when Customize toggles data columns.
 */
export const CHROME_COLUMN_WIDTH = '2rem';

/**
 * Left offset of the pinned primary column when the leading selection
 * column is present (selection column width). Shared by the header, body
 * and skeleton states so the pinned stack stays aligned.
 */
export const PRIMARY_COLUMN_OFFSET = CHROME_COLUMN_WIDTH;

export function resolvePinnedLeftOffset(options: {
  isPrimary: boolean;
  enableRowSelection: boolean;
  pinnedStart: boolean;
}): string | number | undefined {
  if (options.isPrimary && options.enableRowSelection) {
    return PRIMARY_COLUMN_OFFSET;
  }
  if (options.pinnedStart) {
    return 0;
  }
  return undefined;
}

/** Width / min / max styles from column meta (`fixed` locks all three to `width`). */
export function resolveColumnWidthStyle(
  meta: DataTableColumnMeta | undefined,
): Pick<CSSProperties, 'width' | 'minWidth' | 'maxWidth'> {
  if (!meta?.width) {
    return { width: undefined, maxWidth: meta?.maxWidth };
  }
  if (meta.fixed) {
    return {
      width: meta.width,
      minWidth: meta.width,
      maxWidth: meta.maxWidth ?? meta.width,
    };
  }
  return {
    width: meta.width,
    maxWidth: meta.maxWidth ?? meta.width,
  };
}

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';
import { useTableUi } from './table-ui-store';

/**
 * Visually hidden polite live region announcing table events (copy, undo,
 * selection changes) to assistive technology.
 */
export const DataTableLiveRegion = () => {
  const message = useTableUi((s) => s.liveMessage);
  return (
    <div className={styles.liveRegion} aria-live="polite">
      {message}
    </div>
  );
};

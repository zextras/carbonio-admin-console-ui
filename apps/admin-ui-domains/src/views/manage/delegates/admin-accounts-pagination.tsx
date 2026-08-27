/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Paging, TrackNumberPerPage } from '@zextras/ui-components';

import styles from './delegates.module.css';

type AdminAccountsPaginationProps = {
  total: number;
  pageSize: number;
  setOffset: (offset: number) => void;
  setPageSize: (pageSize: number) => void;
};

/**
 * Sticky pagination bar for the admin accounts table. The ResizeObserver keeps
 * the bar (and its scroll-to-top affordance) glued to the viewport bottom only
 * when the table is taller than the viewport.
 */
export const AdminAccountsPagination = ({
  total,
  pageSize,
  setOffset,
  setPageSize,
}: AdminAccountsPaginationProps) => {
  return (
    <div className={styles.pagingSticky} style={{ bottom: '-4rem' }}>
      <div className={styles.pagingBar}>
        <div className={styles.pagingSide}>
          <Paging totalItem={total} setOffset={setOffset} pageSize={pageSize} />
        </div>
        <div className={styles.pagingTrack}>
          <TrackNumberPerPage setPageSize={setPageSize} />
        </div>
      </div>
    </div>
  );
};

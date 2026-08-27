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

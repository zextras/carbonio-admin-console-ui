/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Paging, TrackNumberPerPage } from '@zextras/ui-components';
import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import ScrollContainer from '../../components/scrollComponent';
import styles from './delegates.module.css';

type AdminAccountsPaginationProps = {
  total: number;
  pageSize: number;
  setOffset: (offset: number) => void;
  setPageSize: (pageSize: number) => void;
  tableRef: RefObject<HTMLTableElement | null>;
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
  tableRef,
}: AdminAccountsPaginationProps) => {
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 450;
        const viewportHeight = globalThis.innerHeight;
        setIsTableTooTall(tableHeight > viewportHeight);
      }
    }, 100);

    if (table && !resizeObserverRef.current) {
      const observer = new ResizeObserver(handleResize);
      resizeObserverRef.current = observer;
      observer.observe(table);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [tableRef]);

  return (
    <div
      className={styles.pagingSticky}
      style={{ bottom: isTableTooTall ? '0' : '-4rem' }}
    >
      <ScrollContainer isVisible={isTableTooTall} />
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

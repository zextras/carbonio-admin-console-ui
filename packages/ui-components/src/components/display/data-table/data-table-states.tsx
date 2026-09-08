/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';

type EmptyStateProps = {
  colSpan: number;
  title: string;
  description: string;
};

export const DataTableEmptyState = ({ colSpan, title, description }: EmptyStateProps) => (
  <tr>
    <td colSpan={colSpan} className={styles.stateCell}>
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
    </td>
  </tr>
);

type ErrorStateProps = {
  colSpan: number;
  title: string;
  description: string;
  retryLabel: string;
  onRetry?: () => void;
};

export const DataTableErrorState = ({
  colSpan,
  title,
  description,
  retryLabel,
  onRetry,
}: ErrorStateProps) => (
  <tr>
    <td colSpan={colSpan} className={styles.stateCell}>
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </td>
  </tr>
);

type SkeletonRowsProps = {
  rowCount: number;
  columnCount: number;
  showSelection: boolean;
};

export const DataTableSkeletonRows = ({
  rowCount,
  columnCount,
  showSelection,
}: SkeletonRowsProps) => (
  <>
    {Array.from({ length: rowCount }, (_, rowIndex) => (
      <tr key={`skel-${rowIndex}`} aria-hidden="true">
        {showSelection && (
          <td className={`${styles.td} ${styles.tdSelect} ${styles.pinnedLeft}`}>
            <div className={styles.skeletonBox} />
          </td>
        )}
        {Array.from({ length: columnCount }, (__, colIndex) => (
          <td
            key={`skel-${rowIndex}-${colIndex}`}
            className={`${styles.td}${colIndex === 0 ? ` ${styles.pinnedLeft}` : ''}`}
            style={colIndex === 0 && showSelection ? { left: '3.25rem' } : undefined}
          >
            <div
              className={styles.skeleton}
              style={{ width: `${55 + ((rowIndex * (colIndex + 1) * 17) % 35)}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

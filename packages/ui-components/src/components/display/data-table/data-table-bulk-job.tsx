/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';
import type { DataTableBulkJobState } from './types';

type DataTableBulkJobProps = {
  job: NonNullable<DataTableBulkJobState>;
  cancelLabel: string;
  retryFailedLabel: string;
  dismissLabel: string;
  onCancel: () => void;
  onRetryFailed: () => void;
  onDismiss: () => void;
};

export const DataTableBulkJob = ({
  job,
  cancelLabel,
  retryFailedLabel,
  dismissLabel,
  onCancel,
  onRetryFailed,
  onDismiss,
}: DataTableBulkJobProps) => {
  if (!job.result) {
    const percent = job.total === 0 ? 0 : Math.min(100, (job.done / job.total) * 100);
    return (
      <div className={styles.bulkJob}>
        <div className={styles.bulkJobProgress}>
          <div className={styles.bulkJobMeta}>
            <span className={styles.bulkJobLabel}>{job.label}…</span>
            <span className={styles.bulkJobCount}>
              {job.done.toLocaleString('en')} / {job.total.toLocaleString('en')}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={job.label}
            aria-valuemin={0}
            aria-valuemax={job.total}
            aria-valuenow={job.done}
            className={styles.bulkJobTrack}
          >
            <div className={styles.bulkJobFill} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <button type="button" className={styles.bulkJobCancel} onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bulkJob}>
      <div role="status" className={styles.bulkJobResult}>
        <span>
          ✓ {job.result.ok.toLocaleString('en')} succeeded · {job.result.failed} failed
        </span>
        {job.result.failed > 0 && (
          <button type="button" className={styles.bulkJobRetry} onClick={onRetryFailed}>
            {retryFailedLabel}
          </button>
        )}
        <span className={styles.bulkJobResultSpacer} />
        <button type="button" className={styles.bulkJobDismiss} onClick={onDismiss}>
          {dismissLabel}
        </button>
      </div>
    </div>
  );
};

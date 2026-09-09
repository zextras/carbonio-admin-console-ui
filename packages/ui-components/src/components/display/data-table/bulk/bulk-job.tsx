/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { useDataTableContext } from '../data-table-contexts';
import type { DataTableBulkJobState } from '../models/types';
import { useTableUi } from '../table-ui-store';

export type DataTableBulkJobProps = {
  job: NonNullable<DataTableBulkJobState>;
  onCancel: () => void;
  onRetryFailed: () => void;
  onDismiss: () => void;
  cancelLabel?: string;
  retryFailedLabel?: string;
  dismissLabel?: string;
};

/**
 * Bulk job chrome: progress bar while running, ok/failed result line
 * afterwards with retry-failed and dismiss affordances. The job state is
 * consumer-owned (passed as a prop); the legacy orchestrator wiring is
 * carried inside — cancelling announces on the live region and dismissing
 * clears the row selection — so views only forward their own callbacks.
 */
export const DataTableBulkJob = ({
  job,
  onCancel,
  onRetryFailed,
  onDismiss,
  cancelLabel,
  retryFailedLabel,
  dismissLabel,
}: DataTableBulkJobProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const table = useDataTableContext();
  const announce = useTableUi((s) => s.announce);
  const setSelectAllMatching = useTableUi((s) => s.setSelectAllMatching);

  function handleCancel(): void {
    onCancel();
    announce(t('data_table.job_cancelled', 'Job cancelled — completed items are not rolled back'));
  }

  function handleDismiss(): void {
    onDismiss();
    table.resetRowSelection();
    setSelectAllMatching(false);
  }

  if (!job.result) {
    const percent = job.total === 0 ? 0 : Math.min(100, (job.done / job.total) * 100);
    return (
      <div className={styles.bulkJob}>
        <div className={styles.bulkJobProgress}>
          <div className={styles.bulkJobMeta}>
            <span className={styles.bulkJobLabel}>{job.label}…</span>
            <span className={styles.bulkJobCount}>
              {job.done.toLocaleString(locale)} / {job.total.toLocaleString(locale)}
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
        <button type="button" className={styles.bulkJobCancel} onClick={handleCancel}>
          {cancelLabel ?? t('data_table.job_cancel', 'Cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bulkJob}>
      <div role="status" className={styles.bulkJobResult}>
        <span>
          {t('data_table.job_result', '✓ {{ok}} succeeded · {{failed}} failed', {
            ok: job.result.ok.toLocaleString(locale),
            failed: job.result.failed.toLocaleString(locale),
          })}
        </span>
        {job.result.failed > 0 && (
          <button type="button" className={styles.bulkJobRetry} onClick={onRetryFailed}>
            {retryFailedLabel ?? t('data_table.job_retry_failed', 'Retry failed')}
          </button>
        )}
        <span className={styles.bulkJobResultSpacer} />
        <button type="button" className={styles.bulkJobDismiss} onClick={handleDismiss}>
          {dismissLabel ?? t('data_table.job_dismiss', 'Dismiss')}
        </button>
      </div>
    </div>
  );
};

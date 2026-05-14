/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VERIFY_PROGRESS_COMPLETE_DELAY_MS, VERIFY_PROGRESS_MIN_DISPLAY_MS } from '../../../../constants';
import styles from './verify-progress.module.css';

type VerifyProgressProps = {
  isPending: boolean;
  onComplete?: () => void;
};

export const VerifyProgress = ({
  isPending,
  onComplete,
}: VerifyProgressProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isPending && intervalRef.current === null) {
      setProgress(0);
      popoverRef.current?.showPopover();
      openedAtRef.current = Date.now();
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += 1;
        setProgress(current);
        if (current >= 90 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 90);
    } else if (!isPending && openedAtRef.current > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const elapsed = Date.now() - openedAtRef.current;
      const remaining = Math.max(0, VERIFY_PROGRESS_MIN_DISPLAY_MS - elapsed);
      timeoutRef.current = setTimeout(() => {
        setProgress(100);
        timeoutRef.current = setTimeout(() => {
          popoverRef.current?.hidePopover();
          setProgress(0);
          openedAtRef.current = 0;
          onCompleteRef.current?.();
        }, VERIFY_PROGRESS_COMPLETE_DELAY_MS);
      }, remaining);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPending]);


  const checkItems = [
    t('storages.s3Connectors.verifyProgress.connectionOk', 'Connection'),
    t('storages.s3Connectors.verifyProgress.secureHttpsOk', 'Secure HTTPS'),
    t('storages.s3Connectors.verifyProgress.bucketExists', 'Bucket Exists'),
    t('storages.s3Connectors.verifyProgress.createDirectoryOk', 'Create Directory'),
    t('storages.s3Connectors.verifyProgress.uploadFileOk', 'Upload File'),
    t('storages.s3Connectors.verifyProgress.uploadBigFileOk', 'Upload Big File'),
    t('storages.s3Connectors.verifyProgress.downloadFileOk', 'Download File'),
    t('storages.s3Connectors.verifyProgress.listObjectsOk', 'List Objects'),
    t('storages.s3Connectors.verifyProgress.copyFileOk', 'Copy File'),
    t('storages.s3Connectors.verifyProgress.deleteFileOk', 'Delete File'),
    t('storages.s3Connectors.verifyProgress.deleteDirectoryOk', 'Delete Directory'),
  ];

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <div className={styles.spinnerCircle}>
          <div className={styles.spinner} />
        </div>
      </div>
      <ds-text as="h2" weight="bold" size="large">
        {t('storages.s3Connectors.verifyProgress.verifyingConnectors', 'Verifying connectors')}
      </ds-text>
      <div className={styles.description}>
        <ds-text as="p" color="gray0" weight="light">
          {t(
            'storages.s3Connectors.verifyProgress.description',
            'Please wait while we verify and set up the connectors',
          )}
        </ds-text>
      </div>
      <ul className={styles.stepList}>
        {checkItems.map((item) => (
          <li key={item} className={styles.stepItem}>
            <div className={styles.stepSpinner} />
            <ds-text as="span">{item}</ds-text>
          </li>
        ))}
      </ul>
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

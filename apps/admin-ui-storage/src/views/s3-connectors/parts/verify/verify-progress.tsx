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

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [prevIsPending, setPrevIsPending] = useState(isPending);
  if (isPending !== prevIsPending) {
    setPrevIsPending(isPending);
    if (isPending) {
      setProgress(0);
    }
  }

  useEffect(() => {
    if (isPending && intervalRef.current === null) {
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
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

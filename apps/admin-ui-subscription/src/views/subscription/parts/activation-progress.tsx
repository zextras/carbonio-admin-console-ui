/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text } from '@zextras/ui-components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-progress.module.css';

const MIN_DISPLAY_MS = 5000;
const COMPLETE_DELAY_MS = 600;

type ActivationProgressProps = {
  isPending: boolean;
  onComplete?: () => void;
};

export const ActivationProgress = ({
  isPending,
  onComplete,
}: ActivationProgressProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIsPending = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isPending && !prevIsPending.current) {
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
    } else if (!isPending && prevIsPending.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const elapsed = Date.now() - openedAtRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      timeoutRef.current = setTimeout(() => {
        setProgress(100);
        timeoutRef.current = setTimeout(() => {
          popoverRef.current?.hidePopover();
          setProgress(0);
          onCompleteRef.current?.();
        }, COMPLETE_DELAY_MS);
      }, remaining);
    }
    prevIsPending.current = isPending;

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
      <div className={styles.spinnerContainer}>
        <div className={styles.spinnerCircle}>
          <div className={styles.spinner} />
        </div>
      </div>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_progress.title', 'Activating subscription')}
      </Text>
      <div className={styles.description}>
        <Text color="gray0" weight="light" lineHeight={1.5}>
          {t(
            'subscription.activate.activation_progress.description',
            'Please wait while we verify and set up your workspace',
          )}
        </Text>
      </div>
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text } from '@zextras/ui-components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-progress.module.css';

type ActivationProgressProps = {
  isPending: boolean;
};

export const ActivationProgress = ({ isPending }: ActivationProgressProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPending) {
      setProgress(0);
      popoverRef.current?.showPopover();
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearProgressInterval();
            return prev;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 300);
    } else {
      clearProgressInterval();
      setProgress(100);
      const timeout = setTimeout(() => {
        popoverRef.current?.hidePopover();
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
    return clearProgressInterval;
  }, [clearProgressInterval, isPending]);

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_progress.title', ' Activating subscription')}
      </Text>
      <div className={styles.description}>
        <Text color="gray0">
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

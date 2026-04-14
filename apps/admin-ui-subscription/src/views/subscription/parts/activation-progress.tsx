/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text } from '@zextras/ui-components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-progress.module.css';

type ActivationProgressProps = {
  isPending: boolean;
};

export const ActivationProgress = ({ isPending }: ActivationProgressProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending) return;
    popoverRef.current?.showPopover();
    setProgress(0);

    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current >= 90) clearInterval(id);
    }, 90);

    return () => clearInterval(id);
  }, [isPending]);

  useEffect(() => {
    if (isPending) return;

    setProgress(100);
    const id = setTimeout(() => {
      popoverRef.current?.hidePopover();
      setProgress(0);
    }, 600);

    return () => clearTimeout(id);
  }, [isPending]);

  return (
    <div popover={'manual'} ref={popoverRef} className={styles.popover}>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_progress.title', 'Activating subscription')}
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

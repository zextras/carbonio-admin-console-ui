/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text } from '@zextras/ui-components';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-success.module.css';

type ActivationSuccessProps = {
  isSuccess: boolean;
  onComplete?: () => void;
};

export const ActivationSuccess = ({
  isSuccess,
  onComplete,
}: ActivationSuccessProps): React.JSX.Element => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isSuccess) {
      popoverRef.current?.showPopover();
      timeoutRef.current = setTimeout(() => {
        popoverRef.current?.hidePopover();
        onCompleteRef.current?.();
      }, 3_000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSuccess]);

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.imageCircle}>
        <icon-wc icon="CheckmarkCircle" color="success" size="60px"></icon-wc>
      </div>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_success.title', 'Subscription activated')}
      </Text>
      <div className={styles.description}>
        <Text color="gray0" weight="light" lineHeight={1.5}>
          {t(
            'subscription.activate.activation_success.description',
            'Everything is validated, your license is now active',
          )}
        </Text>
      </div>
    </div>
  );
};

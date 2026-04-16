/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Text } from '@zextras/ui-components';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ACTIVATION_SUCCESS_AUTO_CLOSE_MS } from '../../../constants';
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
      }, ACTIVATION_SUCCESS_AUTO_CLOSE_MS);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSuccess]);

  const buttonLabel = t('subscription.activate.button.redirect', 'go to my subscription');

  const onClick = () => onCompleteRef.current?.();
  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.imageCircle}>
        <ds-icon icon="CheckmarkCircle" color="success" size="60px"></ds-icon>
      </div>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_success.title', 'Subscription activated')}
      </Text>
      <div className={styles.description}>
        <Text color="gray0" weight="light" style={{ whiteSpace: 'pre-line' }}>
          {t(
            'subscription.activate.activation_success.description',
            'License activated.\nYou will be redirected to the subscription page.',
          )}
        </Text>
      </div>
      <Button label={buttonLabel} width="fill" onClick={onClick} />
    </div>
  );
};

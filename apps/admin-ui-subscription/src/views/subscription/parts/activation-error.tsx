/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Text } from '@zextras/ui-components';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-error.module.css';

type ActivationErrorProps = {
  isError: boolean;
};

export const ActivationError = ({ isError }: ActivationErrorProps): React.JSX.Element => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isError) {
      popoverRef.current?.showPopover();
      timeoutRef.current = setTimeout(() => {
        popoverRef.current?.hidePopover();
      }, 3_000_000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isError]);

  const onClick = () => popoverRef.current?.hidePopover();
  const buttonLabel = t('label.back', 'back');

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.imageCircle}>
        <icon-wc icon="AlertTriangleOutline" color="error" size="60px"></icon-wc>
      </div>
      <Text weight="bold" size="large">
        {t('subscription.activate.activation_error.title', 'Something went wrong')}
      </Text>
      <div className={styles.description}>
        <Text color="gray0" weight="light" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
          {t(
            'subscription.activate.activation_error.description',
            'Please verify that you have inserted the correct token.\nIf the error persists contact your provider or try again later.',
          )}
        </Text>
      </div>
      <Button color="gray0" label={buttonLabel} type="outlined" width="fill" onClick={onClick} />
    </div>
  );
};

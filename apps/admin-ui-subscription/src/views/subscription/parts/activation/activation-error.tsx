/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './activation-error.module.css';

export const ActivationError = () => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    popoverRef.current?.showPopover();
  }, []);

  const onClick = () => popoverRef.current?.hidePopover();
  const buttonLabel = t('label.back', 'back');

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.imageCircle}>
        <ds-icon icon="AlertTriangleOutline" color="error" size="60px"></ds-icon>
      </div>
      <ds-text as="h2" weight="bold" size="large">
        {t('subscription.activate.activation_error.title', 'Something went wrong')}
      </ds-text>
      <div className={styles.description}>
        <ds-text
          as="p"
          color="gray0"
          weight="light"
          overflow="break-word"
          style={{ whiteSpace: 'pre-line' }}
        >
          {t(
            'subscription.activate.activation_error.description',
            'Please verify that you have inserted the correct token.\nIf the error persists contact your provider or try again later.',
          )}
        </ds-text>
      </div>
      <Button color="gray0" label={buttonLabel} type="outlined" width="fill" onClick={onClick} />
    </div>
  );
};

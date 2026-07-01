/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Input } from '@zextras/ui-components';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import styles from './change-token-modal.module.css';

type ChangeTokenModalProps = {
  onClose: () => void;
  onConfirm: (token: string) => void;
};

export const ChangeTokenModal = ({ onClose, onConfirm }: ChangeTokenModalProps) => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const activationTokenSchema = z
    .string()
    .trim()
    .min(1, t('subscription.activate.error.empty', 'Please enter your activation token'));

  const validate = (value: string): boolean => {
    const result = activationTokenSchema.safeParse(value);

    if (!result.success) {
      setValidationError(result.error.issues[0]?.message);
      return false;
    }

    setValidationError(null);
    return true;
  };

  useEffect(() => {
    popoverRef.current?.showPopover();
  }, []);

  function handleClose(): void {
    popoverRef.current?.hidePopover();
    setToken('');
    setValidationError(null);
    onClose();
  }

  function handleConfirm(): void {
    if (!validate(token)) {
      return;
    }

    onConfirm(token.trim());
  }

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" size="medium" className={styles.title}>
          {t('core.subscription.changeToken', 'Change token')}
        </ds-text>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('label.close', 'Close')}
        >
          <ds-icon icon="CloseOutline" size="24px" />
        </button>
      </div>
      <ds-divider className={styles.topDivider} />
      <div className={styles.description}>
        <ds-text as="p" size="medium" color="gray0" overflow="break-word">
          {t(
            'core.subscription.changeTokenDescription',
            'Insert here the new token. It could require some times in order to verify that the ticket is compliant with the whole infrastructure.',
          )}
        </ds-text>
      </div>
      <div className={styles.inputWrapper}>
        <Input
          label={t('core.subscription.token', 'Token')}
          trimOnPaste
          backgroundColor="gray5"
          hasError={validationError !== null}
          value={token}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            setToken(event.target.value);
            if (validationError !== null) {
              setValidationError(null);
            }
          }}
          onBlur={(): void => {
            if (token.length > 0) {
              validate(token);
            }
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === 'Enter') {
              handleConfirm();
            }
          }}
        />
        {validationError !== null && (
          <ds-text as="span" color="error" size="small" className={styles.errorMessage}>
            {validationError}
          </ds-text>
        )}
      </div>
      <ds-divider className={styles.divider} />
      <div className={styles.actions}>
        <Button
          type="outlined"
          color="gray0"
          label={t('core.subscription.cancel', 'CANCEL')}
          onClick={handleClose}
        />
        <Button
          type="default"
          label={t('core.subscription.confirmToken', 'CONFIRM TOKEN')}
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
};


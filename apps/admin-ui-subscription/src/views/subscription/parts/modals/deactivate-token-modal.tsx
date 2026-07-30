/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './deactivate-token-modal.module.css';

type DeactivateTokenModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeactivateTokenModal: FC<DeactivateTokenModalProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      popoverRef.current?.showPopover();
    } else {
      popoverRef.current?.hidePopover();
    }
  }, [open]);

  function handleClose(): void {
    popoverRef.current?.hidePopover();
    onClose();
  }

  function handleConfirm(): void {
    popoverRef.current?.hidePopover();
    onConfirm();
  }

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" size="medium" className={styles.title}>
          {t('core.subscription.deactivateToken', 'Deactivate Token')}
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
            'core.subscription.deactivateTokenWarning',
            'You are trying to deactivate the current Token. Doing so will disable all the enabled features.',
          )}
        </ds-text>
        <ds-text as="p" size="medium" color="gray0" overflow="break-word">
          {t(
            'core.subscription.deactivateTokenConfirmation',
            'Are you sure you want to proceed?',
          )}
        </ds-text>
      </div>
      <ds-divider className={styles.divider} />
      <div className={styles.actions}>
        <Button
          type="outlined"
          color="gray0"
          label={t('core.subscription.noCancel', 'NO, CANCEL')}
          onClick={handleClose}
        />
        <Button
          type="default"
          color="error"
          label={t('core.subscription.yesDeactivation', 'YES, DEACTIVATE')}
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
};

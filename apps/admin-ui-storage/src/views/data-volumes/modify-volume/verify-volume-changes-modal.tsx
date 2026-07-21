/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Checkbox } from '@zextras/ui-components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './verify-volume-changes-modal.module.css';

type ChangedField = {
  readonly label: string;
  readonly value: string;
};

type VerifyVolumeChangesModalProps = {
  readonly open: boolean;
  readonly changedFields: Array<ChangedField>;
  readonly closeHandler: () => void;
  readonly applyHandler: () => Promise<void>;
};

export function VerifyVolumeChangesModal({
  open,
  changedFields,
  closeHandler,
  applyHandler,
}: VerifyVolumeChangesModalProps) {
  const [t] = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsConfirmed(false);
    }
  }

  useEffect(() => {
    if (open) {
      popoverRef.current?.showPopover();
    } else {
      popoverRef.current?.hidePopover();
    }
  }, [open]);

  const onClose = (): void => {
    popoverRef.current?.hidePopover();
    closeHandler();
  };

  const onApply = async (): Promise<void> => {
    if (!isConfirmed) {
      return;
    }
    await applyHandler();
  };

  return (
    <div popover="manual" ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" size="medium" className={styles.title}>
          {t('storage.volume.changeImportantInformation', 'Change important information')}
        </ds-text>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('label.close', 'Close')}
        >
          <ds-icon icon="CloseOutline" size="24px" />
        </button>
      </div>
      <div className={styles.topDivider} />
      <ds-text as="p" size="medium" color="gray0" className={styles.warning} overflow="break-word">
        <span className={styles.warningPrefix}>
          {t('label.warning', 'Warning')}:
        </span>{' '}
        <span className={styles.warningText}>
          {t(
            'storage.volume.changeImportantInformation.warningBody',
            'you are editing sensitive information. This could affect the proper functioning of the volume connection.',
          )}
        </span>
        <br />
        <span className={styles.warningText}>
          {t(
            'storage.volume.changeImportantInformation.warningLine2',
            'You are editing this information:',
          )}
        </span>
      </ds-text>

      <div className={styles.fieldList}>
        {changedFields.map((field) => (
          <div key={field.label} className={styles.fieldItem}>
            <ds-text as="span" size="extrasmall" color="gray1" className={styles.fieldLabel}>
              {field.label}
            </ds-text>
            <ds-text as="span" size="medium" color="gray0" className={styles.fieldValue}>
              {field.value}
            </ds-text>
          </div>
        ))}
      </div>

      <div className={styles.checkboxRow}>
        <Checkbox
          iconColor="primary"
          size="small"
          label={t(
            'storage.volume.changeImportantInformation.confirm',
            'I am sure I want to apply these changes',
          )}
          value={isConfirmed}
          onClick={(): void => setIsConfirmed(!isConfirmed)}
        />
      </div>

      <div className={styles.divider} />
      <div className={styles.actions}>
        <Button color="gray0" label={t('label.cancel', 'CANCEL')} type="outlined" onClick={onClose} />
        <Button
          color="primary"
          label={t('storage.volume.applyChanges', 'APPLY CHANGES')}
          type="default"
          onClick={onApply}
          disabled={!isConfirmed}
        />
      </div>
    </div>
  );
}

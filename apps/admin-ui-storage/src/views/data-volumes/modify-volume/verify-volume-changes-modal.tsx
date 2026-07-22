/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Checkbox, Container, Modal, Row } from '@zextras/ui-components';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './verify-volume-changes-modal.module.css';

type ChangedField = {
  label: string;
  value: string;
};

type VerifyVolumeChangesModalProps = {
  open: boolean;
  changedFields: Array<ChangedField>;
  closeHandler: () => void;
  applyHandler: () => Promise<void>;
};

export const VerifyVolumeChangesModal: FC<VerifyVolumeChangesModalProps> = ({
  open,
  changedFields,
  closeHandler,
  applyHandler,
}) => {
  const { t } = useTranslation();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const onClose = (): void => {
    closeHandler();
  };

  const onApply = async (): Promise<void> => {
    if (!isConfirmed) {
      return;
    }
    await applyHandler();
  };

  return (
    <Modal
      open={open}
      size="medium"
      title={t('storage.volume.changeImportantInformation', 'Change important information')}
      showCloseIcon
      onClose={onClose}
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '1rem' }}>
            <Button
              color="gray0"
              label={t('label.cancel', 'CANCEL')}
              type="outlined"
              onClick={onClose}
            />
            <Button
              color="primary"
              label={t('storage.volume.applyChanges', 'APPLY CHANGES')}
              type="default"
              onClick={onApply}
              disabled={!isConfirmed}
            />
          </Row>
        </Container>
      }
    >
      <div className={styles.modalBody}>
        <ds-text as="p" size="medium" color="gray0" className={styles.warning} overflow="break-word">
          <span className={styles.warningPrefix}>{t('label.warning', 'Warning')}:</span>{' '}
          <span className={styles.warningText}>
            {t(
              'storage.volume.changeImportantInformation.warningBody',
              'Changing the Volume Prefix or S3 Connector may require transferring existing data to the selected target. Do you want to continue?',
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
      </div>
    </Modal>
  );
};

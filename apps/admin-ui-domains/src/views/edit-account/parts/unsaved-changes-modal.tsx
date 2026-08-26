/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Modal } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type UnsavedChangesModalProps = {
  open: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onClose: () => void;
};

export const UnsavedChangesModal = ({
  open,
  onDiscard,
  onSave,
  onClose,
}: UnsavedChangesModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      size="small"
      title={t('label.hey_there_are_unsaved_changes_here', 'Hey! There are unsaved changes here')}
      open={open}
      customFooter={
        <div className="flex justify-end gap-4">
          <Button
            label={t('label.discard', 'Discard')}
            color="primary"
            type="outlined"
            onClick={onDiscard}
          />
          <Button
            label={t('label.save_the_changes', 'Save the changes')}
            color="primary"
            onClick={onSave}
          />
        </div>
      }
      showCloseIcon
      onClose={onClose}
    >
      <ds-text
        size={'extralarge'}
        overflow="break-word"
        style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
        as="p"
      >
        {t(
          'label.are_you_sure_you_want_to_leave_without_saving_he_changes',
          `Are you sure you want to leave without saving he changes?`,
        )}
      </ds-text>
    </Modal>
  );
};

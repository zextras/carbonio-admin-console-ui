/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Modal } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CLOSED } from '../../../constants';

type DeleteAccountHintModalProps = {
  account: { id: string; name: string; [key: string]: any };
  onClose: () => void;
};

export const DeleteAccountHintModal = ({ account, onClose }: DeleteAccountHintModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      size="medium"
      title={account?.name}
      open
      customFooter={
        <div className="flex justify-end">
          <Button
            label={t('label.close', 'Close')}
            color="primary"
            onClick={onClose}
            disabled={account?.zimbraAccountStatus === CLOSED}
          />
        </div>
      }
      showCloseIcon
      onClose={onClose}
    >
      <div>
        <div className="pb-md pt-md">
          <ds-text
            style={{ textAlign: 'center' }}
            size={'extralarge'}
            overflow="break-word"
            as="p"
          >
            {t(
              'label.delete_delegated_account_content',
              `The system accounts can't be deleted from here. Please visit the respective module to manage the account.`,
            )}
          </ds-text>
        </div>
      </div>
    </Modal>
  );
};

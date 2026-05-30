/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Modal, Padding } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type DisablePoolModalProps = {
  open: boolean;
  onClose: () => void;
  serverName: string | undefined;
  onDisable: () => void;
};

export const DisablePoolModal = ({
  open,
  onClose,
  serverName,
  onDisable,
}: DisablePoolModalProps) => {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('cos.disabling_pool', 'Disabling pool')}
      open={open}
      showCloseIcon
      onClose={onClose}
      customFooter={
        <Container orientation="horizontal" mainAlignment="space-between" width="100%">
          <Container orientation="horizontal" mainAlignment="flex-start" width="25%">
            <Button
              label={t('label.helo', 'Help')}
              type="outlined"
              color="primary"
              onClick={onClose}
            />
          </Container>

          <Container orientation="horizontal" mainAlignment="flex-end" width="75%">
            <Padding all="small">
              <Button
                label={t('label.no_go_back', 'No, Go Back')}
                color="secondary"
                onClick={onClose}
              />
            </Padding>
            <Button
              label={t('cos.yes_disable', 'Yes, Disable')}
              color="error"
              onClick={onDisable}
            />
          </Container>
        </Container>
      }
    >
      <Padding all="medium">
        <ds-text as="p" overflow="break-word" weight="regular">
          {t('cos.create_cos_success_msg', {
            serverName,
            defaultValue:
              'You are disabling pool on {{serverName}}. All mailboxes will be not moved. Are you sure you want to delete it?',
          })}
        </ds-text>
      </Padding>
    </Modal>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Modal,
  Padding,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { deleteCOS } from '../../../services/delete-cos-service';

type DeleteCosModalProps = {
  open: boolean;
  onClose: () => void;
  cosName: string;
  cosId: string;
};

export const DeleteCosModal = ({
  open,
  onClose,
  cosName,
  cosId,
}: DeleteCosModalProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

  const onDeleteCOS = (): void => {
    setIsRequestInProgress(true);
    deleteCOS(cosId)
      .then((data: unknown) => {
        setIsRequestInProgress(false);
        if (data) {
          createSnackbar({
            key: 'info',
            severity: 'info',
            label: t('label.delete_cos_succeess', {
              cosname: cosName,
              defaultValue: 'The {{cosname}} has been deleted successfully',
            }),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          onClose();
          replaceHistory(`/cos_list`);
        }
      })
      .catch((error: unknown) => {
        setIsRequestInProgress(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label:
            (error as Error)?.message ||
            t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  return (
    <Modal
      title={
        <Trans
          i18nKey="label.deleting_cos_msg"
          defaults="Deleting <bold>{{cosname}}</bold>"
          components={{ bold: <strong /> }}
          values={{ cosname: cosName }}
        />
      }
      open={open}
      showCloseIcon
      onClose={onClose}
      size="medium"
      customFooter={
        <Container orientation="horizontal" mainAlignment="space-between">
          <Container orientation="horizontal" mainAlignment="flex-end" width="fit">
            <Padding all="small">
              <Button
                label={t('label.no_go_back', 'No, Go Back')}
                color="secondary"
                size="medium"
                onClick={onClose}
              />
            </Padding>
            <Button
              label={t('label.yes_delete', 'Yes, Delete')}
              color="error"
              onClick={onDeleteCOS}
              disabled={isRequestInProgress}
            />
          </Container>
        </Container>
      }
    >
      <Container>
        <Padding bottom="small" top="extralarge">
          <ds-text as="p" overflow="break-word" weight="regular">
            {t('label.you_are_deleting', {
              cosname: cosName,
              defaultValue: 'You are deleting {{cosname}}',
            })}
          </ds-text>
        </Padding>
        <Padding bottom="small">
          <ds-text as="p" overflow="break-word" weight="regular">
            {t(
              'label.are_you_sure_deleting_cos',
              'Are you sure you want to delete this Class of Service?',
            )}
          </ds-text>
        </Padding>
        <Padding bottom="extralarge">
          <ds-text as="p" overflow="break-word" weight="regular">
            {t(
              'label.delete_cos_instruction_msg',
              'If you click YES, DELETE the DefaultCOS will be replace the deleted COS.',
            )}
          </ds-text>
        </Padding>
      </Container>
    </Modal>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Modal, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { DeleteVolumeModelProps } from '../../../types';

export function DeleteVolumeModel({
  open,
  closeHandler,
  deleteHandler,
  volumeDetail,
}: DeleteVolumeModelProps) {
  const [t] = useTranslation();
  return (
    <Modal
      size="medium"
      title={t('label.delet_volume_header', 'Delete {{name}} ?', {
        name: volumeDetail?.name,
      })}
      open={open}
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '0.5rem' }}>
            <Button
              label={t('label.cancle_button', 'NO')}
              color="secondary"
              onClick={closeHandler}
            />
            <Button
              label={t('label.delete_button', 'DELETE')}
              color="error"
              onClick={(): void => {
                deleteHandler(volumeDetail);
              }}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={closeHandler}
    >
      <ds-text
        as="p"
        size={'extralarge'}
        overflow="break-word"
        style={{ whiteSpace: 'pre-line', textAlign: 'left', padding: '2rem 0' }}
      >
        {t('label.delete_content', `You are deleting {{name}}. Are you sure you want to delete it?`, {
          name: volumeDetail?.name,
        })}
      </ds-text>
    </Modal>
  );
}

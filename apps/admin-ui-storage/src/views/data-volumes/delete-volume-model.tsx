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
            {volumeDetail?.isCurrent ? (
              <Button
                label={t('label.cancle_button_is_current', 'OK, I GOT IT')}
                color="primary"
                onClick={closeHandler}
              />
            ) : (
              <>
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
              </>
            )}
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
        style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
      >
        {volumeDetail?.isCurrent
          ? t(
              'label.delete_content_is_current',
              `You're trying to delete {{name}}. This volume is set as current. You should set a different volume as the current one before deleting it.`,
              {
                name: volumeDetail?.name,
              },
            )
          : t(
              'label.delete_content',
              `You are deleting {{name}}. Are you sure you want to delete it?`,
              {
                name: volumeDetail?.name,
              },
            )}
      </ds-text>
    </Modal>
  );
}

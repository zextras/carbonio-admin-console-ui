/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Modal, Padding, Row } from '@zextras/ui-components';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const ResetTheme: FC<{
  title: string;
  isOpenResetDialog: boolean;
  closeHandler: () => void;
  onResetHandler: () => void;
}> = ({ title, isOpenResetDialog, closeHandler, onResetHandler }) => {
  const [t] = useTranslation();
  return (
    <Modal
      size="medium"
      title={title}
      open={isOpenResetDialog}
      customFooter={
        <Container orientation="horizontal" mainAlignment="space-between">
          <Button
            style={{ marginLeft: '10px' }}
            type="outlined"
            label={t('label.help', 'Help')}
            color="primary"
            onClick={(): null => null}
          />
          <Row style={{ gap: '1rem' }}>
            <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={closeHandler} />
            <Button label={t('label.yes', 'Yes')} color="error" onClick={onResetHandler} />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={closeHandler}
    >
      <Container>
        <Padding bottom="medium" top="medium">
          <ds-text as="p" size={'extralarge'} overflow="break-word">
            <Trans
              i18nKey="label.reset_whitelabel_settings_content_1"
              defaults="You are you sure to reset the whitelabel settings ?"
              components={{}}
            />
          </ds-text>
        </Padding>
        <Padding bottom="medium">
          <ds-text as="p" overflow="break-word">
            <Trans
              i18nKey="label.reset_whitelabel_settings_content_2"
              defaults="If you click YES button all data will be lost."
              components={{}}
            />
          </ds-text>
        </Padding>
        <Row padding={{ bottom: 'large' }}>
          <ds-icon
            icon="AlertTriangleOutline"
            size="large"
            style={{ height: '48px', width: '48px' }}
          ></ds-icon>
        </Row>
      </Container>
    </Modal>
  );
};

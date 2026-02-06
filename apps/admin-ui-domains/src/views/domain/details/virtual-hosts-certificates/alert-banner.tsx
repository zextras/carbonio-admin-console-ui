/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Row, Text } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface AlertBannerProps {
  onClose: () => void;
}

export const AlertBanner: FC<AlertBannerProps> = ({ onClose }) => {
  const [t] = useTranslation();

  return (
    <Container
      height="fit-content"
      mainAlignment="space-between"
      crossAlignment="center"
      padding={{ horizontal: 'large' }}
    >
      <Row
        padding={{ all: 'large' }}
        width="100%"
        mainAlignment="space-between"
        style={{
          borderRadius: '2px 2px 0px 0px',
          backgroundColor: '#BDE7FE',
        }}
      >
        <Row>
          <icon-wc icon-name="AlertTriangleOutline" size="large" color="info"></icon-wc>
          <Padding left="large">
            <Text>
              {t(
                'label.certificate_alert_helperText',
                'The certificate will be available once the proxy is restarted',
              )}
            </Text>
          </Padding>
        </Row>
        <icon-wc
          icon-name="CloseOutline"
          size="large"
          style={{ cursor: 'pointer' }}
          onClick={onClose}
        ></icon-wc>
      </Row>
    </Container>
  );
};

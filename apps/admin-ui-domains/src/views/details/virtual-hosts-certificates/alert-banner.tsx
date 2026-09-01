/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './alert-banner.module.css';

type AlertBannerProps = {
  onClose: () => void;
};

export const AlertBanner = ({ onClose }: AlertBannerProps) => {
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
          <ds-icon icon="AlertTriangleOutline" size="large" color="info"></ds-icon>
          <Padding left="large">
            <ds-text as="p">
              {t(
                'label.certificate_alert_helperText',
                'The certificate will be available once the proxy is restarted',
              )}
            </ds-text>
          </Padding>
        </Row>
        <button
          type="button"
          aria-label={t('label.close', 'Close')}
          onClick={onClose}
          className={styles.closeButton}
        >
          <ds-icon icon="CloseOutline" size="large"></ds-icon>
        </button>
      </Row>
    </Container>
  );
};

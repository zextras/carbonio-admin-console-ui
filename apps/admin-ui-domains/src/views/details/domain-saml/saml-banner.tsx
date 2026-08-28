/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { copyTextToClipboard } from '../../utility/utils';
import styles from '../domain-saml.module.css';

type SamlBannerProps = {
  entityId: string;
  serviceUrl: string;
  onDismiss: () => void;
};

export const SamlBanner = ({ entityId, serviceUrl, onDismiss }: SamlBannerProps) => {
  const [t] = useTranslation();

  return (
    <Container
      orientation="horizontal"
      crossAlignment="center"
      width="97%"
      mainAlignment="flex-start"
      background="#D3EBF8"
      padding={{ top: 'medium', bottom: 'medium' }}
      style={{
        borderRadius: '0.125rem 0.125rem 0 0',
        margin: '1rem',
        borderBottom: '0.063rem solid #2196D3',
      }}
    >
      <Row width="5%" mainAlignment="flex-start">
        <Padding horizontal="small">
          <ds-icon
            icon="CheckmarkCircle2Outline"
            style={{ width: '1.25rem', height: '1.25rem' }}
            color="#2196D3"
          ></ds-icon>
        </Padding>
      </Row>
      <Row mainAlignment="flex-start" width="65%" padding={{ top: 'small', bottom: 'small' }}>
        <ds-text as="p" overflow="break-word">
          {t(
            'cos.idp_configuration_saml_notes',
            'Go to your IDP to configure your SAML and copy the EntityID and ServiceURL values',
          )}
        </ds-text>
      </Row>
      <Row width="12%" mainAlignment="flex-start">
        <Tooltip placement="top" label={t('label.entity_id_copied', 'EntityID copied')}>
          <Button
            type="outlined"
            label={t('label.entity_id', 'Entity ID')}
            color="#2196D3"
            size="medium"
            backgroundColor="#D3EBF8"
            icon="CopyOutline"
            iconPlacement="left"
            disabled={!entityId}
            onClick={() => copyTextToClipboard(entityId)}
          />
        </Tooltip>
      </Row>
      <Row width="16%" mainAlignment="flex-start">
        <Tooltip placement="top" label={t('label.service_url_copied', 'ServiceURL copied')}>
          <Button
            type="outlined"
            label={t('label.service_url', 'ServiceURL')}
            color="#2196D3"
            size="medium"
            backgroundColor="#D3EBF8"
            icon="CopyOutline"
            iconPlacement="left"
            disabled={!serviceUrl}
            onClick={() => copyTextToClipboard(serviceUrl)}
          />
        </Tooltip>
      </Row>
      <Row width="4%" mainAlignment="flex-start">
        <button
          type="button"
          aria-label={t('label.close', 'Close')}
          onClick={onDismiss}
          className={styles.clearButton}
        >
          <ds-icon icon="CloseOutline" size="large" color="text"></ds-icon>
        </button>
      </Row>
    </Container>
  );
};

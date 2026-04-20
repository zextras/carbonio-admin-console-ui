/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Padding, Row } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface GenerateCertificateModalProps {
  open: boolean;
  domainName: string;
  virtualHosts: string[];
  loading: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export const GenerateCertificateModal: FC<GenerateCertificateModalProps> = ({
  open,
  domainName,
  virtualHosts,
  loading,
  onClose,
  onGenerate,
}) => {
  const [t] = useTranslation();
  const certificateAuthority = "Let's Encrypt";

  return (
    <Modal
      size="medium"
      title={t('label.generate_certificate', 'Generate certificate')}
      open={open}
      showCloseIcon
      onClose={onClose}
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Padding horizontal="small">
            <Button
              label={t('label.dismiss', 'DISMISS')}
              type="outlined"
              color="secondary"
              onClick={onClose}
              disabled={loading}
            />
          </Padding>
          <Button
            label={t('label.generate', 'GENERATE')}
            color="primary"
            onClick={onGenerate}
            loading={loading}
          />
        </Container>
      }
    >
      <Container
        padding={{ vertical: 'large', horizontal: 'medium' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        gap="1rem"
      >
        <Container
          background="gray5"
          padding={{ all: 'medium' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          gap="0.5rem"
        >
          <Row mainAlignment="flex-start" width="fill">
            <ds-text as="strong" weight="bold" size="small" color="gray0">
              {t('label.certificate_authority', 'Certificate Authority')}:
            </ds-text>
            <Padding left="extrasmall">
              <ds-text as="span" size="small" color="gray0">
                {certificateAuthority}
              </ds-text>
            </Padding>
          </Row>
          <Row mainAlignment="flex-start" width="fill">
            <ds-text as="strong" weight="bold" size="small" color="gray0">
              {t('label.domain_name', 'Domain Name')}:
            </ds-text>
            <Padding left="extrasmall">
              <ds-text as="span" size="small" color="gray0">
                {domainName}
              </ds-text>
            </Padding>
          </Row>
          <Row mainAlignment="flex-start" width="fill">
            <ds-text as="strong" weight="bold" size="small" color="gray0">
              {t('label.virtual_hosts', 'Virtual Hosts')}:
            </ds-text>
            <Padding left="extrasmall">
              <ds-text as="span" size="small" color="gray0">
                {virtualHosts.join(', ')}
              </ds-text>
            </Padding>
          </Row>
        </Container>

        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          gap="0.5rem"
        >
          <ds-icon icon="InfoOutline" color="gray1" size="medium"></ds-icon>
          <ds-text as="small" size="small" color="gray1">
            {t(
              'label.certificate_available_after_proxy_restart',
              'The certificate will be available once the Proxy is restarted',
            )}
          </ds-text>
        </Container>
      </Container>
    </Modal>
  );
};

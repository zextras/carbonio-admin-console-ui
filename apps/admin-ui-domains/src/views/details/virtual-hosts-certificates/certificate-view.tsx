/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  LabeledValue,
  ListRow,
  Row,
  Tooltip,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SHORT } from '../../../constants';
import type { DomainCertDetails } from '../../../services/get-domain-cert-service';
import type { DomainSslMaterial } from '../../../services/get-domain-ssl-material-service';
import { useIssueCert } from '../../../services/use-issue-cert';
import { GenerateCertificateModal } from './generate-certificate-modal';

type CertificateViewProps = {
  domainCertiDetails?: DomainCertDetails | null;
  hasCertificate: boolean;
  domainCertificate: DomainSslMaterial | null | undefined;
  domainName: string;
  domainId: string;
  hasVirtualHosts: boolean;
  virtualHosts: Array<string>;
  onVerifyCertificate: () => void;
  onRemove: () => void;
  onCertificateGenerated: () => void;
};

export const CertificateView = ({
  domainCertiDetails,
  hasCertificate,
  domainCertificate,
  domainName,
  domainId,
  hasVirtualHosts,
  virtualHosts,
  onVerifyCertificate,
  onRemove,
  onCertificateGenerated,
}: CertificateViewProps) => {
  const [t] = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const issueCertMutation = useIssueCert({ domainId, domainName });

  const noCertificateLabel = t(
    'label.no_certificate_to_remove',
    'There is no certificate to remove.',
  );
  const noCertificateDownloadLabel = t(
    'label.no_certificate_to_download',
    'There is no certificate to download.',
  );
  const noVirtualHostLabel = t(
    'label.no_virtual_hosts',
    'You need to add at least one Virtual Host.',
  );

  function handleModalClose(): void {
    setModalOpen(false);
  }

  function requestCertiClickHandler(): void {
    issueCertMutation.mutate(SHORT, {
      onSuccess: () => {
        setModalOpen(false);
        onCertificateGenerated();
      },
    });
  }

  function handleDownload(): void {
    const elementCerti = document.createElement('a');
    const fileCerti = new Blob([domainCertificate?.zimbraSSLCertificate ?? ''], {
      type: 'application/x-pem-file',
    });
    elementCerti.href = URL.createObjectURL(fileCerti);
    elementCerti.download = `certificate-${domainName}.pem`;
    document.body.appendChild(elementCerti);
    elementCerti.click();

    const elementPrivateKey = document.createElement('a');
    const fileKey = new Blob([domainCertificate?.zimbraSSLPrivateKey ?? ''], {
      type: 'application/x-pem-file',
    });
    elementPrivateKey.href = URL.createObjectURL(fileKey);
    elementPrivateKey.download = `private-key-${domainName}.pem`;
    document.body.appendChild(elementPrivateKey);
    elementPrivateKey.click();
  }

  return (
    <Container
      padding={{ all: 'large' }}
      height="fit"
      crossAlignment="flex-start"
      background="gray6"
    >
      <Row
        padding={{ top: 'large' }}
        width="100%"
        mainAlignment="space-between"
        crossAlignment="flex-start"
      >
        <Row>
          <ds-text as="h2">{t('label.certificate', 'Certificate')}</ds-text>
        </Row>
        <Row padding={{ left: 'large' }}>
          <Button
            type="ghost"
            label={t('label.upload_certificate', 'UPLOAD CERTIFICATE')}
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              onVerifyCertificate();
            }}
          />
          <Tooltip label={noVirtualHostLabel} disabled={hasVirtualHosts}>
            <Button
              type="ghost"
              label={t('label.generate_certificate', 'GENERATE CERTIFICATE')}
              color="primary"
              disabled={!hasVirtualHosts}
              onClick={(e) => {
                e.preventDefault();
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip label={noCertificateDownloadLabel} disabled={hasCertificate}>
            <Button
              type="ghost"
              label={t('label.download_uppercase', 'DOWNLOAD')}
              color="primary"
              disabled={!hasCertificate}
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
            />
          </Tooltip>
          <Tooltip label={noCertificateLabel} disabled={hasCertificate}>
            <Button
              type="ghost"
              label={t('label.remove', 'Remove')}
              color="error"
              disabled={!hasCertificate}
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
            />
          </Tooltip>
        </Row>
      </Row>
      <ListRow padding={{ top: 'extralarge' }}>
        <Container padding={{ horizontal: 'small', top: 'small' }}>
          <LabeledValue
            label={t('label.subject_name_cname', 'Subject Name (Canonical Name record - CNAME)')}
            backgroundColor="gray6"
            value={domainCertiDetails?.subject || ''}
          />
        </Container>
        <Container padding={{ horizontal: 'small', top: 'small' }}>
          <LabeledValue
            label={t(
              'label.subject_name_fqdn',
              'Subject Alt Name (Fully Qualified Domain Name - FQDN)',
            )}
            backgroundColor="gray6"
            value={domainCertiDetails?.SubjectAltName || ''}
          />
        </Container>
      </ListRow>
      <ListRow padding={{ top: 'large' }}>
        <Container padding={{ horizontal: 'small' }}>
          <LabeledValue
            backgroundColor="gray6"
            label={t('label.issuer', 'Issuer')}
            value={domainCertiDetails?.issuer || ''}
          />
        </Container>
      </ListRow>
      <ListRow padding={{ top: 'large' }}>
        <Container padding={{ horizontal: 'small' }}>
          <LabeledValue
            label={t('label.valid_not_before', 'Valid from (not before)')}
            backgroundColor="gray6"
            value={domainCertiDetails?.notBefore || ''}
          />
        </Container>
        <Container padding={{ horizontal: 'small' }}>
          <LabeledValue
            label={t('label.valid_not_after', 'Valid until (not after)')}
            backgroundColor="gray6"
            value={domainCertiDetails?.notAfter || ''}
          />
        </Container>
      </ListRow>

      <GenerateCertificateModal
        open={modalOpen}
        domainName={domainName}
        virtualHosts={virtualHosts}
        loading={issueCertMutation.isPending}
        onClose={handleModalClose}
        onGenerate={requestCertiClickHandler}
      />
    </Container>
  );
};

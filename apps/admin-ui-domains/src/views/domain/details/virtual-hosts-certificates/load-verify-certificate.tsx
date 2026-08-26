/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Button, Container, CustomTextArea, Padding, Tooltip, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { INVALID } from '../../../../constants';
import { useSaveDomainCertificate } from '../../../../services/use-save-domain-certificate';
import { useVerifyCertKey } from '../../../../services/use-verify-cert-key';
import { useCertificateContext } from './certificate-context';
import { certificateUploadSchema } from './schema';

type LoadAndVerifyCertProps = {
  setToggleWizardSection: (open: boolean) => void;
  externalData: (showAlert: boolean) => void;
};

function pickFile(onContent: (fileName: string, content: string) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e: Event): void => {
    const file = (e.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    file
      .text()
      .then((content) => {
        onContent(file.name, content);
      })
      .catch(() => {
        onContent(file.name, '');
      });
  };
  input.click();
}

export const LoadAndVerifyCert = ({
  setToggleWizardSection,
  externalData,
}: LoadAndVerifyCertProps) => {
  const [t] = useTranslation();
  const { isCertificateAvailable, domainId, domainName } = useCertificateContext();
  const createSnackbar = useSnackbar();
  const verifyMutation = useVerifyCertKey();
  const saveCertMutation = useSaveDomainCertificate({ domainId, domainName });

  const form = useForm({
    defaultValues: {
      certificate: '',
      caChain: '',
      privateKey: '',
      isCertificateAvailable,
    },
    validators: {
      onChange: certificateUploadSchema,
      onSubmit: certificateUploadSchema,
    },
  });

  const certificate = useSelector(form.store, (s) => s.values.certificate);
  const caChain = useSelector(form.store, (s) => s.values.caChain);
  const privateKey = useSelector(form.store, (s) => s.values.privateKey);
  const certError = useSelector(form.store, (s) => s.fieldMeta.certificate?.errors?.[0]);
  const caError = useSelector(form.store, (s) => s.fieldMeta.caChain?.errors?.[0]);
  const keyError = useSelector(form.store, (s) => s.fieldMeta.privateKey?.errors?.[0]);

  const canVerify =
    certificate !== '' &&
    privateKey !== '' &&
    (isCertificateAvailable || caChain !== '');

  async function handleVerify(): Promise<void> {
    await form.validate('change');
    if (!canVerify) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: isCertificateAvailable
          ? t(
              'domain.certificate_content_error_without_ca_chain',
              'Domain certificate , Private key is invalid',
            )
          : t(
              'domain.certificate_content_error',
              'Domain certificate , CA Chain or Private key is invalid',
            ),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }

    verifyMutation.mutate(
      { ca: caChain, cert: certificate, privkey: privateKey },
      {
        onSuccess: (data) => {
          if (!data?.verifyResult || data.verifyResult === INVALID) return;
          const concatedCertiFile = certificate
            ? `${certificate}\n${caChain}`
            : caChain;
          saveCertMutation.mutate(
            { certificate: concatedCertiFile, privateKey },
            {
              onSuccess: () => {
                externalData(true);
                setToggleWizardSection(false);
              },
            },
          );
        },
      },
    );
  }

  return (
    <Container
      padding={{ all: 'large' }}
      gap="1.5rem"
      width="fill"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
    >
      <ds-text as="h2" size="large" weight="bold">
        {t('label.upload_verify_certificate', 'Upload and Verify Certificate')}
      </ds-text>
      <Container
        orientation="horizontal"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        width="fill"
      >
        <Container padding={{ right: '0.25rem' }} width="fit">
          <ds-icon icon="InfoOutline" color="secondary"></ds-icon>
        </Container>
        <ds-text as="p" color="secondary">
          {t(
            'label.certificate_alert_helperText',
            'The certificate will be available once the Proxy is restarted',
          )}
        </ds-text>
      </Container>

      <Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
        <ds-text as="label" weight="bold">
          {t('label.domain_certificate', 'Domain Certificate')}
        </ds-text>
        <Padding bottom="small" />
        <CustomTextArea
          isRequired
          label={t('label.upload_paste_certificate', 'Upload or paste your Certificate')}
          backgroundColor="gray5"
          value={certificate}
          inputName="domainCertificate"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
            form.setFieldValue('certificate', e.target.value);
          }}
          hasError={Boolean(certError)}
        />
        <Padding bottom="large" />
        <Button
          type="outlined"
          label={t('label.upload', 'UPLOAD')}
          color="primary"
          aria-label={t('label.upload_domain_certificate', 'Upload domain certificate')}
          onClick={() =>
            pickFile((_name, content) => form.setFieldValue('certificate', content))
          }
        />
      </Container>

      <Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
        <Padding bottom="small" />
        <ds-text as="label" weight="bold">
          {t('label.domain_certificate_ca_chain', 'Domain Certificate CA Chain')}
        </ds-text>
        <Padding bottom="small" />
        <CustomTextArea
          isRequired
          label={t(
            'label.upload_paste_certificate_ca_chain',
            'Upload or paste your Certificate CA Chain',
          )}
          backgroundColor="gray5"
          value={caChain}
          inputName="domainCertificateCaChain"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
            form.setFieldValue('caChain', e.target.value);
          }}
          hasError={Boolean(caError)}
        />
        <Padding bottom="large" />
        <Button
          type="outlined"
          label={t('label.upload', 'UPLOAD')}
          color="primary"
          aria-label={t('label.upload_ca_chain', 'Upload certificate CA chain')}
          onClick={() => pickFile((_name, content) => form.setFieldValue('caChain', content))}
        />
      </Container>

      <Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
        <Padding bottom="small" />
        <ds-text as="label" weight="bold">
          {t('label.domain_certificate_private_key', 'Domain Private Key')}
        </ds-text>
        <Padding bottom="small" />
        <CustomTextArea
          isRequired
          label={t('label.upload_paste_private_key', 'Upload or paste your Private Key')}
          backgroundColor="gray5"
          value={privateKey}
          inputName="domainPrivateKey"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
            form.setFieldValue('privateKey', e.target.value);
          }}
          hasError={Boolean(keyError)}
        />
        <Padding bottom="large" />
        <Button
          type="outlined"
          label={t('label.upload', 'UPLOAD')}
          color="primary"
          aria-label={t('label.upload_private_key', 'Upload private key')}
          onClick={() =>
            pickFile((_name, content) => form.setFieldValue('privateKey', content))
          }
        />
      </Container>

      <Container padding={{ top: 'medium' }} width="fill">
        <Tooltip
          disabled={canVerify}
          label={t(
            'label.fill_all_required_fields',
            'Please fill in all required fields correctly',
          )}
        >
          <Button
            width="fill"
            size="large"
            label={t('label.verify', 'VERIFY')}
            onClick={handleVerify}
            loading={verifyMutation.isPending || saveCertMutation.isPending}
            disabled={!canVerify}
          />
        </Tooltip>
      </Container>
    </Container>
  );
};

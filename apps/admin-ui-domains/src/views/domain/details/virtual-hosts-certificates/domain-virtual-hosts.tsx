/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, ModalOverlay, Padding } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { useDomainCert } from '../../../../services/use-domain-cert';
import { useDomainSslMaterial } from '../../../../services/use-domain-ssl-material';
import { useDeleteDomainCertificate } from '../../../../services/use-save-domain-certificate';
import { AlertBanner } from './alert-banner';
import { CertificateContextProvider } from './certificate-context';
import { CertificateView } from './certificate-view';
import { DeleteCertificateModel } from './delete-certificate-model';
import { LoadVerifyCertificateWizard } from './load-verify-certificate-wizard';
import { useVirtualHostsForm } from './use-virtual-hosts-form';
import {
  getDefaultVirtualHostsFormValues,
  getDomainNameFromAttrs,
  getZimbraId,
} from './utils';
import { VirtualHostSection } from './virtual-host-section';

export const DomainVirtualHosts = () => {
  const [t] = useTranslation();
  const { domainId = '' } = useParams();
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const zimbraId = getZimbraId(domainInformation);
  const domainName = getDomainNameFromAttrs(domainInformation);
  const defaultValues = getDefaultVirtualHostsFormValues(domainInformation);

  const { form, handleSave, handleCancel } = useVirtualHostsForm({
    defaultValues,
    zimbraId,
  });
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  const { data: domainCertiDetails } = useDomainCert(domainId);
  const { data: domainCertificate } = useDomainSslMaterial(domainName);
  const hasCertificate = Boolean(domainCertiDetails);
  const deleteCertMutation = useDeleteDomainCertificate({ domainId: zimbraId, domainName });

  const [toggleLoadVerifyCertWizard, setToggleLoadVerifyCertWizard] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertToggle, setAlertToggle] = useState(false);

  function closeHandler(): void {
    setOpen(false);
  }

  function deleteHandler(): void {
    deleteCertMutation.mutate(undefined, {
      onSuccess: () => setOpen(false),
    });
  }

  return (
    <CertificateContextProvider
      value={{
        isCertificateAvailable: hasCertificate,
        domainId: zimbraId,
        domainName,
      }}
    >
      <Container
        height="calc(100vh - 105px)"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflowY: 'auto' }}
      >
        {toggleLoadVerifyCertWizard && (
          <ModalOverlay open={toggleLoadVerifyCertWizard}>
            <LoadVerifyCertificateWizard
              setToggleWizard={setToggleLoadVerifyCertWizard}
              setAlertToggle={setAlertToggle}
            />
          </ModalOverlay>
        )}
        {open && (
          <DeleteCertificateModel
            open={open}
            closeHandler={closeHandler}
            deleteHandler={deleteHandler}
          />
        )}
        <FormPageLayout
          title={t('label.virtual_hosts', 'Virtual Hosts')}
          unsavedChanges={isDirty}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          <Padding all="small" width="100%">
            <VirtualHostSection form={form} />
            {alertToggle && <AlertBanner onClose={() => setAlertToggle(false)} />}
            <CertificateView
              domainCertiDetails={domainCertiDetails}
              hasCertificate={hasCertificate}
              domainCertificate={domainCertificate}
              domainName={domainName}
              domainId={zimbraId}
              hasVirtualHosts={defaultValues.hosts.length > 0}
              virtualHosts={defaultValues.hosts.map((host) => host.hostname)}
              onVerifyCertificate={() => setToggleLoadVerifyCertWizard(true)}
              onRemove={() => setOpen(true)}
              onCertificateGenerated={() => setAlertToggle(true)}
            />
          </Padding>
        </FormPageLayout>
      </Container>
    </CertificateContextProvider>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, Container, ModalOverlay, Padding, Row, RouteLeavingGuard, useSnackbar, } from '@zextras/ui-components';
import { domainByIdKey, flushCache, soapFetch, useUserSettings } from '@zextras/ui-shared';
import { isEqual, mapValues, reduce } from 'lodash-es';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { objectType } from '../../../../../types';
import {
  TRUE,
  ZIMBRA_ADMIN_URN,
  ZIMBRA_DOMAIN_NAME,
  ZIMBRA_ID,
  ZIMBRA_SSL_CERTIFICATE,
  ZIMBRA_SSL_PRIVATE_KEY,
  ZIMBRA_VIRTUAL_HOSTNAME,
} from '../../../../constants';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { modifyDomain } from '../../../../services/modify-domain-service';
import { AlertBanner } from './alert-banner';
import { CertificateContext } from './certificate-context';
import { CertificateView } from './certificate-view';
import DeleteCertificateModel from './delete-certificate-model';
import { LoadVerifyCertificateWizard } from './load-verify-certificate-wizard';
import { VirtualHostSection } from './virtual-host-section';

export const DomainVirtualHosts: FC = () => {
  const [t] = useTranslation();
  const { domainId } = useParams();
  const createSnackbar = useSnackbar();
  const { data: domain } = useSelectedDomain();
  const domainInformation: any = domain?.a;
  const queryClient = useQueryClient();
  const [toggleCertiBtn, setToggleCertiBtn] = useState(true);
  const [items, setItems] = useState<any>([]);
  const [defaultItems, setDefaultItems] = useState<any>([]);
  const [domainName, setDomainName] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [zimbraId, setZimbraId] = useState('');
  const [toggleLoadVerifyCertWizard, setToggleLoadVerifyCertWizard] = useState(false);
  const [domainCertificate, setDomainCertificate] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [alertToggle, setAlertToggle] = useState(false);
  const [domainCertiDetails, setDomainCertiDetails] = useState<objectType>();
  const [isCertificateAvailable, setIsCertificateAvailable] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
  const userSetting = useUserSettings();

  useEffect(() => {
    if (userSetting?.attrs) {
      const account = userSetting?.attrs?.zimbraIsAdminAccount;
      if (account && account === TRUE) {
        setIsGlobalAdmin(true);
      }
    }
  }, [userSetting?.attrs]);

  const closeHandler = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    if (!!domainInformation && domainInformation.length > 0) {
      const zimbraIdArray = domainInformation.filter(
        (domainData: any) => domainData.n === ZIMBRA_ID,
      );
      if (zimbraIdArray && zimbraIdArray.length > 0) {
        setZimbraId(zimbraIdArray[0]._content);
      }
      const domainNameArray = domainInformation.filter(
        (domainData: any) => domainData.n === ZIMBRA_DOMAIN_NAME,
      );
      if (domainNameArray && domainNameArray.length > 0) {
        setDomainName(domainNameArray[0]._content);
      }
      const domainVirtualHostArray = domainInformation.filter(
        (domainData: any) => domainData.n === ZIMBRA_VIRTUAL_HOSTNAME,
      );
      if (domainVirtualHostArray && domainVirtualHostArray.length > 0) {
        const virtualHostItems = domainVirtualHostArray.map((domainData: any, index: any) => ({
          id: (index + 1)?.toString(),
          columns: [
            <ds-text key={index + 1} as="span" color="gray0" weight="regular">
              {domainData._content}
            </ds-text>,
          ],
        }));
        setItems(virtualHostItems);
        setDefaultItems(virtualHostItems);
      } else {
        setItems([]);
        setDefaultItems([]);
      }
    }
  }, [domainInformation]);

  useEffect(() => {
    if (!isEqual(defaultItems, items)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [defaultItems, items]);

  const onCancel = (): void => {
    setItems(defaultItems);
  };

  const onSave = (): void => {
    const body: {
      id?: string;
      _jsns?: string;
      a?: { n: string; _content?: string }[];
    } = {};
    const attributes: { n: string; _content?: string }[] = [];
    body.id = zimbraId;

    body._jsns = ZIMBRA_ADMIN_URN;
    items.forEach((item: any) => {
      if (item.columns[0]?.props?.children) {
        attributes.push({
          n: ZIMBRA_VIRTUAL_HOSTNAME,
          _content: item.columns[0]?.props?.children,
        });
      } else {
        attributes.push({
          n: ZIMBRA_VIRTUAL_HOSTNAME,
          _content: item.columns[0],
        });
      }
    });
    if (attributes?.length === 0) {
      attributes.push({
        n: ZIMBRA_VIRTUAL_HOSTNAME,
        _content: '',
      });
    }
    body.a = attributes;
    modifyDomain(body)
      .then((data) => {
        if (data?.warning && Array.isArray(data.warning) && data.warning.length > 0) {
          data.warning.forEach((warning: any) => {
            createSnackbar({
              key: `warning-${warning.type ?? Date.now()}`,
              severity: 'warning',
              label:
                warning.message ??
                t('label.warning_message', 'A warning occurred during the operation'),
              autoHideTimeout: 5000,
              hideButton: true,
              replace: false,
            });
          });
        }

        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: false,
        });
        if (isGlobalAdmin) {
          flushCache('domain', 'id', zimbraId);
        }
        const domainData: any = data?.domain?.[0];
        if (domainData) {
          queryClient.setQueryData(domainByIdKey(domainId, 1), domainData);
        }
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const handleLoadAndVerifyCert = (): void => {
    setToggleLoadVerifyCertWizard(!toggleLoadVerifyCertWizard);
  };

  const getAllCertiDetailsAPICall = useCallback((): void => {
    soapFetch('GetDomainCert', {
      _jsns: ZIMBRA_ADMIN_URN,
      domain: domainId,
    })
      .then((res: any) => {
        const data = mapValues(res?.cert[0], (value) => value[0]._content);
        setDomainCertiDetails(data);
        setToggleCertiBtn(false);
        setIsCertificateAvailable(true);
      })
      // TODO: On no cert found server always returns error so used empty catch for now

      .catch((error) => {
        if (error) {
          setIsCertificateAvailable(false);
        }
      });
    const zimbraData =
      domainInformation &&
      domainInformation.filter((item: objectType) => item.n === ZIMBRA_DOMAIN_NAME)[0]?._content;
    soapFetch(`GetDomain`, {
      _jsns: ZIMBRA_ADMIN_URN,
      attrs: 'zimbraSSLCertificate,zimbraSSLPrivateKey',
      domain: {
        by: 'name',
        _content: zimbraData,
      },
    })
      .then((response: any) => {
        if (response?.domain[0]?.a) {
          const certificates = reduce(
            response?.domain[0]?.a,
            (result, item) => ({ ...result, [item.n]: item._content }),
            {},
          );
          setDomainCertificate(certificates);
        } else {
          setDomainCertificate(null);
        }
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [createSnackbar, domainId, domainInformation, setIsCertificateAvailable, t]);

  const deleteHandler = (): void => {
    const body: {
      id?: string;
      _jsns?: string;
      a?: { n: string; _content?: string }[];
    } = {};
    const attributes: { n: string; _content?: string }[] = [];
    body.id = zimbraId;
    body._jsns = ZIMBRA_ADMIN_URN;
    attributes.push({
      n: ZIMBRA_SSL_CERTIFICATE,
      _content: '',
    });
    attributes.push({
      n: ZIMBRA_SSL_PRIVATE_KEY,
      _content: '',
    });
    body.a = attributes;
    modifyDomain(body)
      .then(() => {
        setDomainCertificate(null);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('domain.certificate_removed', `The certificates has been removed`),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        if (isGlobalAdmin) {
          flushCache('domain', 'id', zimbraId);
        }
        setOpen(false);
        getAllCertiDetailsAPICall();
        setDomainCertiDetails({});
        setToggleCertiBtn(true);
        setIsCertificateAvailable(false);
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  useEffect(() => {
    getAllCertiDetailsAPICall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertToggle]);

  const getVirtualHostsNames = (): string[] => {
    return defaultItems.map((item: any) => {
      if (item.columns[0]?.props?.children) {
        return item.columns[0].props.children;
      }
      return item.columns[0];
    });
  };

  return (
    <CertificateContext.Provider value={{ isCertificateAvailable, setIsCertificateAvailable }}>
      <Container padding={{ vertical: 'large' }} background="gray6" mainAlignment="flex-start">
      {toggleLoadVerifyCertWizard && (
        <ModalOverlay open={toggleLoadVerifyCertWizard}>
          <LoadVerifyCertificateWizard
            setToggleWizard={setToggleLoadVerifyCertWizard}
            setAlertToggle={setAlertToggle}
          />
        </ModalOverlay>
      )}
      <Container
        orientation="column"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        {open && (
          <DeleteCertificateModel
            open={open}
            closeHandler={closeHandler}
            deleteHandler={deleteHandler}
          />
        )}
        <Row mainAlignment="flex-start" width="100%">
          <Container orientation="vertical" mainAlignment="space-around" height="56px">
            <Row orientation="horizontal" width="100%">
              <Row
                padding={{ all: 'large' }}
                mainAlignment="flex-start"
                width="50%"
                crossAlignment="flex-start"
              >
                <ds-text as="h2" size="medium" weight="bold" color="gray0">
                  {t('label.virtual_hosts', 'Virtual Hosts')}
                </ds-text>
              </Row>
              <Row
                padding={{ all: 'large' }}
                width="50%"
                mainAlignment="flex-end"
                crossAlignment="flex-end"
              >
                <Padding right="small">
                  {isDirty && (
                    <Button
                      label={t('label.cancel', 'Cancel')}
                      color="secondary"
                      onClick={onCancel}
                    />
                  )}
                </Padding>
                {isDirty && (
                  <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
                )}
              </Row>
            </Row>
          </Container>
          <ds-divider></ds-divider>
        </Row>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          style={{ overflow: 'auto' }}
          width="100%"
          height="calc(100vh - 150px)"
          padding="extrasmall"
        >
          <Container width="100%">
            <VirtualHostSection items={items} setItems={setItems} />
          </Container>
          {alertToggle && <AlertBanner onClose={() => setAlertToggle(false)} />}
          <Row width="100%" padding={{ horizontal: 'large' }}>
            <ds-divider></ds-divider>
          </Row>
          <CertificateView
            domainCertiDetails={domainCertiDetails}
            toggleCertiBtn={toggleCertiBtn}
            domainCertificate={domainCertificate}
            domainName={domainName}
            domainId={zimbraId}
            hasVirtualHosts={defaultItems.length > 0}
            virtualHosts={getVirtualHostsNames()}
            onVerifyCertificate={handleLoadAndVerifyCert}
            onRemove={() => setOpen(true)}
            onCertificateGenerated={() => setAlertToggle(true)}
          />
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={onSave}>
        <ds-text as="p">
          {t(
            'label.unsaved_changes_line1',
            'Are you sure you want to leave this page without saving?',
          )}
        </ds-text>
        <ds-text as="p">{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</ds-text>
      </RouteLeavingGuard>
      </Container>
    </CertificateContext.Provider>
  );
};

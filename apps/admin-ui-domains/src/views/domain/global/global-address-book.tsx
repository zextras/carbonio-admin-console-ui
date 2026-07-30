/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Row, useSnackbar } from '@zextras/ui-components';
import { useMailstoreServers, useUserSettings } from '@zextras/ui-shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddressBookServiceStatus } from '../../../../types';
import { LDAP_ADDRESS_BOOK_SERVICE, TRUE } from '../../../constants';
import { doStartStopAddressBookService } from '../../../services/do-start-stop-address-book-service';
import { getAddressBookServices } from '../../../services/get-address-book-services';

const DEFAULT_STATUS: AddressBookServiceStatus = {
  running: false,
  couldStart: false,
  couldStop: false,
};

export function GlobalAddressBook() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: mailstoresList = [] } = useMailstoreServers();
  const userSetting = useUserSettings();
  const [serviceStatus, setServiceStatus] = useState<AddressBookServiceStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStatus, setHasLoadedStatus] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  const mailstoreNames = mailstoresList
    .map((mailbox) => mailbox?.name)
    .filter((name): name is string => Boolean(name));
  const targetServer = mailstoreNames[0];

  useEffect(() => {
    if (userSetting?.attrs?.zimbraIsAdminAccount === TRUE) {
      setIsGlobalAdmin(true);
    }
  }, [userSetting?.attrs]);

  useEffect(() => {
    if (!targetServer) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasLoadedStatus(false);

    getAddressBookServices(targetServer)
      .then((status) => {
        if (cancelled) {
          return;
        }
        setServiceStatus(status);
        setHasLoadedStatus(true);
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // Intentionally depend only on targetServer — createSnackbar/t identity must not re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable target server only
  }, [targetServer]);

  function serviceStartStop(): void {
    if (!targetServer || !isGlobalAdmin) {
      return;
    }

    const action = serviceStatus.running ? 'doStopService' : 'doStartService';
    setIsRequestInProgress(true);

    doStartStopAddressBookService(action, targetServer)
      .then(() => {
        const nextRunning = !serviceStatus.running;
        setServiceStatus({
          running: nextRunning,
          couldStart: !nextRunning,
          couldStop: nextRunning,
        });
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: nextRunning
            ? t(
                'label.ldap_address_book_service_started',
                'ldap-address-book service started',
              )
            : t(
                'label.ldap_address_book_service_stopped',
                'ldap-address-book service stopped',
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .catch((error: Error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .finally(() => {
        setIsRequestInProgress(false);
      });
  }

  const canToggle =
    isGlobalAdmin &&
    !isLoading &&
    !isRequestInProgress &&
    Boolean(targetServer) &&
    (serviceStatus.running ? serviceStatus.couldStop : serviceStatus.couldStart);

  return (
    <Container mainAlignment="flex-start" background="gray6">
      <Row mainAlignment="flex-start" width="100%">
        <Container orientation="vertical" mainAlignment="space-around" height="56px">
          <Row orientation="horizontal" width="100%">
            <Row
              padding={{ all: 'large' }}
              mainAlignment="flex-start"
              width="100%"
              crossAlignment="flex-start"
            >
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('label.global_address_book', 'Global address book')}
              </ds-text>
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
        height="calc(100vh - 9.375rem)"
        padding={{ all: 'large' }}
      >
        <Container
          orientation="horizontal"
          width="100%"
          height="fit"
          mainAlignment="space-between"
          crossAlignment="center"
          gap="1.25rem"
        >
          <Container
            width="80%"
            maxWidth="80%"
            height="fit"
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            flexGrow={1}
            flexShrink={1}
            flexBasis="80%"
            minWidth="0"
          >
            <ds-text as="p" size="small" color="gray1" overflow="break-word">
              {t(
                'label.global_address_book_service_description',
                'Start or stop the LDAP Address Book service for this installation. Additional address books are managed per domain under Manage → Address Book.',
              )}
            </ds-text>
          </Container>
          <Container
            width="fit"
            height="fit"
            orientation="vertical"
            mainAlignment="flex-start"
            crossAlignment="flex-end"
            flexGrow={0}
            flexShrink={0}
            gap="0.75rem"
            style={{ marginLeft: 'auto' }}
          >
            {hasLoadedStatus && (
              <Container
                width="fit"
                height="fit"
                orientation="horizontal"
                mainAlignment="flex-end"
                crossAlignment="center"
                gap="0.35rem"
              >
                <ds-text as="span">
                  {`${LDAP_ADDRESS_BOOK_SERVICE} ${t('label.is', 'is')}`}
                </ds-text>
                {!serviceStatus.running && (
                  <ds-text as="span" color="error">
                    {t('label.stopped', 'stopped')}
                  </ds-text>
                )}
                {serviceStatus.running && (
                  <ds-text as="span" color="primary">
                    {t('label.running', 'running')}
                  </ds-text>
                )}
              </Container>
            )}
            <Button
              type="outlined"
              label={
                serviceStatus.running
                  ? t('label.stop_service', 'Stop service')
                  : t('label.start_service', 'Start service')
              }
              color={serviceStatus.running ? 'error' : 'primary'}
              width="fit"
              onClick={serviceStartStop}
              disabled={!canToggle}
              loading={isRequestInProgress || isLoading}
              size="large"
            />
          </Container>
        </Container>
      </Container>
    </Container>
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Padding, Row, useSnackbar } from '@zextras/ui-components';
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

  const statusColor = serviceStatus.running ? 'success' : 'error';
  const statusAccentBorder = serviceStatus.running
    ? '0.25rem solid var(--color-success-regular)'
    : '0.25rem solid var(--color-error-regular)';
  const statusDotStyle = serviceStatus.running
    ? {
        width: '0.6875rem',
        height: '0.6875rem',
        borderRadius: '50%',
        background: 'var(--color-success-regular)',
        flexShrink: 0,
        marginTop: '0.375rem',
        boxShadow: '0 0 0 4px rgba(139, 195, 74, 0.15)',
      }
    : {
        width: '0.6875rem',
        height: '0.6875rem',
        borderRadius: '50%',
        background: 'var(--color-error-regular)',
        flexShrink: 0,
        marginTop: '0.375rem',
        boxShadow: '0 0 0 4px rgba(215, 73, 66, 0.12)',
      };

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
                {t('label.global_address_book', 'Global Address Book')}
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
        gap="1rem"
      >
        {isLoading && !hasLoadedStatus ? (
          <Padding all="small">
            <ds-spinner />
          </Padding>
        ) : (
          hasLoadedStatus && (
            <Container
              orientation="vertical"
              width="100%"
              maxWidth="640px"
              height="fit"
              background="gray6"
              mainAlignment="flex-start"
              crossAlignment="stretch"
              borderColor={{ top: 'gray2', right: 'gray2', bottom: 'gray2' }}
              borderRadius="half"
              style={{ borderLeft: statusAccentBorder }}
            >
              <Container
                orientation="horizontal"
                width="100%"
                height="fit"
                mainAlignment="space-between"
                crossAlignment="flex-start"
                padding={{ all: 'large' }}
                gap="1.5rem"
              >
                <Container
                  orientation="horizontal"
                  width="fill"
                  height="fit"
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  gap="0.875rem"
                  minWidth="0"
                  flexGrow={1}
                >
                  <div style={statusDotStyle} aria-hidden />
                  <Container
                    orientation="vertical"
                    width="fill"
                    height="fit"
                    mainAlignment="flex-start"
                    crossAlignment="flex-start"
                    gap="0.3125rem"
                    minWidth="0"
                  >
                    <Container
                      orientation="horizontal"
                      width="fit"
                      height="fit"
                      mainAlignment="flex-start"
                      crossAlignment="center"
                      gap="0.35rem"
                    >
                      <ds-text as="span" size="medium" weight="medium">
                        {`${LDAP_ADDRESS_BOOK_SERVICE} ${t('label.is', 'is')}`}
                      </ds-text>
                      <ds-text as="span" size="medium" weight="bold" color={statusColor}>
                        {serviceStatus.running
                          ? t('label.running', 'running')
                          : t('label.stopped', 'stopped')}
                      </ds-text>
                    </Container>
                    <ds-text as="p" size="small" color="gray1" overflow="break-word">
                      {serviceStatus.running
                        ? t(
                            'label.ldap_address_book_running_description',
                            'Shared address book folders are reachable by LDAP clients on every domain.',
                          )
                        : t(
                            'label.ldap_address_book_stopped_description',
                            'LDAP clients can’t query shared address books while the service is stopped.',
                          )}
                    </ds-text>
                  </Container>
                </Container>
              </Container>
              <Container
                orientation="horizontal"
                width="100%"
                height="fit"
                background="gray5"
                mainAlignment="space-between"
                crossAlignment="center"
                padding={{ all: 'large' }}
                gap="1rem"
                borderColor={{ top: 'gray3' }}
              >
                <Container
                  width="fill"
                  height="fit"
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  minWidth="0"
                  flexGrow={1}
                  flexShrink={1}
                >
                  <ds-text as="p" size="small" color="gray1" overflow="break-word">
                    {t(
                      'label.ldap_address_book_global_description',
                      'Applies globally, to every domain on this infrastructure.',
                    )}
                  </ds-text>
                </Container>
                <Container
                  width="fit"
                  height="fit"
                  flexGrow={0}
                  flexShrink={0}
                  mainAlignment="center"
                  crossAlignment="center"
                >
                  <Button
                    type="outlined"
                    label={
                      serviceStatus.running
                        ? t('label.stop_service', 'Stop service')
                        : t('label.start_service', 'Start service')
                    }
                    color={serviceStatus.running ? 'error' : 'success'}
                    width="fit"
                    minWidth="11.25rem"
                    onClick={serviceStartStop}
                    disabled={!canToggle}
                    loading={isRequestInProgress}
                    size="large"
                  />
                </Container>
              </Container>
            </Container>
          )
        )}
      </Container>
    </Container>
  );
}

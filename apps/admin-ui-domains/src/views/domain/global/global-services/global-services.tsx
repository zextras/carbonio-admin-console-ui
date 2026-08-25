/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, useSnackbar } from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddressBookServiceStatus } from '../../../../../types';
import { LDAP_ADDRESS_BOOK_PORT, LDAP_ADDRESS_BOOK_SERVICE, TRUE } from '../../../../constants';
import { useAddressBookServiceStatus } from '../../../../services/use-address-book-service';
import { useSetAddressBookServiceEnabled } from '../../../../services/use-set-address-book-service-enabled';
import styles from './global-services.module.css';

const DEFAULT_STATUS: AddressBookServiceStatus = {
  running: false,
  couldStart: false,
  couldStop: false,
};

export const GlobalServices = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const userSetting = useUserSettings();
  const { data, isPending, error: statusError } = useAddressBookServiceStatus();
  const setServiceEnabledMutation = useSetAddressBookServiceEnabled();
  const serviceStatus = data ?? DEFAULT_STATUS;

  const fallbackError = t(
    'label.something_wrong_error_msg',
    'Something went wrong. Please try again.',
  );

  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  useEffect(() => {
    if (statusError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: statusError.message ?? fallbackError,
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [statusError, createSnackbar, fallbackError]);

  function serviceStartStop(): void {
    if (!isGlobalAdmin) {
      return;
    }

    const nextEnabled = !serviceStatus.running;

    setServiceEnabledMutation.mutate(nextEnabled, {
      onSuccess: () => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: nextEnabled
            ? t('label.ldap_address_book_service_started', 'ldap-address-book service started')
            : t('label.ldap_address_book_service_stopped', 'ldap-address-book service stopped'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      },
      onError: (error: Error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error.message ?? fallbackError,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      },
    });
  }

  const canToggle =
    isGlobalAdmin &&
    !isPending &&
    !setServiceEnabledMutation.isPending &&
    (serviceStatus.running ? serviceStatus.couldStop : serviceStatus.couldStart);

  const statusColor = serviceStatus.running ? 'success' : 'error';
  const cardClass = serviceStatus.running ? styles.cardRunning : styles.cardStopped;
  const statusDotClass = serviceStatus.running ? styles.statusDotRunning : styles.statusDotStopped;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <ds-text as="h1" size="medium" weight="bold" color="gray0">
          {t('label.services', 'Services')}
        </ds-text>
      </div>
      <div className={styles.dividerRow}>
        <ds-divider></ds-divider>
      </div>
      <div className={styles.content}>
        {isPending ? (
          <div className={styles.spinner}>
            <ds-spinner />
          </div>
        ) : (
          !statusError && (
            <div className={`${styles.card} ${cardClass}`}>
              <div className={styles.statusArea}>
                <div className={statusDotClass} aria-hidden />
                <div className={styles.statusText}>
                  <div className={styles.statusLine}>
                    <ds-text as="span" size="medium" weight="medium">
                      {`${LDAP_ADDRESS_BOOK_SERVICE} ${t('label.is', 'is')}`}
                    </ds-text>
                    <ds-text as="span" size="medium" weight="bold" color={statusColor}>
                      {serviceStatus.running
                        ? t('label.running', 'running')
                        : t('label.stopped', 'stopped')}
                    </ds-text>
                  </div>
                  <ds-text as="p" size="small" color="gray1" overflow="break-word">
                    {serviceStatus.running
                      ? t(
                          'label.ldap_address_book_running_description',
                          'Exposed address book folders are reachable by LDAP clients on every domain.',
                        )
                      : t(
                          'label.ldap_address_book_stopped_description',
                          'LDAP clients can’t query exposed address books while the service is stopped.',
                        )}
                  </ds-text>
                  <ds-text as="p" size="small" color="gray1" overflow="break-word">
                    {t('label.ldap_address_book_port', 'Listening on port {{port}}.', {
                      port: LDAP_ADDRESS_BOOK_PORT,
                    })}
                  </ds-text>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.footerText}>
                  <ds-text as="p" size="small" color="gray1" overflow="break-word">
                    {t(
                      'label.ldap_address_book_global_description',
                      'Applies globally, to every domain on this infrastructure.',
                    )}
                  </ds-text>
                </div>
                <Button
                  type="outlined"
                  label={
                    serviceStatus.running
                      ? t('label.stop_service', 'Stop service')
                      : t('label.start_service', 'Start service')
                  }
                  color={serviceStatus.running ? 'error' : 'primary'}
                  width="fit"
                  minWidth="11.25rem"
                  onClick={serviceStartStop}
                  disabled={!canToggle}
                  loading={setServiceEnabledMutation.isPending}
                  size="large"
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

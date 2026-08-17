/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Input, LicenseBanner, Modal, Row } from '@zextras/ui-components';
import {
  type LicenseInfo,
  useActivateLicense,
  useCurrentUserRights,
  useLicenseInfo,
  useRemoveLicense,
  useVersion,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CONFIG } from '../../constants';
import { SubscriptionDetails } from './parts/subscription-details';
import { ServiceStatus } from './service-status';

type Module = {
  value: string;
  label: string;
};
type ModuleName = {
  [key: string]: Module;
};

type ModuleConfig = {
  name: string;
  quantity: string;
  enabled: boolean;
};

export type AllModuleConfig = {
  name: Module;
  quantity: string;
  enabled: boolean;
};

const moduleName: ModuleName = {
  backup_realtime: { value: 'Realtime', label: 'Backup' },
  files_basic: { value: 'Basics', label: 'Files' },
  admins_basic: { value: 'Delegated Administration', label: 'Admin' },
  storages_basic: { value: 'Basic', label: 'Storages' },
  appmail_basic: { value: 'Basic', label: 'MailApp' },
  backup_basic: { value: 'Basic', label: 'Backup' },
  mail_replica: { value: '', label: 'MailReplica' },
  storages_conn_basic: { value: 'S3 Connectors', label: 'Storages' },
  storages_centralized: { value: 'Centralized Volumes', label: 'Storages' },
  appmail_advanced: { value: 'Advanced', label: 'MailApp' },
  activesync_shared_folder: { value: 'Shared Folder', label: 'ActiveSync' },
  auth_2fa: { value: '2FA and Policies', label: 'Auth' },
  storages_hsm: { value: 'HSM', label: 'Storages' },
  files_docs_balancing: { value: 'Docs Connector', label: 'Files' },
  auth_saml: { value: 'SAML', label: 'Auth' },
  backup_ext_volume: { value: 'Export on External', label: 'Backup' },
  storages_conn_sproxyd: { value: 'Scality SproxyD Connector', label: 'Storages' },
  activesync_basic: { value: '', label: 'ActiveSync' },
  backup_import_external: { value: 'Import External', label: 'Backup' },
  wsc_basic: { value: 'Basic', label: 'Chats' },
};

const MODULE_PREDEFINED_ORDER = [
  'Storages',
  'HA',
  'Backup',
  'Auth',
  'MailApp',
  'Files',
  'ActiveSync',
  'Chats',
  'Admin',
];

function buildModules(features: Array<ModuleConfig> | undefined): Array<AllModuleConfig> {
  if (!features) return [];

  const allModules = features.map((module: ModuleConfig) => ({
    ...module,
    name: moduleName[module.name],
  }));

  const formatModules = allModules.filter((module: AllModuleConfig) => module.name !== undefined);

  const ModuleSort = (a: AllModuleConfig, b: AllModuleConfig): number => {
    const indexA = MODULE_PREDEFINED_ORDER.indexOf(a.name.label);
    const indexB = MODULE_PREDEFINED_ORDER.indexOf(b.name.label);

    if (indexA === -1 && indexB === -1) {
      return formatModules.indexOf(a) - formatModules.indexOf(b);
    }

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  };

  const sortedModules = [...formatModules].sort(ModuleSort);
  return sortedModules.filter((module: AllModuleConfig) => module.name.value !== 'SproxyD');
}

const getGapColorForLabel = (label: React.Key | null | undefined): string => {
  switch (label) {
    case 'Storages':
      return '#EF9A9A1A';
    case 'HA':
      return 'transparent';
    case 'Backup':
      return '#CE93D81A';
    case 'Auth':
      return '#F48FB11A';
    case 'MailApp':
      return '#B39DDB1A';
    case 'Files':
      return '#A5D6A71A';
    case 'ActiveSync':
      return '#80DEEA1A';
    case 'Chats':
      return '#90CAF91A';
    default:
      return 'transparent';
  }
};

type SubscriptionActionsProps = {
  readonly licenseKey: string;
  readonly onLicenseKeyChange: (value: string) => void;
  readonly canSetSubscription: boolean;
  readonly response: LicenseInfo | undefined;
  readonly activatePending: boolean;
  readonly activateRenewal: boolean;
  readonly removePending: boolean;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onRenew: () => void;
};

const SubscriptionActions = ({
  licenseKey,
  onLicenseKeyChange,
  canSetSubscription,
  response,
  activatePending,
  activateRenewal,
  removePending,
  onActivate,
  onDeactivate,
  onRenew,
}: SubscriptionActionsProps) => {
  const { t } = useTranslation();
  const showActivate = !response || response.expired;

  return (
    <Container
      orientation="horizontal"
      width="100%"
      height="fit"
      wrap="wrap"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      style={{ padding: '8px 0 16px 0' }}
    >
      <Container crossAlignment="flex-start" padding={{ right: 'medium' }} width="74%">
        <Input
          label={t('core.subscription.token', 'Token')}
          backgroundColor="gray5"
          value={licenseKey}
          disabled={!canSetSubscription}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => onLicenseKeyChange(e.target.value)}
        />
      </Container>
      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        width="26%"
        style={{ gap: '0.875rem' }}
      >
        <Button
          label={
            showActivate
              ? t('core.subscription.activate', 'Activate')
              : t('core.subscription.deactivate', 'Deactivate')
          }
          disabled={!canSetSubscription || !licenseKey || activatePending || removePending}
          type="outlined"
          color={showActivate ? 'primary' : 'error'}
          onClick={showActivate ? onActivate : onDeactivate}
          loading={activatePending && !activateRenewal}
          size="extralarge"
        />
        <Button
          label={t('core.subscription.renew', 'Renew')}
          disabled={
            !canSetSubscription || !licenseKey || !response || activatePending || removePending
          }
          type="outlined"
          color="primary"
          onClick={onRenew}
          loading={activatePending && activateRenewal}
          size="extralarge"
        />
      </Container>
    </Container>
  );
};

export const Subscription = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);

  const { data: version } = useVersion();
  const { data: licenseData, isFetching } = useLicenseInfo();
  const [licenseKey, setLicenseKey] = useState('');
  const [prevAuthToken, setPrevAuthToken] = useState<string | undefined>(undefined);
  const { data: rights } = useCurrentUserRights();
  const { t } = useTranslation();

  const activateLicenseMutation = useActivateLicense();

  const removeLicenseMutation = useRemoveLicense();
  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetSubsciption = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const services = licenseData ?? null;

  const authenticationToken = licenseData?.response?.authenticationToken;
  if (authenticationToken !== prevAuthToken) {
    setPrevAuthToken(authenticationToken);
    if (authenticationToken) {
      setLicenseKey(authenticationToken);
    }
  }

  const modules: Array<AllModuleConfig> = buildModules(licenseData?.response?.features);

  const activeLicence = (): void => {
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  const doRemoveLicense = (): void => {
    removeLicenseMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        setLicenseKey('');
      },
    });
  };

  const renewLicence = (): void => {
    activateLicenseMutation.mutate({ token: licenseKey, renewal: true });
  };

  const accountCount = services?.response?.accountCount ?? 0;
  const licensedUsers = Number(services?.response?.licensedUsers ?? '0');
  const calculatedAccountQuotaSizePercentage: number =
    licensedUsers === 0 ? 0 : (accountCount / licensedUsers) * 100;

  if (isFetching) {
    return <ds-spinner></ds-spinner>;
  }

  return (
    <Container maxWidth="100%" mainAlignment="flex-start" background="gray6">
      <LicenseBanner />
      <Container
        orientation="horizontal"
        mainAlignment="space-around"
        background="gray6"
        height="58px"
      >
        <Row
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="100%"
          padding={{ all: 'large' }}
        >
          <Row mainAlignment="flex-start" crossAlignment="flex-start">
            <ds-text as="h2" size="medium" weight="bold" color="gray0">
              {t('label.details', 'Details')}
            </ds-text>
          </Row>
        </Row>
      </Container>

      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
      <Container
        mainAlignment="flex-start"
        padding={{ all: 'large' }}
        orientation="column"
        crossAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 200px)"
      >
        <Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'large' }}>
          <ds-text as="label" weight="bold">
            {t('core.subscription.activation', 'Activation')}
          </ds-text>
        </Row>
        <SubscriptionActions
          licenseKey={licenseKey}
          onLicenseKeyChange={setLicenseKey}
          canSetSubscription={allowSetSubsciption}
          response={licenseData?.response}
          activatePending={activateLicenseMutation.isPending}
          activateRenewal={!!activateLicenseMutation.variables?.renewal}
          removePending={removeLicenseMutation.isPending}
          onActivate={activeLicence}
          onDeactivate={(): void => setOpen(true)}
          onRenew={renewLicence}
        />
        <SubscriptionDetails
          response={licenseData?.response}
          version={version}
          accountQuotaPercentage={calculatedAccountQuotaSizePercentage}
        />
        <Row
          width="fill"
          mainAlignment="flex-start"
          padding={{ top: 'large', bottom: 'large', right: 'large' }}
        >
          <ds-text as="label" weight="bold">
            {t('core.subscription.modules', 'Modules')}
          </ds-text>
        </Row>
        <Container
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          wrap="wrap"
          height="fit"
        >
          {modules.map((module: AllModuleConfig, index: number) => (
            <>
              {index > 0 && (
                <Container
                  style={{
                    width: '2.25rem',
                    height: '7.688rem',
                    background:
                      module.name.label !== modules[index - 1].name.label
                        ? 'transperent'
                        : getGapColorForLabel(module.name.label),
                  }}
                />
              )}
              <ServiceStatus key={module.name.label} data={module} />
            </>
          ))}
        </Container>
        <ds-divider style={{ marginBlockStart: '2rem' }}></ds-divider>
      </Container>
      <Modal
        title={t('core.subscription.modal.label', 'Deactivate Token')}
        open={open}
        onClose={(): void => setOpen(false)}
        customFooter={
          <>
            <Button
              label={t('core.subscription.modal.cancel', 'NO')}
              color="secondary"
              onClick={(): void => setOpen(false)}
            />
            <Container width="0.5rem" />
            <Button
              color="error"
              label={t('core.subscription.modal.deactivate', 'Yes, Deactivate')}
              onClick={doRemoveLicense}
              loading={removeLicenseMutation.isPending}
            />
          </>
        }
        showCloseIcon
      >
        <ds-text as="p" overflow="break-word">
          {t(
            'core.subscription.modal.warning',
            'You are trying to deactivate the current token.Doing so will disable all the enabled features.',
          )}
        </ds-text>

        <ds-text as="p" overflow="break-word">
          {t('core.subscription.modal.confirm', 'Are you sure you want to proceed?')}
        </ds-text>
      </Modal>
    </Container>
  );
};

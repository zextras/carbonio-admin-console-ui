/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  DefaultTabBarItem,
  getFieldErrorProps,
  Input,
  Padding,
  PasswordInput,
  Row,
  Select,
  type SelectItem,
  Switch,
  TabBar,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type S3ConnectorRow,
  type TestS3ConnectorRequest,
  type UpdateS3ConnectorRequest,
} from '../../../types';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { testS3Connector, updateS3Connector } from '../../services/s3-connector-service';
import { useListS3Regions } from '../../services/use-list-s3-regions';
import { EditS3ConnectorUsageTable } from './parts/edit-s3-connector-usage-table';
import { CheckResult, VerifyError } from './parts/verify/verify-error';
import { VerifyProgress } from './parts/verify/verify-progress';
import { VerifySuccess } from './parts/verify/verify-success';
import {
  CUSTOM_REGION_VALUE,
  NO_REGION_VALUE,
  S3_CONNECTOR_VALIDATION_MESSAGES,
  s3ConnectorSchema,
} from './s3-connector-schema';
import type { S3ConnectorFormValues } from './s3-connector-types';
import { parseBackupUsage, parseVolumeUsage } from './utils/s3-connector-usage';
import { VerifyChangesModal } from './verify-changes-modal';

const GENERAL_TAB = 'general';
const VOLUMES_TAB = 'volumes';
const BACKUP_TAB = 'backup';

function isConnectorUnused(connectorDetail: S3ConnectorRow | undefined): boolean {
  const usageCandidates = [
    connectorDetail?.['usage in external backup'],
    connectorDetail?.['usage in powerstore volumes'],
    connectorDetail?.['usage in powerstore volume'],
    connectorDetail?.usage,
  ];

  return usageCandidates.every((value) => {
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === '' || normalized === 'unused' || normalized === '-' || normalized === 'none';
    }
    return !value;
  });
}

type ReusedDefaultTabBarProps = {
  item: { id: string; label: string };
  index: number;
  selected: boolean;
  onClick: () => void;
};

function ReusedDefaultTabBar({
  item,
  index,
  selected,
  onClick,
}: ReusedDefaultTabBarProps) {
  return (
  <DefaultTabBarItem
    item={item}
    tabIndex={index}
    selected={selected}
    onClick={onClick}
    orientation="horizontal"
    background="gray6"
    underlineColor="primary"
    forceWidthEquallyDistributed={false}
  >
    <Row padding="small">
      <ds-text size="small" color={selected ? 'primary' : 'gray'} as="span">
        {item.label}
      </ds-text>
    </Row>
  </DefaultTabBarItem>
  );
}

type EditS3ConnectorDetailPanelProps = {
  setShowEditDetailView: (value: boolean) => void;
  title: string;
  setConnectorDeleteName: (value: S3ConnectorRow | undefined) => void;
  connectorDetail: S3ConnectorRow | undefined;
  setOpen: (value: boolean) => void;
  getConnectorListType: () => void;
};

function computeRegionValue(
  initialRegionValue: string,
  baseRegions: Array<SelectItem<string>>,
): string {
  if (!initialRegionValue) {
    return NO_REGION_VALUE;
  }
  if (baseRegions.some((item) => item.value === initialRegionValue)) {
    return initialRegionValue;
  }
  return CUSTOM_REGION_VALUE;
}

function buildRegionLabel(
  regionValue: string,
  isCustomRegion: boolean,
  customRegionValue: string,
  regionLabel: string | undefined,
): string {
  if (regionValue === NO_REGION_VALUE) {
    return '';
  }
  if (isCustomRegion) {
    return customRegionValue.trim() || '-';
  }
  return String(regionLabel ?? regionValue ?? '-');
}

export function EditS3ConnectorDetailPanel({
  setShowEditDetailView,
  title,
  connectorDetail,
  setConnectorDeleteName,
  setOpen,
  getConnectorListType,
}: EditS3ConnectorDetailPanelProps) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: rawRegions = [] } = useListS3Regions();
  const baseRegions: Array<SelectItem<string>> = rawRegions.map((region) => ({
    value: region.id,
    label: `${region.description}, [${region.id}]`,
  }));
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [checkDetails, setCheckDetails] = useState<CheckResult | undefined>(undefined);
  const [showVerifyResult, setShowVerifyResult] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const [isVerifyError, setIsVerifyError] = useState(false);
  const [selectedTab, setSelectedTab] = useState(GENERAL_TAB);

  const initialInsecureHttps = String(connectorDetail?.insecureHttps ?? true) === 'true';
  const initialRegionValue = connectorDetail?.region ?? '';

  const computedRegionValue = computeRegionValue(initialRegionValue, baseRegions);

  const form = useForm({
    defaultValues: {
      bucketLabel: connectorDetail?.label ?? '',
      bucketName: connectorDetail?.bucketName ?? '',
      accessKey: connectorDetail?.accessKey ?? '',
      secretKey: connectorDetail?.secret ?? '',
      url: connectorDetail?.url ?? '',
      prefix: connectorDetail?.prefix ?? '',
      customRegion:
        computedRegionValue === CUSTOM_REGION_VALUE ? initialRegionValue : '',
      regionValue: computedRegionValue,
      acceptUntrustedSSL: initialInsecureHttps,
    } as S3ConnectorFormValues,
    validators: { onChange: s3ConnectorSchema },
    onSubmit: async () => {},
  });

  useEffect(() => {
    form.setFieldValue('regionValue', computedRegionValue);
    form.setFieldValue(
      'customRegion',
      computedRegionValue === CUSTOM_REGION_VALUE ? initialRegionValue : '',
    );
  }, [computedRegionValue, initialRegionValue, form]);

  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const values = useSelector(form.store, (s) => s.values);
  const regionValue = values.regionValue;
  const isCustomRegion = regionValue === CUSTOM_REGION_VALUE;
  const isEndpointUrlRequired = isCustomRegion || regionValue === NO_REGION_VALUE;

  const regionSelection = (() => {
    const regionItems = [
      { label: t('label.region_none', 'None'), value: NO_REGION_VALUE },
      { label: t('label.region_set_custom', 'Set custom'), value: CUSTOM_REGION_VALUE },
      ...baseRegions,
    ];
    return regionItems.find((item) => item.value === regionValue) ?? { value: '', label: '' };
  })();

  const volumeUsageRows = parseVolumeUsage(connectorDetail?.['usage in powerstore volumes']).map((row) => ({
    server: row.server,
    volume: row.volume,
  }));

  const backupUsageRows = parseBackupUsage(connectorDetail?.['usage in external backup']).map((row) => ({
    server: row.server,
  }));

  const volumeHeaders = [
    { id: 'server', label: t('label.server', 'Server'), bold: true, width: '50%' },
    { id: 'volume', label: t('label.volume', 'Volume'), bold: true, width: '50%' },
  ];

  const backupHeaders = [
    { id: 'server', label: t('label.server_name', 'Server name'), bold: true, width: '100%' },
  ];

  const tabItems = [
    { id: GENERAL_TAB, label: t('label.general', 'GENERAL').toUpperCase(), CustomComponent: ReusedDefaultTabBar },
    { id: VOLUMES_TAB, label: t('label.volumes', 'VOLUMES').toUpperCase(), CustomComponent: ReusedDefaultTabBar },
    { id: BACKUP_TAB, label: t('label.backup', 'BACKUP').toUpperCase(), CustomComponent: ReusedDefaultTabBar },
  ];

  const currentRegionValue = isCustomRegion ? values.customRegion : regionValue;

  const changedFields: Array<{ label: string; value: string }> = [];
  if (values.bucketLabel !== (connectorDetail?.label ?? '')) {
    changedFields.push({ label: t('label.descriptive_name', 'Descriptive name'), value: values.bucketLabel.trim() || '-' });
  }
  if (values.url !== (connectorDetail?.url ?? '')) {
    changedFields.push({ label: t('label.endpoint_url', 'Endpoint URL'), value: values.url.trim() || '-' });
  }
  if (currentRegionValue !== initialRegionValue) {
    const regionLabel = regionValue === NO_REGION_VALUE
      ? t('label.region_none', 'None')
      : buildRegionLabel(regionValue, isCustomRegion, values.customRegion, regionSelection?.label);
    changedFields.push({ label: t('label.region', 'Region'), value: regionLabel });
  }
  if (values.bucketName !== (connectorDetail?.bucketName ?? '')) {
    changedFields.push({ label: t('label.bucket_name', 'Bucket name'), value: values.bucketName.trim() || '-' });
  }
  if (values.accessKey !== (connectorDetail?.accessKey ?? '')) {
    changedFields.push({ label: t('label.access_key', 'Access Key ID'), value: values.accessKey.trim() || '-' });
  }
  if (values.secretKey !== (connectorDetail?.secret ?? '')) {
    changedFields.push({ label: t('label.secret_key', 'Secret Access Key'), value: '********' });
  }
  if (values.acceptUntrustedSSL !== initialInsecureHttps) {
    changedFields.push({
      label: t('buckets.accept_untrusted_ssl', 'Accept untrusted SSL certificates'),
      value: values.acceptUntrustedSSL ? t('label.yes', 'Yes') : t('label.no', 'No'),
    });
  }

  const showDeleteConnector = isConnectorUnused(connectorDetail);

  async function saveChanges(): Promise<{ ok: boolean; errorDetails?: CheckResult }> {
    const v = form.state.values;

    const payload: UpdateS3ConnectorRequest = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'updateS3Connector',
      uuid: connectorDetail?.uuid ?? '',
      iAmSure: true,
      insecureHttps: v.acceptUntrustedSSL,
    };

    if (v.bucketLabel !== (connectorDetail?.label ?? '')) payload.label = v.bucketLabel;
    if (v.bucketName !== (connectorDetail?.bucketName ?? '')) payload.bucketName = v.bucketName;
    if (v.accessKey !== (connectorDetail?.accessKey ?? '')) payload.accessKey = v.accessKey;
    if (v.secretKey !== (connectorDetail?.secret ?? '')) payload.secret = v.secretKey;
    if (v.url !== (connectorDetail?.url ?? '')) payload.url = v.url;
    if (currentRegionValue !== initialRegionValue) payload.region = currentRegionValue;

    const updateResData = await updateS3Connector(payload);

    if (updateResData?.ok) {
      getConnectorListType();
      return { ok: true };
    }

    const errorDetails =
      typeof updateResData?.error === 'string' ? undefined : updateResData?.error?.details;
    return { ok: false, errorDetails };
  }

  async function onVerifyAndSaveChanges(): Promise<void> {
    await form.handleSubmit();
    if (form.state.isValid) {
      if (isDirty && changedFields.length > 0) {
        setIsVerifyModalOpen(true);
      } else if (!isDirty) {
        createSnackbar({
          key: 'no-changes',
          severity: 'info',
          label: t('label.no_changes_have_been_made', 'No changes have been made'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    }
  }

  async function onApplyChanges(): Promise<void> {
    setIsVerifyModalOpen(false);
    setShowVerifyResult(false);
    setIsVerifySuccess(false);
    setIsVerifyError(false);
    setIsVerifyPending(true);

    const { ok, errorDetails } = await saveChanges();

    if (ok) {
      setIsVerifySuccess(true);
    } else {
      setCheckDetails(errorDetails);
      setIsVerifyError(true);
    }
    setShowVerifyResult(true);
    setIsVerifyPending(false);
  }

  async function onTestConnection(): Promise<void> {
    setShowVerifyResult(false);
    setIsVerifySuccess(false);
    setIsVerifyError(false);
    setIsVerifyPending(true);

    try {
      const v = form.state.values;
      const payload: TestS3ConnectorRequest = {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'testS3Connector',
        uuid: connectorDetail?.uuid ?? '',
        label: v.bucketLabel,
        bucketName: v.bucketName,
        accessKey: v.accessKey,
        secret: v.secretKey,
        url: v.url,
        region: currentRegionValue,
        insecureHttps: v.acceptUntrustedSSL,
      };

      const response = await testS3Connector(payload);

      if (response?.ok) {
        setIsVerifySuccess(true);
      } else {
        const errorDetails =
          typeof response?.error === 'string' ? undefined : (response?.error?.details as CheckResult | undefined);
        setCheckDetails(errorDetails);
        setIsVerifyError(true);
      }
    } catch {
      setCheckDetails(undefined);
      setIsVerifyError(true);
    } finally {
      setShowVerifyResult(true);
      setIsVerifyPending(false);
    }
  }

  function handleProgressComplete(): void {
    setShowVerifyResult(true);
  }

  function handleSuccessComplete(): void {
    setShowVerifyResult(false);
    setIsVerifySuccess(false);
  }

  return (
    <>
      <Container background="gray6">
        <Row
          mainAlignment="flex-start"
          crossAlignment="center"
          orientation="horizontal"
          background="white"
          width="fill"
          height="4.15rem"
        >
          <Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
            <ds-text as="h1" weight="bold" size="large">
              {title}
            </ds-text>
          </Row>
          <Row padding={{ horizontal: 'small' }}>
            <Button
              type="ghost"
              color="text"
              icon="CloseOutline"
              onClick={(): void => setShowEditDetailView(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>
        <Row
          padding={{ all: 'small' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          background="white"
          width="fill"
        >
          <TabBar
            items={tabItems as unknown as Array<{ id: string; label: string }>}
            selected={selectedTab}
            onChange={(ev: unknown, selectedId: string): void => {
              setSelectedTab(selectedId);
            }}
            width="100%"
            background="gray6"
          />
          <ds-divider></ds-divider>
        </Row>
        <Container
          padding={{ left: 'large', right: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          background="white"
          style={{ overflow: 'auto' }}
        >
          {selectedTab === GENERAL_TAB && (
            <Container
              padding={{ all: 'large' }}
              mainAlignment="flex-start"
              crossAlignment="flex-start"
            >
              <Row width="100%" mainAlignment="flex-start" padding={{ top: 'small' }}>
                <ds-text as="span" size="extrasmall" color="secondary">
                  {t('label.id', 'ID')}
                </ds-text>
              </Row>
              <Row width="100%" mainAlignment="flex-start" padding={{ top: 'extrasmall' }}>
                <ds-text as="span" size="small" color="gray1" weight="bold">
                  {connectorDetail?.uuid}
                </ds-text>
              </Row>

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <form.Field name="bucketLabel">
                  {(field) => {
                    const error = getFieldErrorProps(field, isSubmitted, t, S3_CONNECTOR_VALIDATION_MESSAGES);
                    return (
                      <Input
                        backgroundColor="gray5"
                        label={t('storages.s3Connectors.descriptiveName', 'Descriptive name*')}
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                        hasError={error.hasError}
                        description={error.description}
                      />
                    );
                  }}
                </form.Field>
              </Row>

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <form.Field name="bucketName">
                  {(field) => {
                    const error = getFieldErrorProps(field, isSubmitted, t, S3_CONNECTOR_VALIDATION_MESSAGES);
                    return (
                      <Input
                        backgroundColor="gray5"
                        label={t('storages.s3Connectors.bucketName', 'Bucket name*')}
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                        hasError={error.hasError}
                        description={error.description}
                      />
                    );
                  }}
                </form.Field>
              </Row>

              <Row width="100%" padding={{ top: 'large' }}>
                <Row width="48%" mainAlignment="flex-start" style={{ display: 'inline', height: '100%' }}>
                  <form.Field name="accessKey">
                    {(field) => (
                      <Input
                        backgroundColor="gray5"
                        label={t('label.access_key', 'Access Key ID*')}
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </Row>
                <Padding horizontal="small" />
                <Row width="48%" mainAlignment="flex-end" style={{ display: 'inline', height: '100%' }}>
                  <form.Field name="secretKey">
                    {(field) => (
                      <PasswordInput
                        backgroundColor="gray5"
                        label={t('label.secret_key', 'Secret Access Key*')}
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </Row>
              </Row>

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <form.Field name="regionValue">
                  {(field) => (
                    <Select
                      items={[
                        { label: t('label.region_none', 'None'), value: NO_REGION_VALUE },
                        { label: t('label.region_set_custom', 'Set custom'), value: CUSTOM_REGION_VALUE },
                        ...baseRegions,
                      ]}
                      background="gray5"
                      label={t('label.region', 'Region')}
                      selection={regionSelection}
                      showCheckbox={false}
                      onChange={(e: string | null): void => field.handleChange(e ?? NO_REGION_VALUE)}
                    />
                  )}
                </form.Field>
              </Row>

              {isCustomRegion && (
                <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                  <form.Field name="customRegion">
                    {(field) => {
                      const error = getFieldErrorProps(field, isSubmitted, t, S3_CONNECTOR_VALIDATION_MESSAGES);
                      return (
                        <Input
                          backgroundColor="gray5"
                          label={t('label.custom_region', 'Custom region')}
                          value={field.state.value}
                          onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                          hasError={error.hasError}
                          description={error.description}
                        />
                      );
                    }}
                  </form.Field>
                </Row>
              )}

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <form.Field name="url">
                  {(field) => {
                    const error = getFieldErrorProps(field, isSubmitted, t, S3_CONNECTOR_VALIDATION_MESSAGES);
                    return (
                      <Input
                        backgroundColor="gray5"
                        label={
                          isEndpointUrlRequired
                            ? t('label.endpoint_url_required', 'Endpoint URL*')
                            : t('label.endpoint_url', 'Endpoint URL')
                        }
                        value={field.state.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => field.handleChange(e.target.value)}
                        hasError={error.hasError}
                        description={error.description}
                      />
                    );
                  }}
                </form.Field>
                <Padding top="extrasmall">
                  <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
                    {t(
                      'buckets.endpoint_url_help',
                      'The endpoint URL of your storage provider. Not needed if your connector are AWS',
                    )}
                  </ds-text>
                </Padding>
              </Row>

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <Input
                  backgroundColor="gray5"
                  disabled
                  label={t('label.prefix', 'Prefix')}
                  defaultValue={connectorDetail?.prefix ?? ''}
                  onChange={(): void => {}}
                />
              </Row>

              <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
                <ds-text weight="bold" color="gray0" size="small">
                  {t('storages.s3Connectors.security', 'Security')}
                </ds-text>
              </Row>
              <Row width="100%" padding={{ top: 'small' }} mainAlignment="space-between">
                <Row width="90%" mainAlignment="flex-start">
                  <form.Field name="acceptUntrustedSSL">
                    {(field) => (
                      <Switch
                        label={t('buckets.accept_untrusted_ssl', 'Accept untrusted SSL certificates')}
                        value={field.state.value}
                        onClick={(): void => field.handleChange(!field.state.value)}
                        iconColor="primary"
                      />
                    )}
                  </form.Field>
                </Row>
                <Row width="10%" mainAlignment="flex-end">
                  <Tooltip
                    placement="top"
                    label={t(
                      'storages.s3Connectors.untrustedSSLTooltip',
                      'Use this only for testing environments or internal infrastructure with custom certificates. Not recommended for production.',
                    )}
                  >
                    <ds-text as="span">
                      <ds-icon icon="InfoOutline" size="large" color="gray0"></ds-icon>
                    </ds-text>
                  </Tooltip>
                </Row>
              </Row>
              <Row width="100%" padding={{ top: 'extrasmall', left: '2rem' }} mainAlignment="flex-start">
                <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
                  {t(
                    'buckets.untrusted_ssl_hint',
                    'Allow connections with self-signed or unverifiable certificates.',
                  )}
                </ds-text>
              </Row>
            </Container>
          )}
          {selectedTab === VOLUMES_TAB && (
            <EditS3ConnectorUsageTable
              rows={volumeUsageRows}
              columnKeys={['server', 'volume']}
              headers={volumeHeaders}
              searchLabel={t('storages.s3Connectors.filterVolumesList', 'Filter volumes list')}
            />
          )}
          {selectedTab === BACKUP_TAB && (
            <EditS3ConnectorUsageTable
              rows={backupUsageRows}
              columnKeys={['server']}
              headers={backupHeaders}
              searchLabel={t('storages.s3Connectors.filterBackupList', 'Filter backup list')}
            />
          )}
        </Container>

        <ds-divider></ds-divider>
        <Row
          width="100%"
          background="white"
          padding={{ all: 'large' }}
          mainAlignment="space-between"
          crossAlignment="center"
        >
          <Row width="auto" mainAlignment="flex-start">
            <Tooltip
              placement="top"
              label={
                showDeleteConnector
                  ? ''
                  : t(
                      'label.delete_connector_disabled_tooltip',
                      'S3 connector is in use and cannot be deleted',
                    )
              }
            >
              <Button
                type="ghost"
                color="error"
                label={t('label.delete_connector', 'DELETE CONNECTOR')}
                onClick={(): void => {
                  setConnectorDeleteName(connectorDetail);
                  setOpen(true);
                }}
                disabled={!showDeleteConnector}
              />
            </Tooltip>
          </Row>
          <Row width="auto" mainAlignment="flex-end">
            <Padding right="small">
              <Button
                type="outlined"
                color="primary"
                label={t('storages.s3Connectors.testConnection', 'Test Connection')}
                onClick={(): void => void onTestConnection()}
                disabled={isVerifyPending || !connectorDetail?.uuid}
              />
            </Padding>
            <Button
              type="default"
              color="primary"
              label={t('label.verify_and_save_changes', 'VERIFY & SAVE CHANGES')}
              onClick={onVerifyAndSaveChanges}
              disabled={isVerifyPending || changedFields.length === 0}
            />
          </Row>
        </Row>
      </Container>
      <VerifyChangesModal
        open={isVerifyModalOpen}
        changedFields={changedFields}
        closeHandler={(): void => setIsVerifyModalOpen(false)}
        applyHandler={onApplyChanges}
      />
      <VerifyProgress isPending={isVerifyPending} onComplete={handleProgressComplete} />
      <VerifySuccess isSuccess={showVerifyResult && isVerifySuccess} onComplete={handleSuccessComplete} />
      <VerifyError
        isError={showVerifyResult && isVerifyError}
        checkDetails={checkDetails}
        onRetry={(): void => setShowVerifyResult(false)}
      />
    </>
  );
}


/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Input,
  Padding,
  PasswordInput,
  Row,
  Select,
  SelectItem,
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { objectType, TestConnectionObjectType } from '../../../types';
import { ALIBABA, ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import { BucketRegions, BucketRegionsInAlibaba } from '../utility/utils';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;
const CUSTOM_REGION_VALUE = 'SET_CUSTOM_REGION';

function isBucketUnused(bucketDetail: objectType | undefined): boolean {
  const usageCandidates = [
    bucketDetail?.['usage in external backup'],
    bucketDetail?.['usage in powerstore volumes'],
    bucketDetail?.['usage in powerstore volume'],
    bucketDetail?.usage,
  ];

  return usageCandidates.every((value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === '' || normalized === 'unused' || normalized === '-' || normalized === 'none';
    }

    return !value;
  });
}

type EditBucketDetailPanelProps = {
  setShowEditDetailView: (value: boolean) => void;
  title: string;
  setBucketDeleteName: (value: objectType | undefined) => void;
  bucketDetail: objectType | undefined;
  setOpen: (value: boolean) => void;
  getBucketListType: () => void;
  setSelectedRow: (value: objectType | undefined) => void;
  setToggleForGetAPICall: (value: boolean) => void;
  toggleForGetAPICall: boolean;
};

const EditBucketDetailPanel: FC<EditBucketDetailPanelProps> = ({
  setShowEditDetailView,
  title,
  bucketDetail,
  setBucketDeleteName,
  setOpen,
  getBucketListType,
  setSelectedRow,
  setToggleForGetAPICall,
  toggleForGetAPICall,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { selectedServerName } = useBucketVolumeStore((state) => state);

  const bucketRegions = useMemo(() => BucketRegions(t), [t]);
  const bucketRegionsInAlibaba = useMemo(() => BucketRegionsInAlibaba(t), [t]);
  const baseRegions = useMemo(
    () =>
      bucketDetail?.storeType?.toUpperCase() === ALIBABA.toUpperCase()
        ? bucketRegionsInAlibaba
        : bucketRegions,
    [bucketDetail?.storeType, bucketRegions, bucketRegionsInAlibaba],
  );

  const initialRegion = useMemo(
    () =>
      baseRegions.find((item) => item.value === bucketDetail?.region) || {
        label: t('label.region_set_custom', 'Set custom'),
        value: CUSTOM_REGION_VALUE,
      },
    [baseRegions, bucketDetail?.region, t],
  );

  const [bucketLabel, setBucketLabel] = useState(bucketDetail?.label ?? '');
  const [bucketName, setBucketName] = useState(bucketDetail?.bucketName ?? '');
  const [accessKeyData, setAccessKeyData] = useState(bucketDetail?.accessKey ?? '');
  const [secretKey, setSecretKey] = useState(bucketDetail?.secret ?? '');
  const [urlData, setUrlData] = useState(bucketDetail?.url ?? '');
  const [prefix, setPrefix] = useState(bucketDetail?.prefix ?? '');
  const [prefixConfirm, setPrefixConfirm] = useState(true);
  const [regionSelection, setRegionSelection] = useState(initialRegion);
  const [isCustomRegion, setIsCustomRegion] = useState(
    initialRegion.value === CUSTOM_REGION_VALUE,
  );
  const [customRegion, setCustomRegion] = useState(
    initialRegion.value === CUSTOM_REGION_VALUE ? bucketDetail?.region ?? '' : '',
  );
  const [acceptUntrustedSSL, setAcceptUntrustedSSL] = useState(true);

  const [verifyError, setVerifyError] = useState('');
  const [requestError, setRequestError] = useState('');

  const currentRegionValue = isCustomRegion ? customRegion : regionSelection?.value;
  const initialRegionValue = bucketDetail?.region ?? '';

  const isDirty =
    bucketLabel !== (bucketDetail?.label ?? '') ||
    bucketName !== (bucketDetail?.bucketName ?? '') ||
    accessKeyData !== (bucketDetail?.accessKey ?? '') ||
    secretKey !== (bucketDetail?.secret ?? '') ||
    urlData !== (bucketDetail?.url ?? '') ||
    prefix !== (bucketDetail?.prefix ?? '') ||
    currentRegionValue !== initialRegionValue;

  const showDeleteConnector = isBucketUnused(bucketDetail);

  useEffect(() => {
    setSelectedRow(bucketDetail);
  }, [bucketDetail, setSelectedRow]);

  async function verifyConnector(): Promise<boolean> {
    if (!bucketDetail?.uuid) {
      return false;
    }

    const objToSendTestConnection: TestConnectionObjectType = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxCore',
      action: 'testS3Connection',
      targetServers: selectedServerName,
      bucketId: bucketDetail.uuid,
    };

    if (selectedServerName === '') {
      delete objToSendTestConnection.targetServers;
    }

    const res = await fetchSoap('zextras', objToSendTestConnection);
    const response = JSON.parse(res.Body.response.content);

    if (
      response.ok ||
      (response.ok === true &&
        response.response[selectedServerName] &&
        response.response[selectedServerName].ok)
    ) {
      setVerifyError('');
      return true;
    }

    const errorResponse =
      response.error ||
      response.response[selectedServerName]?.error ||
      response.response[selectedServerName]?.error?.message;

    const errorResponsePart = String(errorResponse).split(bucketDetail.uuid);
    const errorStoreTypeMessage = errorResponsePart[1]?.replace('as', '') || bucketDetail?.storeType;

    setVerifyError(
      t(
        'label.bucket_verification_failed_message',
        'Verification Failed Could not test bucket configuration. {{bucketType}} not supported for this connection (ID: {{bucketId}})',
        {
          bucketType: errorStoreTypeMessage,
          bucketId: bucketDetail?.uuid,
        },
      ),
    );

    return false;
  }

  async function saveChanges(): Promise<boolean> {
    if (!isDirty) {
      return true;
    }

    const payload: TestConnectionObjectType = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxCore',
      action: 'doUpdateBucket',
      bucketConfigurationId: bucketDetail?.uuid,
      storeType: bucketDetail?.storeType,
    };

    if (bucketLabel !== (bucketDetail?.label ?? '')) {
      payload.label = bucketLabel;
    }
    if (bucketName !== (bucketDetail?.bucketName ?? '')) {
      payload.bucketName = bucketName;
    }
    if (accessKeyData !== (bucketDetail?.accessKey ?? '')) {
      payload.accessKey = accessKeyData;
    }
    if (secretKey !== (bucketDetail?.secret ?? '')) {
      payload.secret = secretKey;
    }
    if (urlData !== (bucketDetail?.url ?? '')) {
      payload.url = urlData;
    }
    if (prefix !== (bucketDetail?.prefix ?? '')) {
      payload.prefix = prefix;
    }
    if (currentRegionValue !== initialRegionValue) {
      payload.region = currentRegionValue;
    }

    const res = await fetchSoap('zextras', payload);
    const updateResData = JSON.parse(res?.Body?.response?.content);

    if (updateResData?.ok) {
      getBucketListType();
      setToggleForGetAPICall(!toggleForGetAPICall);
      setRequestError('');
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.changes_have_been_updated', '{{message}}', {
          message: updateResData?.response?.message || updateResData?.message,
        }),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return true;
    }

    setRequestError(updateResData?.error?.message || updateResData?.error || '');
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: t('label.error', '{{message}}', {
        message: updateResData?.error?.message || updateResData?.error,
      }),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });

    return false;
  }

  async function onVerifyAndSaveChanges(): Promise<void> {
    if (!prefixConfirm) {
      return;
    }

    if (isCustomRegion && customRegion.trim() === '') {
      return;
    }

    const saved = await saveChanges();
    if (!saved) {
      return;
    }

    await verifyConnector();
  }

  return (
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
          <ds-text as="h2" weight="bold">
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
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
        <Row width="100%" mainAlignment="flex-start" padding={{ top: 'small' }}>
          <ds-text as="span" size="extrasmall" color="secondary">
            {t('label.id', 'ID')}
          </ds-text>
        </Row>
        <Row width="100%" mainAlignment="flex-start" padding={{ top: 'extrasmall' }}>
          <ds-text as="span" size="small" color="gray1" weight="bold">
            {bucketDetail?.uuid}
          </ds-text>
        </Row>

        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('label.descriptive_name', 'Descriptive name*')}
            value={bucketLabel}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setBucketLabel(ev.target.value);
            }}
          />
        </Row>

        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('label.bucket_name', 'Bucket name*')}
            value={bucketName}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setBucketName(ev.target.value);
            }}
          />
        </Row>

        <Row width="100%" padding={{ top: 'large' }}>
          <Row width="48%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.access_key', 'Access Key ID*')}
              value={accessKeyData}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setAccessKeyData(ev.target.value);
              }}
            />
          </Row>
          <Padding horizontal="small" />
          <Row width="48%" mainAlignment="flex-end">
            <PasswordInput
              backgroundColor="gray5"
              label={t('label.secret_key', 'Secret Access Key*')}
              value={secretKey}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setSecretKey(ev.target.value);
              }}
            />
          </Row>
        </Row>

        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('label.endpoint_url', 'Endpoint URL')}
            value={urlData}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setUrlData(ev.target.value);
            }}
          />
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
          <Select
            items={[
              ...baseRegions,
              {
                label: t('label.region_set_custom', 'Set custom'),
                value: CUSTOM_REGION_VALUE,
              },
            ]}
            background="gray5"
            label={t('label.region', 'Region')}
            selection={regionSelection}
            showCheckbox={false}
            onChange={(selectedValue): void => {
              const regionValue = Array.isArray(selectedValue)
                ? (selectedValue[0] as SelectItem<string> | undefined)?.value
                : selectedValue;

              if (regionValue !== CUSTOM_REGION_VALUE && typeof regionValue !== 'string') {
                return;
              }

              const nextSelection =
                typeof regionValue === 'string' ? regionValue : CUSTOM_REGION_VALUE;

              if (nextSelection === CUSTOM_REGION_VALUE) {
                setIsCustomRegion(true);
                setRegionSelection({
                  label: t('label.region_set_custom', 'Set custom'),
                  value: CUSTOM_REGION_VALUE,
                });
                return;
              }

              const selectedRegion = baseRegions.find((item) => item.value === nextSelection);
              if (selectedRegion) {
                setIsCustomRegion(false);
                setRegionSelection(selectedRegion);
              }
            }}
          />
        </Row>

        {isCustomRegion && (
          <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.custom_region', 'Custom region')}
              value={customRegion}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setCustomRegion(ev.target.value);
              }}
            />
          </Row>
        )}

        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('label.prefix', 'Prefix')}
            value={prefix}
            hasError={!prefixConfirm}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              const nextPrefix = ev.target.value;
              setPrefix(nextPrefix);
              setPrefixConfirm(nextPrefix === '' || prefixRegex.test(nextPrefix));
            }}
          />
          <Padding top="extrasmall">
            <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
              {t(
                'buckets.prefix_hint',
                'Optional. Limits access to a specific path within the bucket (e.g. mydomains/folder)',
              )}
            </ds-text>
          </Padding>
          {!prefixConfirm && (
            <Padding top="extrasmall">
              <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                {t(
                  'buckets.invalid_prefix',
                  'The prefix should not contain spaces. The allowed letters are a-z, A-Z, and special characters /-.',
                )}
              </ds-text>
            </Padding>
          )}
        </Row>

        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <ds-text as="h6" weight="bold" color="gray1">
            {t('label.security', 'Security')}
          </ds-text>
        </Row>
        <Row width="100%" padding={{ top: 'small' }} mainAlignment="space-between">
          <Row width="90%" mainAlignment="flex-start">
            <Switch
              label={t('buckets.accept_untrusted_ssl', 'Accept untrusted SSL certificates')}
              value={acceptUntrustedSSL}
              onClick={(): void => setAcceptUntrustedSSL(!acceptUntrustedSSL)}
              iconColor="primary"
            />
          </Row>
          <Row width="10%" mainAlignment="flex-end">
            <ds-icon icon="InfoOutline" size="medium" color="gray2"></ds-icon>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'extrasmall' }} mainAlignment="flex-start">
          <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
            {t(
              'buckets.untrusted_ssl_hint',
              'Allow connections with self-signed or unverifiable certificates.',
            )}
          </ds-text>
        </Row>

        {(verifyError || requestError) && (
          <Container
            background="warning"
            width="100%"
            orientation="horizontal"
            height="auto"
            padding={{ all: 'large' }}
            style={{ marginTop: '1rem' }}
          >
            <Row width="10%" mainAlignment="flex-start">
              <ds-icon
                icon="AlertTriangleOutline"
                color="gray6"
                size="large"
                style={{ height: '2rem', width: '2rem' }}
              ></ds-icon>
            </Row>
            <Row width="86%" mainAlignment="flex-end">
              <ds-text as="p" overflow="break-word" color="gray6">
                {verifyError || requestError}
              </ds-text>
            </Row>
          </Container>
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
          {showDeleteConnector && (
            <Button
              type="ghost"
              color="error"
              label={t('label.delete_connector', 'DELETE CONNECTOR')}
              onClick={(): void => {
                setBucketDeleteName(bucketDetail);
                setOpen(true);
              }}
            />
          )}
        </Row>
        <Row width="auto" mainAlignment="flex-end">
          <Padding right="small">
            <Button
              type="outlined"
              color="secondary"
              label={t('label.bucket_cancel_button', 'CANCEL')}
              icon="ChevronLeftOutline"
              iconPlacement="left"
              onClick={(): void => setShowEditDetailView(false)}
            />
          </Padding>
          <Button
            type="default"
            color="primary"
            label={t('label.verify_and_save_changes', 'VERIFY & SAVE CHANGES')}
            onClick={onVerifyAndSaveChanges}
            disabled={isCustomRegion && customRegion.trim() === ''}
          />
        </Row>
      </Row>
    </Container>
  );
};

export default EditBucketDetailPanel;

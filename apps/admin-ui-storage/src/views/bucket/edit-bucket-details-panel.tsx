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

import { objectType, UpdateS3ConnectorRequest } from '../../../types';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { listS3Regions, updateS3Connector } from '../../services/bucket-service';
import { CheckResult, VerifyError } from './parts/verify/verify-error';
import { VerifyProgress } from './parts/verify/verify-progress';
import { VerifySuccess } from './parts/verify/verify-success';
import { VerifyChangesModal } from './verify-changes-modal';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;
const bucketNameRegex = /^\S+$/;
const CUSTOM_REGION_VALUE = 'SET_CUSTOM_REGION';
const NO_REGION_VALUE = '';

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
      return (
        normalized === '' || normalized === 'unused' || normalized === '-' || normalized === 'none'
      );
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
  const [baseRegions, setBaseRegions] = useState<Array<SelectItem<string>>>([]);

  const initialRegion = useMemo(() => {
    if (!bucketDetail?.region) {
      return {
        label: t('label.region_none', 'None'),
        value: NO_REGION_VALUE,
      };
    }
    return (
      baseRegions.find((item) => item.value === bucketDetail?.region) || {
        label: t('label.region_set_custom', 'Set custom'),
        value: CUSTOM_REGION_VALUE,
      }
    );
  }, [baseRegions, bucketDetail?.region, t]);

  const [bucketLabel, setBucketLabel] = useState(bucketDetail?.label ?? '');
  const [bucketName, setBucketName] = useState(bucketDetail?.bucketName ?? '');
  const [accessKeyData, setAccessKeyData] = useState(bucketDetail?.accessKey ?? '');
  const [secretKey, setSecretKey] = useState(bucketDetail?.secret ?? '');
  const [urlData, setUrlData] = useState(bucketDetail?.url ?? '');
  const [prefix, setPrefix] = useState(bucketDetail?.prefix ?? '');
  const [prefixConfirm, setPrefixConfirm] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [regionSelection, setRegionSelection] = useState(initialRegion);
  const [isCustomRegion, setIsCustomRegion] = useState(initialRegion.value === CUSTOM_REGION_VALUE);
  const [customRegion, setCustomRegion] = useState(
    initialRegion.value === CUSTOM_REGION_VALUE ? bucketDetail?.region ?? '' : '',
  );
  const [acceptUntrustedSSL, setAcceptUntrustedSSL] = useState(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyFailError, setVerifyFailError] = useState(
    t(
      'storages.s3Connectors.verifyError.doNotSupport',
      'We do not support this specific connector. Try again with a different one',
    ),
  );
  const [checkDetails, setCheckDetails] = useState<CheckResult | undefined>(undefined);
  const [showVerifyResult, setShowVerifyResult] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const [isVerifyError, setIsVerifyError] = useState(false);

  const currentRegionValue = isCustomRegion ? customRegion : regionSelection?.value ?? '';
  const initialRegionValue = bucketDetail?.region ?? '';
  const isCustomRegionInvalid =
    hasSubmitted && isCustomRegion && !bucketNameRegex.test(customRegion);

  const changedFields = useMemo(() => {
    const fields: Array<{ label: string; value: string }> = [];

    if (bucketLabel !== (bucketDetail?.label ?? '')) {
      fields.push({
        label: t('label.descriptive_name', 'Descriptive name'),
        value: bucketLabel.trim() || '-',
      });
    }

    if (urlData !== (bucketDetail?.url ?? '')) {
      fields.push({
        label: t('label.endpoint_url', 'Endpoint URL'),
        value: urlData.trim() || '-',
      });
    }

    if (currentRegionValue !== initialRegionValue) {
      let regionLabel: string;
      if (regionSelection?.value === NO_REGION_VALUE) {
        regionLabel = t('label.region_none', 'None');
      } else if (isCustomRegion) {
        regionLabel = customRegion.trim() || '-';
      } else {
        regionLabel = String(regionSelection?.label ?? regionSelection?.value ?? '-');
      }
      fields.push({
        label: t('label.region', 'Region'),
        value: regionLabel,
      });
    }

    if (bucketName !== (bucketDetail?.bucketName ?? '')) {
      fields.push({
        label: t('label.bucket_name', 'Bucket name'),
        value: bucketName.trim() || '-',
      });
    }

    if (prefix !== (bucketDetail?.prefix ?? '')) {
      fields.push({
        label: t('label.prefix', 'Prefix'),
        value: prefix.trim() || '-',
      });
    }

    if (accessKeyData !== (bucketDetail?.accessKey ?? '')) {
      fields.push({
        label: t('label.access_key', 'Access Key ID'),
        value: accessKeyData.trim() || '-',
      });
    }

    if (secretKey !== (bucketDetail?.secret ?? '')) {
      fields.push({
        label: t('label.secret_key', 'Secret Access Key'),
        value: '********',
      });
    }

    if (String(acceptUntrustedSSL) !== String(bucketDetail?.insecureHttps ?? true)) {
      fields.push({
        label: t('buckets.accept_untrusted_ssl', 'Accept untrusted SSL certificates'),
        value: acceptUntrustedSSL ? t('label.yes', 'Yes') : t('label.no', 'No'),
      });
    }

    return fields;
  }, [
    accessKeyData,
    acceptUntrustedSSL,
    bucketDetail?.accessKey,
    bucketDetail?.bucketName,
    bucketDetail?.insecureHttps,
    bucketDetail?.label,
    bucketDetail?.prefix,
    bucketDetail?.secret,
    bucketDetail?.url,
    bucketLabel,
    bucketName,
    currentRegionValue,
    customRegion,
    initialRegionValue,
    isCustomRegion,
    prefix,
    regionSelection?.label,
    regionSelection?.value,
    secretKey,
    t,
    urlData,
  ]);

  const isDirty =
    bucketLabel !== (bucketDetail?.label ?? '') ||
    bucketName !== (bucketDetail?.bucketName ?? '') ||
    accessKeyData !== (bucketDetail?.accessKey ?? '') ||
    secretKey !== (bucketDetail?.secret ?? '') ||
    urlData !== (bucketDetail?.url ?? '') ||
    prefix !== (bucketDetail?.prefix ?? '') ||
    currentRegionValue !== initialRegionValue ||
    String(acceptUntrustedSSL) !== String(bucketDetail?.insecureHttps ?? true);

  const showDeleteConnector = isBucketUnused(bucketDetail);

  useEffect(() => {
    setSelectedRow(bucketDetail);
  }, [bucketDetail, setSelectedRow]);

  useEffect(() => {
    listS3Regions()
      .then((regions) => {
        const mappedRegions = regions.map((region) => ({
          value: region.id,
          label: region.description,
        }));
        setBaseRegions(mappedRegions);
      })
      .catch(() => {
        setBaseRegions([]);
      });
  }, []);

  useEffect(() => {
    setAcceptUntrustedSSL(String(bucketDetail?.insecureHttps ?? true) === 'true');
  }, [bucketDetail?.insecureHttps]);

  useEffect(() => {
    setRegionSelection(initialRegion);
    const isCustom = initialRegion.value === CUSTOM_REGION_VALUE;
    setIsCustomRegion(isCustom);
    setCustomRegion(
      isCustom && initialRegion.value !== NO_REGION_VALUE ? bucketDetail?.region ?? '' : '',
    );
  }, [bucketDetail?.region, initialRegion]);

  async function saveChanges(): Promise<{
    ok: boolean;
    errorMessage: string;
    errorDetails?: CheckResult;
  }> {
    if (!isDirty) {
      return { ok: true, errorMessage: '' };
    }

    const payload: UpdateS3ConnectorRequest = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'updateS3Connector',
      uuid: bucketDetail?.uuid ?? '',
      iAmSure: true,
      insecureHttps: acceptUntrustedSSL,
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

    const updateResData = await updateS3Connector(payload);

    if (updateResData?.ok) {
      getBucketListType();
      setToggleForGetAPICall(!toggleForGetAPICall);
      return { ok: true, errorMessage: '' };
    }

    const errorMessage =
      typeof updateResData?.error === 'string'
        ? updateResData.error
        : updateResData?.error?.message || '';
    const errorDetails =
      typeof updateResData?.error === 'string' ? undefined : updateResData?.error?.details;

    return { ok: false, errorMessage, errorDetails };
  }

  async function onVerifyAndSaveChanges(): Promise<void> {
    setHasSubmitted(true);

    if (bucketLabel.trim() === '' || bucketName.trim() === '') {
      return;
    }

    if (isCustomRegion && !bucketNameRegex.test(customRegion)) {
      return;
    }

    if (!prefixConfirm) {
      return;
    }

    if (!isDirty || changedFields.length === 0) {
      createSnackbar({
        key: 'no-changes',
        severity: 'info',
        label: t('label.no_changes_have_been_made', 'No changes have been made'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      return;
    }

    setIsVerifyModalOpen(true);
  }

  async function onApplyChanges(): Promise<void> {
    setIsVerifyModalOpen(false);
    setShowVerifyResult(false);
    setIsVerifySuccess(false);
    setIsVerifyError(false);
    setIsVerifyPending(true);

    const { ok, errorMessage, errorDetails } = await saveChanges();

    if (ok) {
      setIsVerifySuccess(true);
    } else {
      setVerifyFailError(
        errorMessage ||
          t(
            'storages.s3Connectors.verifyError.doNotSupport',
            'We do not support this specific connector. Try again with a different one',
          ),
      );
      setCheckDetails(errorDetails);
      setIsVerifyError(true);
    }

    setIsVerifyPending(false);
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
              {bucketDetail?.uuid}
            </ds-text>
          </Row>

          <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('storages.s3Connectors.descriptiveName', 'Descriptive name*')}
              value={bucketLabel}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setBucketLabel(ev.target.value);
              }}
              hasError={hasSubmitted && bucketLabel.trim() === ''}
            />
            {hasSubmitted && bucketLabel.trim() === '' && (
              <Padding top="extrasmall">
                <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                  {t('storages.s3Connectors.descriptiveNameRequired', 'This field is mandatory')}
                </ds-text>
              </Padding>
            )}
          </Row>

          <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('storages.s3Connectors.bucketName', 'Bucket name*')}
              value={bucketName}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setBucketName(ev.target.value);
              }}
              hasError={hasSubmitted && bucketName.trim() === ''}
            />
            {hasSubmitted && bucketName.trim() === '' && (
              <Padding top="extrasmall">
                <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                  {t(
                    'storages.s3Connectors.invalidBucketName',
                    "This field can't be blank or have white space",
                  )}
                </ds-text>
              </Padding>
            )}
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
                {
                  label: t('label.region_none', 'None'),
                  value: NO_REGION_VALUE,
                },
                {
                  label: t('label.region_set_custom', 'Set custom'),
                  value: CUSTOM_REGION_VALUE,
                },
                ...baseRegions,
              ]}
              background="gray5"
              label={t('label.region', 'Region')}
              selection={regionSelection}
              showCheckbox={false}
              onChange={(selectedValue): void => {
                const regionValue = Array.isArray(selectedValue)
                  ? (selectedValue[0] as SelectItem<string> | undefined)?.value
                  : selectedValue;

                if (
                  regionValue !== CUSTOM_REGION_VALUE &&
                  regionValue !== NO_REGION_VALUE &&
                  typeof regionValue !== 'string'
                ) {
                  return;
                }

                const nextSelection =
                  typeof regionValue === 'string' ? regionValue : CUSTOM_REGION_VALUE;

                if (nextSelection === NO_REGION_VALUE) {
                  setIsCustomRegion(false);
                  setRegionSelection({
                    label: t('label.region_none', 'None'),
                    value: NO_REGION_VALUE,
                  });
                  setCustomRegion('');
                  return;
                }

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
                hasError={isCustomRegionInvalid}
              />
              {isCustomRegionInvalid && (
                <Padding top="extrasmall">
                  <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                    {t(
                      'storages.s3Connectors.invalidCustomRegion',
                      "This field can't be blank or have white space",
                    )}
                  </ds-text>
                </Padding>
              )}
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
            <ds-text weight="bold" color="gray0" size="small">
              {t('storages.s3Connectors.security', 'Security')}
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
          <Row
            width="100%"
            padding={{ top: 'extrasmall', left: '2rem' }}
            mainAlignment="flex-start"
          >
            <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
              {t(
                'buckets.untrusted_ssl_hint',
                'Allow connections with self-signed or unverifiable certificates.',
              )}
            </ds-text>
          </Row>
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
              disabled={
                (isCustomRegion && !bucketNameRegex.test(customRegion)) || changedFields.length === 0
              }
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
      <VerifySuccess
        isSuccess={showVerifyResult && isVerifySuccess}
        onComplete={handleSuccessComplete}
      />
      <VerifyError
        verifyFailError={verifyFailError}
        isError={showVerifyResult && isVerifyError}
        checkDetails={checkDetails}
        onRetry={() => setShowVerifyResult(false)}
      />
    </>
  );
};

export default EditBucketDetailPanel;

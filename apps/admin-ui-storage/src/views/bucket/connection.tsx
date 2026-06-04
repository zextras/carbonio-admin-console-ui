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
  type SelectItem as UISelectItem,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreateS3ConnectorRequest } from '../../../types';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { createS3Connector, listS3Regions } from '../../services/bucket-service';
import { CheckResult, VerifyError } from './parts/verify/verify-error';
import { VerifyProgress } from './parts/verify/verify-progress';
import { VerifySuccess } from './parts/verify/verify-success';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;
const bucketNameRegex = /^\S+$/;
const CUSTOM_REGION_VALUE = 'SET_CUSTOM_REGION';
const NO_REGION_VALUE = '';
const EMPTY_REGION: UISelectItem<string> = { value: '', label: '' };

type S3ConnectorError = {
  error?: string | { message: string; details?: CheckResult };
  message?: string;
  details?: CheckResult;
};

const Connection: FC<{
  onCancel?: () => void;
}> = ({ onCancel }) => {
  const [t] = useTranslation();
  const [bucketRegions, setBucketRegions] = useState<Array<{ value: string; label: string }>>([]);
  const regionItems = useMemo(
    () => [
      {
        label: t('label.region_none', 'None'),
        value: NO_REGION_VALUE,
      },
      {
        label: t('label.region_set_custom', 'Set custom'),
        value: CUSTOM_REGION_VALUE,
      },
      ...bucketRegions,
    ],
    [bucketRegions, t],
  );
  const [buttonColor, setButtonColor] = useState<string>('primary');
  const [buttonDetail, setButtonDetail] = useState(
    t('buckets.connection.verify_and_create_connector', 'VERIFY & CREATE CONNECTOR'),
  );
  const [bucketName, setBucketName] = useState('');
  const [bucketLabel, setBucketLabel] = useState('');
  const [accessKeyData, setAccessKeyData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [regionsData, setRegionsData] = useState<UISelectItem<string> | undefined>();
  const [urlInput, setUrlInput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [isCustomRegion, setIsCustomRegion] = useState(false);

  const [checkDetails, setCheckDetails] = useState<CheckResult | undefined>(undefined);
  const [prefixConfirm, setprefixConfirm] = useState(true);
  const [bucketNameConfirm, setBucketNameConfirm] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [acceptUntrustedSSL, setAcceptUntrustedSSL] = useState(false);
  const [regionSelection, setRegionSelection] = useState<UISelectItem<string>>(EMPTY_REGION);

  const [showVerifyResult, setShowVerifyResult] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const [isVerifyError, setIsVerifyError] = useState(false);

  function getSelectedRegion(): string {
    return isCustomRegion ? customRegion.trim() : regionsData?.value ?? '';
  }

  const isAccessKeyInvalid =
    hasSubmitted && (accessKeyData === '' || !bucketNameRegex.test(accessKeyData));
  const isSecretKeyInvalid = hasSubmitted && (secretKey === '' || !bucketNameRegex.test(secretKey));
  const isCustomRegionInvalid =
    hasSubmitted && isCustomRegion && !bucketNameRegex.test(customRegion);
  const isEndpointUrlRequired = isCustomRegion || getSelectedRegion() === '';
  const isEndpointUrlInvalid =
    hasSubmitted && isEndpointUrlRequired && (urlInput.trim() === '' || !bucketNameRegex.test(urlInput.trim()));

  const handleVerifyConnector = (): void => {
    setHasSubmitted(true);
    const selectedRegion = getSelectedRegion();
    const isRegionValid = isCustomRegion
      ? bucketNameRegex.test(customRegion)
      : selectedRegion === '' || bucketNameRegex.test(selectedRegion);
    const isEndpointValid = !isEndpointUrlRequired || (urlInput.trim() !== '' && bucketNameRegex.test(urlInput.trim()));
    if (
      bucketLabel &&
      bucketName &&
      bucketNameRegex.test(bucketName) &&
      accessKeyData &&
      bucketNameRegex.test(accessKeyData) &&
      secretKey &&
      bucketNameRegex.test(secretKey) &&
      isRegionValid &&
      isEndpointValid
    ) {
      setShowVerifyResult(false);
      setIsVerifySuccess(false);
      setIsVerifyError(false);
      setIsVerifyPending(true);

      const payload: CreateS3ConnectorRequest = {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'createS3Connector',
        iAmSure: true,
        bucketName,
        label: bucketLabel,
        accessKey: accessKeyData,
        secret: secretKey,
        region: selectedRegion,
        insecureHttps: acceptUntrustedSSL,
        notes: '',
      };

      if (urlInput.trim() !== '') {
        payload.url = urlInput.trim();
      }
      if (prefix.trim() !== '') {
        payload.prefix = prefix.trim();
      }

      createS3Connector(payload)
        .then((rawResponse) => {
          const response = rawResponse as { ok?: boolean; error?: string | S3ConnectorError };
          if (response?.ok) {
            setIsVerifySuccess(true);
            return;
          }

          const errorDetails =
            typeof response?.error === 'string' ? undefined : response?.error?.details;
          setCheckDetails(errorDetails);
          setIsVerifyError(true);
        })
        .catch(() => {
          setCheckDetails(undefined);
          setIsVerifyError(true);
        })
        .finally(() => {
          setIsVerifyPending(false);
        });
    }
  };

  const handleProgressComplete = useCallback((): void => {
    setShowVerifyResult(true);
  }, []);

  const handleSuccessComplete = useCallback((): void => {
    setShowVerifyResult(false);
    onCancel?.();
  }, [onCancel]);

  useEffect(() => {
    listS3Regions()
      .then((regions) => {
        const mappedRegions = regions.map((region) => ({
          value: region.id,
          label: region.description,
        }));
        setBucketRegions(mappedRegions);
      })
      .catch(() => {
        setBucketRegions([]);
      });
  }, []);

  useEffect(() => {
    if (regionsData === undefined && bucketRegions.length > 0) {
      setRegionSelection({
        label: t('label.region_none', 'None'),
        value: NO_REGION_VALUE,
      });
    }
  }, [bucketRegions, regionsData, t]);

  useEffect(() => {
    setButtonColor('primary');
    setButtonDetail(
      t('buckets.connection.verify_and_create_connector', 'VERIFY & CREATE CONNECTOR'),
    );
    setBucketName('');
    setAccessKeyData('');
    setSecretKey('');
    setUrlInput('');
    setPrefix('');
    setCustomRegion('');
    setIsCustomRegion(false);
    setRegionSelection({
      label: t('label.region_none', 'None'),
      value: NO_REGION_VALUE,
    });
    setRegionsData(undefined);
  }, [bucketRegions, t]);

  const onSelectRegionChange = useCallback(
    (e: string | null): void => {
      if (e === null) {
        setIsCustomRegion(false);
        setCustomRegion('');
        setRegionsData(undefined);
        setRegionSelection({
          label: t('label.region_none', 'None'),
          value: NO_REGION_VALUE,
        });
        return;
      }

      if (e === CUSTOM_REGION_VALUE) {
        setIsCustomRegion(true);
        setRegionSelection({
          label: t('label.region_set_custom', 'Set custom'),
          value: CUSTOM_REGION_VALUE,
        });
        return;
      }

      if (e === NO_REGION_VALUE) {
        setIsCustomRegion(false);
        setCustomRegion('');
        setRegionsData(undefined);
        setRegionSelection({
          label: t('label.region_none', 'None'),
          value: NO_REGION_VALUE,
        });
        return;
      }

      const volumeObject = bucketRegions.find((s) => s.value === e);
      if (volumeObject) {
        setIsCustomRegion(false);
        setRegionsData(volumeObject);
        setRegionSelection(volumeObject);
      }
    },
    [bucketRegions, t],
  );

  return (
    <Container
      orientation="vertical"
      mainAlignment="flex-start"
      crossAlignment="stretch"
      style={{ minHeight: 'calc(100vh - 12rem)' }}
    >
      <Container
        mainAlignment="flex-start"
        padding={{ horizontal: 'large' }}
        style={{ paddingBottom: '1rem' }}
        height={'100%'}
      >
        <Row padding={{ top: 'extralarge' }} width="100%" mainAlignment="flex-start">
          <ds-text as="h5" weight="bold">
            {t('storages.s3Connectors.sectionTitle', 'S3 connection')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'extrasmall' }} width="100%" mainAlignment="flex-start">
          <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
            {t(
              'storages.s3Connectors.newconnectDescription',
              'Before starting the connection, an S3 bucket must be previously created in your system',
            )}
          </ds-text>
        </Row>
        <Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('storages.s3Connectors.descriptiveName', 'Descriptive name*')}
            value={bucketLabel}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setBucketLabel(ev.target.value);
            }}
            hasError={hasSubmitted && bucketLabel === ''}
          />
          {hasSubmitted && bucketLabel === '' && (
            <Padding top="extrasmall">
              <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                {t('storages.s3Connectors.descriptiveNameRequired', 'This field is mandatory')}
              </ds-text>
            </Padding>
          )}
        </Row>
        <Row width="100%" padding={{ top: 'large' }}>
          <Row width="100%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('storages.s3Connectors.bucketName', 'Bucket name*')}
              value={bucketName}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setBucketName(ev.target.value);
                setBucketNameConfirm(
                  ev.target.value === '' || bucketNameRegex.test(ev.target.value),
                );
              }}
              hasError={hasSubmitted && (bucketName === '' || !bucketNameConfirm)}
            />
            {hasSubmitted && (bucketName === '' || !bucketNameConfirm) && (
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
        </Row>
        <Row width="100%" padding={{ top: 'large' }}>
          <Row width="48%" mainAlignment="flex-start" style={{display:"inline", height:"100%"}}>
            <Input
              backgroundColor="gray5"
              label={t('storages.s3Connectors.accessKey', 'Access Key ID*')}
              value={accessKeyData}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setAccessKeyData(ev.target.value);
              }}
              hasError={isAccessKeyInvalid}
            />
            {isAccessKeyInvalid && (
              <Padding top="extrasmall">
                <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                  {t(
                    'storages.s3Connectors.invalidAccessKey',
                    "This field can't be blank or have white space",
                  )}
                </ds-text>
              </Padding>
            )}
          </Row>
          <Padding horizontal={'small'} />
          <Row width="48%" mainAlignment="flex-end" style={{display:"inline", height:"100%"}}>
            <PasswordInput
              backgroundColor="gray5"
              label={t('label.secret_key', 'Secret Access Key*')}
              value={secretKey}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setSecretKey(ev.target.value);
              }}
              hasError={isSecretKeyInvalid}
            />
            {isSecretKeyInvalid && (
              <Padding top="extrasmall" width='100%'>
                <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                  {t(
                    'storages.s3Connectors.invalidSecretKey',
                    "This field can't be blank or have white space",
                  )}
                </ds-text>
              </Padding>
            )}
          </Row>
        </Row>
        
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Select
            items={regionItems}
            background="gray5"
            label={t('label.region', 'Region')}
            selection={regionSelection}
            onChange={onSelectRegionChange}
            showCheckbox={false}
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
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Input
            label={isEndpointUrlRequired ? t('label.endpoint_url_required', 'Endpoint URL*') : t('label.endpoint_url', 'Endpoint URL')}
            backgroundColor="gray5"
            value={urlInput}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setUrlInput(ev.target.value);
            }}
            hasError={isEndpointUrlInvalid}
          />
          {isEndpointUrlInvalid && (
            <Padding top="extrasmall">
              <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                {t(
                  'storages.s3Connectors.invalidEndpointUrl',
                  "This field is required when Region is 'None' or 'Custom'",
                )}
              </ds-text>
            </Padding>
          )}
          <Padding top="extrasmall">
            <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
              {t(
                'storages.s3Connectors.endpointUrlHelp',
                'The endpoint URL of your storage provider. Not needed if your connector are AWS',
              )}
            </ds-text>
          </Padding>
        </Row>
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Input
            label={t('label.prefix', 'Prefix')}
            backgroundColor="gray5"
            value={prefix}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setPrefix(ev.target.value);
              if (ev.target.value !== '') {
                if (prefixRegex.test(ev.target.value)) {
                  setprefixConfirm(true);
                } else {
                  setprefixConfirm(false);
                }
              } else {
                setprefixConfirm(true);
              }
            }}
            hasError={!prefixConfirm}
          />
          <Padding top="extrasmall">
            <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
              {t(
                'storages.s3Connectors.prefixHint',
                'Optional. Limits access to a specific path within the bucket (e.g. mydomains/folder)',
              )}
            </ds-text>
          </Padding>
          {!prefixConfirm && (
            <Padding top="extrasmall">
              <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                {t(
                  'storages.s3Connectors.invalidPrefix',
                  'The prefix should not contain spaces. The allowed letters are a-z, A-Z, and special characters /-.',
                )}
              </ds-text>
            </Padding>
          )}
        </Row>
        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <ds-text as="h6" weight="bold">
            {t('storages.s3Connectors.security', 'Security')}
          </ds-text>
        </Row>
        <Row width="100%" padding={{ top: 'small' }} mainAlignment="space-between">
          <Row width="90%" mainAlignment="flex-start">
            <Switch
              label={t(
                'storages.s3Connectors.acceptUntrustedSSL',
                'Accept untrusted SSL certificates',
              )}
              value={acceptUntrustedSSL}
              onClick={(): void => {
                setAcceptUntrustedSSL(!acceptUntrustedSSL);
              }}
              iconColor="primary"
            />
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
              'storages.s3Connectors.untrustedSSLHint',
              'Allow connections with self-signed or unverifiable certificates.',
            )}
          </ds-text>
        </Row>
      </Container>

      <Container
        width="100%"
        background="white"
        style={{ position: 'sticky', bottom: 0, zIndex: 1 }}
        height={'4.5rem'}
      >
        <ds-divider></ds-divider>
        <Row width="100%" padding={{ all: 'large' }} mainAlignment="flex-end">
          <Row width="auto" mainAlignment="flex-end">
            <Padding right="small">
              <Button
                type="outlined"
                label={t('label.bucket_cancel_button', 'CANCEL')}
                color="secondary"
                icon="ChevronLeftOutline"
                iconPlacement="left"
                onClick={(): void => {
                  onCancel?.();
                }}
              />
            </Padding>
            <Button
              type="default"
              label={buttonDetail}
              color={buttonColor}
              onClick={handleVerifyConnector}
            />
          </Row>
        </Row>
      </Container>
      <VerifyProgress isPending={isVerifyPending} onComplete={handleProgressComplete} />
      <VerifySuccess
        isSuccess={showVerifyResult && isVerifySuccess}
        onComplete={handleSuccessComplete}
      />
      <VerifyError
        isError={showVerifyResult && isVerifyError}
        checkDetails={checkDetails}
        onRetry={() => setShowVerifyResult(false)}
      />
    </Container>
  );
};

export default Connection;

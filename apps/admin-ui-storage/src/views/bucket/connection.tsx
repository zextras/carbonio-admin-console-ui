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
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TestConnectionObjectType } from '../../../types';
import {
  AMAZON_WEB_SERVICE_S3,
  ERROR,
  FAIL,
  HTTP,
  HTTPS,
  SUCCESS,
  V4,
  ZIMBRA_ADMIN_URN,
} from '../../constants';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import { BucketRegions } from '../utility/utils';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;
const bucketNameRegex = /^\S+$/;
const CUSTOM_REGION_VALUE = 'SET_CUSTOM_REGION';

const Connection: FC<{
  externalData?: string;
  onCancel?: () => void;
}> = ({ externalData, onCancel }) => {
  const [t] = useTranslation();
  const bucketRegions = useMemo(() => BucketRegions(t), [t]);
  const regionItems = useMemo(
    () => [
      ...bucketRegions,
      {
        label: t('label.region_set_custom', 'Set custom'),
        value: CUSTOM_REGION_VALUE,
      },
    ],
    [bucketRegions, t],
  );
  const createSnackbar = useSnackbar();
  const [buttonColor, setButtonColor] = useState<string>('primary');
  const [buttonDetail, setButtonDetail] = useState(
    t('buckets.connection.verify_and_create_connector', 'VERIFY & CREATE CONNECTOR'),
  );
  const [bucketName, setBucketName] = useState('');
  const [bucketLabel, setBucketLabel] = useState('');
  const [accessKeyData, setAccessKeyData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [regionsData, setRegionsData] = useState<{ value: string; label: string } | undefined>();
  const [urlInput, setUrlInput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [verifyCheck, setVerifyCheck] = useState<string>('');
  const [verifyFailErr, setverifyFailErr] = useState('');
  const [bothFail, setbothFail] = useState('');
  const [prefixConfirm, setprefixConfirm] = useState(true);
  const [bucketNameConfirm, setBucketNameConfirm] = useState(true);
  const [acceptUntrustedSSL, setAcceptUntrustedSSL] = useState(true);
  const [regionSelection, setRegionSelection] = useState<{ value: string; label: string }>(
    bucketRegions[0],
  );

  const storeType = externalData || AMAZON_WEB_SERVICE_S3;
  const { selectedServerName } = useBucketVolumeStore((state) => state);

  const handleVerifyConnector = (): void => {
    if (
      bucketLabel &&
      bucketName &&
      bucketNameRegex.test(bucketName) &&
      accessKeyData &&
      secretKey &&
      (!isCustomRegion || customRegion.trim() !== '')
    ) {
      const objectToSend: TestConnectionObjectType = {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxCore',
        action: 'doCreateBucket',
        storeType,
        bucketName,
        label: bucketLabel,
        accessKey: accessKeyData,
        secret: secretKey,
        region: isCustomRegion ? customRegion : regionsData?.value,
        signatureVersion: V4,
        protocol: urlInput.startsWith(HTTPS) ? HTTPS : HTTP,
        url: urlInput,
        prefix,
        targetServer: selectedServerName,
      };

      if (prefix === '') {
        delete objectToSend.prefix;
      }
      if (selectedServerName === '') {
        delete objectToSend?.targetServers;
      }

      fetchSoap('zextras', objectToSend).then((res) => {
        const soapResponse = res as { Body: { response: { content: string } } };
        const response = JSON.parse(soapResponse.Body.response.content);
        if (response.ok) {
          const data = response.response.message;
          const responseData = data.split("'");

          const objToSendTestConnection: TestConnectionObjectType = {
            _jsns: ZIMBRA_ADMIN_URN,
            module: 'ZxCore',
            action: 'testS3Connection',
            targetServers: selectedServerName,
            bucketId: responseData[1],
          };

          if (selectedServerName === '') {
            delete objToSendTestConnection?.targetServers;
          }

          fetchSoap('zextras', objToSendTestConnection).then((responseVerify) => {
            const responseVerifyData = JSON.parse(responseVerify.Body.response.content);
            if (
              responseVerifyData.ok &&
              responseVerifyData.response[selectedServerName] &&
              responseVerifyData.response[selectedServerName].ok
            ) {
              setVerifyCheck(SUCCESS);
            } else {
              const errorResponse = responseVerifyData?.error;

              const errorResponsePart = errorResponse.split(objToSendTestConnection?.bucketId);
              const errorStoreTypeMessage = errorResponsePart[1].replace('as', '');

              setVerifyCheck(ERROR);
              setverifyFailErr(
                t(
                  'label.bucket_verification_failed_message',
                  'Verification Failed Could not test bucket configuration. {{bucketType}} not supported for this connection (ID: {{bucketId}})',
                  {
                    bucketType: errorStoreTypeMessage,
                    bucketId: objToSendTestConnection?.bucketId,
                  },
                ),
              );
            }
          });
        } else {
          setbothFail(
            response?.error?.message ||
              response?.error ||
              response?.exception?.message ||
              response.response[selectedServerName].error.message,
          );
          setVerifyCheck(FAIL);
        }
      });
    }
  };

  useEffect(() => {
    if (regionsData === undefined) {
      setRegionsData(bucketRegions[0]);
    }
  }, [bucketRegions, regionsData]);

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
    setRegionSelection(bucketRegions[0]);
    setRegionsData(bucketRegions[0]);
  }, [bucketRegions, t]);

  const onSelectRegionChange = useCallback(
    (e: unknown): void => {
      if (e === CUSTOM_REGION_VALUE) {
        setIsCustomRegion(true);
        setRegionSelection({
          label: t('label.region_set_custom', 'Set custom'),
          value: CUSTOM_REGION_VALUE,
        });
        return;
      }

      if (typeof e === 'string') {
        const volumeObject = bucketRegions.find((s) => s.value === e);
        if (volumeObject) {
          setIsCustomRegion(false);
          setRegionsData(volumeObject);
          setRegionSelection(volumeObject);
        }
      }
    },
    [bucketRegions, t],
  );

  useEffect(() => {
    if (verifyCheck === SUCCESS) {
      setButtonColor('success');
      setButtonDetail(
        t('label.connector_is_create_and_verified', 'CONNECTOR IS CREATED AND VERIFIED'),
      );
    } else if (verifyCheck === ERROR) {
      setButtonColor('error');
      setButtonDetail(
        t(
          'label.connection_is_created_verify_connector_fail',
          'CONNECTOR IS CREATED BUT VERIFICATION HAS FAILED',
        ),
      );
    } else if (verifyCheck === FAIL) {
      setButtonColor('error');
      setButtonDetail(
        t(
          'label.connector_is_not_created_and_verification_failed',
          'CONNECTOR IS NOT CREATED AND VERIFICATION HAS FAILED',
        ),
      );
      createSnackbar({
        key: '1',
        severity: 'error',
        label: t('label.verify_error', '{{name}}', {
          name: bothFail,
        }),
        autoHideTimeout: 5000,
      });
    } else {
      setButtonColor('primary');
      setButtonDetail(
        t('buckets.connection.verify_and_create_connector', 'VERIFY & CREATE CONNECTOR'),
      );
    }
  }, [bothFail, createSnackbar, t, verifyCheck, verifyFailErr]);

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
      >
        <Row padding={{ top: 'extralarge' }} width="100%" mainAlignment="flex-start">
        <ds-text as="h5" weight="bold" color="gray1">
          {t('buckets.connection.section_title', 'S3 connection')}
        </ds-text>
        </Row>
        <Row padding={{ top: 'extrasmall' }} width="100%" mainAlignment="flex-start">
        <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
          {t(
            'storages.newconnectDescription',
            'Before starting the connection, an S3 bucket must be previously created in your system',
          )}
        </ds-text>
        </Row>
        <Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
        <Input
          backgroundColor="gray5"
          label={t('label.descriptive_name', 'Descriptive name*')}
          value={bucketLabel}
          onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
            setBucketLabel(ev.target.value);
          }}
        />
        </Row>
        <Row width="100%" padding={{ top: 'large' }}>
        <Row width="100%" mainAlignment="flex-start">
          <Input
            backgroundColor="gray5"
            label={t('label.bucket_name', 'Bucket name*')}
            value={bucketName}
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setBucketName(ev.target.value);
              setBucketNameConfirm(ev.target.value === '' || bucketNameRegex.test(ev.target.value));
            }}
            hasError={!bucketNameConfirm}
          />
          <Padding top="extrasmall">
            <ds-text
              as="span"
              color={!bucketNameConfirm ? 'error' : 'secondary'}
              overflow="break-word"
              size="extrasmall"
            >
              {t('buckets.invalid_bucket_name', "This field can't be blank or have white space")}
            </ds-text>
          </Padding>
        </Row>
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
        <Padding horizontal={'small'} />
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
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Input
          label={t('label.endpoint_url', 'Endpoint URL')}
          backgroundColor="gray5"
          value={urlInput}
          onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
            setUrlInput(ev.target.value);
          }}
        />
        <Padding top="extrasmall">
          <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall" >
            {t(
              'buckets.endpoint_url_help',
              'The endpoint URL of your storage provider. Not needed if your connector are AWS',
            )}
          </ds-text>
        </Padding>
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
            />
          </Row>
        )}
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
              onClick={(): void => {
                setAcceptUntrustedSSL(!acceptUntrustedSSL);
              }}
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
        {verifyCheck === SUCCESS && (
          <Row width="100%" padding={{ top: 'large' }}>
            <ds-text as="span" size="small" color="success">
              {t('label.connector_is_create_and_verified', 'CONNECTOR IS CREATED AND VERIFIED')}
            </ds-text>
          </Row>
        )}
        {verifyCheck === ERROR && (
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
                {verifyFailErr}
              </ds-text>
            </Row>
          </Container>
        )}
      </Container>

      <Container
        width="100%"
        background="white"
        style={{ position: 'sticky', bottom: 0, zIndex: 1 }}
      >
        <ds-divider></ds-divider>
        <Row width="100%" padding={{ all: 'large' }} mainAlignment="space-between">
          <Button
            type="outlined"
            label={t('label.bucket_need_help_button', 'NEED HELP?')}
            color="secondary"
            onClick={(): void => undefined}
          />
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
    </Container>
  );
};

export default Connection;

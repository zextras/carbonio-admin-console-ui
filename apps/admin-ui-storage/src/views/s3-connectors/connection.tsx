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
  getFieldErrorProps,
  Input,
  Padding,
  PasswordInput,
  Row,
  Select,
  type SelectItem as UISelectItem,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreateS3ConnectorRequest } from '../../../types';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { createS3Connector } from '../../services/s3-connector-service';
import { useListS3Regions } from '../../services/use-list-s3-regions';
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

type S3ConnectorError = {
  error?: string | { message: string; details?: CheckResult };
  message?: string;
  details?: CheckResult;
};

const EMPTY_REGION: UISelectItem<string> = { value: '', label: '' };

export function Connection({
  onCancel,
}: Readonly<{
  onCancel?: () => void;
}>) {
  const [t] = useTranslation();
  const { data: rawRegions = [] } = useListS3Regions();
  const connectorRegions = rawRegions.map((region) => ({
    value: region.id,
    label: `${region.description}, [${region.id}]`,
  }));
  const [checkDetails, setCheckDetails] = useState<CheckResult | undefined>(undefined);
  const [showVerifyResult, setShowVerifyResult] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);
  const [isProgressActive, setIsProgressActive] = useState(false);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const [isVerifyError, setIsVerifyError] = useState(false);

  const regionItems = [
    { label: t('label.region_none', 'None'), value: NO_REGION_VALUE },
    { label: t('label.region_set_custom', 'Set custom'), value: CUSTOM_REGION_VALUE },
    ...connectorRegions,
  ];

  const form = useForm({
    defaultValues: {
      bucketLabel: '',
      bucketName: '',
      accessKey: '',
      secretKey: '',
      url: '',
      prefix: '',
      customRegion: '',
      regionValue: NO_REGION_VALUE,
      acceptUntrustedSSL: false,
    } as S3ConnectorFormValues,
    validators: { onChange: s3ConnectorSchema },
    onSubmit: async ({ value }) => {
      setShowVerifyResult(false);
      setIsVerifySuccess(false);
      setIsVerifyError(false);
      setIsVerifyPending(true);
      setIsProgressActive(true);

      const selectedRegion =
        value.regionValue === CUSTOM_REGION_VALUE
          ? value.customRegion.trim()
          : value.regionValue;

      const payload: CreateS3ConnectorRequest = {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'createS3Connector',
        iAmSure: true,
        bucketName: value.bucketName,
        label: value.bucketLabel,
        accessKey: value.accessKey,
        secret: value.secretKey,
        region: selectedRegion,
        insecureHttps: value.acceptUntrustedSSL,
        notes: '',
      };

      if (value.url.trim() !== '') {
        payload.url = value.url.trim();
      }
      if (value.prefix.trim() !== '') {
        payload.destinationPath = value.prefix.trim();
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
          setShowVerifyResult(true);
        });
    },
  });

  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const regionValue = useSelector(form.store, (s) => s.values.regionValue);
  const isCustomRegion = regionValue === CUSTOM_REGION_VALUE;
  const isEndpointUrlRequired = isCustomRegion || regionValue === NO_REGION_VALUE;

  const regionSelection = regionItems.find((item) => item.value === regionValue) ?? EMPTY_REGION;

  const handleProgressComplete = (): void => {
    setShowVerifyResult(true);
    setIsProgressActive(false);
  };

  const handleSuccessComplete = (): void => {
    setShowVerifyResult(false);
    onCancel?.();
  };

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
          <form.Field name="bucketLabel">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                S3_CONNECTOR_VALIDATION_MESSAGES,
              );
              return (
                <Input
                  backgroundColor="gray5"
                  label={t('storages.s3Connectors.descriptiveName', 'Descriptive name*')}
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    field.handleChange(e.target.value)
                  }
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
        </Row>
        <Row width="100%" padding={{ top: 'large' }}>
          <Row width="100%" mainAlignment="flex-start">
            <form.Field name="bucketName">
              {(field) => {
                const error = getFieldErrorProps(
                  field,
                  isSubmitted,
                  t,
                  S3_CONNECTOR_VALIDATION_MESSAGES,
                );
                return (
                  <Input
                    backgroundColor="gray5"
                    label={t('storages.s3Connectors.bucketName', 'Bucket name*')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                    hasError={error.hasError}
                    description={error.description}
                  />
                );
              }}
            </form.Field>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large' }}>
          <Row width="48%" mainAlignment="flex-start" style={{ display: 'inline', height: '100%' }}>
            <form.Field name="accessKey">
              {(field) => {
                const error = getFieldErrorProps(
                  field,
                  isSubmitted,
                  t,
                  S3_CONNECTOR_VALIDATION_MESSAGES,
                );
                return (
                  <Input
                    backgroundColor="gray5"
                    label={t('storages.s3Connectors.accessKey', 'Access Key ID*')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                    hasError={error.hasError}
                    description={error.description}
                  />
                );
              }}
            </form.Field>
          </Row>
          <Padding horizontal={'small'} />
          <Row width="48%" mainAlignment="flex-end" style={{ display: 'inline', height: '100%' }}>
            <form.Field name="secretKey">
              {(field) => {
                const error = getFieldErrorProps(
                  field,
                  isSubmitted,
                  t,
                  S3_CONNECTOR_VALIDATION_MESSAGES,
                );
                return (
                  <PasswordInput
                    backgroundColor="gray5"
                    label={t('label.secret_key', 'Secret Access Key*')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                    hasError={error.hasError}
                    description={error.description}
                  />
                );
              }}
            </form.Field>
          </Row>
        </Row>

        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <form.Field name="regionValue">
            {(field) => (
              <Select
                items={regionItems}
                background="gray5"
                label={t('label.region', 'Region')}
                selection={regionSelection}
                onChange={(e: string | null): void => field.handleChange(e ?? NO_REGION_VALUE)}
                showCheckbox={false}
              />
            )}
          </form.Field>
        </Row>
        {isCustomRegion && (
          <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
            <form.Field name="customRegion">
              {(field) => {
                const error = getFieldErrorProps(
                  field,
                  isSubmitted,
                  t,
                  S3_CONNECTOR_VALIDATION_MESSAGES,
                );
                return (
                  <Input
                    backgroundColor="gray5"
                    label={t('label.custom_region', 'Custom region')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                    hasError={error.hasError}
                    description={error.description}
                  />
                );
              }}
            </form.Field>
          </Row>
        )}
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <form.Field name="url">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                S3_CONNECTOR_VALIDATION_MESSAGES,
              );
              return (
                <Input
                  label={
                    isEndpointUrlRequired
                      ? t('label.endpoint_url_required', 'Endpoint URL*')
                      : t('label.endpoint_url', 'Endpoint URL')
                  }
                  backgroundColor="gray5"
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    field.handleChange(e.target.value)
                  }
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
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
          <form.Field name="prefix">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                S3_CONNECTOR_VALIDATION_MESSAGES,
              );
              return (
                <Input
                  label={t('label.prefix', 'Prefix')}
                  backgroundColor="gray5"
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    field.handleChange(e.target.value)
                  }
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
          <Padding top="extrasmall">
            <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
              {t(
                'storages.s3Connectors.prefixHint',
                'Optional. Limits access to a specific path within the bucket (e.g. mydomains/folder)',
              )}
            </ds-text>
          </Padding>
        </Row>
        <Row width="100%" padding={{ top: 'large' }} mainAlignment="flex-start">
          <ds-text as="h6" weight="bold">
            {t('storages.s3Connectors.security', 'Security')}
          </ds-text>
        </Row>
        <Row width="100%" padding={{ top: 'small' }} mainAlignment="space-between">
          <Row width="90%" mainAlignment="flex-start">
            <form.Field name="acceptUntrustedSSL">
              {(field) => (
                <Switch
                  label={t(
                    'storages.s3Connectors.acceptUntrustedSSL',
                    'Accept untrusted SSL certificates',
                  )}
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
                  form.reset();
                  onCancel?.();
                }}
              />
            </Padding>
            <Button
              type="default"
              label={t('buckets.connection.verify_and_create_connector', 'VERIFY & CREATE CONNECTOR')}
              color="primary"
              onClick={(): void => {
                void form.handleSubmit();
              }}
            />
          </Row>
        </Row>
      </Container>
      {isProgressActive && (
        <VerifyProgress isPending={isVerifyPending} onComplete={handleProgressComplete} />
      )}
      {showVerifyResult && isVerifySuccess && (
        <VerifySuccess onComplete={handleSuccessComplete} />
      )}
      {showVerifyResult && isVerifyError && (
        <VerifyError
          checkDetails={checkDetails}
          onClose={(): void => setShowVerifyResult(false)}
          onRetry={(): void => setShowVerifyResult(false)}
        />
      )}
    </Container>
  );
}



/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  getFieldErrorProps,
  LabeledValue,
  NumberInput,
  Padding,
  TextInput,
  PlainSelect,
  Radio,
  Row,
  Switch,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type ChangeEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import {
  COMPRESSION_THRESHOLD_UNIT,
  INDEX_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  SECONDARY_TYPE_VALUE,
} from '../../../constants';
import { volumeAllocationList, volumeTypeList } from '../../utility/utils';
import { VOLUME_CREATE_VALIDATION_MESSAGES } from './schema';
import { VolumeContext } from './volume-context';

function CompressionThresholdIcon() {
  return (
    <ds-text as="span" color="secondary">
      {COMPRESSION_THRESHOLD_UNIT}
    </ds-text>
  );
}

export function MailstoresCreate({
  externalData,
}: Readonly<{
  externalData: string;
}>) {
  const { form } = useContext(VolumeContext);
  const { t } = useTranslation();

  const isAdvanced = useIsAdvanced();
  const volTypeList = volumeTypeList(t, isAdvanced);
  const volAllocationList = volumeAllocationList(t);
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const volumeMain = useSelector(form.store, (s) => s.values.volumeMain);
  const isCompression = useSelector(form.store, (s) => s.values.isCompression);

  const isIndexVolume = volumeMain === INDEX_TYPE_VALUE;

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_server', 'Server')}
          value={externalData}
        />
      </Row>
      {!isAdvanced && (
        <Row padding={{ top: 'large' }} width="100%">
          <PlainSelect
            items={volTypeList}
            label={t('label.volume_type', 'Volume Type')}
            selection={
              volTypeList.find((item) => item.value === form.state.values.volumeMain) ??
              volTypeList[0]
            }
            onChange={(value) => form.setFieldValue('volumeMain', value)}
          />
        </Row>
      )}
      {isAdvanced && (
        <Row padding={{ top: 'large' }} width="100%">
          <PlainSelect
            items={volAllocationList}
            label={t('label.volume_allocation', 'Allocation')}
            selection={
              volAllocationList.find(
                (item) => item.value === form.state.values.volumeAllocation,
              ) ?? volAllocationList[0]
            }
            onChange={(value) => form.setFieldValue('volumeAllocation', value)}
          />
        </Row>
      )}
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <form.Field name="volumeName">
          {(field) => {
            const error = getFieldErrorProps(
              field,
              isSubmitted,
              t,
              VOLUME_CREATE_VALIDATION_MESSAGES,
            );
            return (
              <TextInput
                name="volumeName"
                label={t('label.volume_name', 'Volume Name')}
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                hasError={error.hasError}
                description={error.description}
              />
            );
          }}
        </form.Field>
      </Row>
      {isAdvanced && (
        <>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <Row width="48%" mainAlignment="flex-start">
              <Radio
                label={t('storage.dataVolume.primaryVolume', 'Primary Volume')}
                value={PRIMARY_TYPE_VALUE}
                checked={volumeMain === PRIMARY_TYPE_VALUE}
                onClick={(): void => form.setFieldValue('volumeMain', PRIMARY_TYPE_VALUE)}
                iconColor="primary"
              />
            </Row>
            <Row width="48%" mainAlignment="flex-start">
              <Radio
                label={t('storage.dataVolume.secondaryVolume', 'Secondary Volume')}
                value={SECONDARY_TYPE_VALUE}
                checked={volumeMain === SECONDARY_TYPE_VALUE}
                onClick={(): void => form.setFieldValue('volumeMain', SECONDARY_TYPE_VALUE)}
                iconColor="primary"
              />
            </Row>
          </Row>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <Radio
              label={t('storage.dataVolume.indexVolume', 'Index Volume')}
              value={INDEX_TYPE_VALUE}
              checked={volumeMain === INDEX_TYPE_VALUE}
              onClick={(): void => form.setFieldValue('volumeMain', INDEX_TYPE_VALUE)}
              iconColor="primary"
            />
          </Row>
        </>
      )}
      <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
        <form.Field name="path">
          {(field) => {
            const error = getFieldErrorProps(
              field,
              isSubmitted,
              t,
              VOLUME_CREATE_VALIDATION_MESSAGES,
            );
            return (
              <TextInput
                name="path"
                label={t('label.volume_path', 'Volume path')}
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                hasError={error.hasError}
                description={error.description}
              />
            );
          }}
        </form.Field>
        <Padding top="extrasmall">
          <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
            {t('storage.dataVolumes.volumePathMustExistHint', 'The volume path must already exist')}
          </ds-text>
        </Padding>
      </Row>
      {!isIndexVolume && (
        <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
          <Row width="32%" mainAlignment="flex-start">
            <form.Field name="isCompression">
              {(field) => (
                <Switch
                  value={field.state.value}
                  label={t('label.enable_compression', 'Enable Compression')}
                  onClick={(): void => {
                    const newValue = !field.state.value;
                    field.handleChange(newValue);
                    if (!newValue) {
                      form.setFieldValue('compressionThreshold', '');
                    }
                  }}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Row>
          <Padding horizontal="small" />
          <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="65%">
            <form.Field name="compressionThreshold">
              {(field) => {
                const error = getFieldErrorProps(
                  field,
                  isSubmitted,
                  t,
                  VOLUME_CREATE_VALIDATION_MESSAGES,
                );
                return (
                  <NumberInput
                    name="compressionThreshold"
                    label={t('label.volume_compression_thresold', 'Compression Threshold')}
                    value={field.state.value ?? ''}
                    onChange={(value): void => {
                      field.handleChange(value);
                    }}
                    hasError={error.hasError}
                    description={error.description}
                    disabled={!isCompression}
                    icon={<CompressionThresholdIcon />}
                  />
                );
              }}
            </form.Field>
          </Row>
        </Row>
      )}
      <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
        <form.Field name="isCurrent">
          {(field) => (
            <Switch
              value={field.state.value}
              label={t('label.set_as_current', 'Set as Current')}
              onClick={(): void => field.handleChange(!field.state.value)}
              iconColor="primary"
            />
          )}
        </form.Field>
      </Row>
      <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
        <ds-text as="p" color="secondary">
          {t(
            'label.enable_current_helptext',
            'Enabling this option will disable the current active volume.',
          )}
        </ds-text>
      </Row>
    </Container>
  );
}

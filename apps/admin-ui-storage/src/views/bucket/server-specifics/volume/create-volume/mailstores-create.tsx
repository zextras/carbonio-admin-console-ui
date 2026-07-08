/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  getFieldErrorProps,
  Input,
  LabeledValue,
  Padding,
  Radio,
  Row,
  Select,
  Switch,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type ChangeEvent, type FC, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  COMPRESSION_THRESHOLD_UNIT,
  INDEX_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  SECONDARY_TYPE_VALUE,
} from '../../../../../constants';
import { volumeAllocationList, volumeTypeList } from '../../../../utility/utils';
import { VOLUME_CREATE_VALIDATION_MESSAGES } from './schema';
import { VolumeContext } from './volume-context';

const MailstoresCreate: FC<{
  onSelection?: any;
  externalData: string;
  setCompleteLoading: any;
}> = ({ externalData, setCompleteLoading }) => {
  const { form } = useContext(VolumeContext);
  const { t } = useTranslation();

  const isAdvanced = useIsAdvanced();
  const volTypeList = useMemo(() => volumeTypeList(t, isAdvanced), [t, isAdvanced]);
  const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const isFormValid = useSelector(form.store, (s) => s.isValid);
  const volumeMain = useSelector(form.store, (s) => s.values.volumeMain);
  const isCompression = useSelector(form.store, (s) => s.values.isCompression);

  const isIndexVolume = volumeMain === INDEX_TYPE_VALUE;

  useEffect(() => {
    if (isAdvanced) {
      setCompleteLoading(isFormValid && !!volumeMain);
    } else {
      setCompleteLoading(isFormValid);
    }
  }, [isFormValid, isAdvanced, volumeMain, setCompleteLoading]);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_server', 'Server')}
          backgroundColor="gray6"
          value={externalData}
        />
      </Row>
      {!isAdvanced && (
        <Row padding={{ top: 'large' }} width="100%">
          <Select
            items={volTypeList}
            background="gray5"
            label={t('label.volume_type', 'Volume Type')}
            defaultSelection={
              volTypeList?.filter((items) => items?.value === form.state.values.volumeMain)[0]
            }
            showCheckbox={false}
            onChange={(v: any): void => form.setFieldValue('volumeMain', v)}
          />
        </Row>
      )}
      {isAdvanced && (
        <Row padding={{ top: 'large' }} width="100%">
          <Select
            items={volAllocationList}
            background="gray5"
            label={t('label.volume_allocation', 'Allocation')}
            showCheckbox={false}
            selection={
              volAllocationList?.find(
                (item: any) => item?.value === form.state.values.volumeAllocation,
              ) as any
            }
            onChange={(v: any): void => form.setFieldValue('volumeAllocation', v)}
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
              <Input
                inputName="volumeName"
                label={t('label.volume_name', 'Volume Name')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  field.handleChange(e.target.value)
                }
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
                label={t('label.primary_volume', 'This is a Primary Volume')}
                value={PRIMARY_TYPE_VALUE}
                checked={volumeMain === PRIMARY_TYPE_VALUE}
                onClick={(): void => form.setFieldValue('volumeMain', PRIMARY_TYPE_VALUE)}
                iconColor="primary"
              />
            </Row>
            <Row width="48%" mainAlignment="flex-start">
              <Radio
                label={t('label.secondary_volume', 'This is a Secondary Volume')}
                value={SECONDARY_TYPE_VALUE}
                checked={volumeMain === SECONDARY_TYPE_VALUE}
                onClick={(): void => form.setFieldValue('volumeMain', SECONDARY_TYPE_VALUE)}
                iconColor="primary"
              />
            </Row>
          </Row>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <Radio
              label={t('label.index_volume', 'This is a Index Volume')}
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
              <Input
                inputName="path"
                label={t('label.volume_path', 'Volume path')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  field.handleChange(e.target.value)
                }
                hasError={error.hasError}
                description={error.description}
              />
            );
          }}
        </form.Field>
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
                  <Input
                    inputName="compressionThreshold"
                    label={t('label.volume_compression_thresold', 'Compression Threshold')}
                    backgroundColor="gray5"
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                      if (/^[0-9]*$/.test(e.target.value)) {
                        field.handleChange(e.target.value);
                      }
                    }}
                    hasError={error.hasError}
                    description={error.description}
                    disabled={!isCompression}
                    CustomIcon={(): any => (
                      <ds-text as="span" color="secondary">
                        {COMPRESSION_THRESHOLD_UNIT}
                      </ds-text>
                    )}
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
};

export default MailstoresCreate;

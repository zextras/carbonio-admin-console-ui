/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Displayer,
  IconName,
  Input,
  LabeledValue,
  Padding,
  PasswordInput,
  Row,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { find, get } from 'lodash-es';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TestConnectionObjectType } from '../../../types';
import { ALIBABA, AMAZON_WEB_SERVICE_S3, CUSTOM_S3, EMC, ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';

const EditBucketDetailPanel: FC<{
  setShowEditDetailView: (value: boolean) => void;
  title: string;
  setBucketDeleteName: (value: objectType | undefined) => void;
  bucketDetail: objectType | undefined;
  setOpen: (value: boolean) => void;
  getBucketListType: () => void;
  setSelectedRow: (value: objectType | undefined) => void;
  setToggleForGetAPICall: (value: boolean) => void;
  toggleForGetAPICall: boolean;
}> = ({
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
    setSelectedRow(bucketDetail);
    const [t] = useTranslation();
    const [bucketName, setBucketName] = useState(bucketDetail?.bucketName);
    const [bucketLabel, setBucketLabel] = useState(bucketDetail?.label);
    const [bucketNotes, setBucketNotes] = useState(bucketDetail?.notes);

    const [bucketType, setBucketType] = useState<{ label: string; value: string }>();
    const [regionData, setRegionData] = useState(
      bucketDetail?.region !== undefined && bucketDetail?.region,
    );
    const [accessKeyData, setAccessKeyData] = useState(bucketDetail?.accessKey);
    const [secretKey, setSecretKey] = useState(bucketDetail?.secret);
    const [urlData, setUrlData] = useState(bucketDetail?.url !== undefined ? bucketDetail?.url : '');
    const [verify, setVerify] = useState('primary');

    const [ButtonLabel, setButtonLabel] = useState(t('label.verify_connector', 'VERIFY CONNECTOR'));
    const [buttonIcon, setButtonIcon] = useState<IconName>('ActivityOutline');
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [previousDetail, setPreviousDetail] = useState<Record<string, string | boolean>>({});
    const [showURL, setShowURL] = useState(true);
    const [toggleBtn, setToggleBtn] = useState(false);
    const [checkError, setCheckError] = useState<string>('');
    const createSnackbar = useSnackbar();
    const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
    const bucketRegions = useMemo(() => BucketRegions(t), [t]);
    const bucketRegionsInAlibaba = useMemo(() => BucketRegionsInAlibaba(t), [t]);
    const [modifiedBucketDetails, setModifiedBucketDetails] = useState<Record<string, unknown>>({
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxCore',
      action: 'doUpdateBucket',
      bucketConfigurationId: bucketDetail?.uuid,
      storeType: bucketDetail?.storeType,
    });
    const { selectedServerName } = useBucketVolumeStore((state) => state);

    const verifyConnector = useCallback(() => {
      const objToSendTestConnection: TestConnectionObjectType = {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxCore',
        action: 'testS3Connection',
        targetServers: selectedServerName,
        bucketId: bucketDetail.uuid,
      };

      if (selectedServerName === '') {
        delete objToSendTestConnection?.targetServers;
      }

      fetchSoap('zextras', objToSendTestConnection).then((res) => {
        const response = JSON.parse(res.Body.response.content);
        if (
          response.ok ||
          (response.ok === true &&
            response.response[selectedServerName] &&
            response.response[selectedServerName].ok)
        ) {
          setVerify('success');
          setButtonLabel(t('label.verify_connector_verified', ' VERIFIED'));
          setButtonIcon('ActivityOutline');
          setToggleBtn(true);
        } else {
          const errorResponse =
            response.error ||
            response.response[selectedServerName]?.error ||
            response.response[selectedServerName]?.error?.message;

          const errorResponsePart = errorResponse.split(bucketDetail.uuid);
          const errorStoreTypeMessage = errorResponsePart[1].replace('as', '');

          setVerify('error');
          setButtonLabel(
            t(
              'label.something_went_wrong_check_data_and_try_again',
              'SOMETHING WENT WRONG. CHECK DATA AND TRY AGAIN',
            ),
          );
          setButtonIcon('AlertTriangle');
          setCheckError(
            t(
              'label.bucket_verification_failed_message',
              'Verification Failed Could not test bucket configuration. {{bucketType}} not supported for this connection (ID: {{bucketId}})',
              {
                bucketType: errorStoreTypeMessage,
                bucketId: bucketDetail.uuid,
              },
            ),
          );
          setToggleBtn(false);
        }
      });
    }, [bucketDetail.uuid, selectedServerName, t]);

    useEffect(() => {
      setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
      setButtonIcon('ActivityOutline');
      setVerify('primary');
      setToggleBtn(false);
    }, [bucketDetail.uuid, t, bucketDetail]);

    useEffect(() => {
      if (bucketDetail?.url !== undefined) {
        setShowURL(true);
      } else {
        setShowURL(false);
      }
    }, [bucketDetail?.url]);

    const updatePreviousDetail = (): void => {
      const latestData: Record<string, string | boolean> = {};
      latestData.bucketName = bucketName;
      latestData.bucketLabel = bucketLabel;
      latestData.regionData = bucketDetail?.region !== undefined && regionData;
      latestData.accessKeyData = accessKeyData;
      latestData.secretKey = secretKey;
      latestData.url = bucketDetail?.url !== undefined ? urlData : '';
      setPreviousDetail(latestData);
      setIsDirty(false);
    };

    const checkIfChanged = useCallback(
      (name: string, newValue: string | boolean): void => {
        const currentValue = get(bucketDetail, name);
        if (currentValue !== newValue) {
          setModifiedBucketDetails((prev) => ({
            ...prev,
            [name]: newValue,
          }));
        } else {
          setModifiedBucketDetails((current) => {
            const copy = { ...current };
            delete copy[name];
            return copy;
          });
        }
      },
      [bucketDetail],
    );
    const onSave = (): void => {
      // API CALL
      fetchSoap('zextras', modifiedBucketDetails).then((res) => {
        const updateResData = JSON.parse(res?.Body?.response?.content);
        if (updateResData?.ok) {
          getBucketListType();
          setToggleForGetAPICall(!toggleForGetAPICall);
          setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
          setButtonIcon('ActivityOutline');
          setVerify('primary');
          setToggleBtn(false);
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
          updatePreviousDetail();
          setCheckError('');
        } else {
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
          setToggleBtn(false);
          setCheckError('');
        }
      });
    };

    const onUndo = (): void => {
      const upperBucketType =
        bucketDetail?.storeType !== EMC
          ? bucketDetail.storeType.charAt(0).toUpperCase() +
          bucketDetail.storeType.slice(1).toLowerCase()
          : bucketDetail?.storeType;
      const bucketTypeValue = find(
        bucketTypeItems,
        (o) => o.value?.toLowerCase() === upperBucketType?.toLowerCase(),
      );
      previousDetail?.bucketType
        ? setBucketType(previousDetail?.bucketType)
        : setBucketType(bucketTypeValue);
      previousDetail?.bucketLabel
        ? setBucketLabel(previousDetail?.bucketLabel)
        : setBucketLabel(bucketDetail?.label);
      previousDetail?.bucketName
        ? setBucketName(previousDetail?.bucketName)
        : setBucketName(bucketDetail?.bucketName);
      const regionValue = find(
        upperBucketType === ALIBABA && bucketDetail?.region !== undefined
          ? bucketRegionsInAlibaba
          : bucketRegions,
        (o) => o.value === bucketDetail.region,
      );
      bucketDetail?.region !== undefined && previousDetail?.regionData
        ? setRegionData(previousDetail?.regionData)
        : setRegionData(regionValue);
      previousDetail?.accessKeyData
        ? setAccessKeyData(previousDetail?.accessKeyData)
        : setAccessKeyData(bucketDetail.accessKey);
      previousDetail?.secretKey
        ? setSecretKey(previousDetail?.secretKey)
        : setSecretKey(bucketDetail.secret);
      previousDetail?.url ? setUrlData(previousDetail?.url) : setUrlData(bucketDetail.url);
      setIsDirty(false);
    };

    const onSelectionChange = useCallback(
      (e: string): void => {
        const volumeObject =
          bucketDetail?.region !== undefined && bucketDetail?.storeType === ALIBABA.toUpperCase()
            ? bucketRegionsInAlibaba.find((s) => s.value === e)
            : bucketRegions.find((s) => s.value === e);
        setRegionData(volumeObject);
        checkIfChanged('region', volumeObject?.value);
      },
      [
        bucketDetail?.region,
        bucketDetail?.storeType,
        bucketRegions,
        bucketRegionsInAlibaba,
        checkIfChanged,
      ],
    );

    useEffect(() => {
      const upperBucketType =
        bucketDetail?.storeType !== EMC && bucketDetail?.storeType !== AMAZON_WEB_SERVICE_S3
          ? bucketDetail.storeType.charAt(0).toUpperCase() +
          bucketDetail.storeType.slice(1).toLowerCase()
          : bucketDetail?.storeType;
      const customType =
        bucketDetail?.storeType === CUSTOM_S3 &&
        bucketDetail.storeType.charAt(0).toUpperCase() +
        bucketDetail.storeType.slice(1, 7).toLowerCase() +
        bucketDetail.storeType.charAt(7).toUpperCase() +
        bucketDetail.storeType.slice(8).toLowerCase();
      const bucketTypeValue = find(
        bucketTypeItems,
        (o) => o.value === (bucketDetail?.storeType === CUSTOM_S3 ? customType : upperBucketType),
      )?.value;

      if (bucketType !== undefined && bucketTypeValue !== bucketType?.value) {
        setIsDirty(true);
      }
    }, [bucketDetail, bucketDetail.storeType, bucketType, bucketTypeItems]);

    useEffect(() => {
      if (bucketName !== undefined && bucketDetail?.bucketName !== bucketName) {
        setIsDirty(true);
      }
    }, [bucketDetail?.bucketName, bucketName]);

    useEffect(() => {
      const upperBucketType =
        bucketDetail.storeType !== EMC
          ? bucketDetail.storeType.charAt(0).toUpperCase() +
          bucketDetail.storeType.slice(1).toLowerCase()
          : bucketDetail.storeType;
      const regionValue = find(
        bucketDetail?.region !== undefined && upperBucketType === ALIBABA
          ? bucketRegionsInAlibaba
          : bucketRegions,
        (o) => o?.value === bucketDetail?.region,
      )?.value;
      if (
        bucketDetail?.region !== undefined &&
        regionData?.value !== undefined &&
        regionValue !== regionData?.value
      ) {
        setIsDirty(true);
      }
    }, [
      bucketDetail.region,
      bucketDetail.storeType,
      bucketRegions,
      bucketRegionsInAlibaba,
      regionData,
    ]);

    useEffect(() => {
      if (bucketLabel !== bucketDetail?.label) {
        setIsDirty(true);
      }
    }, [bucketDetail?.label, bucketLabel]);

    useEffect(() => {
      if (accessKeyData !== undefined && bucketDetail?.accessKey !== accessKeyData) {
        setIsDirty(true);
      }
    }, [bucketDetail?.accessKey, accessKeyData]);

    useEffect(() => {
      if (secretKey !== undefined && bucketDetail?.secret !== secretKey) {
        setIsDirty(true);
      }
    }, [bucketDetail?.secret, secretKey]);

    useEffect(() => {
      if (bucketDetail?.url !== undefined) {
        if (bucketDetail?.url !== urlData) {
          setIsDirty(true);
        }
      }
    }, [bucketDetail?.url, secretKey, urlData]);

    useEffect(() => {
      const upperBucketType =
        bucketDetail.storeType !== EMC
          ? bucketDetail.storeType.charAt(0).toUpperCase() +
          bucketDetail.storeType.slice(1).toLowerCase()
          : bucketDetail.storeType;
      const regionValue = find(
        bucketDetail?.region !== undefined && upperBucketType === ALIBABA
          ? bucketRegionsInAlibaba
          : bucketRegions,
        (o) => o.value === bucketDetail.region,
      );
      const bucketTypeValue = find(
        bucketTypeItems,
        (o) => o.value?.toLowerCase() === upperBucketType?.toLowerCase(),
      );
      setRegionData(bucketDetail?.region !== undefined && regionValue);
      setBucketType(bucketTypeValue);
    }, [bucketDetail, bucketRegions, bucketRegionsInAlibaba, bucketTypeItems]);

    const buttons = [
      {
        align: 'right' as const,
        color: 'error',
        label: t('label.delete', 'delete'),
        onClick: (): void => {
          setBucketDeleteName(bucketDetail);
          setOpen(true);
        },
      },
    ];

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
            <ds-text as="h2" weight="bold">{title}</ds-text>
          </Row>
          <Row
            padding={{ all: 'small' }}
            width="50%"
            mainAlignment="flex-end"
            crossAlignment="flex-end"
          >
            <Padding right="small">
              {isDirty && (
                <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
              )}
            </Padding>
            {isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
          </Row>
          <Row padding={{ horizontal: 'small' }}>
            <Button
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={(): void => setShowEditDetailView(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>
        <Displayer buttons={buttons} pinIcon={false} />
        <Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
          <Row padding={{ top: 'small' }} width="100%">
            <LabeledValue
              backgroundColor="gray5"
              label={t('label.bucket_type', 'Bucket Type')}
              value={bucketDetail?.storeType || ''}
            />
          </Row>
          <Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.label', 'Label')}
              inputName="label"
              value={bucketLabel}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setBucketLabel(ev.target.value);
                checkIfChanged(ev.target.name, ev.target.value);
              }}
            />
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <Row
              width={bucketDetail?.region !== undefined ? '48%' : '100%'}
              mainAlignment="flex-start"
            >
              <Input
                label={t('label.bucket_name', 'Bucket Name')}
                inputName="bucketName"
                value={bucketName}
                onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                  setBucketName(ev.target.value);
                  checkIfChanged(ev.target.name, ev.target.value);
                }}
              />
            </Row>
            {bucketDetail?.region !== undefined && (
              <>
                <Padding horizontal={'small'} />
                <Row width="48%" mainAlignment="flex-end" padding={{ right: 'medium' }}>
                  <Select
                    items={
                      bucketDetail.storeType === ALIBABA.toUpperCase()
                        ? bucketRegionsInAlibaba
                        : bucketRegions
                    }
                    background="gray6"
                    label={t('label.region', 'Region')}
                    onChange={onSelectionChange}
                    selection={regionData}
                    showCheckbox={false}
                  />
                </Row>
              </>
            )}
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <Row width="48%" mainAlignment="flex-start">
              <Input
                inputName="access_key"
                label={t('label.access_key', 'Access Key')}
                value={accessKeyData}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setAccessKeyData(e.target.value);
                  checkIfChanged(e.target.name, e.target.value);
                }}
              />
            </Row>
            <Padding horizontal={'small'} />
            <Row width="48%" mainAlignment="flex-end">
              <PasswordInput
                inputName="secret"
                label={t('label.secret_key', 'Secret Key')}
                value={secretKey}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setSecretKey(e.target.value);
                  checkIfChanged(e.target.name, e.target.value);
                }}
              />
            </Row>
          </Row>
          {showURL && (
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <Input
                inputName="url"
                label={t('label.url', 'URL')}
                value={urlData}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setUrlData(e.target.value);
                  checkIfChanged(e.target.name, e.target.value);
                }}
              />
            </Row>
          )}
          <Row padding={{ top: 'small' }} width="100%">
            <LabeledValue
              backgroundColor="gray5"
              label={t('label.prefix', 'Prefix')}
              value={bucketDetail?.prefix || ''}
            />
          </Row>
          <Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.description', 'Description')}
              value={bucketNotes}
              onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
                setBucketNotes(ev.target.value);
                checkIfChanged(ev.target.name, ev.target.value);
              }}
            />
          </Row>
          <Row width="100%" padding={{ top: 'large' }} style={{ display: 'block' }}>
            <Button
              type="outlined"
              label={ButtonLabel}
              icon={buttonIcon}
              iconPlacement="right"
              size="large"
              width="fill"
              style={{ width: '100%' }}
              color={verify}
              onClick={verifyConnector}
              disabled={toggleBtn}
            />
          </Row>
          <ds-divider></ds-divider>

          {checkError !== '' && (
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
                  {checkError}
                </ds-text>
              </Row>
            </Container>
          )}
        </Container>
      </Container>
    );
  };

export default EditBucketDetailPanel;

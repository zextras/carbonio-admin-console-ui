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
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ListRow,
  ModalOverlay,
  Padding,
  Row,
  Switch,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { getSoapFetchRequest, setCoreAttributes, soapFetch, useAllServers } from '@zextras/ui-shared';
import { FC, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { HsmPolicyEditDetail, HsmPolicyFromServer, Volume } from '../../../../types';
import {
  APPOINTMENT,
  CONTACT,
  DOCUMENT,
  MESSAGE,
  SERVER,
  VOLUME_INDEX_TYPE,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { fetchSoap } from '../../../services/bucket-service';
import CreateHsmPolicy from './create-hsm-policy/create-hsm-policy';
import DeleteHsmPolicy from './delete-policy/delete-hsm-policy';
import EditHsmPolicy from './edit-hsm-policy/edit-hsm-policy';
import { asQueryString } from './hsm-policy-detail';

type Timeout = ReturnType<typeof setTimeout>;

const HSMsettingPanel: FC = () => {
  const { server } = useParams() as { server: string };
  const [t] = useTranslation();
  const [policies, setPolicies] = useState<Array<HsmPolicyFromServer>>([]);
  const [showCreateHsmPolicyView, setShowCreateHsmPolicyView] = useState<boolean>(false);
  const [showEditHsmPolicyView, setShowEditHsmPolicyView] = useState<boolean>(false);
  const [showDeletePolicyView, setShowDeletePolicyView] = useState<boolean>(false);
  const { data: serverList = [] } = useAllServers();
  const form = useForm({
    defaultValues: {
      isZxPowerstoreMoveSchedulingEnabled: false,
      powerstoreMoveSchedulerValue: '',
      powerstoreSpaceThreshold: 0,
      deduplicateAfterScheduledMoveBlobs: false,
    },
    onSubmit: async () => {},
  });
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const isZxPowerstoreMoveSchedulingEnabled = useSelector(
    form.store,
    (s) => s.values.isZxPowerstoreMoveSchedulingEnabled,
  );
  const powerstoreMoveSchedulerValue = useSelector(
    form.store,
    (s) => s.values.powerstoreMoveSchedulerValue,
  );
  const powerstoreSpaceThreshold = useSelector(
    form.store,
    (s) => s.values.powerstoreSpaceThreshold,
  );
  const deduplicateAfterScheduledMoveBlobs = useSelector(
    form.store,
    (s) => s.values.deduplicateAfterScheduledMoveBlobs,
  );
  const [volumeList, setVolumeList] = useState<Array<Volume>>([]);
  const createSnackbar = useSnackbar();
  const [selectedPolicies, setSelectedPolicies] = useState<Array<string>>([]);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [isVolumeInProgress, setIsVolumeInProgress] = useState<boolean>(false);
  const [isEditSaveInProgress, setIsEditSaveInProgress] = useState<boolean>(false);
  const timer = useRef<Timeout | undefined>(undefined);
  const storageNotLicenced = t(
    'label.storage_hsm_not_licensed',
    'Cannot complete operation: storages_hsm not licensed.',
  );
  const errorMessage = t(
    'label.something_wrong_error_msg',
    'Something went wrong. Please try again.',
  );

  const headers = [
    {
      id: 'plicy',
      label: t('hsm.policy_name', 'Policy Name'),
      width: '100%',
      bold: true,
    },
  ];

  const showSnackbar = (
    key: string,
    severity: 'success' | 'info' | 'warning' | 'error',
    message: string,
  ) => {
    createSnackbar({
      key,
      severity,
      label: message,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const getHSMPolicyList = () => {
    fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'getHSMPolicy',
      targetServers: server,
    }).then((res) => {
      if (res?.Body?.response?.content) {
        const content = JSON.parse(res?.Body?.response?.content);
        if (
          content?.response?.[server]?.response?.policies &&
          Array.isArray(content?.response?.[server]?.response?.policies) &&
          content?.response?.[server]?.response?.policies?.length > 0
        ) {
          setPolicies(content?.response?.[server]?.response?.policies);
        } else {
          setPolicies([]);
        }
      }
    });
  };

  useEffect(() => {
    getHSMPolicyList();
  }, [server, getHSMPolicyList]);

  const getHSMType = (hsmType: Array<number>): string => {
    let hsmTypeString = '';
    if (hsmType.length > 0) {
      const item: string[] = [];
      if (hsmType.length === 4) {
        hsmTypeString = 'document,message,contact,appointment:';
      } else {
        hsmType.forEach((element: number) => {
          if (element === 5) {
            item.push(MESSAGE);
          } else if (element === 8) {
            item.push(DOCUMENT);
          } else if (element === 11) {
            item.push(APPOINTMENT);
          } else if (element === 6) {
            item.push(CONTACT);
          }
        });
        hsmTypeString = `${item.join()}:`;
      }
    }
    return hsmTypeString;
  };

  const doClickAction = (): void => { };

  const doDoubleClickAction = (): void => {
    setShowEditHsmPolicyView(true);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    clearTimeout(timer.current);
    if (event.detail === 1) {
      timer.current = setTimeout(doClickAction, 300);
    } else if (event.detail === 2) {
      doDoubleClickAction();
    }
  };

  const policiesRow =
    policies.length > 0
      ? policies.map((item: HsmPolicyFromServer) => ({
          id: item?.hsmQuery,
          columns: [
            <ds-text
              as="span"
              size="small"
              weight="regular"
              key={item?.hsmQuery}
              onClick={(e: React.MouseEvent): void => {
                e.stopPropagation();
                setSelectedPolicies([item?.hsmQuery]);
                handleClick(e);
              }}
            >
              {getHSMType(item?.hsmType)}
              {item?.hsmQuery}
            </ds-text>,
          ],
        }))
      : [];

  const setValuesFromAttributes = (
    attributes: Record<string, { value: unknown }> | undefined,
  ) => {
    if (!attributes) return;
    const newValues = { ...form.state.values };
    if (attributes?.powerstoreMoveScheduler) {
      const schedulePattern = (
        attributes?.powerstoreMoveScheduler?.value as Record<string, string> | undefined
      )?.['cron-pattern'];
      newValues.powerstoreMoveSchedulerValue = schedulePattern || '';
    }
    if (attributes?.ZxPowerstore_SpaceThreshold) {
      const spaceThreshold = attributes?.ZxPowerstore_SpaceThreshold?.value;
      newValues.powerstoreSpaceThreshold = (spaceThreshold as number) || 0;
    }
    if (attributes?.deduplicateAfterScheduledMoveBlobs) {
      const duplicate = attributes?.deduplicateAfterScheduledMoveBlobs;
      newValues.deduplicateAfterScheduledMoveBlobs = !!duplicate?.value;
    }
    if (attributes?.ZxPowerstore_MoveSchedulingEnabled) {
      const moveScheduling = attributes?.ZxPowerstore_MoveSchedulingEnabled?.value;
      newValues.isZxPowerstoreMoveSchedulingEnabled = moveScheduling === true;
    }
    form.reset(newValues);
  };

  const getZxPowerStoreServers = () => {
    getSoapFetchRequest(
      `/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`,
    ).then((data: unknown) => {
      const serv = (data as { servers?: Array<Record<string, Record<string, unknown>>> })?.servers;
      if (serv && serv.length > 0) {
        const object = Object.values(serv).map((i) => Object.values(i)[0]) as Array<Record<string, unknown>>;
        const selectedServer = object.find((sItem) => (sItem as { name?: string }).name === server) as Record<string, unknown> | undefined;
        if (selectedServer) {
          const values = selectedServer;
          if (values) {
            const attributes = (values?.ZxPowerstore as { attributes?: Record<string, { value: unknown }> })?.attributes;
            setValuesFromAttributes(attributes);
          }
        }
      }
    });
  };

  const getAllVolumes = () => {
    const serverId = serverList.find((item: { name?: string }) => item?.name === server);
    setIsVolumeInProgress(true);
    setVolumeList([]);
    if (serverId) {
      (soapFetch(
        'GetAllVolumes',
        {
          _jsns: ZIMBRA_ADMIN_URN,
        },
        {
          targetServer: serverId.id,
        },
      ) as Promise<{ volume?: Array<Volume> }>).then((response) => {
        setIsVolumeInProgress(false);
        if (response?.volume && response?.volume.length > 0) {
          setVolumeList(response?.volume.filter((item: Volume) => item.type !== VOLUME_INDEX_TYPE));
        }
      });
    }
  };

  useEffect(() => {
    if (server && serverList && serverList.length > 0) {
      getZxPowerStoreServers();
      getAllVolumes();
    }
  }, [server, getZxPowerStoreServers, serverList, getAllVolumes]);

  const onCancel = () => {
    form.reset();
  };

  const onSave = () => {
    setIsRequestInProgress(true);
    const values = form.state.values;
    const body = {
      powerstoreMoveScheduler: {
        value: {
          'cron-pattern': values.powerstoreMoveSchedulerValue,
          'cron-enabled': values.isZxPowerstoreMoveSchedulingEnabled,
        },
        objectName: server,
        configType: SERVER,
      },
      ZxPowerstore_SpaceThreshold: {
        value: values.powerstoreSpaceThreshold,
        objectName: server,
        configType: SERVER,
      },
      deduplicateAfterScheduledMoveBlobs: {
        value: values.deduplicateAfterScheduledMoveBlobs,
        objectName: server,
        configType: SERVER,
      },
      ZxPowerstore_MoveSchedulingEnabled: {
        value: values.isZxPowerstoreMoveSchedulingEnabled,
        objectName: server,
        configType: SERVER,
      },
    };
    setCoreAttributes<{ errors?: Array<{ error: string }>; error?: string }>(body)
      .then((data) => {
        setIsRequestInProgress(false);
        if ((data?.errors && Array.isArray(data?.errors)) || data?.error) {
          let errMessage = errorMessage;
          if (data?.errors && Array.isArray(data?.errors) && data?.errors[0]?.error) {
            errMessage = data?.errors[0]?.error;
          } else if (data?.error) {
            errMessage = data?.error;
          }
          showSnackbar('error', 'error', errMessage);
        } else {
          form.reset(values, { keepDefaultValues: true });
          showSnackbar(
            'success',
            'success',
            t(
              'label.the_last_changes_has_been_saved_successfully',
              'Changes have been saved successfully',
            ),
          );
        }
      })
      .catch((error: { error?: string }) => {
        setIsRequestInProgress(false);
        showSnackbar('error', 'error', error ? error?.error ?? errorMessage : errorMessage);
      });
  };

  const onDeletePolicy = (isEditSave?: boolean) => {
    setIsRequestInProgress(true);
    const hType = policies.find((item: HsmPolicyFromServer) => item?.hsmQuery === selectedPolicies[0]);
      fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'removeHSMPolicy',
        targetServers: server,
        hsmPolicy: `${getHSMType(hType?.hsmType ?? [])}${selectedPolicies[0]}`.trim(),
      })
        .then((res) => {
          setIsRequestInProgress(false);
          if (res?.Body?.response?.content) {
            const info = JSON.parse(res?.Body?.response?.content);
            getHSMPolicyList();
            if (info?.response?.[server]?.ok) {
              setSelectedPolicies([]);
              setShowDeletePolicyView(false);
              setIsEditSaveInProgress(false);
              if (isEditSave) {
                setShowEditHsmPolicyView(false);
                showSnackbar(
                  'success',
                  'success',
                  t('hsm.edit_hsm_policy_success', 'HSM Policy updated successfully'),
                );
              } else {
                showSnackbar(
                  'success',
                  'success',
                  t('hsm.hsm_policy_correctly_deleted', 'HSM Policy was correctly deleted'),
                );
              }
            }
          }
        })
        .catch((error) => {
          setIsRequestInProgress(false);
          setIsEditSaveInProgress(false);
          showSnackbar('error', 'error', error?.message ? error?.message : errorMessage);
        });
  };

  const parseResponse = (
    isEditSave: boolean | undefined,
    info: { ok?: boolean; error?: { code?: string; message?: string }; exception?: { message: string } },
    isRunOperation?: boolean,
  ) => {
    if (info?.ok) {
      if (isEditSave) {
        onDeletePolicy(isEditSave);
      } else {
        setShowCreateHsmPolicyView(false);
        getHSMPolicyList();
        if (isRunOperation) {
          showSnackbar(
            'success',
            'success',
            t('hsm.policies_executed_successfully', 'HSM policies executed successfully'),
          );
        } else {
          showSnackbar(
            'success',
            'success',
            t('hsm.policies_added_successfully', 'Policies have been added successfully'),
          );
        }
      }
    } else if (info?.error && info?.error?.code === 'MODULE_OR_FEATURE_NOT_LICENSED') {
      setIsEditSaveInProgress(false);
      showSnackbar('error', 'error', storageNotLicenced);
    } else if (info?.error?.message) {
      setIsEditSaveInProgress(false);
      showSnackbar('error', 'error', info?.error?.message);
    } else if (info?.exception?.message) {
      setIsEditSaveInProgress(false);
      showSnackbar('error', 'error', info?.exception?.message);
    }
  };

  const hsmPolicyOperation = (
    hsmPolicyDetail?: HsmPolicyEditDetail,
    isEditSave?: boolean,
    isRunCustomPolicy?: boolean,
  ) => {
    const request: Record<string, unknown> = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: isRunCustomPolicy ? 'doMoveBlobs' : 'setHSMPolicy',
      targetServers: server,
      policyToAdd: true,
    };
      if (isRunCustomPolicy) {
        request.command = 'start';
      }
      if (hsmPolicyDetail) {
        if (
          hsmPolicyDetail?.isContactEnabled === false &&
          hsmPolicyDetail?.isDocumentEnabled === false &&
          hsmPolicyDetail?.isEventEnabled === false &&
          hsmPolicyDetail?.isMessageEnabled === false
        ) {
          showSnackbar(
            'error',
            'error',
            t('hsm.select_at_least_one_item', 'Select at least one item'),
          );
          return;
        }
        if (hsmPolicyDetail?.policyCriteria.length === 0) {
          showSnackbar(
            'error',
            'error',
            t('hsm.add_at_least_one_criteria', 'Add at least one criteria'),
          );
          return;
        }
        const policy = asQueryString(hsmPolicyDetail);
        request.hsmPolicy = policy.trim();
      }
      fetchSoap('zextras', {
        ...request,
      })
        .then((res) => {
          if (res?.Body?.response?.content) {
            const info = JSON.parse(res?.Body?.response?.content);
            parseResponse(isEditSave, info?.response?.[server], isRunCustomPolicy);
          }
        })
        .catch((error) => {
        setIsEditSaveInProgress(false);
        showSnackbar('error', 'error', error?.message ? error?.message : errorMessage);
      });
  };

  const createHSMpolicy = (
    hsmPolicyDetail: HsmPolicyEditDetail,
    isEditSave?: boolean,
  ) => {
    hsmPolicyOperation(hsmPolicyDetail, isEditSave);
  };

  const runCustomHSMpolicy = (hsmPolicyDetail: HsmPolicyEditDetail) => {
    hsmPolicyOperation(hsmPolicyDetail, undefined, true);
  };

  const onEditSave = (editDetail: HsmPolicyEditDetail) => {
    setIsEditSaveInProgress(true);
    createHSMpolicy(editDetail, true);
  };

  const runAllHSMpolicy = () => {
    hsmPolicyOperation(undefined, undefined, true);
  };

  return (
    <Container mainAlignment="flex-start" width="100%">
      <Row
        takeAvailableSpace
        mainAlignment="flex-start"
        width="100%"
        padding={{ left: 'large', right: 'large', bottom: 'medium', top: 'medium' }}
      >
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="2.5rem"
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
            <Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
              <ds-text as="h3" size="medium" weight="bold" color="gray0">
                {
                  <Trans
                    i18nKey="hsm.name_hsm_policies"
                    defaults="<bold>{{serverName}} HSM Policies</bold>"
                    components={{ bold: <strong /> }}
                    values={{
                      serverName: server,
                    }}
                  />
                }
              </ds-text>
            </Row>
            <Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding right="small">
                {isDirty && (
                  <Button
                    label={t('label.cancel', 'Cancel')}
                    color="secondary"
                    onClick={onCancel}
                  />
                )}
              </Padding>
              {isDirty && (
                <Button
                  label={t('label.save', 'Save')}
                  color="primary"
                  onClick={onSave}
                  disabled={isRequestInProgress}
                  loading={isRequestInProgress}
                />
              )}
            </Row>
          </Row>
        </Container>
      </Row>

      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        padding={{ all: 'large' }}
        style={{ overflow: 'auto' }}
        height="calc(100vh - 10.625rem)"
      >
        <ListRow>
          <Padding top="large" bottom="large">
            <ds-text as="p" size="medium" weight="regular">
              {t('hsm.scheduling', 'Scheduling')}
            </ds-text>
          </Padding>
        </ListRow>
        <ListRow>
          <Padding bottom="large">
            <Switch
              label={t('hsm.enable_scheduler', 'Enable Scheduler')}
              value={isZxPowerstoreMoveSchedulingEnabled}
              onClick={(): void =>
                form.setFieldValue(
                  'isZxPowerstoreMoveSchedulingEnabled',
                  !isZxPowerstoreMoveSchedulingEnabled,
                )
              }
              iconColor="primary"
            />
          </Padding>
        </ListRow>
        <ListRow>
          <Container padding={{ bottom: 'large' }}>
            <Input
              label={`${t('hsm.schedule', 'Schedule')} (${t(
                'hsm.example_shedule',
                'E.g. 0 2 * * 3',
              )})`}
              backgroundColor="gray5"
              value={powerstoreMoveSchedulerValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                form.setFieldValue('powerstoreMoveSchedulerValue', e.target.value);
              }}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Switch
            label={t(
              'hsm.apply_duplication_after_scheduledhsm',
              'Apply Deduplication after scheduled HSM',
            )}
            value={deduplicateAfterScheduledMoveBlobs}
            onClick={(): void =>
              form.setFieldValue(
                'deduplicateAfterScheduledMoveBlobs',
                !deduplicateAfterScheduledMoveBlobs,
              )
            }
            iconColor="primary"
          />
        </ListRow>
        <ListRow>
          <Container
            padding={{ left: 'extralarge' }}
            crossAlignment="flex-start"
            mainAlignment="flex-start"
          >
            <Padding left="small">
              <ds-text as="span" size="extrasmall" weight="regular" color="secondary">
                {t(
                  'hsm.this_function_allow_save_disk_copy_msg',
                  'This function allows you to save disk space by storing a single copy of an item.',
                )}
              </ds-text>
            </Padding>
          </Container>
        </ListRow>

        <Row mainAlignment="flex-start" width="100%">
          <Container
            orientation="vertical"
            mainAlignment="space-around"
            background="gray6"
            padding={{ top: 'large' }}
          >
            <Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
              <Row
                mainAlignment="flex-start"
                width="50%"
                crossAlignment="flex-start"
                style={{ alignSelf: 'end' }}
              >
                <ds-text as="h3" size="medium" weight="bold" color="gray0">
                  {t('hsm.hsm_policies_list', 'HSM Policies List')}
                </ds-text>
              </Row>
              <Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
                <Padding right="medium">
                  <Button
                    label={t('hsm.new', 'New')}
                    type="outlined"
                    color="primary"
                    onClick={(): void => {
                      setShowCreateHsmPolicyView(true);
                    }}
                    loading={isVolumeInProgress}
                    disabled={isVolumeInProgress}
                  />
                </Padding>
                <Padding right="medium">
                  <Button
                    label={t('hsm.run_all', 'Run All')}
                    type="outlined"
                    color="primary"
                    onClick={(): void => {
                      runAllHSMpolicy();
                    }}
                    disabled={policiesRow.length === 0}
                    loading={isVolumeInProgress}
                  />
                </Padding>
                <Button
                  label={t('hsm.delete', 'Delete')}
                  color="error"
                  type="outlined"
                  onClick={(): void => {
                    setShowDeletePolicyView(true);
                  }}
                  disabled={selectedPolicies.length === 0}
                  loading={isVolumeInProgress}
                />
              </Row>
            </Row>
          </Container>
        </Row>
        <ListRow>
          <Padding left="extrasmall" bottom="medium">
            <ds-text as="span" size="small" weight="light" color="gray0">
              {t(
                'hsm.default_hsm_policy_warning_message',
                'At least one policy will always stay up. If you delete the last one, another will be generated',
              )}
            </ds-text>
          </Padding>
        </ListRow>

        <ListRow>
          <Table
            rows={policiesRow}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            selectedRows={selectedPolicies as [] | [string]}
            HeaderFactory={CustomHeaderFactory}
            RowFactory={HoverableRowFactory}
          />
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <Input
              label={t('hsm.minimum_space_threshold', 'Minimum Space Threshold')}
              backgroundColor="gray5"
              value={powerstoreSpaceThreshold}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                form.setFieldValue('powerstoreSpaceThreshold', Number(e.target.value) || 0);
              }}
            />
          </Container>
        </ListRow>
      </Container>
      {showCreateHsmPolicyView && (
        <ModalOverlay open={showCreateHsmPolicyView}>
          <CreateHsmPolicy
            setShowCreateHsmPolicyView={setShowCreateHsmPolicyView}
            volumeList={volumeList}
            createHSMpolicy={createHSMpolicy}
            runCustomHSMpolicy={runCustomHSMpolicy}
          />
        </ModalOverlay>
      )}
      {showEditHsmPolicyView && (
        <EditHsmPolicy
          setShowEditHsmPolicyView={setShowEditHsmPolicyView}
          policies={policies}
          selectedPolicies={selectedPolicies[0]}
          volumeList={volumeList}
          onEditSave={onEditSave}
          isEditSaveInProgress={isEditSaveInProgress}
        />
      )}
      {showDeletePolicyView && (
        <DeleteHsmPolicy
          showDeletePolicyView={showDeletePolicyView}
          setShowDeletePolicyView={setShowDeletePolicyView}
          selectedPolicies={selectedPolicies[0]}
          onDeletePolicy={onDeletePolicy}
          isRequestInProgress={isRequestInProgress}
          policies={policies}
        />
      )}
    </Container>
  );
};

export default HSMsettingPanel;

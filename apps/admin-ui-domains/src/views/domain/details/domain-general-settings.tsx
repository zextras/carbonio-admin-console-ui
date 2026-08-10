/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, ChipInput, ChipItem, Container, CustomTextArea, Input, LabeledValue, ListRow, Modal, Padding, RouteLeavingGuard, Row, Select, useSnackbar, } from '@zextras/ui-components';
import { type DirectoryEntry, domainByIdKey, type DomainDirectories, flushCache, replaceHistory, searchDirectory, useCosList, useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import { cloneDeep, filter, find, isEqual, map, some } from 'lodash-es';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { CosMaxAccountValues, Domain, objectType } from '../../../../types';
import {
  ACTIVE,
  CLOSED,
  HTTP,
  HTTPS,
  LOCKED,
  MAINTENANCE,
  NOT_SET,
  SUSPENDED,
  TRUE,
  ZIMBRA_ADMIN_URN,
  ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS,
} from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { batchService } from '../../../services/batch-service';
import { deleteDomain } from '../../../services/delete-domain-service';
import { getDomainQuota } from '../../../services/get-domain-quota';
import { modifyDomain } from '../../../services/modify-domain-service';
import { setDomainQuota } from '../../../services/set-domain-quota';
import { unsetDomainQuota } from '../../../services/unset-domain-quota';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';
import {
  BytesToGB,
  GbToBytes,
  getDateFromStr,
  getFormatedDate,
  isValidEmail,
  timeZoneList,
} from '../../utility/utils';
import { DomainFormActions } from './components/domain-form-actions';
import DomainCosLink from './domain-cos-link';
import DomainListChipInput from './parts/domain-list-chip-input';
import QuotaReportDownloadButton from './quota-report-download-button';
import {
  buildGeneralAttributes,
  type GeneralFormState,
  isGeneralFormDirty,
  parseGeneralFormFromAttributes
} from './schemas/general-settings-types';

const DomainGeneralSettings: FC = () => {
  const [t] = useTranslation();
  const timezones = useMemo(() => timeZoneList(t), [t]);
  const { data: cosData } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const cosList = cosData?.cos ?? [];
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const queryClient = useQueryClient();
  const { domainId } = useParams();
  const createSnackbar = useSnackbar();
  const userSetting = useUserSettings();
  const isAdvanced = useIsAdvanced();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
  const serviceProtocolItems: any = useMemo(
    () => [
      {
        value: NOT_SET,
        label: t('label.not_set', 'Not Set'),
      },
      {
        label: `${t('label.https', 'https')} (${t('label.secure', 'secure')})`,
        value: HTTPS,
      },
      {
        label: `${t('label.http', 'http')} (${t('label.unsecure', 'unsecure')})`,
        value: HTTP,
      },
    ],
    [t],
  );

  const domainStatusItems = useMemo(
    () => [
      {
        label: t('label.active', 'Active'),
        value: ACTIVE,
      },
      {
        label: `${t('label.closed', 'Closed')} (${t('label.soft_deleted', 'Soft-deleted')})`,
        value: CLOSED,
      },
      {
        label: `${t('label.locked', 'Locked')} (${t(
          'label.login_is_disabled',

          'Login is disabled',
        )})`,
        value: LOCKED,
      },
      {
        label: `${t('label.in_maintenance', 'In maintenance')} (${t(
          'label.login_is_disabled',
          'Login is disabled',
        )})`,
        value: MAINTENANCE,
      },
      {
        label: `${t('label.suspended', 'Suspended')} (${t(
          'label.login_is_disabled',
          'Login is disabled',
        )})`,
        value: SUSPENDED,
      },
    ],
    [t],
  );

  // Form state - replaces many individual useState
  const [formState, setFormState] = useState<GeneralFormState | null>(null);
  const [originalFormState, setOriginalFormState] = useState<GeneralFormState | null>(null);

  // UI state for Select components
  const [selectedTimeZone, setSelectedTimeZone]: any = useState(timezones[0]);
  const [selectedPublicServiceProtocol, setSelectedPublicServiceProtocol]: any = useState(
    serviceProtocolItems[0],
  );
  const [domainStatus, setDomainStatus] = useState<any>(domainStatusItems[0]);

  // COS state
  const [cosItems, setCosItems] = useState<any[]>([]);
  const [cosMaxAccountList, SetCosMaxAccountList] = useState<Array<CosMaxAccountValues>>([]);

  // Modal state
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [openDeleteDomainConfirmDialog, setOpenDeleteDomainConfirmDialog] =
    useState<boolean>(false);
  const [confirmDomainName, setConfirmDomainName] = useState<string>('');

  // Validation state
  const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Delete domain state
  const [domainDirectories, setDomainDirectories] = useState<DomainDirectories>({
    account: [],
    dl: [],
    alias: [],
    calresource: [],
  });
  const [isRequstInProgress, setIsRequestInProgress] = useState<boolean>(true);

  // Domain quota state (advanced mode)
  const [domainQuotaGB, setDomainQuotaGB] = useState<string>('');
  const [initDomainQuotaGB, setInitDomainQuotaGB] = useState<string>('');

  // Computed isDirty using the helper function
  const isDirty = isGeneralFormDirty(originalFormState, formState, domainQuotaGB, initDomainQuotaGB);

  // Build COS items for Select component
  useEffect(() => {
    if (cosList && cosList.length > 0) {
      const arrayItem: any[] = cosList.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      setCosItems(arrayItem);
    }
  }, [cosList]);

  // Initialize form state from domain data
  useEffect(() => {
    if (!domainInformation || domainInformation.length === 0) return;

    // Reset domain directories
    setDomainDirectories({
      account: [],
      dl: [],
      alias: [],
      calresource: [],
    });

    // Parse form state from attributes
    const parsed = parseGeneralFormFromAttributes(domainInformation);
    if (parsed) {
      setFormState(parsed);
      setOriginalFormState(parsed);

      // Update Select component states
      const tz = timezones.find((item) => item.value === parsed.zimbraPrefTimeZoneId);
      setSelectedTimeZone(tz ?? timezones[0]);

      const protocol = serviceProtocolItems.find(
        (item: any) => item.value === parsed.zimbraPublicServiceProtocol
      );
      setSelectedPublicServiceProtocol(protocol ?? serviceProtocolItems[0]);

      const status = domainStatusItems.find(
        (item) => item.value === parsed.zimbraDomainStatus
      );
      setDomainStatus(status ?? domainStatusItems[0]);

      // Parse COS max accounts
      const domainCosMaxAccountArray = domainInformation.filter(
        (domainContent: any) => domainContent.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS,
      );
      if (domainCosMaxAccountArray.length > 0) {
        const domainCosMaxAccounts = domainCosMaxAccountArray.map((domainContent: any) => ({
          id: domainContent._content?.split(':')[0],
          value: domainContent._content?.split(':')[1] ?? -1,
        }));
        SetCosMaxAccountList(domainCosMaxAccounts);
      } else {
        SetCosMaxAccountList([]);
      }
    }
  }, [domainInformation, domainStatusItems, serviceProtocolItems, timezones]);

  // Fetch domain quota when zimbraId is available (advanced mode only)
  useEffect(() => {
    if (isAdvanced && formState?.zimbraId) {
      getDomainQuota(formState.zimbraId).then((result) => {
        if (result.type === 'success') {
          const gb = String(BytesToGB(result.limit));
          setDomainQuotaGB(gb);
          setInitDomainQuotaGB(gb);
        }
      });
    }
  }, [formState?.zimbraId, isAdvanced]);

  // Helper to update form state field
  const updateFormField = <K extends keyof GeneralFormState>(
    field: K,
    value: GeneralFormState[K]
  ): void => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const onTimeZoneChange = (v: any): void => {
    const it = timezones.find((item: any) => item.value === v);
    setSelectedTimeZone(it);
    updateFormField('zimbraPrefTimeZoneId', v ?? '');
  };

  const onPublicServiceProtocolChange = (v: any): void => {
    const it = serviceProtocolItems.find((item: any) => item.value === v);
    setSelectedPublicServiceProtocol(it);
    updateFormField('zimbraPublicServiceProtocol', v ?? '');
  };

  const onDomainStatusChange = (v: any): void => {
    const it = domainStatusItems.find((item: any) => item.value === v);
    setDomainStatus(it);
    updateFormField('zimbraDomainStatus', v ?? '');
  };
  const onCancel = (): void => {
    if (!originalFormState) return;

    // Reset form state
    setFormState(cloneDeep(originalFormState));

    // Reset Select component states
    const protocol = serviceProtocolItems.find(
      (item: any) => item.value === originalFormState.zimbraPublicServiceProtocol,
    );
    setSelectedPublicServiceProtocol(protocol ?? serviceProtocolItems[0]);

    const tz = timezones.find(
      (item) => item.value === originalFormState.zimbraPrefTimeZoneId
    );
    setSelectedTimeZone(tz ?? timezones[0]);

    const status = domainStatusItems.find(
      (item) => item.value === originalFormState.zimbraDomainStatus
    );
    setDomainStatus(status ?? domainStatusItems[0]);

    // Reset domain quota
    if (isAdvanced) {
      setDomainQuotaGB(initDomainQuotaGB);
    }
  };
  const handleSuccess = (data: { domain: Domain[] }): void => {
    if (isGlobalAdmin && formState?.zimbraId) {
      flushCache('domain', 'id', formState.zimbraId);
    }
    createSnackbar({
      key: 'success',
      severity: 'success',
      label: t('label.change_save_success_msg', 'The change has been saved successfully'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
    const newDomain: Domain = data?.domain[0];
    if (newDomain) {
      queryClient.setQueryData(domainByIdKey(domainId, 1), newDomain);
    }
    setIsLoading(false);
  };

  const handleError = (error: { message?: string }): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: error?.message
        ? error?.message
        : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
    setIsLoading(false);
  };

  const isInvalidEmail = (): boolean =>
    !(isValidEmail(formState?.carbonioNotificationFrom ?? '') || formState?.carbonioNotificationFrom === '');

  const onSave = (): void => {
    if (!formState) return;

    if (isInvalidEmail()) {
      setHasCarbonioNotificationFromError(true);
      return;
    }

    setIsLoading(true);
    setHasCarbonioNotificationFromError(false);

    const attributes = buildGeneralAttributes({
      state: formState,
      isGlobalAdmin,
      isAdvanced
    });

    const body = {
      id: formState.zimbraId,
      _jsns: ZIMBRA_ADMIN_URN,
      a: attributes,
    };

    modifyDomain(body).then(handleSuccess).catch(handleError);

    if (isAdvanced && domainQuotaGB !== initDomainQuotaGB) {
      const quotaPromise =
        domainQuotaGB === ''
          ? unsetDomainQuota(formState.zimbraId)
          : setDomainQuota(formState.zimbraId, GbToBytes(Number(domainQuotaGB)));

      quotaPromise.then((result) => {
        if (result.type === 'success') {
          setInitDomainQuotaGB(domainQuotaGB);
        } else {
          createSnackbar({
            key: 'quota-error',
            severity: 'error',
            label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
      });
    }
  };

  const deleteOnlyDomain = useCallback((): void => {
    if (!formState?.zimbraId) return;
    deleteDomain(formState.zimbraId).then(() => {
      setIsRequestInProgress(false);
      setOpenDeleteDomainConfirmDialog(false);
      setDomainDirectories({
        account: [],
        dl: [],
        alias: [],
        calresource: [],
      });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.delete_domain_success_msg', 'Domain has been deleted successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      replaceHistory(`/`);
    });
  }, [createSnackbar, formState?.zimbraId, t]);

  const onDeleteAccountAndDomain = (): void => {
    setIsRequestInProgress(true);
    const accountDeleteBatch: any[] = [];
    const dlDeleteBatch: any[] = [];
    const resourceDeleteBatch: any[] = [];

    domainDirectories.account.forEach((item: any): any =>
      accountDeleteBatch.push({
        id: item?.id,
        _jsns: ZIMBRA_ADMIN_URN,
      }),
    );
    domainDirectories.dl.forEach((item: any): any =>
      dlDeleteBatch.push({
        id: { _content: item?.id },
        _jsns: ZIMBRA_ADMIN_URN,
      }),
    );
    domainDirectories.calresource.forEach((item: any): any =>
      resourceDeleteBatch.push({
        id: item?.id,
        _jsns: ZIMBRA_ADMIN_URN,
      }),
    );
    batchService({
      DeleteDistributionListRequest: dlDeleteBatch,
      DeleteCalendarResourceRequest: resourceDeleteBatch,
      DeleteAccountRequest: accountDeleteBatch,
      _jsns: 'urn:zimbra',
    }).then((res) => {
      if (res?.Fault) {
        res?.Fault?.forEach((item: any) =>
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: item?.Reason?.Text,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          }),
        );
        setIsRequestInProgress(false);
      } else {
        deleteOnlyDomain();
      }
    });
  };

  const domainCreationDate = useMemo(
    () =>
      formState?.zimbraCreateTimestamp
        ? getFormatedDate(getDateFromStr(formState.zimbraCreateTimestamp))
        : '',
    [formState?.zimbraCreateTimestamp],
  );

  // Derive domain name from formState
  const domainName = formState?.zimbraDomainName ?? '';
  const getAllDirectories = useCallback(
    (
      offset: number,
      limit: number,
      accountListArr: DirectoryEntry[],
      dlListArr: DirectoryEntry[],
      aliasListArr: DirectoryEntry[],
      calResourceArr: DirectoryEntry[],
    ): void => {
      const type = 'accounts,distributionlists,aliases,resources,dynamicgroups';
      const attrs =
        'zimbraAliasTargetId,zimbraId,targetName,uid,type,description,displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,displayName,zimbraId,zimbraMailHost,uid,zimbraAccountStatus,description,zimbraCalResType,displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus, zimbraIsSystemAccount';
      searchDirectory({ attr: attrs, type, domainName, query: '', offset, limit })
        .then((data) => {
          if (data?.account?.length) {
            data.account.forEach((item: DirectoryEntry) => {
              const zimbraIsSystemAccount = find(item.a, { n: 'zimbraIsSystemAccount' });
              if (zimbraIsSystemAccount) {
                item.zimbraIsSystemAccount = zimbraIsSystemAccount._content;
              }
              return item;
            });
            accountListArr.push(...data.account);
          }
          if (data?.dl?.length) {
            dlListArr.push(...data.dl);
          }
          if (data?.alias?.length) {
            aliasListArr.push(...data.alias);
          }
          if (data?.calresource?.length) {
            calResourceArr.push(...data.calresource);
          }
          if (data?.more) {
            getAllDirectories(
              offset + limit,
              limit,
              cloneDeep(accountListArr),
              cloneDeep(dlListArr),
              cloneDeep(aliasListArr),
              cloneDeep(calResourceArr),
            );
          } else if ((data?.searchTotal ?? 0) > 0) {
            if (
              accountListArr?.length ||
              dlListArr?.length ||
              aliasListArr?.length ||
              calResourceArr?.length
            ) {
              setDomainDirectories({
                account: cloneDeep(accountListArr),
                dl: cloneDeep(dlListArr),
                alias: cloneDeep(aliasListArr),
                calresource: cloneDeep(calResourceArr),
              });
              setOpenConfirmDialog(false);
              setOpenDeleteDomainConfirmDialog(true);
            } else {
              deleteOnlyDomain();
            }
          } else if (data?.searchTotal === 0) {
            deleteOnlyDomain();
          }
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, deleteOnlyDomain, domainName, t],
  );

  const onDeleteDomain = (): void => {
    setIsRequestInProgress(true);
    getAllDirectories(0, 1000, [], [], [], []);
  };

  const onCloseDomain = (): void => {
    if (!formState?.zimbraId) return;

    setConfirmDomainName('');
    setOpenDeleteDomainConfirmDialog(false);
    const body = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: formState.zimbraId,
      a: [
        {
          n: 'zimbraDomainStatus',
          _content: domainStatusItems[1].value,
        },
      ],
    };
    setIsRequestInProgress(true);
    modifyDomain(body)
      .then((data) => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.domain_close_success_msg', 'Domain has been closed successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        if (isGlobalAdmin) {
          flushCache('domain', 'id', formState.zimbraId);
        }
        const closedDomain = data?.domain[0];
        if (closedDomain) {
          queryClient.setQueryData(domainByIdKey(domainId, 1), closedDomain);
        }
        // Update form state with new status
        setFormState((prev) =>
          prev ? { ...prev, zimbraDomainStatus: domainStatusItems[1].value } : prev
        );
        setOriginalFormState((prev) =>
          prev ? { ...prev, zimbraDomainStatus: domainStatusItems[1].value } : prev
        );
        setDomainStatus(domainStatusItems[1]);
        setIsRequestInProgress(false);
      })
      .catch((error) => {
        setIsRequestInProgress(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  // Show shimmer while loading form state
  if (!formState) {
    return (
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <ds-page-shimmer rows={6} />
      </Container>
    );
  }

  return (
    <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
      {isLoading && <ds-spinner></ds-spinner>}
      <Row mainAlignment="flex-start" width="100%">
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="58px"
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
              <ds-text as="h2" size="medium" weight="bold" color="gray0">
                {t('label.general_settings', 'General Settings')}
              </ds-text>
            </Row>
            <DomainFormActions
              isDirty={isDirty}
              isPending={isLoading}
              onCancel={onCancel}
              onSave={onSave}
            />
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>

      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 150px)"
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container
            height="fit"
            crossAlignment="flex-start"
            background="gray6"
            padding={{ all: 'small' }}
          >
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <LabeledValue
                  label={t('label.name', 'Name')}
                  value={domainName}
                  backgroundColor="gray6"
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <LabeledValue
                  label={t('label.id', 'Id')}
                  value={formState?.zimbraId ?? ''}
                  backgroundColor="gray6"
                />
              </Container>
            </ListRow>

            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t(
                    'label.max_manageable_account_for_the_domain',
                    'Max manageable account for the domain (0=unlimited)',
                  )}
                  value={formState?.zimbraDomainMaxAccounts ?? ''}
                  backgroundColor="gray6"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateFormField('zimbraDomainMaxAccounts', e.target.value);
                  }}
                  disabled={!isGlobalAdmin}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <LabeledValue
                  label={t('label.creation_date', 'Creation Date')}
                  value={domainCreationDate}
                  backgroundColor="gray6"
                />
              </Container>
            </ListRow>

            <ListRow></ListRow>

            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Select
                  items={serviceProtocolItems}
                  background="gray5"
                  label={t('label.public_service_protocol', 'Public Service Protocol')}
                  showCheckbox={false}
                  onChange={onPublicServiceProtocolChange}
                  selection={selectedPublicServiceProtocol}
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <Input
                  isRequired
                  label={t('label.public_service_hostname', 'Public Service Host Name')}
                  value={formState?.zimbraPublicServiceHostname ?? ''}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateFormField('zimbraPublicServiceHostname', e.target.value);
                  }}
                />
              </Container>

              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.public_service_port', 'Public Service Port')}
                  value={formState?.zimbraPublicServicePort ?? ''}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateFormField('zimbraPublicServicePort', e.target.value);
                  }}
                />
              </Container>
            </ListRow>

            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Select
                  items={timezones}
                  background="gray5"
                  label={t('label.timezone', 'Time Zone')}
                  showCheckbox={false}
                  onChange={onTimeZoneChange}
                  selection={selectedTimeZone}
                />
              </Container>
            </ListRow>
            <Container
              orientation="horizontal"
              width="98%"
              crossAlignment="center"
              mainAlignment="space-between"
              style={{ margin: '8px' }}
            >
              <ds-divider></ds-divider>
            </Container>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Select
                  items={cosItems}
                  background="gray5"
                  label={t('label.default_class_of_service', 'Default Class of Service')}
                  showCheckbox={false}
                  onChange={(e: any): void => {
                    updateFormField('zimbraDomainDefaultCOSId', e ?? '');
                  }}
                  selection={
                    !formState?.zimbraDomainDefaultCOSId
                      ? cosItems[-1]
                      : cosItems.find((item: any) => item.value === formState.zimbraDomainDefaultCOSId)
                  }
                />
              </Container>
              <Container padding={{ all: 'small' }}>
                <Select
                  items={domainStatusItems}
                  background="gray5"
                  label={t('label.status', 'Status')}
                  defaultSelection={domainStatusItems[0]}
                  showCheckbox={false}
                  onChange={onDomainStatusChange}
                  selection={domainStatus}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <Input
                  label={t('label.description', 'Description')}
                  value={formState?.description ?? ''}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateFormField('description', e.target.value);
                  }}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ all: 'small' }}>
                <CustomTextArea
                  label={t('label.notes', 'Notes')}
                  value={formState?.zimbraNotes ?? ''}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
                    updateFormField('zimbraNotes', e.target.value);
                  }}
                />
              </Container>
            </ListRow>

            {isAdvanced && (
              <>
                <Row
                  mainAlignment="flex-start"
                  width="100%"
                  background="gray6"
                  padding={{ top: 'large', left: 'small' }}
                >
                  <ds-text as="h3" size="small" weight="bold" color="gray0">
                    {t('label.accountQuotaSetting', 'Account Quota Settings')}
                  </ds-text>
                </Row>
                <ListRow>
                  <Container
                    orientation="horizontal"
                    crossAlignment="stretch"
                    padding={{ all: 'small' }}
                    gap="1rem"
                  >
                    <Input
                      label={t(
                        'label.max_quota_per_account_in_this_domain',
                        'Max quota per account in this domain (GB)',
                      )}
                      value={domainQuotaGB}
                      backgroundColor="gray5"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                        const digits = e.target.value.replaceAll(/\D/g, '');
                        setDomainQuotaGB(digits.replace(/^0+/, ''));
                      }}
                      disabled={!isGlobalAdmin}
                    />
                    <QuotaReportDownloadButton domainName={domainName} />
                  </Container>
                </ListRow>
              </>
            )}

            {isAdvanced && (
              <ListRow>
                <Container
                  padding={{ all: 'small' }}
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                >
                  <ds-text as="h3" size="small" weight="bold">
                    {t(
                      'domains.generalSettings.AllowSearchUserFromSpecificDomains',
                      'Search users in specific domains',
                    )}
                  </ds-text>

                  <Padding top="small" />
                  <DomainListChipInput
                    domainList={formState?.carbonioSearchSpecifiedDomainsByFeature ?? []}
                    setDomainList={(list): void => {
                      updateFormField('carbonioSearchSpecifiedDomainsByFeature', list);
                    }}
                    domainName={domainName}
                  />
                </Container>
              </ListRow>
            )}
            <Row
              mainAlignment="flex-start"
              width="100%"
              background="gray6"
              padding={{ top: 'large' }}
            >
              <ds-text as="h2" size="medium" weight="bold" color="gray0">
                {t('label.domain_system_notifications', 'Domain System Notifications')}
              </ds-text>
            </Row>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ horizontal: 'small', top: 'large', bottom: 'small' }}
              >
                <Input
                  isRequired
                  label={t('label.notification_sender', 'Notification Sender')}
                  backgroundColor="gray5"
                  value={formState?.carbonioNotificationFrom ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    updateFormField('carbonioNotificationFrom', e.target.value);
                  }}
                  hasError={hasCarbonioNotificationFromError}
                  description={
                    hasCarbonioNotificationFromError
                      ? t('label.notification_error_msg', 'Enter a valid email address.')
                      : undefined
                  }
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ horizontal: 'small', top: 'large', bottom: 'extralarge' }}
              >
                <ChipInput
                  isRequired
                  placeholder={t('label.send_notifications_to', 'Send notifications to...')}
                  background="gray5"
                  defaultValue={formState?.carbonioNotificationRecipients ?? []}
                  value={formState?.carbonioNotificationRecipients ?? []}
                  onChange={(emails: Array<ChipItem>): void => {
                    const data: objectType[] = [];
                    map(emails, (email: objectType) => {
                      if (isValidEmail(email.label ?? '')) data.push(email);
                    });
                    updateFormField('carbonioNotificationRecipients', data);
                  }}
                  hasError={some(formState?.carbonioNotificationRecipients ?? [], { error: true })}
                  maxChips={null}
                />
              </Container>
            </ListRow>
            <DomainCosLink
              cosMaxAccountList={cosMaxAccountList}
              domainId={formState?.zimbraId ?? ''}
              defaultCosId={formState?.zimbraDomainDefaultCOSId ?? ''}
              domainName={domainName}
            />
            <ListRow>
              <Container padding={{ all: 'small' }} width="100%" style={{ display: 'block' }}>
                <Button
                  type="outlined"
                  label={t('label.delete_domain', 'Delete Domain')}
                  color="error"
                  size="extralarge"
                  width="fill"
                  onClick={onDeleteDomain}
                  style={{ width: '100%' }}
                />
                <Modal
                  title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
                  open={openConfirmDialog}
                  showCloseIcon
                  onClose={(): void => {
                    setConfirmDomainName('');
                    setOpenConfirmDialog(false);
                  }}
                  customFooter={
                    <Container orientation="horizontal" mainAlignment="space-between">
                      <Container orientation="horizontal" mainAlignment="flex-start" width="10rem">
                        <Button
                          label={t('label.need_help', 'NEED HELP?')}
                          type="outlined"
                          color="primary"
                          onClick={(): void => {
                            setConfirmDomainName('');
                            setOpenConfirmDialog(false);
                          }}
                          width="fill"
                        />
                      </Container>
                      <Container orientation="horizontal" mainAlignment="flex-end">
                        <Padding all="small">
                          <Button
                            label={t('label.cancel', 'CANCEL')}
                            color="secondary"
                            onClick={(): void => {
                              setConfirmDomainName('');
                              setOpenConfirmDialog(false);
                            }}
                          />
                        </Padding>

                        <Button
                          label={t('label.delete', 'DELETE')}
                          color="error"
                          onClick={onDeleteDomain}
                          disabled={isRequstInProgress}
                        />
                      </Container>
                    </Container>
                  }
                >
                  <Padding all="medium">
                    <ds-text as="p" overflow="break-word" weight="regular">
                      {t('label.delete_domain_error_msg', {
                        domainName,
                        defaultValue:
                          'You are deleting {{domainName}}. Are you sure you want to delete {{domainName}}?',
                      })}
                    </ds-text>
                  </Padding>
                </Modal>

                {/* Open Delete Forcefully domains */}

                <Modal
                  title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
                  open={openDeleteDomainConfirmDialog}
                  showCloseIcon
                  onClose={(): void => {
                    setConfirmDomainName('');
                    setOpenDeleteDomainConfirmDialog(false);
                    setDomainDirectories({
                      account: [],
                      dl: [],
                      alias: [],
                      calresource: [],
                    });
                  }}
                  customFooter={
                    <Container orientation="horizontal" mainAlignment="space-between">
                      <Container orientation="horizontal" mainAlignment="flex-start" width="10rem">
                        <Button
                          label={t('label.cancel', 'CANCEL')}
                          color="secondary"
                          onClick={(): void => {
                            setConfirmDomainName('');
                            setOpenDeleteDomainConfirmDialog(false);
                            setDomainDirectories({
                              account: [],
                              dl: [],
                              alias: [],
                              calresource: [],
                            });
                          }}
                        />
                      </Container>
                      <Container orientation="horizontal" mainAlignment="flex-end">
                        <Padding right="small">
                          <Button
                            label={t('label.force_delete', 'Force Delete')}
                            color="error"
                            onClick={onDeleteAccountAndDomain}
                            disabled={isRequstInProgress}
                          />
                        </Padding>
                        {domainStatus.value !== domainStatusItems[1].value ? (
                          <Button
                            label={t('label.close_domain', 'CLOSE DOMAIN')}
                            color="primary"
                            onClick={onCloseDomain}
                          />
                        ) : (
                          <></>
                        )}
                      </Container>
                    </Container>
                  }
                >
                  <Padding all="medium">
                    <ds-text as="p" overflow="break-word" weight="regular">
                      {t('label.delete_domain_with_all_resources_pre_msg', {
                        domainName,
                        defaultValue: 'Domain {{domainName}} is not empty and contains',
                      })}
                    </ds-text>
                    <br />
                    {domainDirectories.account.length ? (
                      <ds-text as="p" overflow="break-word" weight="regular">
                        {domainDirectories.account.length} {t('label.accounts', 'Accounts')}
                      </ds-text>
                    ) : (
                      <></>
                    )}
                    {filter(domainDirectories.account, {
                      zimbraIsSystemAccount: 'TRUE',
                    }).length ? (
                      <ds-text as="p" overflow="break-word" weight="regular">
                        {
                          filter(domainDirectories.account, {
                            zimbraIsSystemAccount: 'TRUE',
                          }).length
                        }{' '}
                        {t('label.system_account', 'System Accounts')}
                      </ds-text>
                    ) : (
                      <></>
                    )}
                    {domainDirectories.dl.length ? (
                      <ds-text as="p" overflow="break-word" weight="regular">
                        {domainDirectories.dl.length}{' '}
                        {t('label.distribution_list', 'Distribution List')}
                      </ds-text>
                    ) : (
                      <></>
                    )}
                    {domainDirectories.alias.length ? (
                      <ds-text as="p" overflow="break-word" weight="regular">
                        {domainDirectories.alias.length} {t('label.aliases', 'Aliases')}
                      </ds-text>
                    ) : (
                      <></>
                    )}
                    {domainDirectories.calresource.length ? (
                      <ds-text as="p" overflow="break-word" weight="regular">
                        {domainDirectories.calresource.length} {t('label.resources', 'Resources')}
                      </ds-text>
                    ) : (
                      <></>
                    )}
                    <br />
                    {domainStatus.value !== domainStatusItems[1].value ? (
                      <>
                        <ds-text as="p" overflow="break-word" weight="regular">
                          {t('label.delete_domain_with_all_resources_close_domain', {
                            defaultValue:
                              'If you are not sure, you still can close the domain to avoid any further interaction, leaving all the resources available in case of need.',
                          })}
                        </ds-text>
                        <br />

                        <ds-text as="p" overflow="break-word" weight="regular">
                          {t('label.delete_domain_with_all_resources_permanently_remove', {
                            defaultValue:
                              'Otherwise, you can permanently remove all the accounts and domain objects. This operation cannot be reverted.',
                          })}
                        </ds-text>
                        <br />
                      </>
                    ) : (
                      <>
                        <ds-text as="p" overflow="break-word" weight="regular">
                          {t(
                            'label.permanently_delete_domain_with_all_resources_permanently_remove',
                            {
                              defaultValue:
                                'Permanently remove all the accounts and domain objects. This operation cannot be reverted.',
                            },
                          )}
                        </ds-text>
                        <br />
                      </>
                    )}
                    <ds-text as="p" overflow="break-word" weight="regular">
                      <Trans
                        i18nKey="label.type_domain_name"
                        defaults={`To confirm, type here the domain name <bold>"{{domainName}}"</bold>:`}
                        components={{ bold: <strong /> }}
                        values={{
                          domainName,
                        }}
                        t={t}
                      />
                    </ds-text>
                    <ListRow>
                      <Container padding={{ top: 'large' }}>
                        <Input
                          value={confirmDomainName}
                          backgroundColor="gray5"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                            setConfirmDomainName(e.target.value);
                            if (isEqual(e.target.value, domainName)) {
                              setIsRequestInProgress(false);
                            } else {
                              setIsRequestInProgress(true);
                            }
                          }}
                        />
                      </Container>
                    </ListRow>
                  </Padding>
                </Modal>
              </Container>
            </ListRow>
          </Container>
        </Row>
      </Container>

      <RouteLeavingGuard when={isDirty} onSave={onSave} />
    </Container>
  );
};
export default DomainGeneralSettings;

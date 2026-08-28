/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Padding,
  RouteLeavingGuard,
  Row,
  TabBar,
  useSnackbar,
} from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { format, isValid } from 'date-fns';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DL, EMAIL, GRP } from '../../../../constants';
import { getGrant } from '../../../../services/get-grant';
import { useAddDistributionListMember } from '../../../../services/use-add-distribution-list-member';
import { useAddMailingListAlias } from '../../../../services/use-add-mailing-list-alias';
import { useDeleteDistributionList } from '../../../../services/use-delete-distribution-list';
import { useDeleteMailingListAlias } from '../../../../services/use-delete-mailing-list-alias';
import { useDistributionList } from '../../../../services/use-distribution-list';
import { useDistributionListAction } from '../../../../services/use-distribution-list-action';
import { useDistributionListGrants } from '../../../../services/use-distribution-list-grants';
import { useDistributionListMembership } from '../../../../services/use-distribution-list-membership';
import { useModifyDistributionList } from '../../../../services/use-modify-distribution-list';
import { useRemoveDistributionListMember } from '../../../../services/use-remove-distribution-list-member';
import { useRenameDistributionList } from '../../../../services/use-rename-distribution-list';
import { getDateTimeFromStr } from '../../../utility/utils';
import { GeneralTab } from '../edit-mailing-detail/general-tab';
import { ReusedDefaultTabBar } from '../edit-mailing-detail/reused-default-tab-bar';
import { type SaveOperation } from './build-save-operations';
import { DeleteDistributionListModal } from './delete-distribution-list-modal';
import { buildFormSaveOperations, mapToFormValues } from './form-values';
import { MembersTab } from './members-tab/members-tab';
import { OwnersTab } from './owners-tab/owners-tab';
import {
  type DistributionListDetail,
  parseDistributionListDetail,
  parseDistributionListGrants,
  parseDistributionListMembership,
} from './parse-distribution-list-detail';
import { SendAsTab } from './send-as-tab/send-as-tab';
import { SendToTab } from './send-to-tab/send-to-tab';
import { TabDirtyGuardModal } from './tab-dirty-guard-modal';
import type { EditDistributionListFormValues } from './types';

const EditDistributionList: FC<any> = ({
  selectedMailingList,
  setIsUpdateRecord,
  setShowMailingListDetailView,
}) => {
  /* Cached data layer */
  const detailQuery = useDistributionList(selectedMailingList?.id, selectedMailingList?.name);
  const membershipQuery = useDistributionListMembership(
    selectedMailingList?.dynamic || !selectedMailingList?.id ? undefined : selectedMailingList?.id,
  );
  const grantsQuery = useDistributionListGrants(selectedMailingList?.id);

  const parsedDetail = useMemo(
    () => parseDistributionListDetail(detailQuery.data, selectedMailingList?.name),
    [detailQuery.data, selectedMailingList?.name],
  );
  const membership = useMemo(
    () => parseDistributionListMembership(membershipQuery.data),
    [membershipQuery.data],
  );
  const parsedGrants = useMemo(
    () => parseDistributionListGrants(grantsQuery.data, selectedMailingList?.id),
    [grantsQuery.data, selectedMailingList?.id],
  );

  const formValues = useMemo(
    () => mapToFormValues(parsedDetail, membership, parsedGrants, selectedMailingList),
    [parsedDetail, membership, parsedGrants, selectedMailingList],
  );

  const isReady =
    Boolean(parsedDetail) &&
    (Boolean(selectedMailingList?.dynamic) || membershipQuery.data !== undefined) &&
    grantsQuery.data !== undefined;

  const dlCreateDate = useMemo(() => {
    const timestamp = parsedDetail?.createTimestamp;
    if (!timestamp || timestamp === '') {
      return '';
    }
    const date = getDateTimeFromStr(timestamp);
    return date && isValid(date) ? format(date, 'dd MMM yyyy - HH:mm') : '';
  }, [parsedDetail?.createTimestamp]);

  if (!isReady) {
    return (
      <Container
        background="gray5"
        mainAlignment="flex-start"
        style={{
          position: 'absolute',
          top: '0rem',
          height: 'auto',
          width: 'auto',
          overflow: 'hidden',
          transition: 'left 0.2s ease-in-out',
          boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
          right: 0,
        }}
      >
        <Row
          mainAlignment="flex-start"
          crossAlignment="center"
          orientation="horizontal"
          background="white"
          width="fill"
          height="56px"
        >
          <Row padding={{ horizontal: 'small' }}></Row>
          <Row takeAvailableSpace mainAlignment="flex-start">
            <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
              {selectedMailingList?.name}
            </ds-text>
          </Row>
        </Row>
        <Row>
          <ds-divider color="gray3" />
        </Row>
        <Container height="calc(100vh - 3.5rem)" mainAlignment="center">
          <ds-spinner></ds-spinner>
        </Container>
      </Container>
    );
  }

  return (
    <EditDistributionListContent
      selectedMailingList={selectedMailingList}
      formValues={formValues}
      parsedDetail={parsedDetail as DistributionListDetail}
      dlCreateDate={dlCreateDate}
      setIsUpdateRecord={setIsUpdateRecord}
      setShowMailingListDetailView={setShowMailingListDetailView}
    />
  );
};

type EditDistributionListContentProps = {
  selectedMailingList: any;
  formValues: EditDistributionListFormValues;
  parsedDetail: DistributionListDetail;
  dlCreateDate: string;
  setIsUpdateRecord: (value: boolean) => void;
  setShowMailingListDetailView: (value: boolean) => void;
};

function EditDistributionListContent({
  selectedMailingList,
  formValues,
  parsedDetail,
  dlCreateDate,
  setIsUpdateRecord,
  setShowMailingListDetailView,
}: EditDistributionListContentProps) {
  const [t] = useTranslation();
  const searchUserLabelValue = t(
    'label.search_for_user_and_clic_to_add',
    'Search for a user and click on the ADD button.',
  );
  const createSnackbar = useSnackbar();
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === 'TRUE';

  const listId = selectedMailingList?.id ?? '';
  const listName = selectedMailingList?.name ?? '';
  const dynamic = Boolean(selectedMailingList?.dynamic);

  const modifyMutation = useModifyDistributionList(listId);
  const renameMutation = useRenameDistributionList(listId);
  const addAliasMutation = useAddMailingListAlias(listId);
  const removeAliasMutation = useDeleteMailingListAlias(listId);
  const actionMutation = useDistributionListAction(listId);
  const addMemberMutation = useAddDistributionListMember();
  const removeMemberMutation = useRemoveDistributionListMember();
  const deleteListMutation = useDeleteDistributionList(listId);

  function executeSaveOperation(operation: SaveOperation): Promise<any> {
    switch (operation.type) {
      case 'modify':
        return modifyMutation.mutateAsync(operation.attributes);
      case 'rename':
        return renameMutation.mutateAsync(operation.newName);
      case 'addAlias':
        return addAliasMutation.mutateAsync(operation.alias);
      case 'removeAlias':
        return removeAliasMutation.mutateAsync(operation.alias);
      case 'addMemberOf':
        return addMemberMutation.mutateAsync({
          listId: operation.listId,
          member: operation.member,
        });
      case 'removeMemberOf':
        return removeMemberMutation.mutateAsync({
          listId: operation.listId,
          member: operation.member,
        });
      case 'action':
        return actionMutation.mutateAsync({ dl: operation.dl, action: operation.action });
    }
  }

  const form = useForm({
    defaultValues: formValues,
    onSubmit: async ({ value }) => {
      const operations = buildFormSaveOperations(value, formValues, {
        dynamic,
        isACLGroup: parsedDetail.isACLGroup,
        listId,
        listName,
      });
      if (operations.length === 0) {
        return;
      }
      setIsLoading(true);
      // the original flow clears the grant emails after saving when the
      // grant type is not "only these users"
      const finalValue: EditDistributionListFormValues =
        value.grantTypeValue !== EMAIL ? { ...value, grantEmails: [] } : value;
      try {
        const responses = await Promise.all(operations.map(executeSaveOperation));
        const fault = responses.find((item: any) => item?.Fault);
        if (fault) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: fault?.Fault?.Reason?.Text,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t('label.changes_have_been_saved', 'The changes have been saved'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
        form.reset(finalValue, { keepDefaultValues: true });
        setIsUpdateRecord(true);
      } catch (error: any) {
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
      } finally {
        setIsLoading(false);
      }
    },
  });

  /* Keep the form defaults in sync with (re)fetched query data */
  useEffect(() => {
    form.update({ defaultValues: formValues });
  }, [form, formValues]);

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);
  const values = useSelector(form.store, (state) => state.values);

  const [selectedTab, setSelectedTab] = useState<string>('general');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isOpenUnsavedDialog, setIsOpenUnsavedDialog] = useState<boolean>(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [granteeTotalRights, setGranteeTotalRights] = useState(0);
  const [targetTotalRights, setTargetTotalRights] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalGrantRights = granteeTotalRights + targetTotalRights;

  const dlMembershipListNames = values.dlMembershipList.map((item) => item?.name).join(', ');

  const handleClickDeleteEvent = () => {
    const getGrantBody: any = {};
    const grantee = {
      type: GRP,
      by: 'id',
      _content: listId,
      all: false,
    };
    getGrantBody.grantee = grantee;
    getGrant(getGrantBody)
      .then((data: any) => {
        if (data && data?.grant && Array.isArray(data?.grant)) {
          let granteeTotal = 0;

          const granteeRights = data?.grant?.map((items: any) => items?.right?.length);
          const granteeRightLenght = granteeRights?.values();

          for (const value of granteeRightLenght) {
            granteeTotal += value;
          }
          setGranteeTotalRights(granteeTotal);
        }
        setIsOpenDeleteDialog(true);
      })
      .catch((error) => {
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

    // get grants' rights as target
    const getGrantBodyTarget: any = {};
    const target = {
      type: DL,
      by: 'id',
      _content: listId,
    };
    getGrantBodyTarget.target = target;
    getGrant(getGrantBodyTarget)
      .then((resFromTarget: any) => {
        if (resFromTarget && resFromTarget?.grant && Array.isArray(resFromTarget?.grant)) {
          let targetTotal = 0;
          const targetRights = resFromTarget?.grant?.map((items: any) => items?.right?.length);
          const targetRightLenght = targetRights?.values();

          for (const value of targetRightLenght) {
            targetTotal += value;
          }
          setTargetTotalRights(targetTotal);
        }
        setIsOpenDeleteDialog(true);
      })
      .catch((error) => {
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

  const closeHandler = () => {
    setIsOpenDeleteDialog(false);
  };

  const onSuccess = (message: string) => {
    createSnackbar({
      key: 'success',
      severity: 'success',
      label: message,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
    setIsRequestInProgress(false);
    closeHandler();
    setShowMailingListDetailView(false);
    setIsUpdateRecord(true);
  };

  const onDeleteHandler = () => {
    setIsRequestInProgress(true);
    deleteListMutation.mutate(undefined, {
      onSuccess: () =>
        onSuccess(
          t('label.dl_delete_successfull', '{{name}} has been deleted successfully', {
            name: values.distributionName,
          }),
        ),
      onError: (error: any) => {
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
      },
    });
  };

  const items: any = [
    {
      id: 'general',
      label: t('label.general', 'GENERAL'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'members',
      label: t('label.members', 'MEMBERS').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'owners',
      label: t('label.owners', 'OWNERS'),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'sendas',
      label: t('domain.distributionList.sendAs', 'SEND AS').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'sendto',
      label: t('domain.distributionList.sendTo', 'SEND TO').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
  ];

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
      <Container
        background="gray5"
        mainAlignment="flex-start"
        style={{
          position: 'absolute',
          top: '0rem',
          height: 'auto',
          width: 'auto',
          overflow: 'hidden',
          transition: 'left 0.2s ease-in-out',
          boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
          right: 0,
        }}
      >
        <Row
          mainAlignment="flex-start"
          crossAlignment="center"
          orientation="horizontal"
          background="white"
          width="fill"
          height="56px"
        >
          <Row padding={{ horizontal: 'small' }}></Row>
          <Row takeAvailableSpace mainAlignment="flex-start">
            <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
              {values.distributionName} (
              {dynamic ? t('label.dynamic', 'Dynamic') : t('label.standard', 'Standard')})
            </ds-text>
          </Row>
          <Row>
            {!isDirty && (
              <Row padding={{ right: 'medium' }}>
                <Button
                  size="medium"
                  type="outlined"
                  color="error"
                  onClick={handleClickDeleteEvent}
                  icon="Trash2Outline"
                  label={t('label.delete', 'delete')}
                />
              </Row>
            )}
            {isDirty && (
              <Container
                orientation="horizontal"
                mainAlignment="flex-end"
                crossAlignment="flex-end"
                background="gray6"
              >
                <Padding right="small">
                  <Button
                    label={t('label.cancel', 'Cancel')}
                    color="secondary"
                    onClick={(): void => form.reset()}
                  />
                </Padding>
                <Padding right="small">
                  <Button
                    label={t('label.save', 'Save')}
                    color="primary"
                    onClick={(): void => void form.handleSubmit()}
                  />
                </Padding>
              </Container>
            )}
          </Row>
          <Row padding={{ right: 'extrasmall', left: 'small' }}>
            <Button
              type="ghost"
              color={'text'}
              size="medium"
              icon="CloseOutline"
              onClick={(): void => setShowMailingListDetailView(false)}
            />
          </Row>
        </Row>
        <Row>
          <ds-divider color="gray3" />
        </Row>

        <Container
          padding={{ all: 'small' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          background="white"
        >
          <TabBar
            items={items}
            selected={selectedTab}
            onChange={(ev: unknown, selectedId: string): void => {
              if (
                isDirty &&
                (selectedTab === 'general' || selectedTab === 'sendto') &&
                selectedId !== selectedTab
              ) {
                setPendingTab(selectedId);
                setIsOpenUnsavedDialog(true);
              } else {
                setSelectedTab(selectedId);
              }
            }}
            width="100%"
            background="gray6"
          />
          <ds-divider color="gray2" />
        </Container>

        {selectedTab === 'general' && (
          <GeneralTab
            form={form}
            dlCreateDate={dlCreateDate}
            dlId={parsedDetail.dlId}
            selectedMailingList={selectedMailingList}
            dlMembershipListNames={dlMembershipListNames}
          />
        )}

        {selectedTab === 'members' && (
          <MembersTab
            form={form}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
            isGlobalAdmin={isGlobalAdmin}
          />
        )}

        {selectedTab === 'owners' && (
          <OwnersTab
            form={form}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
          />
        )}

        {selectedTab === 'sendas' && (
          <SendAsTab
            form={form as never}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
          />
        )}

        {selectedTab === 'sendto' && (
          <SendToTab form={form as never} searchUserLabelValue={searchUserLabelValue} />
        )}

        {isOpenUnsavedDialog && (
          <TabDirtyGuardModal
            open={isOpenUnsavedDialog}
            onExitWithoutSave={(): void => {
              form.reset();
              if (pendingTab) {
                setSelectedTab(pendingTab);
              }
              setPendingTab(null);
              setIsOpenUnsavedDialog(false);
            }}
            onSaveAndExit={(): void => {
              void form.handleSubmit();
              if (pendingTab) {
                setSelectedTab(pendingTab);
              }
              setPendingTab(null);
              setIsOpenUnsavedDialog(false);
            }}
            onClose={(): void => {
              setPendingTab(null);
              setIsOpenUnsavedDialog(false);
            }}
          />
        )}

        <RouteLeavingGuard when={isDirty} onSave={(): void => void form.handleSubmit()} />
        {isOpenDeleteDialog && (
          <DeleteDistributionListModal
            open={isOpenDeleteDialog}
            listLabel={values.displayName || values.distributionName}
            totalGrantRights={totalGrantRights}
            isRequestInProgress={isRequestInProgress}
            onCancel={closeHandler}
            onConfirm={onDeleteHandler}
          />
        )}
      </Container>
    </>
  );
}

export default EditDistributionList;

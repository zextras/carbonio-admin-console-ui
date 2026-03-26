/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Modal,
  Padding,
  Row,
  TabBar,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { useDomainStore, useUserSettings } from '@zextras/ui-shared';
import { format, isValid } from 'date-fns';
import { differenceBy, isEqual } from 'lodash';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ALL, DL, EDOM, EMAIL, GRP, GST, PUB, USR } from '../../../../constants';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { addMailingListAliasRequest } from '../../../../services/add-mailing-list-alias';
import { deleteDistributionList } from '../../../../services/delete-distribution-list';
import { deleteMailingListAliasRequest } from '../../../../services/delete-mailing-list-alias';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { getDistributionList } from '../../../../services/get-distribution-list';
import { getDistributionListMembership } from '../../../../services/get-distributionlists-membership-service';
import { getGrant } from '../../../../services/get-grant';
import { modifyDistributionList } from '../../../../services/modify-distributionlist-service';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import { renameDistributionList } from '../../../../services/rename-distributionlist-service';
import { getDomainList } from '../../../../services/search-domain-service';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { getDateTimeFromStr } from '../../../utility/utils';
import { GeneralTab } from './edit-mailing-detail/general-tab';
import { MembersTab } from './edit-mailing-detail/members-tab';
import { OwnersTab } from './edit-mailing-detail/owners-tab';
import { ReusedDefaultTabBar } from './edit-mailing-detail/reused-default-tab-bar';
import { SendAsTab } from './edit-mailing-detail/send-as-tab';
import { SendToTab } from './edit-mailing-detail/send-to-tab';

export const TRUE_FALSE = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
} as const;

const EditMailingListView: FC<any> = ({
  selectedMailingList,
  setIsUpdateRecord,
  setShowMailingListDetailView,
}) => {
  const [t] = useTranslation();
  const searchUserLabelValue = t(
    'label.search_for_user_and_clic_to_add',
    'Search for a user and click on the ADD button.',
  );
  const createSnackbar = useSnackbar();
  const [displayName, setDisplayName] = useState<string>('');
  const [distributionName, setDistributionName] = useState<string>('');
  const [
    zimbraDistributionListSendShareMessageToNewMembers,
    setZimbraDistributionListSendShareMessageToNewMembers,
  ] = useState<boolean>(false);

  const [zimbraHideInGal, setZimbraHideInGal] = useState<boolean>(false);
  const [zimbraDefaultMailAlias, setDefaultZimbraMailAlias] = useState<any>([]);
  const [zimbraMailAlias, setZimbraMailAlias] = useState<any>([]);
  const [dlm, setDlm] = useState<any[]>([]);
  const [zimbraNotes, setZimbraNotes] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [zimbraCreateTimestamp, setZimbraCreateTimestamp] = useState<string>('');
  const [dlId, setdlId] = useState<string>('');
  const [dlMembershipList, setDlMembershipList] = useState<any>([]);
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [dlMembershipListNames, setDlMembershipListNames] = useState<string>('');
  // const [openAddMailingListDialog, setOpenAddMailingListDialog] = useState<boolean>(false);
  // const [isAddToOwnerList, setIsAddToOwnerList] = useState<boolean>(false);
  // const [searchMailingListOrUser, setSearchMailingListOrUser] = useState<string>('');
  // const [isShowError, setIsShowError] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [memberURL, setMemberURL] = useState<string>();
  const [ownerOfList, setOwnerOfList] = useState<any[]>([]);
  const [zimbraIsACLGroup, setZimbraIsACLGroup] = useState<boolean>(false);
  const [isShowSenderToError, setIsShowSenderToError] = useState<boolean>(false);
  const domainList = useDomainStore((state) => state.domainList);
  const setDomainListStore = useDomainStore((state) => state.setDomainList);
  const [granteeTotalRights, setGranteeTotalRights] = useState(0);
  const [targetTotalRights, setTargetTotalRights] = useState(0);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [totalGrantRights, setTotalGrantRights] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const userSetting = useUserSettings();
  const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('general');
  const [isOpenUnsavedDialog, setIsOpenUnsavedDialog] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);



  // sendEmails
  const [sendEmails, setSendEmails] = useState<any>([]);

  const [sendEmailsList, setSendEmailsList] = useState<any>([]);

  const dlCreateDate = useMemo(() => {
    if (!zimbraCreateTimestamp || zimbraCreateTimestamp === '') {
      return '';
    }
    const date = getDateTimeFromStr(zimbraCreateTimestamp);
    return date && isValid(date) ? format(date, 'dd MMM yyyy - HH:mm') : '';
  }, [zimbraCreateTimestamp]);

  const rightsOptions: any[] = useMemo(
    () => [
      {
        label: t('domain.mailingList.canReceive', 'Can Receive'),
        value: TRUE_FALSE.TRUE,
      },
      {
        label: t('domain.mailingList.cantReceive', "Can't Receive"),
        value: TRUE_FALSE.FALSE,
      },
    ],
    [t],
  );

  const grantTypeOptions: any[] = useMemo(
    () => [
      {
        label: t('label.everyone', 'Everyone'),
        value: PUB,
      },
      {
        label: t('label.members_only', 'Members only'),
        value: GRP,
      },
      {
        label: t('label.internal_users_only', 'Internal Users only'),
        value: ALL,
      },
      {
        label: t('label.only_there_users', 'Only these users'),
        value: EMAIL,
      },
    ],
    [t],
  );

  useEffect(() => {
    if (userSetting?.attrs) {
      const account = userSetting?.attrs?.zimbraIsAdminAccount;
      if (account && account === 'TRUE') {
        setIsGlobalAdmin(true);
      }
    }
  }, [userSetting?.attrs]);

  type DomainResponse = {
    domain: [
      {
        name: string;
        id: string;
        a: { n: string; _content: string }[];
      },
    ];
    more: boolean;
    searchTotal: number;
    _jsns: string;
  };

  const getDomainLists = useCallback(
    (offset: number): void => {
      getDomainList('', offset)
        .then((data) => {
          const searchResponse: DomainResponse = data;
          if (!!searchResponse && searchResponse?.searchTotal > 0) {
            if (searchResponse?.domain?.length) {
              setDomainListStore([...domainList, ...searchResponse.domain]);
              if (searchResponse?.more) {
                getDomainLists(offset + 50);
              }
            }
          } else {
            setDomainListStore([]);
          }
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, domainList, setDomainListStore, t],
  );

  useEffect(() => {
    if (!domainList?.length) {
      getDomainLists(0);
    }
  }, [domainList, getDomainLists]);

  const [previousDetail, setPreviousDetail] = useState<any>({});

  const [zimbraMailStatus, setZimbraMailStatus] = useState<any>(rightsOptions[1]);

  const onRightsChange = useCallback(
    (v: any): any => {
      const it = rightsOptions.find((item: any) => item.value === v);
      setZimbraMailStatus(it);
    },
    [rightsOptions],
  );

  const getMailingList = useCallback(
    (id: string, name: string): void => {
      getDistributionList(id, name).then((data) => {
        const distributionListMembers = data?.dl[0];
        if (distributionListMembers) {
          if (distributionListMembers?.id) {
            setdlId(distributionListMembers?.id);
          }
          if (distributionListMembers?.dlm) {
            const _dlm = distributionListMembers?.dlm.map((item: any) => item?._content);
            setDlm(_dlm);
            setPreviousDetail((prevState: any) => ({
              ...prevState,
              dlm: _dlm,
            }));
          } else {
            setPreviousDetail((prevState: any) => ({
              ...prevState,
              dlm: [],
            }));
          }
          if (distributionListMembers?.a) {
            /* Get Gal Hide Information */
            const _zimbraHideInGal = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'zimbraHideInGal',
            )?._content;
            if (_zimbraHideInGal === 'TRUE') {
              setZimbraHideInGal(true);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraHideInGal: true,
              }));
            } else {
              setZimbraHideInGal(false);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraHideInGal: false,
              }));
            }

            const _zimbraNotes = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'zimbraNotes',
            )?._content;

            setZimbraNotes(_zimbraNotes || '');
            if (_zimbraNotes) {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraNotes: _zimbraNotes,
              }));
            } else {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraNotes: '',
              }));
            }

            const _description = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'description',
            )?._content;

            setDescription(_description || '');
            if (_description) {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                description: _description,
              }));
            } else {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                description: '',
              }));
            }

            const _zimbraDistributionListSendShareMessageToNewMembers =
              distributionListMembers?.a?.find(
                (a: any) => a?.n === 'zimbraDistributionListSendShareMessageToNewMembers',
              )?._content;

            if (_zimbraDistributionListSendShareMessageToNewMembers === 'TRUE') {
              setZimbraDistributionListSendShareMessageToNewMembers(true);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraDistributionListSendShareMessageToNewMembers: true,
              }));
            } else {
              setZimbraDistributionListSendShareMessageToNewMembers(false);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraDistributionListSendShareMessageToNewMembers: false,
              }));
            }

            const _zimbraMailAlias = distributionListMembers?.a?.filter(
              (a: any) => a?.n === 'zimbraMailAlias' && a?._content !== selectedMailingList?.name,
            );
            if (_zimbraMailAlias && _zimbraMailAlias.length > 0) {
              const allAlias = _zimbraMailAlias.map((ele: any) => ({ label: ele?._content }));
              setZimbraMailAlias(allAlias);
              setDefaultZimbraMailAlias(allAlias);
            }
            const _zimbraCreateTimestamp = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'zimbraCreateTimestamp',
            )?._content;
            _zimbraCreateTimestamp
              ? setZimbraCreateTimestamp(_zimbraCreateTimestamp)
              : setZimbraCreateTimestamp('');

            /* Mail status */
            const _zimbraMailStatus = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'zimbraMailStatus',
            )?._content;
            if (_zimbraMailStatus === 'enabled') {
              onRightsChange(rightsOptions[0].value);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraMailStatus: rightsOptions[0],
              }));
            } else {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                zimbraMailStatus: rightsOptions[1],
              }));
            }

            const _memberURL = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'memberURL',
            )?._content;

            if (_memberURL) {
              setMemberURL(_memberURL);
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                memberURL: _memberURL,
              }));
            } else if (selectedMailingList?.dynamic) {
              setPreviousDetail((prevState: any) => ({
                ...prevState,
                memberURL: '',
              }));
            }

            const _zimbraIsACLGroup = distributionListMembers?.a?.find(
              (a: any) => a?.n === 'zimbraIsACLGroup',
            )?._content;
            if (_zimbraIsACLGroup) {
              setZimbraIsACLGroup(_zimbraIsACLGroup === 'TRUE');
            }
          }
        }
      });
    },
    [selectedMailingList?.name, rightsOptions, onRightsChange, selectedMailingList?.dynamic],
  );

  const getDistributionListMembershipList = useCallback((id: string): void => {
    getDistributionListMembership(id).then((data) => {
      const members = data?.dl;
      if (members && members.length > 0) {
        const allMembers = members.map((item: any) => ({
          label: item?.name,
          background: 'gray3',
          color: 'text',
          id: item?.id,
          name: item?.name,
        }));
        setDlMembershipList(allMembers);
        setDlMembershipListNames(allMembers.map((item: any) => item?.name).join(', '));
        setPreviousDetail((prevState: any) => ({
          ...prevState,
          dlMembershipList: allMembers,
        }));
      } else {
        setPreviousDetail((prevState: any) => ({
          ...prevState,
          dlMembershipList: [],
        }));
        setDlMembershipListNames('');
      }
    });
  }, []);

  useEffect(() => {
    if (selectedMailingList?.a) {
      const dsName = selectedMailingList?.a?.find((a: any) => a?.n === 'displayName')?._content;
      if (dsName) {
        setDisplayName(dsName);
        setPreviousDetail((prevState: any) => ({
          ...prevState,
          displayName: dsName,
        }));
      } else {
        setDisplayName('');
        setPreviousDetail((prevState: any) => ({
          ...prevState,
          displayName: '',
        }));
      }
    }
    setDistributionName(selectedMailingList?.name);
    setPreviousDetail((prevState: any) => ({
      ...prevState,
      distributionName: selectedMailingList?.name,
    }));
    getMailingList(selectedMailingList?.id, selectedMailingList?.name);
    if (!selectedMailingList?.dynamic) {
      getDistributionListMembershipList(selectedMailingList?.id);
    }
  }, [selectedMailingList, getMailingList, getDistributionListMembershipList]);

  const [grantType, setGrantType] = useState<any>([]);
  const [grantEmails, setGrantEmails] = useState<any>([]);
  const [grantEmailsList, setGrantEmailsList] = useState<any>([]);

  const onGrantTypeChange = useCallback(
    (v: any): any => {
      const it = grantTypeOptions.find((item: any) => item.value === v);
      setGrantType(it);
      if (
        previousDetail?.grantType !== undefined &&
        previousDetail?.grantType?.value !== undefined &&
        previousDetail?.grantType?.value !== v
      ) {
        setIsDirty(true);
      }
    },
    [grantTypeOptions, grantType, previousDetail?.grantType, setIsDirty],
  );

  useEffect(() => {
    if (grantType && grantType?.value === ALL) {
      setTimeout(() => {
        setGrantEmailsList([]);
      }, 100);
    }
  }, [grantType]);

  const getGrantML = useCallback(() => {
    const getGrantBody: any = {};
    const target = {
      type: DL,
      by: 'id',
      _content: selectedMailingList?.id,
    };
    getGrantBody.target = target;
    getGrant(getGrantBody)
      .then((data: any) => {
        const emails: Array<{ id: string; name: string }> = [];
        const owners: Array<{ id: string; name: string }> = [];
        const sendACL: Array<{ id: string; name: string; sendAcl: string }> = [];
        let it = grantTypeOptions.find((item: any) => item.value === PUB);
        if (data && data?.grant && Array.isArray(data?.grant)) {
          const grant = data?.grant;
          if (grant.length > 0) {
            const sendToListItems = grant.filter(
              (item: any) => item?.right[0]?._content === 'sendToDistList',
            );
            const ownDistListItems = grant.filter(
              (item: any) => item?.right[0]?._content === 'ownDistList',
            );
            const sendAsDistListItems = grant.filter(
              (item: any) => item?.right[0]?._content === 'sendAsDistList',
            );
            const sendOnBehalfOfDistListItems = grant.filter(
              (item: any) => item?.right[0]?._content === 'sendOnBehalfOfDistList',
            );

            let myGrantType = '';

            if (sendToListItems && sendToListItems.length > 0) {
              const type = sendToListItems[0]?.grantee[0]?.type;
              const sameGranteeAsList = sendToListItems.filter(
                (item: any) =>
                  item?.grantee[0]?.type === type &&
                  item?.grantee[0]?.id === selectedMailingList?.id,
              );
              if (
                (type === GRP || type === DL || type === USR || type == EDOM || type == GST) &&
                sameGranteeAsList.length == 0
              ) {
                onGrantTypeChange(EMAIL);
                myGrantType = EMAIL;
              } else if (type === GRP && sameGranteeAsList.length == 1) {
                onGrantTypeChange(GRP);
                myGrantType = GRP;
              } else if (type === ALL) {
                onGrantTypeChange(ALL);
                myGrantType = ALL;
              } else {
                // probably this option is not possible, but just in case set it to PUB
                onGrantTypeChange(PUB);
                myGrantType = PUB;
              }
            } else {
              onGrantTypeChange(PUB);
              myGrantType = PUB;
            }

            if (ownDistListItems && ownDistListItems.length > 0) {
              ownDistListItems.forEach((grItem: any) => {
                if (grItem?.right && Array.isArray(grItem?.right)) {
                  owners.push({
                    id: grItem?.grantee[0]?.id,
                    name: grItem?.grantee[0]?.name,
                  });
                }
              });
            }

            if (sendAsDistListItems && sendAsDistListItems.length > 0) {
              sendAsDistListItems.forEach((grItem: any) => {
                if (grItem?.right && Array.isArray(grItem?.right)) {
                  sendACL.push({
                    id: grItem?.grantee[0]?.id,
                    name: grItem?.grantee[0]?.name,
                    sendAcl: 'sendAsDistList',
                  });
                }
              });
            }

            if (sendOnBehalfOfDistListItems && sendOnBehalfOfDistListItems.length > 0) {
              sendOnBehalfOfDistListItems.forEach((grItem: any) => {
                if (grItem?.right && Array.isArray(grItem?.right)) {
                  sendACL.push({
                    id: grItem?.grantee[0]?.id,
                    name: grItem?.grantee[0]?.name,
                    sendAcl: 'sendOnBehalfOfDistList',
                  });
                }
              });
            }

            sendToListItems.forEach((grItem: any) => {
              if (
                grItem?.right &&
                Array.isArray(grItem?.right) &&
                grItem?.grantee[0]?.id !== selectedMailingList?.id &&
                grItem?.grantee[0]?.type !== ALL
              ) {
                emails.push({
                  id: grItem?.grantee[0]?.id,
                  name: grItem?.grantee[0]?.name,
                });
              }
            });

            if (sendACL.length > 0) {
              setSendEmails(sendACL);
              setSendEmailsList(sendACL);
            }

            if (emails.length > 0) {
              setGrantEmails(emails);
              setGrantEmailsList(emails.map((item: any) => item?.name));
            }

            if (owners.length > 0) {
              setOwnersList(owners);
            }

            it = grantTypeOptions.find((item: any) => item.value === myGrantType);
          }
        } else {
          setGrantType(it);
        }
        setPreviousDetail((prevState: any) => ({
          ...prevState,
          grantEmails: emails,
          ownersList: owners,
          sendEmailsList: sendACL,
          grantType: it,
        }));
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
  }, [createSnackbar, t, selectedMailingList, onGrantTypeChange, grantTypeOptions, grantType]);

  useEffect(() => {
    if (isDirty) return;
    getGrantML();
  }, [getGrantML, isDirty]);

  const updatePreviousDetail = (): void => {
    const latestData: any = {};
    latestData.displayName = displayName;
    latestData.distributionName = distributionName;
    zimbraHideInGal ? (latestData.zimbraHideInGal = true) : (latestData.zimbraHideInGal = false);
    dlm ? (latestData.dlm = dlm) : (latestData.dlm = []);
    ownersList ? (latestData.ownersList = ownersList) : (latestData.ownersList = []);
    dlMembershipList
      ? (latestData.dlMembershipList = dlMembershipList)
      : (latestData.dlMembershipList = []);
    zimbraNotes ? (latestData.zimbraNotes = zimbraNotes) : (latestData.zimbraNotes = '');
    description ? (latestData.description = description) : (latestData.description = '');
    zimbraDistributionListSendShareMessageToNewMembers
      ? (latestData.zimbraDistributionListSendShareMessageToNewMembers = true)
      : (latestData.zimbraDistributionListSendShareMessageToNewMember = false);
    latestData.zimbraMailStatus = zimbraMailStatus;

    if (selectedMailingList?.dynamic) {
      latestData.memberURL = memberURL;
      ownerOfList ? (latestData.ownerOffset = ownerOfList) : (latestData.ownerOffset = []);
    }

    latestData.grantType = grantType;
    latestData.grantEmails = grantEmails;
    latestData.sendEmails = sendEmails;
    setPreviousDetail(latestData);
    setIsDirty(false);
  };

  const onUndo = (): void => {
    previousDetail?.displayName ? setDisplayName(previousDetail?.displayName) : setDisplayName('');
    if (selectedMailingList?.dynamic) {
      previousDetail?.memberURL ? setMemberURL(previousDetail?.memberURL) : setMemberURL('');
    }
    setDistributionName(previousDetail?.distributionName);
    previousDetail?.zimbraHideInGal ? setZimbraHideInGal(true) : setZimbraHideInGal(false);
    previousDetail?.dlm !== undefined ? setDlm(previousDetail?.dlm) : setDlm([]);
    previousDetail?.ownersList !== undefined
      ? setOwnersList(previousDetail?.ownersList)
      : setOwnersList([]);
    previousDetail?.dlMembershipList !== undefined
      ? setDlMembershipList(previousDetail?.dlMembershipList)
      : setDlMembershipList([]);
    previousDetail?.sendEmailsList !== undefined
      ? setSendEmails(previousDetail?.sendEmailsList)
      : setSendEmails([]);
    previousDetail?.zimbraNotes ? setZimbraNotes(previousDetail?.zimbraNotes) : setZimbraNotes('');
    previousDetail?.description ? setDescription(previousDetail?.description) : setDescription('');
    previousDetail?.zimbraDistributionListSendShareMessageToNewMembers
      ? setZimbraDistributionListSendShareMessageToNewMembers(true)
      : setZimbraDistributionListSendShareMessageToNewMembers(false);
    previousDetail?.zimbraMailStatus !== undefined
      ? setZimbraMailStatus(previousDetail?.zimbraMailStatus)
      : setZimbraMailStatus(rightsOptions[1]);
    if (selectedMailingList?.dynamic) {
      previousDetail?.ownerOfList !== undefined
        ? setOwnerOfList(previousDetail?.ownerOfList)
        : setOwnerOfList([]);
    }
    setZimbraMailAlias(zimbraDefaultMailAlias);
    setIsDirty(false);
  };

  const callAllRequest = (requests: any): void => {
    setIsLoading(true);
    Promise.all(requests)
      .then((response: any) => Promise.all(response))
      .then((data: any) => {
        let isError = false;
        let errorMessage = '';
        if (grantType?.value !== EMAIL) {
          setGrantEmailsList([]);
          setGrantEmails([]);
        }
        data.forEach((item: any) => {
          if (item?.Fault) {
            isError = true;
            errorMessage = item?.Fault?.Reason?.Text;
          }
        });
        if (isError) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: errorMessage,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          updatePreviousDetail();
          setIsUpdateRecord(true);
        } else {
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t('label.changes_have_been_saved', 'The changes have been saved'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          updatePreviousDetail();
          setIsUpdateRecord(true);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setIsLoading(false);
      });
  };

  const onSave = (): void => {
    const attributes: any[] = [];
    const request: any[] = [];

    if (previousDetail.displayName !== undefined && previousDetail.displayName !== displayName) {
      attributes.push({
        n: 'displayName',
        _content: displayName,
      });
    }

    if (previousDetail?.zimbraNotes !== undefined && previousDetail?.zimbraNotes !== zimbraNotes) {
      attributes.push({
        n: 'zimbraNotes',
        _content: zimbraNotes,
      });
    }

    if (previousDetail?.description !== undefined && previousDetail?.description !== description) {
      attributes.push({
        n: 'description',
        _content: description,
      });
    }

    if (
      previousDetail?.zimbraMailStatus !== undefined &&
      previousDetail?.zimbraMailStatus?.value !== zimbraMailStatus?.value
    ) {
      attributes.push({
        n: 'zimbraMailStatus',
        _content: zimbraMailStatus?.value === TRUE_FALSE.TRUE ? 'enabled' : 'disabled',
      });
    }

    if (
      previousDetail?.zimbraHideInGal !== undefined &&
      previousDetail?.zimbraHideInGal !== zimbraHideInGal
    ) {
      attributes.push({
        n: 'zimbraHideInGal',
        _content: zimbraHideInGal ? 'TRUE' : 'FALSE',
      });
    }

    if (
      !selectedMailingList?.dynamic &&
      previousDetail.zimbraDistributionListSendShareMessageToNewMembers !== undefined &&
      previousDetail.zimbraDistributionListSendShareMessageToNewMembers !==
        zimbraDistributionListSendShareMessageToNewMembers
    ) {
      attributes.push({
        n: 'zimbraDistributionListSendShareMessageToNewMembers',
        _content: zimbraDistributionListSendShareMessageToNewMembers ? 'TRUE' : 'FALSE',
      });
    }

    if (
      selectedMailingList?.dynamic &&
      !zimbraIsACLGroup &&
      previousDetail?.memberURL !== undefined &&
      previousDetail?.memberURL !== memberURL
    ) {
      attributes.push({
        n: 'memberURL',
        _content: memberURL,
      });
    }

    if (attributes.length > 0)
      request.push(modifyDistributionList(selectedMailingList?.id, attributes));

    if (
      previousDetail?.distributionName !== undefined &&
      previousDetail?.distributionName !== distributionName
    ) {
      request.push(renameDistributionList(selectedMailingList?.id, distributionName));
    }

    /* Member Of List */
    if (
      previousDetail?.dlMembershipList !== undefined &&
      !isEqual(previousDetail?.dlMembershipList, dlMembershipList)
    ) {
      const newAddedMember: any[] = [];
      dlMembershipList.forEach((item: any) => {
        if (!previousDetail?.dlMembershipList.map((i: any) => i?.id).includes(item?.id)) {
          newAddedMember.push(item);
        }
      });

      const removeMember: any[] = [];
      previousDetail?.dlMembershipList.forEach((item: any) => {
        if (!dlMembershipList.map((i: any) => i?.id).includes(item?.id)) {
          removeMember.push(item);
        }
      });

      if (newAddedMember.length > 0) {
        newAddedMember.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: item?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: distributionName,
          };
          request.push(addDistributionListMember(id, dlmItem));
        });
      }

      if (removeMember.length > 0) {
        removeMember.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: item?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: distributionName,
          };
          request.push(removeDistributionListMember(id, dlmItem));
        });
      }
    }

    /* Dynamic Member List */
    if (
      selectedMailingList?.dynamic &&
      previousDetail?.ownerOfList !== undefined &&
      !isEqual(previousDetail?.ownerOfList, ownerOfList)
    ) {
      const newAddedMember: any[] = [];
      ownerOfList.forEach((item: any) => {
        if (!previousDetail?.ownerOfList.map((i: any) => i?.id).includes(item?.id)) {
          newAddedMember.push(item);
        }
      });

      const removeMember: any[] = [];
      previousDetail?.ownerOfList.forEach((item: any) => {
        if (!ownerOfList.map((i: any) => i?.id).includes(item?.id)) {
          removeMember.push(item);
        }
      });

      if (newAddedMember.length > 0) {
        newAddedMember.forEach(() => {
          const id: any = {
            n: 'id',
            _content: selectedMailingList?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: distributionName,
          };
          request.push(addDistributionListMember(id, dlmItem));
        });
      }

      if (removeMember.length > 0) {
        removeMember.forEach(() => {
          const id: any = {
            n: 'id',
            _content: selectedMailingList?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: distributionName,
          };
          request.push(removeDistributionListMember(id, dlmItem));
        });
      }
    }

    /* Alias List */
    if (!isEqual(zimbraDefaultMailAlias, zimbraMailAlias)) {
      const deleteAliasArr = differenceBy(zimbraDefaultMailAlias, zimbraMailAlias, 'label');
      const addAliasArr = differenceBy(zimbraMailAlias, zimbraDefaultMailAlias, 'label');

      deleteAliasArr.forEach((aliasName: any) => {
        request.push(deleteMailingListAliasRequest(selectedMailingList?.id, `${aliasName?.label}`));
      });

      addAliasArr.forEach((aliasName: any) => {
        request.push(addMailingListAliasRequest(selectedMailingList?.id, `${aliasName?.label}`));
      });

      setDefaultZimbraMailAlias(zimbraMailAlias);
    }

    /* Grant Type */
    if (
      previousDetail?.grantEmails !== undefined &&
      previousDetail?.grantType !== undefined &&
      (!isEqual(previousDetail?.grantEmails, grantEmails) ||
        previousDetail?.grantType?.value !== grantType?.value)
    ) {
      let dl: any = {};
      dl = { by: 'id', _content: selectedMailingList?.id };
      let action: any = {};
      if (grantType?.value === PUB) {
        action = {
          op: 'setRights',
          right: { right: 'sendToDistList', grantee: [] },
        };
      } else if (grantType?.value === GRP) {
        action = {
          op: 'setRights',
          right: {
            right: 'sendToDistList',
            grantee: [{ type: GRP, by: 'name', _content: selectedMailingList?.name }],
          },
        };
      } else if (grantType?.value === ALL) {
        action = {
          op: 'setRights',
          right: { right: 'sendToDistList', grantee: [{ type: ALL }] },
        };
      } else if (grantType?.value === EMAIL) {
        action = {
          op: 'setRights',
          right: {
            right: 'sendToDistList',
            grantee: grantEmails.map((item: any) => ({
              type: 'email',
              by: 'name',
              _content: item?.name ? item?.name : item,
            })),
          },
        };
      }
      request.push(distributionListAction(dl, action));
    }

    if (request.length > 0) {
      callAllRequest(request);
    }
  };

  useEffect(() => {
    if (previousDetail?.displayName !== undefined && previousDetail?.displayName !== displayName) {
      setIsDirty(true);
    }
  }, [previousDetail?.displayName, displayName]);
  useEffect(() => {
    if (!isEqual(zimbraDefaultMailAlias, zimbraMailAlias)) {
      setIsDirty(true);
    }
  }, [zimbraDefaultMailAlias, zimbraMailAlias]);

  useEffect(() => {
    if (
      previousDetail?.distributionName !== undefined &&
      previousDetail?.distributionName !== distributionName
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.distributionName, distributionName]);

  useEffect(() => {
    if (
      previousDetail?.zimbraHideInGal !== undefined &&
      previousDetail?.zimbraHideInGal !== zimbraHideInGal
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.zimbraHideInGal, zimbraHideInGal]);

  useEffect(() => {
    if (
      previousDetail?.ownerOfList !== undefined &&
      !isEqual(previousDetail?.ownerOfList, ownerOfList)
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.ownerOfList, ownerOfList]);



  useEffect(() => {
    if (
      previousDetail?.dlMembershipList !== undefined &&
      !isEqual(previousDetail?.dlMembershipList, dlMembershipList)
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.dlMembershipList, dlMembershipList]);

  useEffect(() => {
    if (previousDetail?.zimbraNotes !== undefined && previousDetail?.zimbraNotes !== zimbraNotes) {
      setIsDirty(true);
    }
  }, [previousDetail?.zimbraNotes, zimbraNotes]);

  useEffect(() => {
    if (previousDetail?.description !== undefined && previousDetail?.description !== description) {
      setIsDirty(true);
    }
  }, [previousDetail?.description, description]);

  useEffect(() => {
    if (
      previousDetail?.zimbraDistributionListSendShareMessageToNewMembers !== undefined &&
      previousDetail?.zimbraDistributionListSendShareMessageToNewMembers !==
        zimbraDistributionListSendShareMessageToNewMembers
    ) {
      setIsDirty(true);
    }
  }, [
    previousDetail?.zimbraDistributionListSendShareMessageToNewMembers,
    zimbraDistributionListSendShareMessageToNewMembers,
  ]);

  useEffect(() => {
    if (
      previousDetail?.zimbraMailStatus !== undefined &&
      previousDetail?.zimbraMailStatus?.value !== zimbraMailStatus.value
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.zimbraMailStatus, zimbraMailStatus]);

  useEffect(() => {
    if (previousDetail?.memberURL !== undefined && previousDetail?.memberURL !== memberURL) {
      setIsDirty(true);
    }
  }, [previousDetail?.memberURL, memberURL]);

  const handleClickDeleteEvent = useCallback(() => {
    const getGrantBody: any = {};
    const grantee = {
      type: GRP,
      by: 'id',
      _content: selectedMailingList?.id,
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
      _content: selectedMailingList?.id,
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
  }, [createSnackbar, selectedMailingList?.name, t]);

  const closeHandler = useCallback(() => {
    setIsOpenDeleteDialog(false);
  }, []);


  const onSuccess = useCallback(
    (message: string) => {
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
    },
    [closeHandler, createSnackbar, setIsUpdateRecord, setShowMailingListDetailView],
  );

  const onDeleteHandler = useCallback(() => {
    setIsRequestInProgress(true);
    deleteDistributionList(dlId)
      .then(() => {
        onSuccess(
          t('label.dl_delete_successfull', '{{name}} has been deleted successfully', {
            name: distributionName,
          }),
        );
      })
      .then((error: any) => {
        setIsRequestInProgress(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [createSnackbar, onSuccess, t, dlId, distributionName]);

  useEffect(() => {
    const totalRights = targetTotalRights + granteeTotalRights;
    setTotalGrantRights(totalRights);
  }, [granteeTotalRights, targetTotalRights]);

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
      label: t('label.sendas', 'SEND AS').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'sendto',
      label: t('label.sendto', 'SEND TO').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
  ];
  // if(!selectedMailingList?.dynamic) {
  //   items.push({
  //     id: 'sendas',
  //     label: t('label.sendas', 'SEND AS').toLocaleUpperCase(),
  //     CustomComponent: ReusedDefaultTabBar,
  //   });
  // }

  return (
    <>
      {isLoading && <spinner-wc></spinner-wc>}
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
            <Text size="medium" overflow="ellipsis" weight="bold">
              {distributionName} (
              {selectedMailingList?.dynamic
                ? t('label.dynamic', 'Dynamic')
                : t('label.standard', 'Standard')}
              )
            </Text>
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
                  <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
                </Padding>
                <Padding right="small">
                  <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
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
          <divider-wc color="gray3" />
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
          <divider-wc color="gray2" />
        </Container>

        {selectedTab === 'general' && (
          <GeneralTab
            displayName={displayName}
            setDisplayName={setDisplayName}
            distributionName={distributionName}
            setDistributionName={setDistributionName}
            zimbraHideInGal={zimbraHideInGal}
            setZimbraHideInGal={setZimbraHideInGal}
            zimbraNotes={zimbraNotes}
            setZimbraNotes={setZimbraNotes}
            description={description}
            setDescription={setDescription}
            zimbraDistributionListSendShareMessageToNewMembers={zimbraDistributionListSendShareMessageToNewMembers}
            setZimbraDistributionListSendShareMessageToNewMembers={setZimbraDistributionListSendShareMessageToNewMembers}
            zimbraMailStatus={zimbraMailStatus}
            onRightsChange={onRightsChange}
            rightsOptions={rightsOptions}
            zimbraMailAlias={zimbraMailAlias}
            setZimbraMailAlias={setZimbraMailAlias}
            dlCreateDate={dlCreateDate}
            dlId={dlId}
            dlmCount={dlm.length}
            selectedMailingList={selectedMailingList}
            dlMembershipListNames={dlMembershipListNames}
            setIsDirty={setIsDirty}
          />
        )}

        {selectedTab === 'members' && (
          <MembersTab
            dlm={dlm}
            setDlm={setDlm}
            setPreviousDetail={setPreviousDetail}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
            isGlobalAdmin={isGlobalAdmin}
            memberURL={memberURL}
            setMemberURL={setMemberURL}
          />
        )}

        {selectedTab === 'owners' && (
          <OwnersTab
            ownersList={ownersList}
            setOwnersList={setOwnersList}
            setPreviousDetail={setPreviousDetail}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
          />
        )}

        {selectedTab === 'sendas' && (
          <SendAsTab
            sendEmailsList={sendEmailsList}
            setSendEmailsList={setSendEmailsList}
            setSendEmails={setSendEmails}
            setPreviousDetail={setPreviousDetail}
            selectedMailingList={selectedMailingList}
            isRequestInProgress={isRequestInProgress}
            setIsRequestInProgress={setIsRequestInProgress}
            searchUserLabelValue={searchUserLabelValue}
          />
        )}

        {selectedTab === 'sendto' && (
          <SendToTab
            grantTypeOptions={grantTypeOptions}
            grantType={grantType}
            onGrantTypeChange={onGrantTypeChange}
            grantEmailsList={grantEmailsList}
            setGrantEmailsList={setGrantEmailsList}
            setGrantEmails={setGrantEmails}
            setIsDirty={setIsDirty}
            searchUserLabelValue={searchUserLabelValue}
            isShowSenderToError={isShowSenderToError}
            setIsShowSenderToError={setIsShowSenderToError}
          />
        )}

        {isOpenUnsavedDialog && (
          <Modal
            size="small"
            title={t('domain.distributionList.unsavedChanges', 'Unsaved Changes')}
            open={isOpenUnsavedDialog}
            customFooter={
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Row style={{ gap: '1rem' }}>
                  <Button
                    label={t('domain.distributionList.exitWithoutSave', 'Exit without Save')}
                    color="gray0"
                    type="outlined"
                    onClick={(): void => {
                      onUndo();
                      if (pendingTab) {
                        setSelectedTab(pendingTab);
                      }
                      setPendingTab(null);
                      setIsOpenUnsavedDialog(false);
                    }}
                  />
                  <Button
                    label={t('domain.distributionList.saveAndExit', 'Save & Exit')}
                    color="primary"
                    onClick={(): void => {
                      onSave();
                      if (pendingTab) {
                        setSelectedTab(pendingTab);
                      }
                      setPendingTab(null);
                      setIsOpenUnsavedDialog(false);
                    }}
                  />
                </Row>
              </Container>
            }
            showCloseIcon
            onClose={(): void => {
              setPendingTab(null);
              setIsOpenUnsavedDialog(false);
            }}
          >
            <Container
              padding={{ top: 'extralarge', bottom: 'extralarge' }}
              mainAlignment='flex-start'
            >
              <Text size="large" overflow="break-word">
                {t(
                  'domain.distributionList.unsavedChangesMessage',
                  'Are you sure you want to leave this page without saving?',
                )}
              </Text>
            </Container>
          </Modal>
        )}

        <RouteLeavingGuard when={isDirty} onSave={onSave}>
          <Text>
            {t(
              'label.unsaved_changes_line1',
              'Are you sure you want to leave this page without saving?',
            )}
          </Text>
          <Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
        </RouteLeavingGuard>
        {isOpenDeleteDialog && (
          <Modal
            size="medium"
            title={t('label.you_are_deleting_ml', 'You are deleting {{name}}', {
              name: displayName || distributionName,
            })}
            open={isOpenDeleteDialog}
            customFooter={
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Row style={{ gap: '1rem' }}>
                  <Button
                    label={t('label.cancel', 'Cancel')}
                    color="secondary"
                    type="outlined"
                    onClick={closeHandler}
                    disabled={isRequestInProgress}
                  />
                  <Button
                    label={t('label.yes_delete_it', 'Yes, Delete it')}
                    color="error"
                    onClick={onDeleteHandler}
                    disabled={isRequestInProgress}
                  />
                </Row>
              </Container>
            }
            showCloseIcon
            onClose={closeHandler}
          >
            <Container
              padding={{ top: 'extralarge', bottom: 'extralarge' }}
              style={{ textAlign: 'center' }}
            >
              <Padding bottom="small">
                {totalGrantRights !== 0 && (
                  <Container padding={{ bottom: 'extralarge' }}>
                    <Text size={'extralarge'} overflow="break-word">
                      <Trans
                        i18nKey="label.total_acc_rights_with_delete_distribution_list_helper_text"
                        defaults="This list has <bold>{{totalAccRights}}</bold> shared accounts rights. <br /> If you delete it all rights will be lost."
                        components={{
                          bold: <strong />,
                          br: <br />,
                        }}
                        values={{
                          totalAccRights: totalGrantRights,
                        }}
                      />
                    </Text>
                  </Container>
                )}
                <Text size={'extralarge'} overflow="break-word">
                  <Trans
                    i18nKey="label.are_you_sure_delete_distribution_list"
                    defaults="Are you sure you want to delete <bold>{{name}}</bold> ?"
                    components={{ bold: <strong /> }}
                    values={{
                      name: displayName || distributionName,
                    }}
                  />
                </Text>
              </Padding>
            </Container>
          </Modal>
        )}
      </Container>
    </>
  );
};
export default EditMailingListView;

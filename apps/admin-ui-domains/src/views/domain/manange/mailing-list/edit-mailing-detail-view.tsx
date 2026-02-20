/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Checkbox,
  Container,
  CustomHeaderFactory,
  CustomTextArea,
  DefaultTabBarItem,
  DropDownInput,
  HoverableRowFactory,
  Input,
  ListRow,
  Modal,
  Padding,
  Paging,
  Row,
  Select,
  Switch,
  TabBar,
  Table,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { useDomainStore, useUserSettings } from '@zextras/ui-shared';
import { format, isValid } from 'date-fns';
import { debounce, differenceBy, isEqual, sortedUniq, uniq, uniqBy } from 'lodash';
import React, {
  ChangeEvent,
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import helmetLogo from '../../../../assets/helmet_logo.svg';
import {
  ALL,
  DL,
  EDOM,
  EMAIL,
  GRP,
  GST,
  PUB,
  RECORD_DISPLAY_LIMIT,
  USR,
} from '../../../../constants';
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
import { searchDirectory } from '../../../../services/search-directory-service';
import { getDomainList } from '../../../../services/search-domain-service';
import { searchGal } from '../../../../services/search-gal-service';
import ManageAliases from '../../../components/manageAliases';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { getAllEmailFromString, getDateTimeFromStr, isValidEmail } from '../../../utility/utils';

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
  const [dlmTableRows, setDlmTableRows] = useState<any>([]);
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [ownerTableRows, setOwnerTableRows] = useState<any[]>([]);
  const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<any[]>([]);
  const [selectedOwnerListMember, setSelectedOwnerListMember] = useState<any[]>([]);
  const [dlMembershipListNames, setDlMembershipListNames] = useState<string>('');
  const [openAddMailingListDialog, setOpenAddMailingListDialog] = useState<boolean>(false);
  const isRequstInProgress = false;
  const [isAddToOwnerList, setIsAddToOwnerList] = useState<boolean>(false);
  const [searchMailingListOrUser, setSearchMailingListOrUser] = useState<string>('');
  const [isShowError, setIsShowError] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [searchMember, setSearchMember] = useState<string>('');
  const [searchOwner, setSearchOwner] = useState<string>('');
  const [memberURL, setMemberURL] = useState<string>();
  const [ownerOfList, setOwnerOfList] = useState<any[]>([]);
  const [ownerErrorMessage, setOwnerErrorMessage] = useState<string | null>('');
  const [zimbraIsACLGroup, setZimbraIsACLGroup] = useState<boolean>(false);
  const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
  const [searchOwnerResult, setSearchOwnerResult] = useState<Array<any>>([]);
  const [isShowMemberError, setIsShowMemberError] = useState<boolean>(false);
  const [isShowOwnerError, setIsShowOwnerError] = useState<boolean>(false);
  const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>('');
  const [allOwnerList, setAllOwnerList] = useState<Array<any>>([]);
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

  // filtering
  const [filterMember, setFilterMember] = useState<string>('');
  const [filteredDlmTableRows, setFilteredDlmTableRows] = useState<any>([]);
  const [filterGrantEmail, setFilterGrantEmail] = useState<string>('');
  const [filteredGrantEmailRows, setFilteredGrantEmailRows] = useState<any>([]);
  const [filterSendEmail, setFilterSendEmail] = useState<string>('');
  const [filteredSendEmailRows, setFilteredSendEmailRows] = useState<any>([]);

  // sendrightsCheckMarks
  const [sendRightCheck, setSendRightCheck] = useState<boolean>(false);
  const [sendBehalfRightCheck, setSendBehalfRightCheck] = useState<boolean>(false);

  // sendEmails
  const [sendEmails, setSendEmails] = useState<any>([]);

  // sendRights table
  const [selectedSendEmail, setSelectedSendEmail] = useState<Array<any>>([]);
  const [sendEmailItem, setSendEmailItem] = useState<string>('');
  const [sendEmailsList, setSendEmailsList] = useState<any>([]);
  const [sendEmailTableRows, setSendEmailTableRows] = useState<any>([]);

  // dist list members offset
  const [offset, setOffset] = useState<number>(0);
  const limit = 15;
  const [DLMCurrentPage, setDLMSearchCurrentPage] = useState(1);
  const [DLMPagedRows, setDLMPagedRows] = useState<any>([]);

  const dlCreateDate = useMemo(() => {
    if (!zimbraCreateTimestamp || zimbraCreateTimestamp === '') {
      return '';
    }
    const date = getDateTimeFromStr(zimbraCreateTimestamp);
    return date && isValid(date) ? format(date, 'dd MMM yyyy - HH:mm') : '';
  }, [zimbraCreateTimestamp]);

  const memberHeaders: any[] = useMemo(
    () => [
      {
        id: 'members',
        label: t('label.members', 'Members'),
        width: '80%',
        bold: true,
      },
      !selectedMailingList?.dynamic
        ? {
            id: 'actions',
            label: t('label.actions', 'Actions'),
            width: '20%',
            bold: false,
          }
        : { id: 'actions', label: '', width: '0%', bold: false },
    ],
    [t],
  );

  const ownerHeaders: any[] = useMemo(
    () => [
      {
        id: 'owners',
        label: t('label.owners', 'Owners'),
        width: '80%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: false,
      },
    ],
    [t],
  );

  const grantEmailHeaders: any[] = useMemo(
    () => [
      {
        id: 'grantEmail',
        label: t('label.who_can_send_mails_to_list ', 'Who can send mails TO this list?'),
        width: '80%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: false,
      },
    ],
    [t],
  );

  const sendEmailHeaders: any[] = useMemo(
    () => [
      {
        id: 'sendEmail',
        label: t('label.delegates', 'Delegates'),
        width: '50%',
        bold: true,
      },
      {
        id: 'sendAcl',
        label: t('label.rights', 'Rights'),
        width: '30%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: false,
      },
    ],
    [t],
  );

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

  useEffect(() => {
    if (dlm && dlm.length > 0) {
      if (!filterMember) {
        const allRows = dlm.map((item: any) => ({
          id: item,
          columns: [
            <Text
              size="small"
              weight="regular"
              key={item}
              color="gray0"
              onClick={(): void => {
                setSelectedDistributionListMember([item]);
              }}
            >
              {item}
            </Text>,
            selectedMailingList?.dynamic ? null : (
              <Button
                type="ghost"
                color={'text'}
                size="medium"
                icon="CloseOutline"
                style={{ position: 'inherit' }}
                aria-label={t('label.delete', 'Delete')}
                onClick={(): void => deleteSingleRow(item, 'distListMember')}
              />
            ),
          ],
        }));
        const pagedRows = allRows.slice(offset, offset + limit);
        setDlmTableRows(allRows);
        setDLMPagedRows(pagedRows);
      } else {
        const filteredRows = dlm
          .filter((item: any) => item.toLowerCase().includes(filterMember.toLowerCase()))
          .map((item: any) => ({
            id: item,
            columns: [
              <Text
                size="small"
                weight="regular"
                key={item}
                color="gray0"
                onClick={(): void => {
                  setSelectedDistributionListMember([item]);
                }}
              >
                {item}
              </Text>,
              selectedMailingList?.dynamic ? null : (
                <Button
                  type="ghost"
                  color={'text'}
                  size="medium"
                  icon="CloseOutline"
                  style={{ position: 'inherit' }}
                  aria-label={t('label.delete', 'Delete')}
                  onClick={(): void => deleteSingleRow(item, 'distListMember')}
                />
              ),
            ],
          }));
        const pagedRows = filteredRows.slice(offset, offset + limit);
        setDlmTableRows(filteredRows);
        setDLMPagedRows(pagedRows);
      }
    } else {
      setDlmTableRows([]);
      setDLMPagedRows([]);
      setOffset(0);
      setDLMSearchCurrentPage(1);
    }
  }, [dlm, offset, filterMember]);

  useEffect(() => {
    if (ownersList && ownersList.length > 0) {
      const allRows = ownersList.map((item: any) => ({
        id: item?.name,
        columns: [
          <Text
            size="small"
            weight="regular"
            key={item?.id}
            color="gray0"
            onClick={(): void => {
              setSelectedOwnerListMember([item?.name]);
            }}
          >
            {item?.name}
          </Text>,
          <Button
            key="delete_owner_btn"
            type="ghost"
            color={'text'}
            size="medium"
            icon="CloseOutline"
            style={{ position: 'inherit' }}
            aria-label={t('label.delete', 'Delete')}
            onClick={(): void => deleteSingleRow(item?.name, 'owner')}
          />,
        ],
      }));
      setOwnerTableRows(allRows);
    } else {
      setOwnerTableRows([]);
    }
  }, [ownersList]);

  useEffect(() => {
    if (sendEmailsList && sendEmailsList.length > 0) {
      const allRows = sendEmailsList.map((item: any) => ({
        id: item?.name,
        columns: [
          <Text
            size="small"
            weight="regular"
            key={item?.id}
            color="gray0"
            onClick={(): void => {
              setSelectedSendEmail([item?.name]);
            }}
          >
            {item?.name}
          </Text>,
          <Text
            size="small"
            weight="regular"
            key={item?.id + '_acl'}
            color="gray0"
            onClick={(): void => {
              setSelectedSendEmail([item?.name]);
            }}
          >
            {item?.sendAcl === 'sendAsDistList'
              ? t('account_details.send_check', 'Send As')
              : t('account_details.send_on_behalf_of_check', 'Send On Behalf Of')}
          </Text>,
          <Button
            key="delete_send_email_btn"
            type="ghost"
            color={'text'}
            size="medium"
            icon="CloseOutline"
            style={{ position: 'inherit' }}
            aria-label={t('label.delete', 'Delete')}
            onClick={(): void => deleteSingleRow(item?.name, 'sendEmail')}
          />,
        ],
      }));
      setSendEmailTableRows(allRows);
    } else {
      setSendEmailTableRows([]);
    }
  }, [sendEmailsList]);

  const _allOwnerLists = useMemo(
    () =>
      ownersList.map((item: any) => ({
        id: item?.id,
        name: item?.name,
        type: item?.type,
      })),
    [ownersList],
  );

  const onAddToList = useCallback((): void => {
    const attrs = '';
    const types = 'distributionlists,aliases,accounts,resources';
    const query = `(mail=${searchMailingListOrUser})`;
    searchDirectory(attrs, types, '', query, 0, 2).then((data) => {
      const accountExists = data?.dl || data?.account;
      if (!!accountExists && accountExists[0]) {
        setIsShowError(false);
        if (isAddToOwnerList) {
          if (ownersList.find((item: any) => item?.name === searchMailingListOrUser)) {
            setIsShowError(true);
            setOwnerErrorMessage(
              t(
                'label.distribution_list_already_in_list_error',

                'The Distribution List / User is already in the list',
              ),
            );
          } else {
            setOwnersList(
              ownersList.concat({ id: accountExists[0]?.id, name: accountExists[0]?.name }),
            );
            setOpenAddMailingListDialog(false);
          }
        } else if (dlm.find((item: any) => item === searchMailingListOrUser)) {
          setIsShowError(true);
          setOwnerErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          setDlm(dlm.concat(accountExists[0]?.name));
          setOpenAddMailingListDialog(false);
        }
      } else {
        setIsShowError(true);
        setOwnerErrorMessage(
          t(
            'label.distribution_list_not_exists_error_msg',
            'The Distribution List / User does not exist. Please check the spelling and try again.',
          ),
        );
      }
    });
  }, [t, isAddToOwnerList, searchMailingListOrUser, dlm, ownersList]);

  const [grantType, setGrantType] = useState<any>([]);
  const [grantEmails, setGrantEmails] = useState<any>([]);
  const [searchGrantEmailResult, setSearchGrantEmailResult] = useState<Array<any>>([]);
  const [grantEmailItem, setGrantEmailItem] = useState<string>('');
  const [grantEmailTableRows, setGrantEmailTableRows] = useState<Array<any>>([]);
  const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);
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

  const grantItems = searchGrantEmailResult.map((item: any) => ({
    id: item?.id,
    label: item?.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          setGrantEmailItem(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  const sendItems = searchGrantEmailResult.map((item: any) => ({
    id: item?.id,
    label: item?.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          setSendEmailItem(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  const searchEmailFromGal = useCallback((searchKeyword: string) => {
    searchGal(searchKeyword).then((data) => {
      const contactList = data?.cn;
      if (contactList) {
        let result: any[] = [];
        result = contactList.map((item: any): any => ({
          id: item?.id,
          name: item?._attrs?.email,
        }));
        setSearchGrantEmailResult(result);
      } else {
        setSearchGrantEmailResult([]);
      }
    });
  }, []);

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
          setGrantEmailTableRows([]);
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

  const getOwnerType = useCallback(
    (email?: string): any => {
      let type = 'email';
      const all = [..._allOwnerLists, ...allOwnerList];
      all.forEach((item: any) => {
        if (item?.id && item?.type && item?.email === email) {
          type = item?.type === 'group' || item?.type === GRP ? GRP : USR;
        }
      });
      return type;
    },
    [allOwnerList, _allOwnerLists],
  );

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

    /* Members List */
    if (previousDetail?.dlm !== undefined && !isEqual(previousDetail?.dlm, dlm)) {
      const newAddedMember: any[] = [];
      dlm.forEach((item: any) => {
        if (!previousDetail?.dlm.includes(item)) {
          newAddedMember.push(item);
        }
      });
      const removeMember: any[] = [];
      previousDetail?.dlm.forEach((item: any) => {
        if (!dlm.includes(item)) {
          removeMember.push(item);
        }
      });

      if (newAddedMember.length > 0) {
        newAddedMember.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: selectedMailingList?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: item,
          };
          request.push(addDistributionListMember(id, dlmItem));
        });
      }

      if (removeMember.length > 0) {
        removeMember.forEach((item: any) => {
          const id: any = {
            n: 'id',
            _content: selectedMailingList?.id,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: item,
          };
          request.push(removeDistributionListMember(id, dlmItem));
        });
      }
    }

    /* Owner List */
    if (
      previousDetail?.ownersList !== undefined &&
      !isEqual(previousDetail?.ownersList, ownersList)
    ) {
      const newAddedOwnerMember: any[] = [];
      ownersList.forEach((item: any) => {
        if (!previousDetail?.ownersList.includes(item)) {
          newAddedOwnerMember.push(item);
        }
      });
      const removeOwnerMember: any[] = [];
      previousDetail?.ownersList.forEach((item: any) => {
        if (!ownersList.includes(item)) {
          removeOwnerMember.push(item);
        }
      });

      if (newAddedOwnerMember.length > 0) {
        newAddedOwnerMember.forEach((item: any) => {
          const dl: any = {
            by: 'id',
            _content: selectedMailingList?.id,
          };
          const action: any = {
            op: 'addOwners',
            owner: {
              by: 'name',
              type: getOwnerType(item?.name),
              _content: item?.name,
            },
          };
          request.push(distributionListAction(dl, action));
        });
      }

      if (removeOwnerMember.length > 0) {
        removeOwnerMember.forEach((item: any) => {
          const dl: any = {
            by: 'id',
            _content: selectedMailingList?.id,
          };
          const action: any = {
            op: 'removeOwners',
            owner: {
              by: 'name',
              type: getOwnerType(item?.name),
              _content: item?.name,
            },
          };
          request.push(distributionListAction(dl, action));
        });
      }
    }

    /* Send As / On Behalf Of List */
    if (
      previousDetail?.sendEmailsList !== undefined &&
      !isEqual(previousDetail?.sendEmailsList, sendEmailsList)
    ) {
      const newAddedSendEmailMember: any[] = [];
      sendEmailsList.forEach((item: any) => {
        if (
          !previousDetail?.sendEmailsList.find(
            (i: any) => i?.name === item?.name && i?.sendAcl === item?.sendAcl,
          )
        ) {
          newAddedSendEmailMember.push(item);
        }
      });
      const removeSendEmailMember: any[] = [];
      previousDetail?.sendEmailsList.forEach((item: any) => {
        if (
          !sendEmailsList.find((i: any) => i?.name === item?.name && i?.sendAcl === item?.sendAcl)
        ) {
          removeSendEmailMember.push(item);
        }
      });

      if (newAddedSendEmailMember.length > 0) {
        newAddedSendEmailMember.forEach((item: any) => {
          const dl: any = {
            by: 'id',
            _content: selectedMailingList?.id,
          };
          const action: any = {
            op: 'grantRights',
            right: {
              right: item?.sendAcl,
              grantee: {
                by: 'name',
                type: 'email',
                _content: item?.name ? item?.name : item,
              },
            },
          };
          request.push(distributionListAction(dl, action));
        });
      }

      if (removeSendEmailMember.length > 0) {
        removeSendEmailMember.forEach((item: any) => {
          const dl: any = {
            by: 'id',
            _content: selectedMailingList?.id,
          };
          const action: any = {
            op: 'revokeRights',
            right: {
              right: item?.sendAcl,
              grantee: {
                by: 'name',
                type: 'email',
                _content: item?.name ? item?.name : item,
              },
            },
          };
          request.push(distributionListAction(dl, action));
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
    if (previousDetail?.dlm !== undefined && !isEqual(previousDetail?.dlm, dlm)) {
      setIsDirty(true);
    }
  }, [previousDetail?.dlm, dlm]);

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
      previousDetail?.ownersList !== undefined &&
      !isEqual(previousDetail?.ownersList, ownersList)
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.ownersList, ownersList]);

  useEffect(() => {
    if (
      previousDetail?.sendEmailsList !== undefined &&
      !isEqual(previousDetail?.sendEmailsList, sendEmailsList)
    ) {
      setIsDirty(true);
    }
  }, [previousDetail?.sendEmailsList, sendEmailsList]);

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

  useEffect(() => {
    if (openAddMailingListDialog) {
      setSearchMailingListOrUser('');
      setIsShowError(false);
    }
  }, [openAddMailingListDialog]);

  useEffect(() => {
    if (selectedMailingList?.dynamic) {
      setIsAddToOwnerList(true);
    }
  }, [selectedMailingList?.dynamic]);

  const searchMemberItems = searchMemberResult.map((item: any) => ({
    id: item.id,
    label: item.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          setSearchMember(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  const searchOwnerList = searchOwnerResult.map((item: any) => ({
    id: item.id,
    label: item.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => {
          setSearchOwner(item?.name);
        }}
      >
        {item?.name}
      </Row>
    ),
  }));

  const getSearchMemberList = useCallback(
    (mem: string) => {
      const attrs =
        'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraMailStatus';
      const types = 'accounts,distributionlists,aliases';
      const query = `(&(!(zimbraAccountStatus=closed))(!(zimbraIsAdminGroup=TRUE))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)))`;

      searchDirectory(attrs, types, '', query, 0, RECORD_DISPLAY_LIMIT, 'name')
        .then((data) => {
          const result: any[] = [];
          const dl = data?.dl;
          const account = data?.account;
          const alias = data?.alias;
          if (dl) {
            dl.map((item: any) => result.push(item));
          }
          if (account) {
            account.map((item: any) => result.push(item));
          }
          if (alias) {
            alias.map((item: any) => result.push(item));
          }
          setSearchMemberResult(result);
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, t],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchMemberCall = useCallback(
    debounce((mem) => {
      getSearchMemberList(mem);
    }, 700),
    [debounce],
  );
  useEffect(() => {
    if (searchMember !== '') {
      searchMemberCall(searchMember);
    }
  }, [searchMember, searchMemberCall]);

  const onAdd = useCallback((): void => {
    if (searchMember !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: any[] = specialChars.test(searchMember)
        ? getAllEmailFromString(searchMember)
        : [searchMember];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowMemberError(true);
          setMemberErrorMessage(
            t(
              'label.distribution_list_not_exists_error_msg',
              'The Distribution List / User does not exist. Please check the spelling and try again.',
            ),
          );
        } else if (dlm.find((item: any) => item === searchMember)) {
          setIsShowMemberError(true);
          setMemberErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          const sortedList = sortedUniq(allEmails);
          setDlm(uniq(dlm.concat(sortedList)));
          setIsShowMemberError(false);
          setSearchMember('');
          setMemberErrorMessage('');
        }
      } else if (allEmails === undefined) {
        setMemberErrorMessage(
          t(
            'label.distribution_list_not_exists_error_msg',
            'The Distribution List / User does not exist. Please check the spelling and try again.',
          ),
        );
        setIsShowMemberError(true);
      }
    }
  }, [searchMember, t, dlm]);

  const onAddOwner = useCallback((): void => {
    if (searchOwner !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: any[] = specialChars.test(searchOwner)
        ? getAllEmailFromString(searchOwner)
        : [searchOwner];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowOwnerError(true);
          setOwnerErrorMessage(
            t(
              'label.distribution_list_not_exists_error_msg',
              'The Distribution List / User does not exist. Please check the spelling and try again.',
            ),
          );
        } else if (ownersList.find((item: any) => item?.name === searchOwner)) {
          setIsShowOwnerError(true);
          setOwnerErrorMessage(
            t(
              'label.distribution_list_already_in_list_error',
              'The Distribution List / User is already in the list',
            ),
          );
        } else {
          setIsShowOwnerError(false);
          const sortedList = sortedUniq(allEmails);
          setOwnersList(
            uniq(ownersList.concat(sortedList.map((item: any) => ({ name: item, id: item })))),
          );
          setSearchOwner('');
          setMemberErrorMessage('');
        }
      } else if (allEmails === undefined) {
        setIsShowOwnerError(true);
        setOwnerErrorMessage(
          t(
            'label.distribution_list_not_exists_error_msg',
            'The Distribution List / User does not exist. Please check the spelling and try again.',
          ),
        );
      }
    }
  }, [searchOwner, t, ownersList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchSendEmail = useCallback(
    debounce((searchWord) => {
      searchEmailFromGal(searchWord);
    }, 700),
    [debounce],
  );

  useEffect(() => {
    if (sendEmailItem !== '') {
      searchSendEmail(sendEmailItem);
    }
  }, [sendEmailItem, searchSendEmail]);

  const onAddSendEmail = useCallback(() => {
    if (sendEmailItem !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: any[] = specialChars.test(sendEmailItem)
        ? getAllEmailFromString(sendEmailItem)
        : [sendEmailItem];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: `${t('label.invalid_email_address', 'Invalid email address')} ${
              inValidEmailAddress[0]
            }`,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          setSendEmailItem('');
          setSendRightCheck(false);
          setSendBehalfRightCheck(false);
          allEmails.forEach((item: any, index: any) => {
            if (sendRightCheck && !sendBehalfRightCheck) {
              allEmails[index] = { name: item, sendAcl: 'sendAsDistList' };
            } else if (!sendRightCheck && sendBehalfRightCheck) {
              allEmails[index] = { name: item, sendAcl: 'sendOnBehalfOfDistList' };
            }
          });
          const sortedList = sortedUniq(allEmails);
          const emails = uniq(sendEmailsList.concat(sortedList));
          setSendEmailsList(emails);
          setSendEmails(emails);
          setIsDirty(true);
        }
      } else if (allEmails === undefined) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: `${t('label.invalid_email_address', 'Invalid email address')} ${grantEmailItem}`,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    }
  }, [sendEmailsList, createSnackbar, sendEmailItem, sendRightCheck, sendBehalfRightCheck, t]);

  const getSearchOwnerList = useCallback(
    (searchKeyword: string) => {
      searchGal(searchKeyword).then((data) => {
        const contactList = data?.cn;
        if (contactList) {
          let result: any[] = [];
          result = contactList.map((item: any): any => ({
            id: item?.id,
            name: item?._attrs?.email,
          }));
          setAllOwnerList(
            uniqBy(
              allOwnerList.concat(
                contactList.map((item: any) => ({
                  id: item?.id,
                  name: item?._attrs?.email,
                  type: item?._attrs?.type,
                })),
              ),
              'id',
            ),
          );
          setSearchOwnerResult(result);
        } else {
          setSearchOwnerResult([]);
        }
      });
    },
    [allOwnerList],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchOwnerCall = useCallback(
    debounce((mem) => {
      getSearchOwnerList(mem);
    }, 700),
    [debounce],
  );
  useEffect(() => {
    if (searchOwner !== '') {
      searchOwnerCall(searchOwner);
    }
  }, [searchOwner, searchOwnerCall]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchGrantEmail = useCallback(
    debounce((searchWord) => {
      searchEmailFromGal(searchWord);
    }, 700),
    [debounce],
  );

  useEffect(() => {
    if (grantEmailItem !== '') {
      searchGrantEmail(grantEmailItem);
    }
  }, [grantEmailItem, searchGrantEmail]);

  const onAddGrantEmail = useCallback(() => {
    if (grantEmailItem !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: any[] = specialChars.test(grantEmailItem)
        ? getAllEmailFromString(grantEmailItem)
        : [grantEmailItem];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: `${t('label.invalid_email_address', 'Invalid email address')} ${
              inValidEmailAddress[0]
            }`,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          setGrantEmailItem('');
          const sortedList = sortedUniq(allEmails);
          const emails = uniq(grantEmailsList.concat(sortedList));
          setGrantEmailsList(emails);
          setGrantEmails(emails);
          setIsDirty(true);
        }
      } else if (allEmails === undefined) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: `${t('label.invalid_email_address', 'Invalid email address')} ${grantEmailItem}`,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    }
  }, [grantEmailsList, createSnackbar, grantEmailItem, t]);

  useMemo(() => {
    if (grantEmailsList && grantEmailsList.length > 0) {
      const allRows = grantEmailsList.map((item: any) => ({
        id: item,
        columns: [
          <Text
            size="small"
            weight="regular"
            key={item}
            color="gray0"
            onClick={(): void => {
              setSelectedGrantEmail([item]);
            }}
          >
            {item}
          </Text>,
          <Button
            key={item + '_delete'}
            type="ghost"
            color={'text'}
            size="medium"
            icon="CloseOutline"
            style={{ position: 'inherit' }}
            aria-label={t('label.delete', 'Delete')}
            onClick={(): void => deleteSingleRow(item, 'grantEmail')}
          />,
        ],
      }));
      setGrantEmailTableRows(allRows);
    } else {
      setGrantEmailTableRows([]);
    }
  }, [grantEmailsList]);

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

  const ReusedDefaultTabBar: FC<{
    item: any;
    index: any;
    selected: any;
    onClick: any;
  }> = ({ item, index, selected, onClick }): ReactElement => (
    <DefaultTabBarItem
      item={item}
      tabIndex={index}
      selected={selected}
      onClick={onClick}
      orientation="horizontal"
      background="gray6"
      underlineColor="primary"
      forceWidthEquallyDistributed={false}
    >
      <Row padding="small">
        <Text size="small" color={selected ? 'primary' : 'gray'}>
          {item.label}
        </Text>
      </Row>
    </DefaultTabBarItem>
  );

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
      id: 'security',
      label: t('label.security', 'SECURITY'),
      CustomComponent: ReusedDefaultTabBar,
    },
    !selectedMailingList?.dynamic && {
      id: 'delegates',
      label: t('label.delegates', 'DELEGATES').toLocaleUpperCase(),
      CustomComponent: ReusedDefaultTabBar,
    },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value != '') {
      setFilterMember(value);
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const allRows = dlmTableRows.filter((item: any) =>
        item?.id.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredDlmTableRows(allRows);
      const pagedRows = allRows.slice(0, limit);
      setDLMPagedRows(pagedRows);
    } else {
      setFilterMember('');
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const pagedRows = dlmTableRows.slice(0, limit);
      setFilteredDlmTableRows([]);
      setDLMPagedRows(pagedRows);
    }
  };

  const handleInputChangeGrantEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value != '') {
      setFilterGrantEmail(value);
      const allRows = grantEmailTableRows.filter((item: any) =>
        item?.id.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredGrantEmailRows(allRows);
    } else {
      setFilterGrantEmail('');
      setFilteredGrantEmailRows(grantEmailTableRows);
    }
  };

  const handleInputChangeSendEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value != '') {
      setFilterSendEmail(value);
      const allRows = sendEmailTableRows.filter((item: any) =>
        item.id?.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSendEmailRows(allRows);
    } else {
      setFilterSendEmail('');
      setFilteredSendEmailRows(sendEmailTableRows);
    }
  };

  const deleteSingleRow = (itemName: string, type: string): void => {
    if (type === 'grantEmail') {
      const _grant = grantEmailsList.filter((item: any) => itemName !== item);
      const _grant_filtered = filteredGrantEmailRows.filter((item: any) => itemName !== item.id);
      setGrantEmailsList(_grant);
      setFilteredGrantEmailRows(_grant_filtered);
      setSelectedGrantEmail([]);
      setGrantEmails(_grant);
      setIsDirty(true);
    } else if (type === 'distListMember') {
      const _dlm = dlm.filter((item: any) => itemName !== item);
      const _dlm_filtered = filteredDlmTableRows.filter((item: any) => itemName !== item.id);
      setFilteredDlmTableRows(_dlm_filtered);
      setDlm(_dlm);
      setSelectedDistributionListMember([]);
      if (DLMPagedRows.length === 1) {
        setDLMSearchCurrentPage(1);
        setOffset(0);
        setFilterMember('');
      }
    } else if (type === 'owner') {
      const _ownerList = ownersList.filter((item: any) => itemName !== item.name);
      setOwnersList(_ownerList);
      setSelectedOwnerListMember([]);
    } else if (type === 'sendEmail') {
      const _sendList = sendEmailsList.filter((item: any) => itemName !== item.name);
      const _send_filtered = filteredSendEmailRows.filter((item: any) => itemName !== item.id);
      setFilteredSendEmailRows(_send_filtered);
      const sortedList = sortedUniq(_sendList);
      const emails = uniq(sortedList);
      setSendEmailsList(emails);
      setSendEmails(emails);
      setSelectedSendEmail([]);
    }
  };

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
                  icon="TrashOutline"
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
              setSelectedTab(selectedId);
            }}
            //onClick={setClick}
            width="100%"
            background="gray6"
          />
          <divider-wc color="gray2" />
        </Container>

        {selectedTab === 'general' && (
          <Container
            padding={{ left: 'large', right: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="calc(100vh - 3.6rem)"
            background="white"
            width={'58.75rem'}
            style={{ overflow: 'auto' }}
          >
            <Row padding={{ top: 'medium', bottom: 'medium' }}>
              <Text size="medium" weight="bold" color="gray0">
                {t('domain.list_details', 'List Details')}
              </Text>
            </Row>

            <ListRow padding={{ right: 'small', bottom: 'small' }}>
              <Container padding={{ top: 'small' }}>
                <Input
                  label={t('label.display_name', 'Display Name')}
                  value={displayName}
                  backgroundColor="gray5"
                  onChange={(e: any): any => {
                    setDisplayName(e.target.value);
                  }}
                />
              </Container>
              <Container padding={{ left: 'large', top: 'small' }}>
                <Input
                  label={t('label.address', 'Address')}
                  value={distributionName}
                  backgroundColor="gray5"
                  onChange={(e: any): any => {
                    setDistributionName(e.target.value);
                  }}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ right: 'small', top: 'small' }}>
                <Select
                  items={rightsOptions}
                  background="gray5"
                  label={t('label.status', 'Status')}
                  showCheckbox={false}
                  onChange={onRightsChange}
                  selection={zimbraMailStatus}
                />
              </Container>
            </ListRow>
            <Container
              height="fit"
              padding={{ left: 'small', top: 'large', right: 'small', bottom: 'small' }}
            >
              <ManageAliases
                listAliases={zimbraMailAlias}
                setListAliases={setZimbraMailAlias}
                setAliasChange={(): void => ((): any => true)()}
              />
            </Container>
            {!selectedMailingList?.dynamic && (
              <ListRow padding={{ all: 'small' }}>
                <Container
                  padding={{ top: 'small' }}
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                >
                  <Switch
                    value={zimbraDistributionListSendShareMessageToNewMembers}
                    label={t(
                      'label.send_new_members_notification_for_share_assigned_to_this_group',
                      'Send new members a notification for the share/delegation assigned to this group',
                    )}
                    onClick={(): void => {
                      setIsDirty(true);
                      setZimbraDistributionListSendShareMessageToNewMembers(
                        !zimbraDistributionListSendShareMessageToNewMembers,
                      );
                    }}
                    iconColor="primary"
                  />
                </Container>
              </ListRow>
            )}
            <ListRow padding={{ left: 'small', right: 'small', bottom: 'small' }}>
              <Container mainAlignment="flex-start" crossAlignment="flex-start">
                <Switch
                  value={zimbraHideInGal}
                  label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
                  onClick={(): void => {
                    setIsDirty(true);
                    setZimbraHideInGal(!zimbraHideInGal);
                  }}
                  iconColor="primary"
                />
              </Container>
            </ListRow>
            <ListRow padding={{ all: 'small' }}>
              <Container orientation="horizontal">
                <Container padding={{ right: 'large' }}>
                  <Input
                    label={t('label.members', 'Members')}
                    value={dlm.length}
                    backgroundColor="gray5"
                    disabled
                    textColor={'black'}
                  />
                </Container>
                <Container>
                  <Input
                    label={t('label.alias_in_the_list', 'Alias in the List')}
                    value={zimbraMailAlias.length}
                    backgroundColor="gray5"
                    textColor={'black'}
                    disabled
                  />
                </Container>
              </Container>
            </ListRow>

            <ListRow padding={{ all: 'small' }}>
              <Container padding={{ bottom: 'small' }} orientation="horizontal">
                <Container padding={{ right: 'large' }}>
                  <Input
                    label={t('label.id_lbl', 'ID')}
                    value={dlId}
                    backgroundColor="gray5"
                    disabled
                    textColor={'black'}
                  />
                </Container>
                <Container>
                  <Input
                    label={t('label.creation_date', 'Creation Date')}
                    value={dlCreateDate}
                    backgroundColor="gray5"
                    disabled
                    textColor={'black'}
                  />
                </Container>
              </Container>
            </ListRow>
            <Row padding={{ top: 'large' }}>
              <Text size="medium" weight="bold" color="gray0">
                {t('label.description', 'Description')}
              </Text>
            </Row>
            <ListRow padding={{ all: 'small' }}>
              <Container padding={{ bottom: 'medium' }}>
                <Input
                  value={description}
                  label={t(
                    'label.note_label',
                    'Write something that will easily make you remember this element',
                  )}
                  backgroundColor="gray5"
                  onChange={(e: any): any => {
                    setDescription(e.target.value);
                  }}
                />
              </Container>
            </ListRow>
            <Row padding={{ top: 'large' }}>
              <Text size="medium" weight="bold" color="gray0">
                {t('label.notes', 'Notes')}
              </Text>
            </Row>
            <ListRow padding={{ all: 'small' }}>
              <Container padding={{ bottom: 'medium' }}>
                <CustomTextArea
                  value={zimbraNotes}
                  label={t('label.notes', 'Notes')}
                  backgroundColor="gray5"
                  onChange={(e: any): any => {
                    setZimbraNotes(e.target.value);
                  }}
                />
              </Container>
            </ListRow>

            {!selectedMailingList?.dynamic && (
              <>
                <Row padding={{ top: 'small' }}>
                  <Text size="medium" weight="bold" color="gray0">
                    {t('label.this_list_included_in', 'This list is included in')}
                  </Text>
                </Row>
                <ListRow padding={{ all: 'small' }}>
                  <Container padding={{ bottom: 'small' }}>
                    <Input
                      label={t('label.distribution_lists', 'Distribution Lists')}
                      value={dlMembershipListNames}
                      backgroundColor="gray5"
                      textColor={'black'}
                    />
                  </Container>
                </ListRow>
              </>
            )}
            <Row
              mainAlignment="flex-start"
              width="100%"
              padding={{ top: 'small', bottom: 'small' }}
            >
              <Container padding={{ bottom: 'small' }}>
                <divider-wc />
              </Container>
            </Row>
          </Container>
        )}

        {selectedTab === 'members' && (
          <Container
            padding={{ left: 'large', right: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="calc(100vh - 3.6rem)"
            background="white"
            width={'58.75rem'}
            style={{ overflow: 'auto' }}
          >
            {selectedMailingList?.dynamic && (
              <>
                <Row padding={{ bottom: 'medium', top: 'medium' }}>
                  <Text size="medium" weight="bold" color="gray0">
                    {t('label.dynamic_mode', 'Dynamic Mode')}
                  </Text>
                </Row>
                <ListRow padding={{ all: 'small' }}>
                  <Container orientation="horizontal">
                    <Container>
                      <Input
                        label={t('label.distribution_list_url', "Distribution List's URL")}
                        value={memberURL}
                        backgroundColor="gray5"
                        onChange={(e: any): any => {
                          setMemberURL(e.target.value);
                        }}
                        disabled={!isGlobalAdmin}
                      />
                    </Container>
                  </Container>
                </ListRow>
                <divider-wc />
                <Row padding={{ bottom: 'medium', top: 'medium' }}>
                  <Text size="medium" weight="bold" color="gray0">
                    {t('label.members', 'Members')}
                  </Text>
                </Row>
              </>
            )}
            {!selectedMailingList?.dynamic && (
              <>
                <Row padding={{ bottom: 'medium', top: 'medium' }}>
                  <Text size="medium" weight="bold" color="gray0">
                    {t('label.members', 'Members')}
                  </Text>
                </Row>
                <ListRow
                  padding={{
                    top: 'small',
                    bottom: isShowMemberError ? 'extrasmall' : 'small',
                    left: 'small',
                    right: 'small',
                  }}
                >
                  <Container
                    orientation="vertical"
                    mainAlignment="space-around"
                    background="gray6"
                    height="58px"
                  >
                    <Row
                      orientation="horizontal"
                      mainAlignment="flex-start"
                      crossAlignment="flex-start"
                      width="100%"
                    >
                      <Row mainAlignment="flex-start" width="58%" crossAlignment="flex-start">
                        <DropDownInput
                          width="100%"
                          items={searchMemberItems}
                          inputLabel={t(
                            'label.type_accounts_paste_them_here',
                            'Type the Accounts or paste them here',
                          )}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                            setSearchMember(e.target.value);
                          }}
                          inputValue={searchMember}
                          isCustomIcon={false}
                          hasError={isShowMemberError}
                        />
                      </Row>

                      <Row width="42%" mainAlignment="flex-start" crossAlignment="flex-start">
                        <Padding left="large" right="large">
                          <Button
                            type="outlined"
                            key="add-button"
                            label={t('label.add', 'Add')}
                            color="primary"
                            iconPlacement="right"
                            onClick={onAdd}
                            size="extralarge"
                            disabled={searchMember === ''}
                          />
                        </Padding>
                      </Row>
                    </Row>
                  </Container>
                </ListRow>
                {isShowMemberError && (
                  <Row>
                    <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                      <Padding right={'0'}>
                        <Text size="extrasmall" weight="regular" color="error">
                          {memberErrorMessage}
                        </Text>
                      </Padding>
                    </Container>
                  </Row>
                )}
              </>
            )}
            <Row padding={{ all: 'small' }}>
              <Container mainAlignment="flex-start" padding={{ top: 'small', bottom: 'small' }}>
                <ListRow
                  padding={{
                    top: 'small',
                    bottom: isShowMemberError ? 'extrasmall' : 'small',
                    left: 'small',
                    right: 'small',
                  }}
                >
                  <Row width="auto" mainAlignment="flex-start" crossAlignment="flex-start">
                    {(dlmTableRows.length > 0 || filterMember !== '') && (
                      <>
                        <Input
                          label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                          value={filterMember}
                          backgroundColor="gray5"
                          onChange={handleInputChange}
                          CustomIcon={(): any => (
                            <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                          )}
                        />
                        <Container padding={{ bottom: 'small' }}>
                          <divider-wc />
                        </Container>
                      </>
                    )}
                    <Table
                      rows={DLMPagedRows}
                      headers={memberHeaders}
                      showCheckbox={false}
                      selectedRows={selectedDistributionListMember}
                      RowFactory={HoverableRowFactory}
                      HeaderFactory={CustomHeaderFactory}
                      onSelectionChange={(selectedRows) => {
                        setSelectedDistributionListMember(selectedRows);
                      }}
                    />
                    <Container
                      style={{
                        position: 'sticky',
                        bottom: '-4rem',
                      }}
                    >
                      <Container
                        orientation="horizontal"
                        mainAlignment="space-between"
                        background="gray6"
                        width="100%"
                        padding={{ right: 'extralarge' }}
                        height="auto"
                      >
                        <Container crossAlignment="flex-start">
                          <Paging
                            totalItem={
                              filterMember ? filteredDlmTableRows.length : dlmTableRows.length
                            }
                            setOffset={setOffset}
                            pageSize={limit}
                            currentPageProp={DLMCurrentPage}
                            onPageChange={setDLMSearchCurrentPage}
                          />
                        </Container>
                      </Container>
                    </Container>
                  </Row>
                </ListRow>
              </Container>
            </Row>
            {dlmTableRows.length === 0 && !selectedMailingList?.dynamic && filterMember !== '' && (
              <ListRow padding={{ all: 'small' }}>
                <Container
                  background="gray6"
                  height="fit-content"
                  mainAlignment="center"
                  crossAlignment="center"
                >
                  <Padding value="57px 0 0 0" width="100%">
                    <Row mainAlignment="center" width="100%">
                      <img src={helmetLogo} alt="logo" />
                    </Row>
                  </Padding>
                  <Padding vertical="extralarge" width="100%">
                    <Row mainAlignment="center" width="100%">
                      <Text size="large" color="secondary" weight="regular">
                        {t('label.there_are_not_member_here', 'There aren’t members here.')}
                      </Text>
                    </Row>
                    <Row mainAlignment="center" width="100%">
                      <Text size="large" color="secondary" weight="regular">
                        {searchUserLabelValue}
                      </Text>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
            )}
            <Row
              mainAlignment="flex-start"
              width="100%"
              padding={{ top: 'small', bottom: 'small' }}
            >
              <Container padding={{ bottom: 'small' }}>
                <divider-wc />
              </Container>
            </Row>
          </Container>
        )}

        {selectedTab === 'security' && (
          <Container
            padding={{ left: 'large', right: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="calc(100vh - 3.6rem)"
            background="white"
            width={'58.75rem'}
            style={{ overflow: 'auto' }}
          >
            <Row padding={{ bottom: 'medium', top: 'medium' }}>
              <Text weight="bold" color="gray0">
                {t('label.owners_settings_lbl', 'Owners’ Settings')}
              </Text>
            </Row>
            <ListRow padding={{ left: 'small', right: 'small' }}>
              <Text
                size="medium"
                color="secondary"
                style={{ whiteSpace: 'normal' }}
                overflow="break-word"
              >
                {t(
                  'label.owners_description_msg_1',
                  'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.',
                )}
              </Text>
            </ListRow>

            <ListRow padding={{ all: 'small' }}>
              <Container
                orientation="vertical"
                mainAlignment="space-around"
                background="gray6"
                height="58px"
              >
                <Row
                  orientation="horizontal"
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  width="100%"
                >
                  <Row mainAlignment="flex-start" width="66%" crossAlignment="flex-start">
                    <DropDownInput
                      width="100%"
                      items={searchOwnerList}
                      inputLabel={t(
                        'account_details.start_typing_account',
                        'Start typing an Account / Group to add it to the rights',
                      )}
                      size="medium"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                        setSearchOwner(e.target.value);
                      }}
                      inputValue={searchOwner}
                      isCustomIcon={false}
                      hasError={isShowOwnerError}
                    />
                  </Row>
                  <Row width="34%" mainAlignment="flex-start" crossAlignment="flex-start">
                    <Padding left="large" right="large">
                      <Button
                        type="outlined"
                        key="add-button"
                        label={t('label.add', 'Add')}
                        color="primary"
                        iconPlacement="right"
                        onClick={onAddOwner}
                        size="extralarge"
                        disabled={searchOwner === ''}
                      />
                    </Padding>
                  </Row>
                </Row>
              </Container>
              {isShowOwnerError && (
                <Row>
                  <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                    <Padding right={'0'}>
                      <Text size="extrasmall" weight="regular" color="error">
                        {ownerErrorMessage}
                      </Text>
                    </Padding>
                  </Container>
                </Row>
              )}
            </ListRow>

            <ListRow padding={{ all: 'small' }}>
              <Container
                padding={{
                  bottom: 'small',
                }}
                mainAlignment="flex-start"
              >
                <Table
                  rows={ownerTableRows}
                  headers={ownerHeaders}
                  showCheckbox={false}
                  selectedRows={selectedOwnerListMember}
                  RowFactory={HoverableRowFactory}
                  HeaderFactory={CustomHeaderFactory}
                />
              </Container>
            </ListRow>

            {ownerTableRows.length === 0 && (
              <ListRow padding={{ all: 'small' }}>
                <Container
                  background="gray6"
                  height="fit-content"
                  mainAlignment="center"
                  crossAlignment="center"
                >
                  <Padding value="57px 0 0 0" width="100%">
                    <Row mainAlignment="center" width="100%">
                      <img src={helmetLogo} alt="logo" />
                    </Row>
                  </Padding>
                  <Padding vertical="extralarge" width="100%">
                    <Row mainAlignment="center" width="100%">
                      <Text size="large" color="secondary" weight="regular">
                        {t('label.there_are_no_owners', 'There aren’t owners here.')}
                      </Text>
                    </Row>
                    <Row mainAlignment="center" width="100%">
                      <Text size="large" color="secondary" weight="regular">
                        {searchUserLabelValue}
                      </Text>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
            )}

            <Row
              mainAlignment="flex-start"
              width="100%"
              padding={{ top: 'small', bottom: 'small' }}
            >
              <Container padding={{ bottom: 'small' }}>
                <divider-wc />
              </Container>
            </Row>

            <Row padding={{ bottom: 'medium' }}>
              <Text weight="bold" color="gray0">
                {t('label.sending_options', 'Sending Options')}
              </Text>
            </Row>
            <ListRow padding={{ all: 'small' }}>
              <Container>
                <Select
                  items={grantTypeOptions}
                  background="gray5"
                  label={t(
                    'label.who_can_send_mails_to_this_list',
                    'Who can send mails TO this list?',
                  )}
                  showCheckbox={false}
                  onChange={onGrantTypeChange}
                  selection={grantType}
                />
              </Container>
            </ListRow>

            {grantType?.value === EMAIL && (
              <Container
                padding={{ left: 'large', right: 'large', bottom: 'large' }}
                height={'auto'}
              >
                <ListRow padding={{ all: 'small' }}>
                  <Container
                    orientation="vertical"
                    mainAlignment="space-around"
                    background="gray6"
                    height="58px"
                  >
                    <ListRow>
                      <Container
                        mainAlignment="flex-start"
                        crossAlignment="flex-start"
                        orientation="horizontal"
                        padding={{ top: 'large', right: 'small' }}
                        width="100%"
                      >
                        <Row mainAlignment="flex-start" width="66%" crossAlignment="flex-start">
                          <DropDownInput
                            items={grantItems}
                            inputLabel={t(
                              'account_details.start_typing_account',
                              'Start typing an Account / Group to add it to the rights',
                            )}
                            size="medium"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                              setGrantEmailItem(e.target.value);
                            }}
                            inputValue={grantEmailItem}
                            isCustomIcon={false}
                            inputDisabled={grantType?.value !== EMAIL}
                          />
                        </Row>
                        <Row width="34%" mainAlignment="flex-start" crossAlignment="flex-start">
                          <Padding left="large" right="large">
                            <Button
                              type="outlined"
                              key="add-button"
                              label={t('label.add', 'Add')}
                              color="primary"
                              iconPlacement="right"
                              onClick={onAddGrantEmail}
                              size="extralarge"
                              disabled={grantEmailItem === ''}
                            />
                          </Padding>
                        </Row>
                      </Container>
                    </ListRow>
                  </Container>
                </ListRow>

                <ListRow padding={{ all: 'small' }}>
                  <Container padding={{ bottom: 'large', top: 'large' }}>
                    {grantEmailTableRows.length > 0 && (
                      <>
                        <Input
                          label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                          value={filterGrantEmail}
                          backgroundColor="gray5"
                          onChange={handleInputChangeGrantEmail}
                          CustomIcon={(): any => (
                            <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                          )}
                        />
                        <Container padding={{ bottom: 'small' }}>
                          <divider-wc />
                        </Container>
                      </>
                    )}
                    <Table
                      rows={filterGrantEmail ? filteredGrantEmailRows : grantEmailTableRows}
                      headers={grantEmailHeaders}
                      showCheckbox={false}
                      selectedRows={selectedGrantEmail}
                      RowFactory={HoverableRowFactory}
                      HeaderFactory={CustomHeaderFactory}
                    />
                  </Container>
                </ListRow>

                {grantEmailTableRows.length === 0 && (
                  <ListRow padding={{ all: 'small' }}>
                    <Container
                      background="gray6"
                      height="fit-content"
                      mainAlignment="center"
                      crossAlignment="center"
                    >
                      <Padding value="57px 0 0 0" width="100%">
                        <Row mainAlignment="center" width="100%">
                          <img src={helmetLogo} alt="logo" />
                        </Row>
                      </Padding>
                      <Padding vertical="extralarge" width="100%">
                        <Row mainAlignment="center" width="100%">
                          <Text size="large" color="secondary" weight="regular">
                            {t('label.there_are_not_member_here', 'There aren’t members here.')}
                          </Text>
                        </Row>
                        <Row mainAlignment="center" width="100%">
                          <Text size="large" color="secondary" weight="regular">
                            {searchUserLabelValue}
                          </Text>
                        </Row>
                      </Padding>
                    </Container>
                  </ListRow>
                )}
              </Container>
            )}
          </Container>
        )}

        {selectedTab === 'delegates' && (
          <Container
            padding={{ left: 'large', right: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            height="calc(100vh - 3.6rem)"
            background="white"
            width={'58.75rem'}
            style={{ overflow: 'auto' }}
          >
            <Row padding={{ bottom: 'medium', top: 'medium' }}>
              <Text size="medium" color="gray0" weight="bold">
                {t(`label.delegate's_general_send_settings`, `Delegate's general Send Settings`)}
              </Text>
            </Row>
            <Container padding={{ left: 'large', right: 'large', bottom: 'large' }} height={'auto'}>
              <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
                <DropDownInput
                  items={sendItems}
                  inputLabel={t(
                    'account_details.start_typing_account',
                    'Start typing an Account / Group to add it to the rights',
                  )}
                  size="medium"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSendEmailItem(e.target.value);
                  }}
                  inputValue={sendEmailItem}
                  isCustomIcon={false}
                  inputDisabled={selectedMailingList?.dynamic}
                />
              </Row>
              <Container mainAlignment="flex-start">
                <Row width="100%" padding={{ top: 'extralarge' }} mainAlignment="flex-start">
                  <Text size="small" color="gray0" weight="bold">
                    {t('label.sending_options', 'Send options')}
                  </Text>
                </Row>
                <Row width="50%" padding={{ top: 'small' }} mainAlignment="flex-start">
                  <Row width="50%" mainAlignment="flex-start">
                    <Checkbox
                      iconColor="primary"
                      value={sendRightCheck}
                      onClick={(): void => {
                        if (!sendRightCheck) {
                          setSendBehalfRightCheck(false);
                        }
                        setSendRightCheck(!sendRightCheck);
                      }}
                      label={t('account_details.send_check', 'Send')}
                    />
                  </Row>
                  <Row width="50%" mainAlignment="flex-start">
                    <Checkbox
                      iconColor="primary"
                      value={sendBehalfRightCheck}
                      onClick={(): void => {
                        if (!sendBehalfRightCheck) {
                          setSendRightCheck(false);
                        }
                        setSendBehalfRightCheck(!sendBehalfRightCheck);
                      }}
                      label={t('account_details.send_on_behalf_of_check', 'Send on Behalf of')}
                    />
                  </Row>
                </Row>
              </Container>
              <Container mainAlignment="flex-start">
                <Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
                  <Button
                    label={t(
                      'account_details.add_the_account_group_with_selected_rights',
                      'ADD THE ACCOUNT / GROUP WITH SELECTED RIGHTS',
                    )}
                    onClick={(): void => onAddSendEmail()}
                    width="fill"
                    type="outlined"
                    disabled={!(sendRightCheck || sendBehalfRightCheck) || !sendEmailItem?.length}
                  />
                </Row>
              </Container>
              <Row width="100%" padding={{ top: 'medium' }}>
                <divider-wc color="gray2" />
              </Row>

              <ListRow padding={{ all: 'small' }}>
                <Container padding={{ bottom: 'large', top: 'large' }}>
                  {sendEmailTableRows.length > 0 && (
                    <ListRow>
                      <Row width="100%" mainAlignment="flex-start" padding={{ top: 'medium' }}>
                        <Input
                          label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                          value={filterSendEmail}
                          backgroundColor="gray5"
                          onChange={handleInputChangeSendEmail}
                          CustomIcon={(): any => (
                            <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                          )}
                        />
                        <Container padding={{ bottom: 'small' }}>
                          <divider-wc />
                        </Container>
                      </Row>
                    </ListRow>
                  )}
                  <Table
                    rows={filterSendEmail ? filteredSendEmailRows : sendEmailTableRows}
                    headers={sendEmailHeaders}
                    showCheckbox={false}
                    selectedRows={selectedSendEmail}
                    RowFactory={HoverableRowFactory}
                    HeaderFactory={CustomHeaderFactory}
                  />
                </Container>
              </ListRow>

              {sendEmailTableRows.length === 0 && (
                <ListRow padding={{ all: 'small' }}>
                  <Container
                    background="gray6"
                    height="fit-content"
                    mainAlignment="center"
                    crossAlignment="center"
                  >
                    <Padding value="57px 0 0 0" width="100%">
                      <Row mainAlignment="center" width="100%">
                        <img src={helmetLogo} alt="logo" />
                      </Row>
                    </Padding>
                    <Padding vertical="extralarge" width="100%">
                      <Row mainAlignment="center" width="100%">
                        <Text size="large" color="secondary" weight="regular">
                          {t('label.there_are_not_member_here', 'There aren’t members here.')}
                        </Text>
                      </Row>
                      <Row mainAlignment="center" width="100%">
                        <Text size="large" color="secondary" weight="regular">
                          {searchUserLabelValue}
                        </Text>
                      </Row>
                    </Padding>
                  </Container>
                </ListRow>
              )}
            </Container>
          </Container>
        )}

        <Modal
          title={
            <Trans
              i18nKey="label.would_you_like_to_add_ml"
              defaults="<bold>Who would you like to add to the Distribution List?</bold>"
              components={{ bold: <strong /> }}
            />
          }
          open={openAddMailingListDialog}
          showCloseIcon
          onClose={(): void => {
            setOpenAddMailingListDialog(false);
          }}
          size="medium"
          customFooter={
            <Container orientation="horizontal" mainAlignment="space-between">
              <Button
                label={t('label.help', 'Help')}
                type="outlined"
                color="primary"
                onClick={(): null => null}
              />
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Padding all="small">
                  <Button
                    label={t('label.go_back', 'Go Back')}
                    color="secondary"
                    size="medium"
                    onClick={(): void => {
                      setOpenAddMailingListDialog(false);
                    }}
                  />
                </Padding>
                <Button
                  label={t('label.add_to_the_list', 'Add to the list')}
                  color="primary"
                  onClick={onAddToList}
                  disabled={isRequstInProgress}
                />
              </Container>
            </Container>
          }
        >
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ all: 'medium' }}
          >
            <Text overflow="break-word" weight="regular">
              {t(
                'label.add_in_distribution_list_or_both',
                'You add another Distribution List or a User. Both of them can be a Owner of the list.',
              )}
            </Text>

            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="fill"
              padding={{ top: 'medium' }}
            >
              <Input
                value={searchMailingListOrUser}
                backgroundColor="gray5"
                onChange={(e: any): void => {
                  setSearchMailingListOrUser(e.target.value);
                }}
                hasError={isShowError}
                label={t('label.distribution_list_user', 'Distribution List / User')}
              />
            </Container>
            {isShowError && (
              <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                <Padding top="small">
                  <Text size="extrasmall" weight="regular" color="error">
                    {ownerErrorMessage}
                  </Text>
                </Padding>
              </Container>
            )}

            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'small' }}
            >
              <Switch
                value={isAddToOwnerList}
                label={t(
                  'label.this_account_owner_of_the_list',
                  'this account will be a Owner of the list',
                )}
                onClick={(): void => {
                  setIsAddToOwnerList(!isAddToOwnerList);
                }}
                disabled={selectedMailingList?.dynamic}
                iconColor="primary"
              />
            </Container>
          </Container>
        </Modal>
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

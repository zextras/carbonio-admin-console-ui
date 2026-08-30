/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  DropDownInput,
  HoverableRowFactory,
  Input,
  ListRow,
  Padding,
  Row,
  Table,
  type TRow,
  useSnackbar,
} from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import { ChangeEvent, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { RECORD_DISPLAY_LIMIT } from '../../../constants';
import { generateSnackbarFromError } from '../../../utils/generate-snackbar-error';
import { isValidEmail } from '../../utility/utils';

type SendInviteItem = { id: string; n: string; _content: string };

type SendInviteAccountsProps = {
  isEditable: boolean;
  sendInviteList: Array<SendInviteItem>;
  setSendInviteList: (list: Array<SendInviteItem>) => void;
  hideSearchBar?: boolean;
  hideHeaderBar?: boolean;
};

const SearchFunnelIcon = (): ReactElement => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

export const SendInviteAccounts = ({
  isEditable,
  sendInviteList,
  setSendInviteList,
  hideSearchBar,
  hideHeaderBar,
}: SendInviteAccountsProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [newSentInviteValue, setNewSentInviteValue] = useState<string>('');
  const [selectedSendInvite, setSelectedSendInvite] = useState<Array<string>>([]);
  const [sendInviteAddBtnDisabled, setSendInviteAddBtnDisabled] = useState(true);
  const [sendInviteDeleteBtnDisabled, setSendInviteDeleteBtnDisabled] = useState(true);
  const [searchAccountName, setSearchAccountName] = useState<string>('');
  const [searchMemberResult, setSearchMemberResult] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  const sendInviteHeaders = [
    { id: 'account', label: t('label.accounts', 'Accounts'), width: '100%', bold: true },
  ];

  const filteredInviteList = searchAccountName
    ? sendInviteList.filter((item) => item._content?.includes(searchAccountName))
    : sendInviteList;

  const sendInviteRows: Array<TRow> = filteredInviteList.map((item) => ({
    id: item.id,
    columns: [
      <ds-text as="span" size="medium" weight="light" key={item.id} color="gray0">
        {item._content}
      </ds-text>,
    ],
    clickable: true,
  }));

  function addSendInviteAccount(): void {
    if (newSentInviteValue) {
      const lastId = sendInviteList.length > 0 ? sendInviteList.at(-1)!.id : '0';
      const newId = (Number.parseInt(lastId, 10) + 1).toString();
      const item: SendInviteItem = {
        id: newId,
        n: 'zimbraPrefCalendarForwardInvitesTo',
        _content: newSentInviteValue,
      };
      setSendInviteList([...sendInviteList, item]);
      setSendInviteAddBtnDisabled(true);
      setNewSentInviteValue('');
    }
  }

  function deleteSendInviteAccount(): void {
    if (selectedSendInvite.length > 0) {
      const selectedIds = new Set(selectedSendInvite);
      setSendInviteList(sendInviteList.filter((item) => !selectedIds.has(item.id)));
      setSendInviteDeleteBtnDisabled(true);
      setSelectedSendInvite([]);
    }
  }

  function getSearchMemberList(mem: string): void {
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
    const types = 'accounts,distributionlists,aliases';
    const query = `(&(!(zimbraAccountStatus=closed))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)(uid=*${mem}*)(zimbraDomainName=*${mem}*)(uid=*${mem}*)))`;

    searchDirectory({
      attr: attrs,
      type: types,
      domainName: '',
      query,
      offset: 0,
      limit: RECORD_DISPLAY_LIMIT,
      sortBy: 'name',
    })
      .then(
        (data: {
          dl?: Array<{ id: string; name: string }>;
          account?: Array<{ id: string; name: string }>;
          alias?: Array<{ id: string; name: string }>;
        }) => {
          const result: Array<{ id: string; name: string }> = [
            ...(data?.dl ?? []),
            ...(data?.account ?? []),
            ...(data?.alias ?? []),
          ];
          setSearchMemberResult(result);
        },
      )
      .catch((error: Error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }

  const searchMemberCall = debounce((mem: string) => {
    if (mem !== '') {
      getSearchMemberList(mem);
    }
  }, 700);

  const searchMemberItems = searchMemberResult.map((item) => ({
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
        onClick={() => {
          setNewSentInviteValue(item.name);
          setSendInviteAddBtnDisabled(!isValidEmail(item.name));
        }}
      >
        {item.name}
      </Row>
    ),
  }));

  return (
    <>
      {!hideHeaderBar && (
        <Row padding={{ top: 'extralarge' }}>
          <ds-text as="h3" size="small" weight="bold">
            {t('label.send_invite_to', 'Send Invite To')}
          </ds-text>
        </Row>
      )}
      {isEditable && (
        <ListRow>
          <Row
            mainAlignment="flex-start"
            crossAlignment="center"
            orientation="horizontal"
            background="white"
            width="100%"
            padding={{ top: 'large' }}
          >
            <Row mainAlignment="flex-start" style={{ width: '60%' }}>
              <DropDownInput
                maxWidth="19rem"
                width="19rem"
                items={searchMemberItems}
                inputLabel={t('label.enter_email_address', 'Enter E-mail address')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNewSentInviteValue(e.target.value);
                  setSendInviteAddBtnDisabled(!isValidEmail(e.target.value));
                  searchMemberCall(e.target.value);
                }}
                inputValue={newSentInviteValue}
                isCustomIcon={false}
              />
            </Row>
            <Row
              orientation="horizontal"
              mainAlignment="flex-end"
              crossAlignment="flex-end"
              width="40%"
            >
              <Padding left="large">
                <Button
                  type="outlined"
                  label={t('label.add', 'Add')}
                  icon="Plus"
                  color="primary"
                  size="large"
                  disabled={sendInviteAddBtnDisabled}
                  onClick={addSendInviteAccount}
                />
              </Padding>
              <Padding left="large">
                <Button
                  type="outlined"
                  label={t('label.delete', 'Delete')}
                  icon="Trash2Outline"
                  color="error"
                  size="large"
                  disabled={sendInviteDeleteBtnDisabled}
                  onClick={deleteSendInviteAccount}
                />
              </Padding>
            </Row>
          </Row>
        </ListRow>
      )}
      {!hideSearchBar && (
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Row width="100%">
              <Input
                disabled={sendInviteList.length === 0 && searchAccountName.length === 0}
                label={t('label.search_an_account', 'Search for an account')}
                backgroundColor="gray5"
                value={searchAccountName}
                CustomIcon={SearchFunnelIcon}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearchAccountName(e.target.value);
                }}
              />
            </Row>
          </Container>
        </ListRow>
      )}
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large' }}
        >
          <Table
            rows={sendInviteRows}
            headers={sendInviteHeaders}
            showCheckbox={!!isEditable}
            style={{ overflow: 'auto', height: '100%' }}
            selectedRows={selectedSendInvite}
            onSelectionChange={(selected: Array<string>) => {
              setSelectedSendInvite(selected);
              setSendInviteDeleteBtnDisabled(!selected || selected.length === 0);
            }}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {sendInviteRows.length === 0 && (
        <ListRow>
          <Container
            orientation="column"
            crossAlignment="center"
            mainAlignment="center"
            padding={{ top: 'extralarge' }}
          >
            <Row>
              <img src={logo} alt="logo" />
            </Row>
            <Row
              padding={{ top: 'extralarge' }}
              orientation="vertical"
              crossAlignment="center"
              style={{ textAlign: 'center' }}
            >
              <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                {t('label.this_list_is_empty', 'This list is empty.')}
              </ds-text>
            </Row>
          </Container>
        </ListRow>
      )}
    </>
  );
};

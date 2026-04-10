/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  CustomTextArea,
  HoverableRowFactory,
  Input,
  ListRow,
  Padding,
  Paging,
  Row,
  Switch,
  Table,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LDAP, LDAP_QUERY, TRUE } from '../../../../constants';
import { searchDirectory } from '../../../../services/search-directory-service';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { isValidLdapQuery } from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';

const LIMIT = 15;

const MailingListSection: FC<any> = () => {
  const { t } = useTranslation();
  const context = useContext(MailingListContext);
  const createSnackbar = useSnackbar();
  const [isValidQuery, setIsValidQuery] = useState<boolean>(true);
  const { mailingListDetail, setMailingListDetail } = context;
  const [dynamicListMember, setDynamicListMember] = useState<Array<any>>(
    mailingListDetail?.ldapQueryMembers,
  );
  const [dynamicListMemberRows, setDynamicListMemberRows] = useState<Array<any>>([]);
  const [isShowLdapQueryMessage, setIsShowLdapQueryMessage] = useState<boolean>(false);
  const [ldapQueryErrorMessage, setLdapQueryErrorMessage] = useState<string | null>('');

  const userSetting = useUserSettings();
  const [isDelegatedAdmin, setIsDelegatedAdmin] = useState<boolean>(false);
  useEffect(() => {
    if (userSetting?.attrs) {
      const account = userSetting?.attrs?.zimbraIsDelegatedAdminAccount;
      if (account && account === TRUE) {
        setIsDelegatedAdmin(true);
      }
    }
  }, [userSetting?.attrs]);

  // dist list members offset
  const [offset, setOffset] = useState<number>(0);
  const [DLMCurrentPage, setDLMSearchCurrentPage] = useState(1);
  const [DLMPagedRows, setDLMPagedRows] = useState<any>([]);

  // filtering
  const [filterMember, setFilterMember] = useState<string>('');
  const [filteredDlmTableRows, setFilteredDlmTableRows] = useState<any>([]);

  const setValueByName = useCallback(
    (name: string, value: any) => {
      setMailingListDetail((prev: any) => ({ ...prev, [name]: value }));
    },
    [setMailingListDetail],
  );

  const changeLdapDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      let isValid = false;
      if (newValue.startsWith(LDAP)) {
        setValueByName(e.target.name, newValue);
        isValid = isValidLdapQuery(newValue);
      } else {
        setValueByName(e.target.name, LDAP);
      }
      setIsValidQuery(isValid);
      setIsShowLdapQueryMessage(!isValid);
    },
    [setValueByName],
  );
  const changeResourceDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValueByName(e.target.name, e.target.value);
    },
    [setValueByName],
  );

  const memberHeaders: any[] = useMemo(
    () => [
      {
        id: 'members',
        label: t('label.accounts', 'Accounts'),
        width: '100%',
        bold: true,
      },
    ],
    [t],
  );

  const getMemberFromLdapQuery = useCallback(() => {
    const query = mailingListDetail?.memberURL.replace('ldap:///??sub?', '');
    searchDirectory(
      'cn,description,name,zimbraId',
      'accounts,distributionlists,dynamicgroups,accounts,aliases,dynamicgroups,resources',
      '',
      query,
    )
      .then((data) => {
        const allList: any[] = [];
        const account = data?.account;
        const dl = data?.dl;
        const alias = data?.alias;
        const calresource = data?.calresource;
        const errorFault = data?.Body?.Fault;
        if (errorFault) {
          setIsShowLdapQueryMessage(true);
          setLdapQueryErrorMessage(t('label.query_is_not_valid', 'Query is not valid'));
        } else {
          setIsShowLdapQueryMessage(false);
          setLdapQueryErrorMessage('');
        }
        if (dl) {
          dl.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
        }
        if (account) {
          account.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
        }
        if (alias) {
          alias.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
        }
        if (calresource) {
          calresource.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
        }
        if (allList && allList.length > 0) {
          setDynamicListMember(allList);
        } else {
          setDynamicListMember([]);
        }
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }, [createSnackbar, mailingListDetail?.memberURL, t]);

  useEffect(() => {
    if (dynamicListMember && dynamicListMember.length > 0) {
      if (!filterMember) {
        const searchDlRows = dynamicListMember.map((item: any) => ({
          id: item?.name,
          columns: [
            <Text size="medium" weight="light" key={item?.id} color="#828282">
              {item?.name}
            </Text>,
            '',
          ],
        }));
        const pagedRows = searchDlRows.slice(offset, offset + LIMIT);
        setDynamicListMemberRows(searchDlRows);
        setDLMPagedRows(pagedRows);
        setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: dynamicListMember }));
      } else {
        const allRows = dynamicListMember.filter((item: any) =>
          item?.name.toLowerCase().includes(filterMember.toLowerCase()),
        );
        const searchDlRows = allRows.map((item: any) => ({
          id: item?.name,
          columns: [
            <Text size="medium" weight="light" key={item?.id} color="#828282">
              {item?.name}
            </Text>,
            '',
          ],
        }));
        const pagedRows = searchDlRows.slice(offset, offset + LIMIT);
        setDLMPagedRows(pagedRows);
      }
    } else {
      setDynamicListMemberRows([]);
      setDLMPagedRows([]);
      setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: [] }));
    }
  }, [dynamicListMember, offset]);

  const handleInputChangeMember = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value != '') {
      setFilterMember(value);
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const allRows = dynamicListMemberRows.filter((item: any) =>
        item?.id.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredDlmTableRows(allRows);
      const pagedRows = allRows.slice(0, LIMIT);
      setDLMPagedRows(pagedRows);
    } else {
      setFilterMember('');
      setDLMSearchCurrentPage(1);
      setOffset(0);
      const pagedRows = dynamicListMemberRows.slice(0, LIMIT);
      setFilteredDlmTableRows([]);
      setDLMPagedRows(pagedRows);
    }
  };

  return (
    <Container mainAlignment="flex-start">
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 13rem)"
        background="white"
        style={{ overflow: 'auto', padding: '16px' }}
      >
        <Row>
          <Text size="small" weight="bold">
            {t('label.distribution_list_name', 'Distribution List Name')}
          </Text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large' }}
          >
            <Input
              label={t('label.display_name', 'Display Name')}
              backgroundColor="gray5"
              value={mailingListDetail?.displayName}
              inputName="displayName"
              onChange={changeResourceDetail}
            />
          </Container>
        </ListRow>

        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <Input
              label={t('label.list_name', 'List Name')}
              backgroundColor="gray5"
              value={mailingListDetail?.prefixName}
              inputName="prefixName"
              onChange={changeResourceDetail}
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="center"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
            width="fit"
          >
            <icon-wc icon="AtOutline" size="large"></icon-wc>
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', left: 'small' }}
          >
            <Input
              label={t('domain.type_here_a_domain', 'Type here a domain')}
              value={mailingListDetail?.suffixName}
              backgroundColor="gray5"
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'small', bottom: 'medium' }}
          >
            <Input
              label={t('label.description', 'Description')}
              backgroundColor="gray5"
              value={mailingListDetail?.description}
              inputName="description"
              onChange={changeResourceDetail}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'small', bottom: 'medium' }}
          >
            <CustomTextArea
              label={t('label.notes', 'Notes')}
              backgroundColor="gray5"
              value={mailingListDetail?.zimbraNotes}
              inputName="zimbraNotes"
              onChange={changeResourceDetail}
            />
          </Container>
        </ListRow>
        {!isDelegatedAdmin && (
          <>
            <Row
              mainAlignment="flex-start"
              width="100%"
              padding={{ top: 'small', bottom: 'small' }}
            >
              <Container padding={{ bottom: 'small' }}>
                <ds-divider />
              </Container>
            </Row>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'medium', bottom: 'medium' }}
              >
                <Switch
                  value={mailingListDetail?.dynamic}
                  label={t('label.dynamic_mode', 'Dynamic Mode')}
                  onClick={(): void => {
                    setMailingListDetail((prev: any) => ({
                      ...prev,
                      dynamic: !mailingListDetail?.dynamic,
                    }));
                  }}
                  iconColor="primary"
                />
              </Container>
            </ListRow>
          </>
        )}
        {mailingListDetail?.dynamic && (
          <>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'small', bottom: 'medium' }}
              >
                <Input
                  label={t('label.distribution_list_url', "Distribution List's URL")}
                  backgroundColor="gray5"
                  value={mailingListDetail?.memberURL}
                  inputName="memberURL"
                  onChange={changeLdapDetail}
                  hasError={!isValidQuery}
                  CustomIcon={(): any => (
                    <icon-wc
                      icon="CheckmarkOutline"
                      size="large"
                      color="grey"
                      onClick={getMemberFromLdapQuery}
                      style={{ cursor: 'pointer' }}
                    ></icon-wc>
                  )}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Text size="small" weight="regular" color="gray1">
                {`${t('label.example_lbl', 'Example:')} ${LDAP_QUERY}`}
              </Text>
            </ListRow>
            {isShowLdapQueryMessage && (
              <Row>
                <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                  <Padding all={'0'}>
                    <Text size="extrasmall" weight="regular" color="error">
                      {ldapQueryErrorMessage}
                    </Text>
                  </Padding>
                </Container>
              </Row>
            )}
          </>
        )}
        {mailingListDetail?.dynamic && (
          <>
            <Row padding={{ top: 'large' }}>
              <Text size="small" weight="bold">
                {t('label.members', 'Members')}
              </Text>
            </Row>
            <ListRow padding={{ all: 'small' }}>
              <Container padding={{ bottom: 'large', top: 'large' }}>
                {dynamicListMemberRows.length > 0 && (
                  <>
                    <Input
                      label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
                      value={filterMember}
                      backgroundColor="gray5"
                      onChange={handleInputChangeMember}
                      CustomIcon={(): any => (
                        <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                      )}
                    />
                    <Container padding={{ bottom: 'small' }}>
                      <ds-divider />
                    </Container>
                  </>
                )}
                <Table
                  rows={DLMPagedRows}
                  headers={memberHeaders}
                  showCheckbox={false}
                  RowFactory={HoverableRowFactory}
                  HeaderFactory={CustomHeaderFactory}
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
                          filterMember ? filteredDlmTableRows.length : dynamicListMemberRows.length
                        }
                        setOffset={setOffset}
                        pageSize={LIMIT}
                        currentPageProp={DLMCurrentPage}
                        onPageChange={setDLMSearchCurrentPage}
                      />
                    </Container>
                  </Container>
                </Container>
              </Container>
            </ListRow>
          </>
        )}
      </Container>
    </Container>
  );
};

export default MailingListSection;

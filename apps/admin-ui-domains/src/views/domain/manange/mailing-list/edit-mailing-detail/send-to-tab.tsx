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
  Select,
  Table,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { sortedUniq, uniq } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { EMAIL } from '../../../../../constants';
import { searchGal } from '../../../../../services/search-gal-service';
import { getAllEmailFromString, isValidEmail } from '../../../../utility/utils';
import { useSearchWithDebounce } from './hooks/use-search-with-debounce';
import { useTableFilter } from './hooks/use-table-filter';

type SendToTabProps = {
  selectedMailingList: any;
  grantTypeOptions: Array<any>;
  grantType: any;
  onGrantTypeChange: (v: any) => void;
  grantEmailsList: Array<any>;
  setGrantEmailsList: (v: Array<any>) => void;
  grantEmails: Array<any>;
  setGrantEmails: (v: Array<any>) => void;
  setIsDirty: (v: boolean) => void;
  searchUserLabelValue: string;
  isShowSenderToError: boolean;
  setIsShowSenderToError: (v: boolean) => void;
};

export const SendToTab: FC<SendToTabProps> = ({
  selectedMailingList,
  grantTypeOptions,
  grantType,
  onGrantTypeChange,
  grantEmailsList,
  setGrantEmailsList,
  grantEmails,
  setGrantEmails,
  setIsDirty,
  searchUserLabelValue,
  isShowSenderToError,
  setIsShowSenderToError,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [grantEmailItem, setGrantEmailItem] = useState('');
  const [searchGrantEmailResult, setSearchGrantEmailResult] = useState<Array<any>>([]);
  const [grantEmailTableRows, setGrantEmailTableRows] = useState<Array<any>>([]);
  const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);

  const {
    filterValue: filterGrantEmail,
    filteredRows: filteredGrantEmailRows,
    handleFilterChange: handleInputChangeGrantEmail,
  } = useTableFilter(grantEmailTableRows);

  const grantEmailHeaders: Array<any> = useMemo(
    () => [
      {
        id: 'grantEmail',
        label: t('domain.distributionList.sendTo.account', 'Account'),
        width: '80%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '20%',
        bold: true,
      },
    ],
    [t],
  );

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

  const searchEmailFromGal = useCallback((searchKeyword: string) => {
    searchGal(searchKeyword).then((data) => {
      const contactList = data?.cn;
      if (contactList) {
        let result: Array<any> = [];
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

  useSearchWithDebounce(grantEmailItem, searchEmailFromGal);

  const onAddGrantEmail = useCallback(() => {
    if (grantEmailItem !== '') {
      const specialChars = /[ `'"<>,;]/;
      const allEmails: Array<any> = specialChars.test(grantEmailItem)
        ? getAllEmailFromString(grantEmailItem)
        : [grantEmailItem];
      if (allEmails !== null && allEmails !== undefined) {
        const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
        if (inValidEmailAddress && inValidEmailAddress.length > 0) {
          setIsShowSenderToError(true);
        } else {
          setGrantEmailItem('');
          setIsShowSenderToError(false);
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
  }, [grantEmailsList, createSnackbar, grantEmailItem, t, setGrantEmailsList, setGrantEmails, setIsDirty, setIsShowSenderToError]);

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
            color={'error'}
            size="medium"
            icon="Trash2Outline"
            style={{ position: 'inherit' }}
            aria-label={t('label.delete', 'Delete')}
            onClick={(): void => {
              const updated = grantEmailsList.filter((g: any) => item !== g);
              setGrantEmailsList(updated);
              setGrantEmails(updated);
              setSelectedGrantEmail([]);
              setIsDirty(true);
            }}
          />,
        ],
      }));
      setGrantEmailTableRows(allRows);
    } else {
      setGrantEmailTableRows([]);
    }
  }, [grantEmailsList]);

  return (
    <Container
      padding={{ left: 'large', right: 'large' }}
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 3.6rem)"
      background="white"
      width={'58.75rem'}
      style={{ overflow: 'auto' }}
    >
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        orientation="vertical"
        padding={{ bottom: 'medium', top: 'medium' }}
      >
        <Text size="medium" color="gray0" weight="bold">
          {t(`domain.distributionList.managePermission`, `Manage permissions`)}
        </Text>
        <Text
          size="small"
          color="secondary"
          style={{ marginTop: '0.5rem' }}
          overflow="break-word"
        >
          {t(
            'domain.distributionList.sendTo.managePermissionDescriptionMsg',
            'Control who can send emails to this distribution list',
          )}
        </Text>
      </Row>

      <ListRow>
        <Container>
          <Select
            items={grantTypeOptions}
            background="gray5"
            label={t(
              'domain.distributionList.sendTo.acceptMessageFrom',
              'Accept message from',
            )}
            showCheckbox={false}
            onChange={onGrantTypeChange}
            selection={grantType}
          />
        </Container>
      </ListRow>

      {grantType?.value === EMAIL && (
        <Container padding={{ bottom: 'large' }} height={'auto'}>
          <ListRow>
            <Container orientation="vertical" mainAlignment="flex-start" background="gray6">
              <Row
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                width="100%"
                padding={{ top: 'large' }}
              >
                <DropDownInput
                  items={grantItems}
                  inputLabel={t(
                    'domain.distributionList.sendTo.addSendersByEmail',
                    'Add senders by email address',
                  )}
                  size="medium"
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    setGrantEmailItem(e.target.value);
                  }}
                  inputValue={grantEmailItem}
                  isCustomIcon={false}
                  inputDisabled={grantType?.value !== EMAIL}
                  width="100%"
                />
              </Row>
              {isShowSenderToError && (
                <Row
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  width="100%"
                  padding={{ top: 'small' }}
                >
                  <Container
                    mainAlignment="flex-start"
                    crossAlignment="flex-start"
                    width="fill"
                  >
                    <Padding right={'0'}>
                      <Text size="extrasmall" weight="regular" color="error">
                        {t(
                          'domain.distributionList.sendTo.invalidAccountErrorMessage',
                          'The Sender email does not exist or is invalid. Please check it and try again.',
                        )}
                      </Text>
                    </Padding>
                  </Container>
                </Row>
              )}
              <Row
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                width="100%"
                padding={{ top: 'large', bottom: 'large' }}
              >
                <Button
                  icon="Plus"
                  label={t('domain.distributionList.sendAs.addAccount', 'ADD ACCOUNT')}
                  color="primary"
                  iconPlacement="left"
                  onClick={onAddGrantEmail}
                  size="medium"
                  disabled={grantEmailItem === ''}
                />
              </Row>
            </Container>
          </ListRow>
          <Row width="100%">
            <divider-wc color="gray2" />
          </Row>
          <ListRow>
            <Container padding={{ bottom: 'large', top: 'large' }}>
              <Row
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ bottom: 'large' }}
                width="100%"
              >
                <Text weight="bold" color="gray0">
                  {t(
                    'domain.distributionList.sendTo.authorizedSenders',
                    'Authorized senders to this distribution list',
                  )}
                </Text>
              </Row>
              {grantEmailTableRows.length > 0 && (
                <ListRow>
                  <Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
                    <Input
                      label={t(
                        'domain.distributionList.sendTo.searchSenders',
                        'Search senders',
                      )}
                      value={filterGrantEmail}
                      backgroundColor="gray5"
                      onChange={handleInputChangeGrantEmail}
                      CustomIcon={(): any => (
                        <icon-wc icon="FunnelOutline" size="large" color="primary"></icon-wc>
                      )}
                    />
                  </Row>
                </ListRow>
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
                      {t('label.there_are_not_member_here', "There aren't members here.")}
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
  );
};

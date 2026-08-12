/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DropDownInput,
  ListItems,
  type ListItemType,
  ListPanelItem,
  Padding,
  Row,
} from '@zextras/ui-components';
import {
  getRights,
  replaceHistory,
  useCurrentUserRights,
  useMailstoreServers,
  useModuleLicenseInfo,
  useRelativePathname,
} from '@zextras/ui-shared';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import type { MailstoreServer } from '../../../types';
import {
  ADVANCED_LBL,
  BACKUP_BASIC,
  CONFIGURATION_BACKUP,
  IMPORT_EXTERNAL_BACKUP,
  IS_DEFAULT_SETTINGS_EXPANDED,
  IS_SERVER_SPECIFICS_EXPANDED,
  LIST_SERVER,
  SERVER,
  SERVER_CONFIG,
  SERVERS_LIST,
} from '../../constants';
import { SECTION_ROUTES } from './backup-section-routes';

export const BackupListPanel = () => {
  const [t] = useTranslation();
  const relativePathname = useRelativePathname();
  const serverMatch = matchPath('/:server/:operation', relativePathname);
  const opMatch = serverMatch ? null : matchPath('/:operation', relativePathname);
  const selectedOperationItem =
    serverMatch?.params.operation ?? opMatch?.params.operation ?? SERVERS_LIST;
  const selectedServer = serverMatch?.params.server ?? '';
  const isServerSelect = !!serverMatch;
  const [isDefaultSettingsExpanded, setIsDefaultSettingsExpanded] = useState(
    () => localStorage.getItem(IS_DEFAULT_SETTINGS_EXPANDED) !== 'false',
  );
  const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState(
    () => localStorage.getItem(IS_SERVER_SPECIFICS_EXPANDED) !== 'false',
  );
  const { data: serverList = [], isError, isLoading } = useMailstoreServers();
  const [searchServer, setSearchServer] = useState<string>(selectedServer);
  const { moduleLicenseInfo } = useModuleLicenseInfo();
  const licenseFeatures = moduleLicenseInfo?.features ?? [];
  const isBackupModuleLicensed = licenseFeatures.some(
    (f: Record<string, string | number | boolean>) => f?.name === BACKUP_BASIC && f?.enabled,
  );
  const { data: rights } = useCurrentUserRights();
  const serverRights = rights && rights.length > 0 ? getRights(rights, SERVER) : [];
  const hasListServerRights = serverRights.some(
    (item: Record<string, string>) => item?.n === LIST_SERVER,
  );

  const filteredServers = (isError || isLoading)
    ? []
    : serverList.filter((item) => item.name?.includes(searchServer));

  const serverNames: Array<ListItemType> = filteredServers.map((serverItem) => ({
    id: serverItem?.id ?? '',
    name: serverItem?.name ?? '',
    isSelected: false,
    label: serverItem?.name ?? '',
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '0.18rem',
          width: 'inherit',
        }}
        onClick={(): void => {
          const serverName = serverItem?.name ?? '';
          setSearchServer(serverName);
          replaceHistory(`/${serverName}/${CONFIGURATION_BACKUP}`);
        }}
      >
        {serverItem?.name}
      </Row>
    ),
  }));

  const isShowError = serverList.length > 0 && filteredServers.length === 0;

  const defaultSettingsOptions = SECTION_ROUTES.filter(
    (route) => !route.prefix && route.id !== IMPORT_EXTERNAL_BACKUP,
  ).map(({ id, labelKey, labelDefault }) => ({
    id,
    name: t(labelKey, labelDefault),
    isSelected: !!isBackupModuleLicensed,
  }));

  const defaultOptions = hasListServerRights
    ? defaultSettingsOptions
    : defaultSettingsOptions.filter((item) => item?.id !== SERVERS_LIST);

  const serverSettingsOptions = SECTION_ROUTES.filter((route) => route.prefix === ':server').map(
    ({ id, labelKey, labelDefault }) => ({
      id,
      name: t(labelKey, labelDefault),
      isSelected: isBackupModuleLicensed ? isServerSelect : false,
    }),
  );

  const handleSelectOperationItem = (id: string): void => {
    if (id === CONFIGURATION_BACKUP || id === ADVANCED_LBL) {
      replaceHistory(`/${selectedServer}/${id}`);
    } else {
      replaceHistory(`/${id}`);
    }
  };

  const toggleDefaultSettingsView = (): void => {
    if (isDefaultSettingsExpanded) {
      setIsDefaultSettingsExpanded(false);
      localStorage.setItem(IS_DEFAULT_SETTINGS_EXPANDED, 'false');
    } else {
      setIsDefaultSettingsExpanded(true);
      localStorage.removeItem(IS_DEFAULT_SETTINGS_EXPANDED);
    }
  };

  const toggleServerSpecific = (): void => {
    if (isServerSpecificsExpanded) {
      setIsServerSpecificsExpanded(false);
      localStorage.setItem(IS_SERVER_SPECIFICS_EXPANDED, 'false');
    } else {
      setIsServerSpecificsExpanded(true);
      localStorage.removeItem(IS_SERVER_SPECIFICS_EXPANDED);
    }
    setIsServerSpecificsExpanded(!isServerSpecificsExpanded);
  };

  const customIconDetail = {
    icon: searchServer === '' ? ('HardDriveOutline' as const) : ('CloseOutline' as const),
    onClick: (): void => {
      if (searchServer !== '') {
        setSearchServer('');
        replaceHistory(`/${SERVER_CONFIG}`);
      }
    },
  };

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
    >
      <ListPanelItem
        title={t('label.global_server_settings', 'Global Server Settings')}
        isListExpanded={isDefaultSettingsExpanded}
        setToggleView={toggleDefaultSettingsView}
      />
      {isDefaultSettingsExpanded && (
        <ListItems
          items={defaultOptions}
          selectedOperationItem={selectedOperationItem}
          setSelectedOperationItem={handleSelectOperationItem}
        />
      )}

      {hasListServerRights && (
        <Container mainAlignment="flex-start">
          <ListPanelItem
            title={t('label.server_specifics', 'Server Specifics')}
            isListExpanded={isServerSpecificsExpanded}
            setToggleView={toggleServerSpecific}
          />
          {isServerSpecificsExpanded && (
            <>
              <Row mainAlignment="flex-start" width="100%">
                <DropDownInput
                  items={isBackupModuleLicensed ? serverNames : []}
                  maxWidth="18.75rem"
                  width="16.56rem"
                  inputLabel={t('label.select_a_server', 'Select a Server')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearchServer(e.target.value);
                  }}
                  inputValue={searchServer}
                  isCustomIcon
                  hasError={isShowError}
                  inputDisabled={!isBackupModuleLicensed}
                  customIconDetail={customIconDetail}
                />
                {isShowError && (
                  <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                    <Padding top="large" left="small">
                      <ds-text as="span" size="extrasmall" weight="regular" color="error">
                        {t(
                          'label.not_found_check_the_text_and_try_again',
                          'Not found - check the text and try again',
                        )}
                      </ds-text>
                    </Padding>
                  </Container>
                )}
              </Row>
            </>
          )}

          {isServerSpecificsExpanded && (
            <ListItems
              items={serverSettingsOptions}
              selectedOperationItem={selectedOperationItem}
              setSelectedOperationItem={handleSelectOperationItem}
            />
          )}
        </Container>
      )}
    </Container>
  );
};

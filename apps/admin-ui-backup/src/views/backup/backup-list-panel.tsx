/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ComboboxInput,
  type ComboboxItem,
  Container,
  ListItems,
  ListPanelItem,
} from '@zextras/ui-components';
import {
  getRights,
  replaceHistory,
  useCurrentUserRights,
  useMailstoreServers,
  useModuleLicenseInfo,
  useRelativePathname,
} from '@zextras/ui-shared';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

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
  const [prevSelectedServer, setPrevSelectedServer] = useState(selectedServer);
  if (selectedServer !== prevSelectedServer) {
    setPrevSelectedServer(selectedServer);
    setSearchServer(selectedServer);
  }
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

  const filteredServers =
    isError || isLoading ? [] : serverList.filter((item) => item.name?.includes(searchServer));

  const serverItems: Array<ComboboxItem> = filteredServers.map((serverItem) => ({
    id: serverItem?.id ?? '',
    label: serverItem?.name ?? '',
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
      {isServerSpecificsExpanded && (
        <div className="box-border w-full max-w-[18.75rem] px-lg py-lg">
          <ComboboxInput
            label={t('label.select_a_server', 'Select a Server')}
            items={isBackupModuleLicensed ? serverItems : []}
            value={searchServer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setSearchServer(e.target.value);
            }}
            onSelect={(item: ComboboxItem): void => {
              setSearchServer(item.label);
              replaceHistory(`/${item.label}/${CONFIGURATION_BACKUP}`);
            }}
            onClear={(): void => {
              setSearchServer('');
              replaceHistory(`/${SERVER_CONFIG}`);
            }}
            hasError={isShowError}
            disabled={!isBackupModuleLicensed}
            description={
              isShowError
                ? t(
                    'label.not_found_check_the_text_and_try_again',
                    'Not found - check the text and try again',
                  )
                : undefined
            }
          />
        </div>
      )}
      {hasListServerRights && (
        <Container mainAlignment="flex-start">
          <ListPanelItem
            title={t('label.server_specifics', 'Server Specifics')}
            isListExpanded={isServerSpecificsExpanded}
            setToggleView={toggleServerSpecific}
          />

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

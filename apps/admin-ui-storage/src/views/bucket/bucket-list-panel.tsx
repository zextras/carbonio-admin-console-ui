/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DropDownInput,
  ListItems,
  ListPanelItem,
  Padding,
  Row,
} from '@zextras/ui-components';
import { replaceHistory, useIsAdvanced, useMailstoreServers } from '@zextras/ui-shared';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  IS_SERVER_LIST_EXPANDED,
  IS_SERVER_SPECIFIC_LIST_EXPANDED,
  MANAGE_APP_ID,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
  STORAGES_ROUTE_ID,
} from '../../constants';

function getRelativePathname(pathname: string, base: string): string {
  if (!pathname.startsWith(base)) {
    return pathname;
  }
  const stripped = pathname.slice(base.length);
  if (stripped === '') {
    return '/';
  }
  return stripped;
}

const BucketListPanel: FC = () => {
  const [t] = useTranslation();

  const locationService = useLocation();
  const storageBase = `/${MANAGE_APP_ID}/${STORAGES_ROUTE_ID}`;
  const relativePathname = getRelativePathname(locationService.pathname, storageBase);
  const serverMatch = matchPath(`/:server/:operation`, relativePathname);
  const opMatch = serverMatch ? null : matchPath(`/:operation`, relativePathname);
  const selectedOperationItem =
    serverMatch?.params.operation ?? opMatch?.params.operation ?? null;
  const selectedServer = serverMatch?.params.server ?? '';
  const isServerSelect = !!serverMatch;

  const { data: volumeList = [], isError, isLoading } = useMailstoreServers();
  const isAdvanced = useIsAdvanced();

  const [isServerListExpand, setIsServerListExpand] = useState(
    () => localStorage.getItem(IS_SERVER_LIST_EXPANDED) !== 'false',
  );
  const [isServerSpecificListExpand, setIsServerSpecificListExpand] = useState(
    () => localStorage.getItem(IS_SERVER_SPECIFIC_LIST_EXPANDED) !== 'false',
  );
  const [searchVolumeName, setSearchVolumeName] = useState(selectedServer);

  const [prevSelectedServer, setPrevSelectedServer] = useState(selectedServer);
  if (selectedServer !== prevSelectedServer) {
    setPrevSelectedServer(selectedServer);
    setSearchVolumeName(isServerSelect ? selectedServer : '');
  }

  const filteredServers = volumeList.filter((item) => item.name?.includes(searchVolumeName));

  const itemsVolume = filteredServers.map((volume) => ({
    id: volume.id,
    label: volume.name,
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
          const serverName = volume.name || '';
          setSearchVolumeName(serverName);
          replaceHistory(`/${serverName}/${DATA_VOLUMES}`);
        }}
      >
        {volume.name}
      </Row>
    ),
  }));

  const isShowError =
    !isError &&
    !isLoading &&
    volumeList.length > 0 &&
    filteredServers.length === 0 &&
    searchVolumeName !== '';

  const globalServerOption = [
    {
      id: SERVERS_LIST,
      name: t('label.servers_list', 'Servers List'),
      isSelected: true,
    },
    {
      id: S3CONNECTOR_LIST,
      name: t('storages.s3Connectors.title', 'S3 connectors'),
      isSelected: true,
    },
  ];

  const globalOptions = !isAdvanced
    ? globalServerOption.filter((item) => item.id !== S3CONNECTOR_LIST)
    : globalServerOption;

  const serverSpecificOption = [
    {
      id: DATA_VOLUMES,
      name: t('label.data_volumes', 'Data Volumes'),
      isSelected: isServerSelect,
    },
    {
      id: HSM_SETTINGS,
      name: t('label.hsm_settings', 'HSM Settings'),
      isSelected: isServerSelect,
    },
  ];

  const serverOptions = !isAdvanced
    ? serverSpecificOption.filter((item) => item.id !== HSM_SETTINGS)
    : serverSpecificOption;

  const toggleServer = (): void => {
    setIsServerListExpand((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(IS_SERVER_LIST_EXPANDED);
      } else {
        localStorage.setItem(IS_SERVER_LIST_EXPANDED, 'false');
      }
      return next;
    });
  };

  const toggleServerSpecific = (): void => {
    setIsServerSpecificListExpand((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
      } else {
        localStorage.setItem(IS_SERVER_SPECIFIC_LIST_EXPANDED, 'false');
      }
      return next;
    });
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchVolumeName(ev.target.value);
  };

  const handleCustomIconClick = (): void => {
    if (searchVolumeName !== '') {
      setSearchVolumeName('');
      replaceHistory(`/${SERVERS_LIST}`);
    }
  };

  const customIconDetail = {
    icon: searchVolumeName === '' ? ('HardDriveOutline' as const) : ('CloseOutline' as const),
    onClick: handleCustomIconClick,
  };

  const handleSelectOperation = (id: string): void => {
    if (id === DATA_VOLUMES || id === HSM_SETTINGS) {
      replaceHistory(`/${selectedServer}/${id}`);
    } else {
      replaceHistory(`/${id}`);
    }
  };

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto' }}
      width="100%"
      background="gray5"
    >
      <Container crossAlignment="flex-start" mainAlignment="flex-start">
        <ListPanelItem
          title={t('label.global_servers', 'Global Servers')}
          isListExpanded={isServerListExpand}
          setToggleView={toggleServer}
        />
        {isServerListExpand && (
          <ListItems
            items={globalOptions}
            selectedOperationItem={selectedOperationItem}
            setSelectedOperationItem={handleSelectOperation}
          />
        )}
        <ListPanelItem
          title={t('label.server_details', 'Server Details')}
          isListExpanded={isServerSpecificListExpand}
          setToggleView={toggleServerSpecific}
        />
        {isServerSpecificListExpand && (
          <>
            <Row mainAlignment="flex-start" width="100%">
              <DropDownInput
                items={itemsVolume}
                inputLabel={t('label.select_a_server', 'Select a Server')}
                onChange={handleInputChange}
                hasError={isShowError}
                inputValue={searchVolumeName}
                isCustomIcon
                customIconDetail={customIconDetail}
              />
            </Row>
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
            <ListItems
              items={serverOptions}
              selectedOperationItem={selectedOperationItem}
              setSelectedOperationItem={handleSelectOperation}
            />
          </>
        )}
      </Container>
    </Container>
  );
};
export default BucketListPanel;

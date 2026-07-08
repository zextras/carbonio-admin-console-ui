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
import { replaceHistory, useIsAdvanced, useMailstoreServers, useRelativePathname } from '@zextras/ui-shared';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  IS_SERVER_LIST_EXPANDED,
  IS_SERVER_SPECIFIC_LIST_EXPANDED,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
} from '../../constants';

const BucketListPanel: FC = () => {
  const [t] = useTranslation();

  const relativePathname = useRelativePathname();
  const serverMatch = matchPath(`/:server/:operation`, relativePathname);
  const opMatch = serverMatch ? null : matchPath(`/:operation`, relativePathname);
  const selectedOperationItem =
    serverMatch?.params.operation ?? opMatch?.params.operation ?? null;
  const selectedServer = serverMatch?.params.server ?? '';
  const isServerSelect = !!serverMatch;

  const { data: volumeList = [], isError, isLoading } = useMailstoreServers();
  const isAdvanced = useIsAdvanced();

  const [isServerListExpand, setIsServerListExpand] = useState(true);
  const [isServerSpecificListExpand, setIsServerSpecificListExpand] = useState(true);
  const [searchVolumeName, setSearchVolumeName] = useState(selectedServer);
  const [itemsVolume, setItemsVolume] = useState<
    Array<{ id: string | undefined; label: string | undefined; customComponent: React.ReactElement }>
  >([]);
  const [isShowError, setIsShowError] = useState(false);

  useEffect(() => {
    if (selectedServer) {
      setSearchVolumeName(selectedServer);
    }
  }, [selectedServer]);

  useEffect(() => {
    if (!isServerSelect) {
      setSearchVolumeName('');
    }
  }, [isServerSelect]);

  const filteredServers = useMemo(
    () => volumeList.filter((item) => item.name?.includes(searchVolumeName)),
    [volumeList, searchVolumeName],
  );

  const addServerToList = useCallback((list: typeof volumeList) => {
    const data = list.map((volume) => ({
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
    setItemsVolume(data);
  }, []);

  useEffect(() => {
    if (isError || isLoading) {
      return;
    }
    addServerToList(filteredServers);
    if (volumeList.length > 0 && filteredServers.length === 0 && searchVolumeName !== '') {
      setIsShowError(true);
    } else {
      setIsShowError(false);
    }
  }, [searchVolumeName, addServerToList, volumeList, filteredServers, isError, isLoading]);

  const globalServerOption = useMemo(
    () => [
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
    ],
    [t],
  );

  const globalOptions = useMemo(
    () =>
      !isAdvanced
        ? globalServerOption.filter((item) => item.id !== S3CONNECTOR_LIST)
        : globalServerOption,
    [isAdvanced, globalServerOption],
  );

  const serverSpecificOption = useMemo(
    () => [
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
    ],
    [t, isServerSelect],
  );

  const serverOptions = useMemo(
    () =>
      !isAdvanced
        ? serverSpecificOption.filter((item) => item.id !== HSM_SETTINGS)
        : serverSpecificOption,
    [isAdvanced, serverSpecificOption],
  );

  const toggleServer = useCallback((): void => {
    setIsServerListExpand((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(IS_SERVER_LIST_EXPANDED);
      } else {
        localStorage.setItem(IS_SERVER_LIST_EXPANDED, 'false');
      }
      return next;
    });
  }, []);

  const toggleServerSpecific = useCallback((): void => {
    setIsServerSpecificListExpand((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
      } else {
        localStorage.setItem(IS_SERVER_SPECIFIC_LIST_EXPANDED, 'false');
      }
      return next;
    });
  }, []);

  const handleInputChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>): void => {
    setIsShowError(false);
    setSearchVolumeName(ev.target.value);
  }, []);

  const handleCustomIconClick = useCallback((): void => {
    setIsShowError(false);
    if (searchVolumeName !== '') {
      setSearchVolumeName('');
      replaceHistory(`/${SERVERS_LIST}`);
    }
  }, [searchVolumeName]);

  const customIconDetail = useMemo(
    () => ({
      icon: searchVolumeName === '' ? ('HardDriveOutline' as const) : ('CloseOutline' as const),
      onClick: handleCustomIconClick,
    }),
    [searchVolumeName, handleCustomIconClick],
  );

  const handleSelectOperation = useCallback(
    (id: string): void => {
      if (id === DATA_VOLUMES || id === HSM_SETTINGS) {
        replaceHistory(`/${selectedServer}/${id}`);
      } else {
        replaceHistory(`/${id}`);
      }
    },
    [selectedServer],
  );

  useEffect(() => {
    const storedServerValue = localStorage.getItem(IS_SERVER_LIST_EXPANDED);
    setIsServerListExpand(storedServerValue !== 'false');

    const storedValue = localStorage.getItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
    setIsServerSpecificListExpand(storedValue !== 'false');
  }, []);

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

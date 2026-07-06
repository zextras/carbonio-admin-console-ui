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
import {
  replaceHistory,
  useGlobalCarbonioSendAnalytics,
  useIsAdvanced,
  useMailstoreServers,
} from '@zextras/ui-shared';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  IS_SERVER_LIST_EXPANDED,
  IS_SERVER_SPECIFIC_LIST_EXPANDED,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
} from '../../constants';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';

const BucketListPanel: FC = () => {
  const [t] = useTranslation();

  const setSelectedServerName = useBucketVolumeStore((state) => state.setSelectedServerName);
  const { data: volumeList = [], isError, isLoading } = useMailstoreServers();
  const { data: globalCarbonioSendAnalytics = false } = useGlobalCarbonioSendAnalytics();
  const [isStoreSelect, setIsStoreSelect] = useState(false);
  const [isStoreVolumeSelect, setIsStoreVolumeSelect] = useState(false);
  const [selectedOperationItem, setSelectedOperationItem] = useState('');
  const [isServerListExpand, setIsServerListExpand] = useState(true);
  const [isServerSpecificListExpand, setIsServerSpecificListExpand] = useState(true);
  const [searchVolumeName, setSearchVolumeName] = useState('');
  const [isVolumeListExpand, setIsVolumeListExpand] = useState(false);
  const isAdvanced = useIsAdvanced();
  const [itemsVolume, setItemsVolume] = useState();
  const [isShowError, setIsShowError] = useState(false);

  const selectedVolume = useCallback(
    (volume: any) => {
      setIsStoreSelect(true);
      setSelectedServerName(volume?.name);
      setSearchVolumeName(volume?.name);
      setSelectedOperationItem(DATA_VOLUMES);
      setIsStoreVolumeSelect(true);
      setIsVolumeListExpand(false);
    },
    [setSelectedServerName],
  );

  const addServerToList = useCallback(
    (list: any) => {
      const data = list.map((volume: any) => ({
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
              selectedVolume(volume);
            }}
          >
            {volume?.name}
          </Row>
        ),
      }));
      setItemsVolume(data);
    },
    [selectedVolume],
  );

  useEffect(() => {
    if (isError || isLoading) {
      return;
    }
    const filterList = volumeList.filter((item: any) => item.name?.includes(searchVolumeName));
    addServerToList(filterList);
    if (volumeList.length > 0 && filterList.length === 0) {
      setIsShowError(true);
    }
  }, [searchVolumeName, addServerToList, volumeList, isError, isLoading]);

  const globalServerOption = useMemo(
    () => [
      {
        id: SERVERS_LIST,
        name: t('label.servers_list', 'Servers List'),
        isSelected: isStoreSelect,
      },
      {
        id: S3CONNECTOR_LIST,
        name: t('storages.s3Connectors.title', 'S3 connectors'),
        isSelected: isStoreSelect,
      },
    ],
    [t, isStoreSelect],
  );

  const globalOptions = useMemo(
    () =>
      !isAdvanced
        ? globalServerOption.filter((item: any) => item?.id !== S3CONNECTOR_LIST)
        : globalServerOption,
    [isAdvanced, globalServerOption],
  );

  const serverSpecificOption = useMemo(
    () => [
      {
        id: DATA_VOLUMES,
        name: t('label.data_volumes', 'Data Volumes'),
        isSelected: isStoreVolumeSelect,
      },
      {
        id: HSM_SETTINGS,
        name: t('label.hsm_settings', 'HSM Settings'),
        isSelected: isStoreVolumeSelect,
      },
    ],
    [t, isStoreVolumeSelect],
  );

  const serverOptions = useMemo(
    () =>
      !isAdvanced
        ? serverSpecificOption.filter((item: any) => item?.id !== HSM_SETTINGS)
        : serverSpecificOption,
    [isAdvanced, serverSpecificOption],
  );

  useEffect(() => {
    setIsStoreSelect(true);
  }, []);

  useEffect(() => {
    setSelectedOperationItem(SERVERS_LIST);
  }, []);

  useEffect(() => {
    if (isStoreSelect) {
      if (selectedOperationItem) {
        if (selectedOperationItem === DATA_VOLUMES || selectedOperationItem === HSM_SETTINGS) {
          replaceHistory(`${searchVolumeName}/${selectedOperationItem}`);
        } else {
          replaceHistory(`/${selectedOperationItem}`);
        }
      } else {
        replaceHistory(`/${selectedOperationItem}`);
      }
    }
  }, [isStoreSelect, selectedOperationItem, searchVolumeName, globalCarbonioSendAnalytics]);

  const toggleServer = (): void => {
    if (isServerListExpand) {
      setIsServerListExpand(false);
      localStorage.setItem(IS_SERVER_LIST_EXPANDED, 'false');
    } else {
      setIsServerListExpand(true);
      localStorage.removeItem(IS_SERVER_LIST_EXPANDED);
    }
  };
  const toggleServerSpecific = (): void => {
    if (isServerSpecificListExpand) {
      setIsServerSpecificListExpand(false);
      localStorage.setItem(IS_SERVER_SPECIFIC_LIST_EXPANDED, 'false');
    } else {
      setIsServerSpecificListExpand(true);
      localStorage.removeItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
    }
    setIsServerSpecificListExpand(!isServerSpecificListExpand);
  };

  const customIconDetail = {
    icon: searchVolumeName === '' ? ('HardDriveOutline' as const) : ('CloseOutline' as const),
    onClick: (): void => {
      setIsVolumeListExpand(!isVolumeListExpand);
      setIsShowError(false);
      if (searchVolumeName !== '') {
        setSearchVolumeName('');
        setIsStoreVolumeSelect(false);
        setSelectedOperationItem(SERVERS_LIST);
      }
    },
  };

  useEffect(() => {
    const storedServerValue = localStorage.getItem(IS_SERVER_LIST_EXPANDED);
    if (storedServerValue === 'false') {
      setIsServerListExpand(false);
    } else {
      setIsServerListExpand(true);
    }
    const storedValue = localStorage.getItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
    if (storedValue === 'false') {
      setIsServerSpecificListExpand(false);
    } else {
      setIsServerSpecificListExpand(true);
    }
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
            setSelectedOperationItem={setSelectedOperationItem}
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
                onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
                  setIsShowError(false);
                  setSearchVolumeName(ev.target.value);
                }}
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
              setSelectedOperationItem={setSelectedOperationItem}
            />
          </>
        )}
      </Container>
    </Container>
  );
};
export default BucketListPanel;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  replaceHistory,
  useGlobalCarbonioSendAnalytics,
  useMtaServers,
} from '@zextras/admin-ui-bootstrap';
import { Container, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ADVANCED,
  ANTIVIRUS_AND_ANTISPAM,
  GENERAL,
  IS_SERVER_SPECIFICS_EXPANDED,
  MTA_SERVER_GENERAL,
  OUTBOUND_FLOW,
  POSTSCREEN_TUNING,
  QUEUE,
} from '../../constants';
import type { DropdownItem, MtaServer } from '../../types/mta';
import DropDownInput from '../components/dropDownInput';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const MTAListPanel: FC = () => {
  const [t] = useTranslation();

  const [isMtaSettingsExpanded, setIsMtaSettingsExpanded] = useState(true);
  const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState(
    localStorage.getItem(IS_SERVER_SPECIFICS_EXPANDED) !== 'false',
  );

  const [selectedServer, setSelectedServer] = useState('');
  const [isServerSelect, setIsServerSelect] = useState(false);
  const [selectedOperationItem, setSelectedOperationItem] = useState(GENERAL);

  const [searchServer, setSearchServer] = useState('');
  const [isShowError, setIsShowError] = useState(false);

  const { data: mtaServerList = [] } = useMtaServers();
  const { data: globalCarbonioSendAnalytics = false } = useGlobalCarbonioSendAnalytics();

  const filteredServers = useMemo(
    () => mtaServerList.filter((item: MtaServer) => item.name?.includes(searchServer)),
    [mtaServerList, searchServer],
  );

  const serverDropdownItems = useMemo(
    () =>
      filteredServers.map((serverItem: MtaServer) => ({
        id: serverItem.id || '',
        label: serverItem.name || '',
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
              setSelectedServer(serverItem.name || '');
              setSearchServer(serverItem.name || '');
              setSelectedOperationItem(MTA_SERVER_GENERAL);
              setIsServerSelect(true);
            }}
          >
            {serverItem.name}
          </Row>
        ),
      })) as Array<DropdownItem>,
    [filteredServers],
  );

  useEffect(() => {
    if (mtaServerList.length > 0 && filteredServers.length === 0 && searchServer !== '') {
      setIsShowError(true);
    } else {
      setIsShowError(false);
    }
  }, [mtaServerList.length, filteredServers.length, searchServer]);

  const mailTransferAgentOptions = useMemo(
    () => [
      {
        id: GENERAL,
        name: t('mta.inbound_flow_and_security', 'Inbound Flow & Security'),
        isSelected: true,
      },
      {
        id: POSTSCREEN_TUNING,
        name: t('mta.postscreen_tuning', 'Postscreen Tuning'),
        isSelected: true,
      },
      {
        id: OUTBOUND_FLOW,
        name: t('mta.outbound_flow', 'Outbound Flow'),
        isSelected: true,
      },
      {
        id: ANTIVIRUS_AND_ANTISPAM,
        name: t('mta.antivirus_and_antispam', 'Antivirus & Antispam'),
        isSelected: true,
      },
      {
        id: ADVANCED,
        name: t('label.advanced', 'Advanced'),
        isSelected: true,
      },
      {
        id: QUEUE,
        name: t('mta.queue', 'Queue'),
        isSelected: true,
      },
    ],
    [t],
  );

  const serverOptions = useMemo(
    () => [
      {
        id: MTA_SERVER_GENERAL,
        name: t('label.mta_server_general', 'General'),
        isSelected: isServerSelect,
      },
    ],
    [t, isServerSelect],
  );

  const toggleDefaultSettingsView = useCallback((): void => {
    setIsMtaSettingsExpanded((prev) => !prev);
  }, []);

  const toggleServerSpecific = useCallback((): void => {
    const newExpandedState = !isServerSpecificsExpanded;

    if (newExpandedState) {
      localStorage.removeItem(IS_SERVER_SPECIFICS_EXPANDED);
    } else {
      localStorage.setItem(IS_SERVER_SPECIFICS_EXPANDED, 'false');
    }

    setIsServerSpecificsExpanded(newExpandedState);
  }, [isServerSpecificsExpanded]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsShowError(false);
    setSearchServer(e.target.value);
  }, []);

  const handleCustomIconClick = useCallback((): void => {
    setIsShowError(false);
    if (searchServer !== '') {
      setSearchServer('');
      setIsServerSelect(false);
      setSelectedOperationItem(MTA_SERVER_GENERAL);
    }
  }, [searchServer]);

  const customIconDetail = useMemo(
    () => ({
      icon: searchServer === '' ? 'HardDriveOutline' : 'CloseOutline',
      onClick: handleCustomIconClick,
    }),
    [searchServer, handleCustomIconClick],
  );

  useEffect(() => {
    if (selectedOperationItem === MTA_SERVER_GENERAL) {
      replaceHistory(`/${selectedServer}/${selectedOperationItem}`);
    } else {
      replaceHistory(`/${selectedOperationItem}`);
    }
  }, [globalCarbonioSendAnalytics, selectedOperationItem, selectedServer]);

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
    >
      <ListPanelItem
        title={t('mta.mail_transfer_agent_mta', 'Mail Transfer Agent (MTA)')}
        isListExpanded={isMtaSettingsExpanded}
        setToggleView={toggleDefaultSettingsView}
      />
      {isMtaSettingsExpanded && (
        <ListItems
          items={mailTransferAgentOptions}
          selectedOperationItem={selectedOperationItem}
          setSelectedOperationItem={setSelectedOperationItem}
        />
      )}

      <Container mainAlignment="flex-start">
        <ListPanelItem
          title={t('label.single_server', 'Single Server')}
          isListExpanded={isServerSpecificsExpanded}
          setToggleView={toggleServerSpecific}
        />
        {isServerSpecificsExpanded && (
          <>
            <Row mainAlignment="flex-start" width="100%">
              <DropDownInput
                items={serverDropdownItems || []}
                maxWidth="18.75rem"
                width="16.56rem"
                inputLabel={t('label.select_a_server', 'Select a Server')}
                onChange={handleInputChange}
                inputValue={searchServer}
                isCustomIcon
                hasError={isShowError}
                inputDisabled={false}
                customIconDetail={customIconDetail}
              />
              {isShowError && (
                <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                  <Padding top="large" left="small">
                    <Text size="extrasmall" weight="regular" color="error">
                      {t(
                        'label.not_found_check_the_text_and_try_again',
                        'Not found - check the text and try again',
                      )}
                    </Text>
                  </Padding>
                </Container>
              )}
            </Row>
          </>
        )}

        {isServerSpecificsExpanded && (
          <ListItems
            items={serverOptions}
            selectedOperationItem={selectedOperationItem}
            setSelectedOperationItem={setSelectedOperationItem}
          />
        )}
      </Container>
    </Container>
  );
};

export default MTAListPanel;

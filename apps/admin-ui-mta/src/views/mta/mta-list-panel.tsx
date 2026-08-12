/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DropDownInput,
  ListItems,
  Padding,
  Row,
} from '@zextras/ui-components';
import { replaceHistory, useMtaServers, useRelativePathname } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import {
  INBOUND_FLOW_SECURITY,
  IS_SERVER_SPECIFICS_EXPANDED,
  MTA_SERVER_GENERAL,
} from '../../constants';
import type { DropdownItem, MtaServer } from '../../types/mta';
import { ListPanelItem } from '../list/list-panel-item';
import { SECTION_ROUTES } from './mta-section-routes';

export function MTAListPanel() {
  const [t] = useTranslation();

  const [isMtaSettingsExpanded, setIsMtaSettingsExpanded] = useState(true);
  const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState(
    localStorage.getItem(IS_SERVER_SPECIFICS_EXPANDED) !== 'false',
  );

  const relativePathname = useRelativePathname();
  const serverMatch = matchPath(`/:server/:operation`, relativePathname);
  const opMatch = serverMatch ? null : matchPath(`/:operation`, relativePathname);
  const selectedOperationItem = serverMatch?.params.operation ?? opMatch?.params.operation ?? null;
  const selectedServer = serverMatch?.params.server ?? '';
  const isServerSelect = !!serverMatch;

  const [searchServer, setSearchServer] = useState('');

  const { data: mtaServerList = [] } = useMtaServers();

  const filteredServers = mtaServerList.filter((item: MtaServer) =>
    item.name?.includes(searchServer),
  );

  const isShowError =
    mtaServerList.length > 0 && filteredServers.length === 0 && searchServer !== '';

  const serverDropdownItems = filteredServers.map((serverItem: MtaServer) => ({
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
          const serverName = serverItem.name || '';
          setSearchServer(serverName);
          replaceHistory(`/${serverName}/${MTA_SERVER_GENERAL}`);
        }}
      >
        {serverItem.name}
      </Row>
    ),
  })) as Array<DropdownItem>;

  const mailTransferAgentOptions = SECTION_ROUTES.filter((route) => !route.prefix).map((route) => ({
    id: route.id,
    name: t(route.labelKey, route.labelDefault),
    isSelected: true,
  }));

  const serverOptions = SECTION_ROUTES.filter((route) => route.prefix === ':server').map(
    (route) => ({
      id: route.id,
      name: t(route.labelKey, route.labelDefault),
      isSelected: isServerSelect,
    }),
  );

  function toggleDefaultSettingsView(): void {
    setIsMtaSettingsExpanded((prev) => !prev);
  }

  function toggleServerSpecific(): void {
    const newExpandedState = !isServerSpecificsExpanded;

    if (newExpandedState) {
      localStorage.removeItem(IS_SERVER_SPECIFICS_EXPANDED);
    } else {
      localStorage.setItem(IS_SERVER_SPECIFICS_EXPANDED, 'false');
    }

    setIsServerSpecificsExpanded(newExpandedState);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setSearchServer(e.target.value);
  }

  function handleCustomIconClick(): void {
    if (searchServer !== '') {
      setSearchServer('');
      replaceHistory(`/${INBOUND_FLOW_SECURITY}`);
    }
  }

  const customIconDetail = {
    icon: searchServer === '' ? ('HardDriveOutline' as const) : ('CloseOutline' as const),
    onClick: handleCustomIconClick,
  };

  function handleSelectOperation(id: string): void {
    if (id === MTA_SERVER_GENERAL) {
      replaceHistory(`/${selectedServer}/${id}`);
    } else {
      replaceHistory(`/${id}`);
    }
  }

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
          setSelectedOperationItem={handleSelectOperation}
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
            items={serverOptions}
            selectedOperationItem={selectedOperationItem}
            setSelectedOperationItem={handleSelectOperation}
          />
        )}
      </Container>
    </Container>
  );
}

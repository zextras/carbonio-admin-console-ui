/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Input,
  List,
  ListItem,
  Padding,
  Row,
  Tooltip,
} from '@zextras/ui-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/helmet_logo.svg';
import { isDraftHostnameValid, type VirtualHostItem } from './schema';
import type { VirtualHostsFormApi } from './use-virtual-hosts-form';

type VirtualHostSectionProps = {
  form: VirtualHostsFormApi;
};

export const VirtualHostSection = ({ form }: VirtualHostSectionProps) => {
  const [t] = useTranslation();
  const hosts = useSelector(form.store, (s) => s.values.hosts);
  const [virtualHostValue, setVirtualHostValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const isDraftValid = isDraftHostnameValid(virtualHostValue);
  const addButtonDisabled = !isDraftValid;
  const hasSelection = selectedRows.length > 0;

  function setHosts(next: Array<VirtualHostItem>): void {
    form.setFieldValue('hosts', next);
  }

  function handleRowSelect(id: string): void {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id],
    );
  }

  function handleSelectAll(): void {
    if (selectedRows.length === hosts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(hosts.map((item) => item.id));
    }
  }

  function removeVirtualHost(): void {
    if (selectedRows.length === 0 || hosts.length === 0) return;
    setHosts(hosts.filter((item) => !selectedRows.includes(item.id)));
    setSelectedRows([]);
  }

  function removeSingleItem(id: string): void {
    setHosts(hosts.filter((item) => item.id !== id));
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
  }

  function addVirtualHost(): void {
    if (!isDraftValid) return;
    const lastId = hosts.length > 0 ? hosts.at(-1)?.id : '0';
    const newId = String(Number.parseInt(lastId ?? '0', 10) + 1);
    setHosts([...hosts, { id: newId, hostname: virtualHostValue }]);
    setVirtualHostValue('');
  }

  return (
    <Container width="100%" height="fit">
      <Container
        orientation="horizontal"
        mainAlignment="flex-start"
        height="fit"
        width="100%"
        wrap="nowrap"
        padding={{ vertical: '1rem' }}
      >
        <Row takeAvailableSpace>
          <Input
            label={t(
              'label.add_virtual_host_name',
              'Type a new Virtual Host Name and click on “Add +” to add it to the list',
            )}
            backgroundColor="gray5"
            value={virtualHostValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setVirtualHostValue(e.target.value);
            }}
            hasError={virtualHostValue !== '' && !isDraftValid}
          />
          {virtualHostValue !== '' && !isDraftValid && (
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width="fill"
              padding={{ top: 'extrasmall' }}
            >
              <ds-text as="strong" color="error" overflow="break-word" size="extrasmall">
                {t('domain.virtual_host_name_error', 'Please enter valid virtual host name!')}
              </ds-text>
            </Container>
          )}
        </Row>
        <Row width="10%">
          <Tooltip
            label={t('tooltip.add_virtual_host', 'Type a valid Virtual Host Name to add it')}
            disabled={!addButtonDisabled}
          >
            <Button
              type="ghost"
              label={t('label.add', 'Add')}
              color="primary"
              disabled={addButtonDisabled}
              onClick={(e) => {
                e.preventDefault();
                addVirtualHost();
              }}
            />
          </Tooltip>
        </Row>
      </Container>
      <Container
        background="gray3"
        orientation="horizontal"
        mainAlignment="space-between"
        width="100%"
        maxHeight="2.188rem"
        padding={{ horizontal: '1rem', vertical: '0.5rem' }}
        style={{ cursor: 'pointer' }}
        onClick={handleSelectAll}
        onMouseEnter={() => setHoveredRow('header')}
        onMouseLeave={() => setHoveredRow(null)}
      >
        <Row mainAlignment="flex-start" takeAvailableSpace>
          {hoveredRow === 'header' || hasSelection ? (
            <ds-icon
              icon={
                selectedRows.length === hosts.length && hosts.length > 0
                  ? 'CheckmarkSquareOutline'
                  : 'SquareOutline'
              }
            ></ds-icon>
          ) : (
            <Container width="1rem" height="1rem" />
          )}
          <Padding left="small">
            <ds-text as="strong" weight="bold">
              {t('label.virtual_host_name', 'Virtual Host Name')}
            </ds-text>
          </Padding>
        </Row>
        {selectedRows.length > 1 && (
          <Row width="fit" mainAlignment="flex-end" padding={{ right: '1rem' }}>
            <Button
              type="ghost"
              color="error"
              label={t('button.remove_selected_items', 'Remove selected items')}
              size="small"
              onClick={(e) => {
                e.preventDefault();
                removeVirtualHost();
              }}
            />
          </Row>
        )}
      </Container>
      <Container maxHeight="10.94rem" style={{ overflowY: 'auto' }}>
        <List>
          {hosts.map((item, id) => (
            <ListItem key={item.id} selected={selectedRows.includes(item.id)}>
              {(visible: boolean) =>
                visible ? (
                  <Container
                    orientation="horizontal"
                    mainAlignment="flex-start"
                    width="100%"
                    maxHeight="2.188rem"
                    background={id % 2 === 0 ? 'gray6' : 'gray5'}
                    style={{ cursor: 'pointer' }}
                    padding={{ horizontal: '1rem', vertical: '0.5rem' }}
                    onClick={() => handleRowSelect(item.id)}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <Row mainAlignment="flex-start" crossAlignment="flex-start" width="fit">
                      <Container
                        width="1rem"
                        height="1rem"
                        mainAlignment="center"
                        crossAlignment="center"
                      >
                        {hoveredRow === item.id || selectedRows.includes(item.id) ? (
                          <ds-icon
                            icon={
                              selectedRows.includes(item.id)
                                ? 'CheckmarkSquareOutline'
                                : 'SquareOutline'
                            }
                          ></ds-icon>
                        ) : (
                          <ds-text as="span">{id + 1}</ds-text>
                        )}
                      </Container>
                    </Row>
                    <Row mainAlignment="flex-start">
                      <Padding left="small">
                        <ds-text as="span">{item.hostname}</ds-text>
                      </Padding>
                    </Row>
                    {hasSelection &&
                      (hoveredRow === item.id || selectedRows.includes(item.id)) && (
                        <Row
                          takeAvailableSpace
                          mainAlignment="flex-end"
                          padding={{ right: '1rem' }}
                        >
                          <Button
                            type="ghost"
                            color="error"
                            label="Remove"
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              removeSingleItem(item.id);
                            }}
                          />
                        </Row>
                      )}
                  </Container>
                ) : (
                  <div style={{ height: '4rem' }} />
                )
              }
            </ListItem>
          ))}
        </List>
      </Container>
      {hosts.length === 0 && (
        <Container
          background="gray6"
          height="fit-content"
          mainAlignment="center"
          crossAlignment="center"
        >
          <Padding value="57px 0 0 0" width="100%">
            <Row mainAlignment="center" width="100%">
              <img src={logo} alt="logo" />
            </Row>
          </Padding>
          <Padding vertical="extralarge" width="100%">
            <Row mainAlignment="center" crossAlignment="center" width="100%">
              <ds-text
                as="p"
                size="large"
                color="secondary"
                weight="regular"
                style={{ textAlign: 'center' }}
              >
                <Trans
                  i18nKey="label.no_virtual_host_message"
                  defaults="There aren’t any virtual hosts yet."
                  components={{ break: <br /> }}
                />
              </ds-text>
            </Row>
          </Padding>
        </Container>
      )}
    </Container>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Paging,
  Row,
  Table,
  TrackNumberPerPage,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Attribute } from '../../../../types';
import logo from '../../../assets/gardian.svg';
import { GENERAL_SETTINGS, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { useDomainSearch } from '../../../services/use-domain-search';
import ScrollContainer from '../../components/scrollComponent';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';

type StatusTypes = {
  [key: string]: {
    [key: string]: string;
  };
};

type ZimbraDomain = {
  name: string;
  id: string;
  a: Attribute[];
};

export type ZimbraDomainResponse = {
  domain: ZimbraDomain[];
  more: boolean;
  searchTotal: number;
  _jsns: string;
};

type ZimbraDomainEntry = {
  name: string;
  id: string;
  a: Attribute[];
  zimbraDomainType: string;
  zimbraDomainStatus: string;
  zimbraDomainName: string;
  zimbraId: string;
};

export const DomainList = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [isTableTooTall, setIsTableTooTall] = useState(false);

  const tableRef = useRef<HTMLDivElement | null>(null);

  const headers = [
    {
      id: 'name',
      label: t('label.domain_name', 'Domain Name'),
      width: '25%',
      bold: true,
    },
    {
      id: 'status',
      label: t('label.status', 'Status'),
      width: '75%',
      bold: true,
    },
  ];

  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchString, setSearchString] = useState<string>('');
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const debouncedSearch = useDebouncedValue(searchString, 700);

  const { data, isFetching, isError, error } = useDomainSearch({
    searchQuery: debouncedSearch,
    limit,
    offset,
  });

  const STATUS_COLOR: StatusTypes = {
    active: {
      color: '#8BC34A',
      label: t('label.active', 'Active'),
    },
    maintenance: {
      color: '#2196D3',
      label: t('label.in_maintenance', 'In maintenance'),
    },
    locked: {
      color: '#D74942',
      label: t('label.locked', 'Locked'),
    },
    closed: {
      color: '#828282',
      label: t('label.closed', 'Closed'),
    },
    pending: {
      color: '#828282',
      label: t('label.pending', 'Pending'),
    },
    lockout: {
      color: '#D74942',
      label: t('label.lockout', 'Lockout'),
    },
    suspended: {
      color: '#D74942',
      label: t('label.suspended', 'Suspended'),
    },
  };

  useEffect(() => {
    if (isError && error) {
      createSnackbar(generateSnackbarFromError(error, t));
    }
  }, [isError, error, createSnackbar, t]);

  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  const onDomainSelect = (domain: ZimbraDomainEntry): void => {
    replaceHistory(`/${domain?.id}/${GENERAL_SETTINGS}`);
  };

  const rawDomains: ZimbraDomain[] = data?.domain ?? [];
  const totalDomain = data?.searchTotal ?? 0;

  const domainList = rawDomains.map(
    (
      item,
    ): {
      id: string;
      columns: ReactElement[];
      iteam: ZimbraDomainEntry;
      clickable: boolean;
    } => {
      const domainIteam: ZimbraDomainEntry = {
        name: item.name,
        id: item.id,
        zimbraDomainType: '',
        zimbraDomainStatus: 'active',
        zimbraDomainName: '',
        zimbraId: '',
        a: item.a,
      };
      item?.a?.forEach((ele: Attribute) => {
        if (ele.n === 'zimbraDomainType') {
          domainIteam.zimbraDomainType = ele._content;
        } else if (ele.n === 'zimbraDomainStatus') {
          domainIteam.zimbraDomainStatus = ele._content;
        } else if (ele.n === 'zimbraDomainName') {
          domainIteam.zimbraDomainName = ele._content;
        } else if (ele.n === 'zimbraId') {
          domainIteam.zimbraId = ele._content;
        }
      });
      return {
        id: item?.id,
        columns: [
          <ds-text
            as="span"
            size="small"
            key={item?.id}
            color="gray0"
            weight="regular"
            onClick={(): void => {
              onDomainSelect(domainIteam);
            }}
          >
            {item?.name || ' '}
          </ds-text>,

          <ds-text
            as="span"
            size="small"
            weight="light"
            key={item?.id}
            color={STATUS_COLOR[domainIteam.zimbraDomainStatus].color}
            onClick={(): void => {
              onDomainSelect(domainIteam);
            }}
          >
            {STATUS_COLOR[domainIteam.zimbraDomainStatus].label}
          </ds-text>,
        ],
        iteam: domainIteam,
        clickable: true,
      };
    },
  );

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 375;
        const viewportHeight = window.innerHeight;
        setIsTableTooTall(tableHeight > viewportHeight);
      }
    }, 100);

    if (table && !resizeObserverRef.current) {
      const observer = new ResizeObserver(handleResize);
      resizeObserverRef.current = observer;
      observer.observe(table);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  return (
    <Container
      padding={{ top: 'large', left: 'large', right: 'large' }}
      mainAlignment="flex-start"
      background="gray6"
    >
      <Row mainAlignment="flex-start" width="100%">
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="3.625rem"
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('domain.domain_list', 'Domains List')}
              </ds-text>
            </Row>
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        style={{
          position: 'relative',
          overflow: 'auto',
        }}
        padding={{ top: 'small', left: 'small', right: 'small' }}
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ bottom: 'large' }}
            >
              <Container>
                <Input
                  label={t('label.i_am_looking_for_this_domain', `I'm looking for this domain…`)}
                  disabled={domainList.length === 0 && searchString.length === 0 && !isError}
                  value={searchString}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearchString(e.target.value);
                  }}
                  CustomIcon={(): React.ReactElement => (
                    <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                  )}
                />
              </Container>
            </Row>
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              style={{
                position: 'relative',
              }}
            >
              <Table
                rows={domainList}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: domainList.length === 0 ? '50%' : '100%',
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isFetching && (
                <Container
                  crossAlignment="center"
                  mainAlignment="center"
                  height="auto"
                  padding={{ top: 'medium' }}
                >
                  <ds-spinner></ds-spinner>
                </Container>
              )}
              {domainList.length === 0 && !isFetching && (
                <Container orientation="column" crossAlignment="center" mainAlignment="center">
                  <Row>
                    <img src={logo} alt="logo" />
                  </Row>
                  <Row
                    padding={{ top: 'extralarge' }}
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                  >
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      {t('label.this_list_is_empty', 'This list is empty.')}
                    </ds-text>
                  </Row>
                  <Row
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                    padding={{ top: 'small' }}
                    width="53%"
                  >
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      <Trans
                        i18nKey="label.create_domain_list_msg"
                        defaults="You can create a new Domain by clicking on <bold>Create</bold> button on header menu"
                        components={{ bold: <strong /> }}
                      />
                    </ds-text>
                  </Row>
                </Container>
              )}
              {domainList.length !== 0 && (
                <Container
                  style={{
                    position: 'sticky',
                    bottom: isTableTooTall ? '0' : '-4rem',
                  }}
                >
                  <ScrollContainer isVisible={isTableTooTall} />
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    background="gray6"
                    width="100%"
                    padding={{ right: 'extralarge' }}
                    height="auto"
                  >
                    <Container crossAlignment="flex-start">
                      <Paging totalItem={totalDomain} setOffset={setOffset} pageSize={limit} />
                    </Container>
                    <Container
                      crossAlignment="flex-end"
                      orientation="horizontal"
                      mainAlignment="flex-end"
                      padding={{ top: 'small' }}
                    >
                      <TrackNumberPerPage setPageSize={setLimit} />
                    </Container>
                  </Container>
                </Container>
              )}
            </Row>
          </Container>
        </Row>
      </Container>
    </Container>
  );
};


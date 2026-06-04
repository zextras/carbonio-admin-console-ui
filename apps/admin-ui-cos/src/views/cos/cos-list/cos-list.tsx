/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  Input,
  Paging,
  Row,
  Table,
  TrackNumberPerPage,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { GENERAL_INFORMATION, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { useCosList } from '../../../services/use-cos-list';
import { ScrollComponent } from '../../components/scroll-component';
import { FunnelSearchIcon } from '../cos-server-pools/funnel-search-icon';
import CosRowFactory from './cos-row-factory';

type ZimbraCosAttribute = {
  n: string;
  _content: string;
};

type ZimbraCosEntry = {
  name: string;
  id: string;
  a: Array<ZimbraCosAttribute>;
  zimbraCosType: string;
  zimbraCosStatus: string;
  zimbraCosName: string;
  zimbraId: string;
};

const STATUS_CONFIG = {
  active: { color: 'success', labelKey: 'label.active', labelDefault: 'Active' },
  maintenance: { color: 'info', labelKey: 'label.in_maintenance', labelDefault: 'In maintenance' },
  locked: { color: 'error', labelKey: 'label.locked', labelDefault: 'Locked' },
  closed: { color: 'gray1', labelKey: 'label.closed', labelDefault: 'Closed' },
  pending: { color: 'gray1', labelKey: 'label.pending', labelDefault: 'Pending' },
  lockout: { color: 'error', labelKey: 'label.lockout', labelDefault: 'Lockout' },
} as const;

const DEBOUNCE_SEARCH_DELAY = 700;
const DEBOUNCE_RESIZE_DELAY = 100;
const TABLE_VIEWPORT_OFFSET = 375;
const HEADER_HEIGHT = '3.625rem';

function parseCosAttributes(attributes: Array<ZimbraCosAttribute>): {
  zimbraCosType: string;
  zimbraCosStatus: string;
  zimbraCosName: string;
  zimbraId: string;
} {
  const map: Record<string, string> = {};
  attributes.forEach((attr) => {
    map[attr.n] = attr._content;
  });
  return {
    zimbraCosType: map.zimbraCosType ?? '',
    zimbraCosStatus: map.zimbraCosStatus ?? 'active',
    zimbraCosName: map.zimbraCosName ?? '',
    zimbraId: map.zimbraId ?? '',
  };
}

function getStatusDisplay(status: string, t: (key: string, defaultValue: string) => string) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  return {
    color: config?.color ?? 'gray1',
    label: t(config?.labelKey ?? 'label.active', config?.labelDefault ?? 'Active'),
  };
}

export const CosList = () => {
  const [t] = useTranslation();
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const headers = [
    {
      id: 'name',
      label: t('label.Cos_name', 'Cos Name'),
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
  const [searchString, setSearchString] = useState<string>('');
  const debouncedSearch = useDebouncedValue(searchString, DEBOUNCE_SEARCH_DELAY);

  const { data, isPending, isError } = useCosList({
    searchQuery: debouncedSearch,
    limit,
    offset,
  });

  const cosListResponse = data?.cos || [];
  const totalCos = data?.searchTotal || 0;

  const onCosSelect = (cosEntry: ZimbraCosEntry) => {
    replaceHistory(`/${cosEntry.id}/${GENERAL_INFORMATION}`);
  };

  const cosList = Array.isArray(cosListResponse)
    ? cosListResponse.map((item) => {
        const parsed = parseCosAttributes(item.a ?? []);
        const cosItem: ZimbraCosEntry = {
          name: item.name,
          id: item.id,
          a: item.a,
          ...parsed,
        };
        const { color: statusColor, label: statusLabel } = getStatusDisplay(
          cosItem.zimbraCosStatus,
          t,
        );
        return {
          id: item.id,
          columns: [
            <ds-text as="span" size="small" key="name" color="gray0" weight="regular">
              {item.name || ' '}
            </ds-text>,

            <ds-text as="span" size="small" weight="light" key="status" color={statusColor}>
              {statusLabel}
            </ds-text>,
          ],
          item: cosItem,
          clickable: true,
          onClick: (): void => {
            onCosSelect(cosItem);
          },
        };
      })
    : [];

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const handleResize = debounce((): void => {
      const tableHeight = table.clientHeight + TABLE_VIEWPORT_OFFSET;
      const viewportHeight = window.innerHeight;
      setIsTableTooTall(tableHeight > viewportHeight);
    }, DEBOUNCE_RESIZE_DELAY);

    if (!resizeObserverRef.current) {
      const observer = new ResizeObserver(handleResize);
      resizeObserverRef.current = observer;
      observer.observe(table);
    }

    return () => {
      handleResize.cancel();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  const showEmptyState = cosList.length === 0;

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
          height={HEADER_HEIGHT}
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
              <ds-text as="strong" size="medium" weight="bold" color="gray0">
                {t('label.Cos_list', 'COS List')}
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
          minHeight: '10rem',
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
                  label={t('label.i_am_looking_for_this_Cos', `I'm looking for this Cos…`)}
                  disabled={showEmptyState && searchString.length === 0 && isError}
                  value={searchString}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearchString(e.target.value);
                    if (e.target.value) setOffset(0);
                  }}
                  CustomIcon={FunnelSearchIcon}
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
                rows={cosList}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: cosList.length === 0 ? '50%' : '100%',
                }}
                RowFactory={CosRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isError && (
                <Container
                  orientation="column"
                  crossAlignment="center"
                  mainAlignment="center"
                  padding={{ top: 'extralarge' }}
                >
                  <ds-text as="p" weight="light" color="error" size="large">
                    {t(
                      'label.error_loading_cos_list',
                      'Failed to load COS list. Please try again.',
                    )}
                  </ds-text>
                </Container>
              )}
              {showEmptyState && !isError && (
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
                    <ds-text as="p" weight="light" color="gray1" size="large" overflow="break-word">
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
                    <ds-text as="p" weight="light" color="gray1" size="large" overflow="break-word">
                      <Trans
                        i18nKey="label.create_Cos_list_msg"
                        defaults="You can create a new Cos by clicking on <bold>Create</bold> button on header menu"
                        components={{ bold: <strong /> }}
                      />
                    </ds-text>
                  </Row>
                </Container>
              )}
              {cosList.length !== 0 && (
                <Container
                  style={{
                    position: 'sticky',
                    bottom: isTableTooTall ? '0' : '-4rem',
                  }}
                >
                  {isTableTooTall && <ScrollComponent />}
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    background="gray6"
                    width="100%"
                    padding={{ right: 'extralarge' }}
                    height="auto"
                  >
                    <Container crossAlignment="flex-start">
                      <Paging totalItem={totalCos} setOffset={setOffset} pageSize={limit} />
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

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
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../assets/gardian.svg';
import { GENERAL_INFORMATION, RECORD_DISPLAY_LIMIT } from '../../constants';
import { useCosList } from '../../services/use-cos-list';
import { useCosStore } from '../../store/cos/store';
import ScrollContainer from '../components/scrollComponent';

type ZimbraCosAttribute = {
  n: string;
  _content: string;
};

type ZimbraCosEntry = {
  name: string;
  id: string;
  a: ZimbraCosAttribute[];
  zimbraCosType: string;
  zimbraCosStatus: string;
  zimbraCosName: string;
  zimbraId: string;
};

const STATUS_COLOR = {
  active: '#8BC34A',
  maintenance: '#2196D3',
  locked: '#D74942',
  closed: '#828282',
  pending: '#828282',
  lockout: '#D74942',
} as const;

const STATUS_LABEL_KEYS: Record<string, string> = {
  active: 'label.active',
  maintenance: 'label.in_maintenance',
  locked: 'label.locked',
  closed: 'label.closed',
  pending: 'label.pending',
  lockout: 'label.lockout',
};

const STATUS_LABEL_DEFAULTS: Record<string, string> = {
  active: 'Active',
  maintenance: 'In maintenance',
  locked: 'Locked',
  closed: 'Closed',
  pending: 'Pending',
  lockout: 'Lockout',
};

const CosList: FC = () => {
  const [t] = useTranslation();
  const { setCos, setCosView } = useCosStore();
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isPending, isError } = useCosList({
    searchQuery,
    limit,
    offset,
  });

  const cosListResponse = data?.cos || [];
  const totalCos = data?.searchTotal || 0;

  const onCosSelect = (Cos: ZimbraCosEntry) => {
    setCos({
      a: Cos?.a,
      id: Cos?.id,
      name: Cos?.name,
    });
    setCosView(GENERAL_INFORMATION);
    replaceHistory(`/${Cos.id}/${GENERAL_INFORMATION}`);
  };

  const cosList = (() => {
    if (!cosListResponse || !Array.isArray(cosListResponse)) return [];

    return cosListResponse.map((item) => {
      const CosIteam: ZimbraCosEntry = {
        name: item.name,
        id: item.id,
        zimbraCosType: '',
        zimbraCosStatus: 'active',
        zimbraCosName: '',
        zimbraId: '',
        a: item.a,
      };
      item?.a?.forEach((ele: ZimbraCosAttribute) => {
        if (ele.n === 'zimbraCosType') {
          CosIteam.zimbraCosType = ele._content;
        } else if (ele.n === 'zimbraCosStatus') {
          CosIteam.zimbraCosStatus = ele._content;
        } else if (ele.n === 'zimbraCosName') {
          CosIteam.zimbraCosName = ele._content;
        } else if (ele.n === 'zimbraId') {
          CosIteam.zimbraId = ele._content;
        }
      });
      const status = CosIteam.zimbraCosStatus;
      const statusColor = STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? '#828282';
      const statusLabel = t(
        STATUS_LABEL_KEYS[status] ?? 'label.active',
        STATUS_LABEL_DEFAULTS[status] ?? 'Active',
      );
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
              onCosSelect(CosIteam);
            }}
          >
            {item?.name || ' '}
          </ds-text>,

          <ds-text
            as="span"
            size="small"
            weight="light"
            key={item?.id}
            color={statusColor}
            onClick={(): void => {
              onCosSelect(CosIteam);
            }}
          >
            {statusLabel}
          </ds-text>,
        ],
        iteam: CosIteam,
        clickable: true,
      };
    });
  })();

  const searchcosListRef = useRef(
    debounce((searchText: string) => {
      setSearchQuery(searchText);
    }, 700),
  );
  useEffect(() => {
    searchcosListRef.current(searchString);
  }, [offset, searchString]);

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
                  disabled={cosList.length === 0 && searchString.length === 0 && isError}
                  value={searchString}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearchString(e.target.value);
                  }}
                  CustomIcon={(): React.JSX.Element => (
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
                rows={!isPending ? cosList : []}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: isPending || cosList.length === 0 ? '50%' : '100%',
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isPending && (
                <Container
                  crossAlignment="center"
                  mainAlignment="center"
                  height="auto"
                  padding={{ top: 'medium' }}
                >
                  <ds-spinner></ds-spinner>
                </Container>
              )}
              {cosList.length === 0 && !isPending && (
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

export default CosList;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  DropDownInput,
  ListItems,
  type ListItemType,
  ListPanelItem,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { type SearchDirectoryEntry } from '../../../types/cos';
import {
  ADVANCED,
  COS_LIST,
  COS_ROUTE_ID,
  FEATURES,
  GENERAL_INFORMATION,
  IS_COS_DETAIL_LIST_EXPANDED,
  MANAGE_APP_ID,
  MAX_COS_DISPLAY,
  PREFERENCES,
  SERVER_POOLS,
  WSC,
} from '../../constants';
import { getCosList } from '../../services/search-cos-service';
import { useCosDetail } from '../../services/use-cos-detail';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import GeneralListPanel from './general-list-panel';

export const CosListPanel: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { pathname } = useLocation();
  const [searchCosName, setSearchCosName] = useState('');
  const [isCosSelect, setIsCosSelect] = useState(false);
  const [cosList, setCosList] = useState<Array<SearchDirectoryEntry>>([]);
  const [isCosListExpand, setIsCosListExpand] = useState(false);
  const [selectedCosId, setSelectedCosId] = useState<string | undefined>(undefined);
  const { data: cosDetailData } = useCosDetail(selectedCosId);
  const cosInformation = cosDetailData?.cos?.[0];
  const cosName = cosInformation?.name;
  const [isShowError, setIsShowError] = useState(false);
  const prevCosRef = useRef<string | undefined>(undefined);
  const [isDetailListExpanded, setIsDetailListExpanded] = useState(true);

  const cosView = (() => {
    if (pathname === `/${COS_LIST}` || pathname === '/') return COS_LIST;
    const segments = pathname.split('/').filter(Boolean);
    return segments.length >= 2 ? segments[segments.length - 1] : null;
  })();

  const getCosLists = (searchData: string): void => {
    getCosList(searchData)
      .then((data) => {
        if (data && data?.searchTotal && data.searchTotal > 0 && data.cos) {
          setCosList(data.cos);
        } else {
          setCosList([]);
          setIsShowError(true);
        }
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  };

  useEffect(() => {
    getCosLists('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!prevCosRef.current && prevCosRef.current !== cosName) {
      getCosLists('');
    }
    prevCosRef.current = cosName;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosName]);

  useEffect(() => {
    if (cosInformation?.name) {
      setSearchCosName(cosInformation?.name);
      setIsCosSelect(true);
      setIsCosListExpand(false);
      if (cosInformation?.id) {
        replaceHistory(`/${cosInformation.id}/${GENERAL_INFORMATION}`);
      }
    }
  }, [cosInformation?.id, cosInformation?.name]);

  useEffect(() => {
    if (
      (pathname && pathname === `/${MANAGE_APP_ID}/${COS_ROUTE_ID}`) ||
      pathname === `/${MANAGE_APP_ID}/${COS_ROUTE_ID}/`
    ) {
      setCosList([]);
      setIsCosSelect(false);
      setSearchCosName('');
      setIsCosListExpand(false);
      setSelectedCosId(undefined);
      replaceHistory(`/${COS_LIST}`);
    }
  }, [pathname]);

  const searchCosCallRef = useRef(
    debounce((searchData: string) => {
      getCosLists(searchData);
    }, 700),
  );

  useEffect(() => {
    if (!isCosSelect) {
      searchCosCallRef.current(searchCosName);
    }
  }, [searchCosName, isCosSelect]);

  const toggleDetailView = (): void => {
    if (isDetailListExpanded) {
      setIsDetailListExpanded(false);
      localStorage.setItem(IS_COS_DETAIL_LIST_EXPANDED, 'false');
    } else {
      setIsDetailListExpanded(true);
      localStorage.removeItem(IS_COS_DETAIL_LIST_EXPANDED);
    }
    setIsDetailListExpanded(!isDetailListExpanded);
  };

  const navigateToCosView = (view: string) => {
    if (isCosSelect && selectedCosId) {
      replaceHistory(`/${selectedCosId}/${view}`);
    }
  };

  const selectedCos = (cosData: SearchDirectoryEntry) => {
    setIsCosSelect(true);
    setSearchCosName(cosData?.name);
    setIsCosListExpand(false);
    setSelectedCosId(cosData?.id);
    replaceHistory(`/${cosData.id}/${GENERAL_INFORMATION}`);
  };

  const detailOptions: Array<ListItemType> = [
    {
      id: GENERAL_INFORMATION,
      name: t('label.general_information', 'General Information'),
      isSelected: isCosSelect,
    },
    {
      id: FEATURES,
      name: t('label.features', 'Features'),
      isSelected: isCosSelect,
    },
    {
      id: WSC,
      name: t('label.wsc', 'Chat'),
      isSelected: isCosSelect,
    },
    {
      id: PREFERENCES,
      name: t('label.preferences', 'Preferences'),
      isSelected: isCosSelect,
    },
    {
      id: SERVER_POOLS,
      name: t('label.server_pools', 'Server Pools'),
      isSelected: isCosSelect,
    },
    {
      id: ADVANCED,
      name: t('label.advanced', 'Advanced'),
      isSelected: isCosSelect,
    },
  ];

  const customIconDetail = {
    icon: isCosListExpand ? ('ArrowIosUpward' as const) : ('ArrowIosDownwardOutline' as const),
    size: '20px',
    onClick: (): void => {
      setIsCosListExpand(!isCosListExpand);
    },
  };

  const globalOptionItems: Array<ListItemType> = [
    {
      id: COS_LIST,
      name: t('label.Cos_list', 'COS List'),
      isSelected: true,
    },
  ];

  const items =
    cosList.length > MAX_COS_DISPLAY
      ? [
          {
            customComponent: (
              <>
                <Row mainAlignment="flex-start">
                  <Padding horizontal="small">
                    <ds-icon icon="InfoOutline" style={{ width: '20px', height: '20px' }}></ds-icon>
                  </Padding>
                </Row>
                <Row
                  mainAlignment="flex-start"
                  width="100%"
                  padding={{
                    all: 'small',
                  }}
                >
                  <ds-text as="p" overflow="break-word">
                    {t(
                      'many_cos_info_msg',
                      'So many COSes! Which one would you like to see? Start typing to filter.',
                    )}
                  </ds-text>
                </Row>
              </>
            ),
          },
        ]
      : cosList.map((cosData) => ({
          id: cosData.id,
          label: cosData.name,
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
                selectedCos(cosData);
              }}
            >
              {cosData?.name}
            </Row>
          ),
        }));

  useEffect(() => {
    const storedValue = localStorage.getItem(IS_COS_DETAIL_LIST_EXPANDED);
    if (storedValue === 'false') {
      setIsDetailListExpanded(false);
    } else {
      setIsDetailListExpanded(true);
    }
  }, []);

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
    >
      <GeneralListPanel generalOptionItems={globalOptionItems} />
      <Row padding={{ all: 'medium' }} width="100%" mainAlignment="space-between"></Row>
      <Row mainAlignment="flex-start" width="100%">
        <DropDownInput
          items={items}
          inputLabel={
            isCosSelect
              ? t('cos.i_want_to_see_this_cos', 'I want to see this COS')
              : t('cos.search_class_of_service', 'Select a Class of Service')
          }
          onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
            setIsCosSelect(false);
            setIsShowError(false);
            setSearchCosName(ev.target.value);
          }}
          inputValue={searchCosName}
          hasError={isShowError}
          isCustomIcon
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
      <ListPanelItem
        title={t('label.details', 'Details')}
        isListExpanded={isDetailListExpanded}
        setToggleView={toggleDetailView}
      />
      {isDetailListExpanded && (
        <ListItems
          items={detailOptions}
          selectedOperationItem={cosView}
          setSelectedOperationItem={navigateToCosView}
        />
      )}
    </Container>
  );
};

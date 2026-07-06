/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
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
import { replaceHistory, useCosList } from '@zextras/ui-shared';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router';

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
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import { cosQueryKeys } from '../../services/cos-query-keys';
import { useCosDetail } from '../../services/use-cos-detail';
import { GeneralListPanel } from './general-list-panel';

export const CosListPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const [searchCosName, setSearchCosName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 700);
  const [isCosListExpand, setIsCosListExpand] = useState(false);
  const cosDetailMatch = matchPath(`/${MANAGE_APP_ID}/${COS_ROUTE_ID}/:cosId/:operation`, pathname);
  const selectedCosId = cosDetailMatch?.params.cosId;
  const isCosSelect = !!selectedCosId;
  const { data: cosDetailData } = useCosDetail(selectedCosId);
  const cosInformation = cosDetailData?.cos?.[0];
  const cosName = cosInformation?.name;
  const prevCosRef = useRef<string | undefined>(undefined);
  const [isDetailListExpanded, setIsDetailListExpanded] = useState(() => {
    const storedValue = localStorage.getItem(IS_COS_DETAIL_LIST_EXPANDED);
    return storedValue !== 'false';
  });

  const { data, error } = useCosList({ searchQuery: debouncedSearch, limit: 50, offset: 0 });
  const cosList = data?.cos ?? [];
  const isShowError = (data?.searchTotal ?? 0) <= 0 && !error;

  useEffect(() => {
    if (error) {
      createSnackbar({
        key: 'cos-list-error',
        severity: 'error',
        label: t('label.error_loading_cos_list', 'Failed to load COS list. Please try again.'),
        autoHideTimeout: 5000,
        replace: true,
      });
    }
  }, [createSnackbar, error, t]);

  const cosView = cosDetailMatch?.params.operation ?? COS_LIST;

  useEffect(() => {
    if (!!prevCosRef.current && prevCosRef.current !== cosName) {
      queryClient.invalidateQueries({ queryKey: cosQueryKeys.all });
    }
    prevCosRef.current = cosName;
  }, [cosName, queryClient]);

  useEffect(() => {
    if (cosInformation?.name) {
      setSearchCosName(cosInformation?.name);
      setSearchQuery('');
      setIsCosListExpand(false);
    }
  }, [cosInformation?.id, cosInformation?.name]);

  useEffect(() => {
    if (!isCosSelect) {
      setSearchCosName('');
      setSearchQuery('');
    }
  }, [isCosSelect]);

  const selectedCos = (cosData: SearchDirectoryEntry) => {
    setSearchCosName(cosData?.name);
    setSearchQuery('');
    setIsCosListExpand(false);
    replaceHistory(`/${cosData.id}/${GENERAL_INFORMATION}`);
  };

  const toggleDetailView = (): void => {
    const newValue = !isDetailListExpanded;
    setIsDetailListExpanded(newValue);
    if (newValue) {
      localStorage.removeItem(IS_COS_DETAIL_LIST_EXPANDED);
    } else {
      localStorage.setItem(IS_COS_DETAIL_LIST_EXPANDED, 'false');
    }
  };

  const navigateToCosView = (view: string) => {
    if (isCosSelect && selectedCosId) {
      replaceHistory(`/${selectedCosId}/${view}`);
    }
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

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '1px solid var(--color-white)' }}
    >
      <GeneralListPanel generalOptionItems={globalOptionItems} selectedOperationItem={cosView} />
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
            setSearchCosName(ev.target.value);
            setSearchQuery(ev.target.value);
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

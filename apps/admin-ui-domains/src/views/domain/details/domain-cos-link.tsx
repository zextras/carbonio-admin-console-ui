/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  DropDownInput,
  HoverableRowFactory,
  Input,
  ListRow,
  Padding,
  Row,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import { useCosList, useDebouncedValue, useUserSettings } from '@zextras/ui-shared';
import { type ChangeEvent, type KeyboardEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Attribute } from '../../../../types/attribute';
import type { CosMaxAccountValues } from '../../../../types/domain';
import { MAX_COS_DISPLAY, TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useCopyCos } from '../../../services/use-copy-cos';
import { useGrantCosRights, useRevokeCosRights } from '../../../services/use-grant-cos-rights';
import { useModifyDomain } from '../../../services/use-modify-domain';

type CosLinkTableRow = TRow & {
  hoverContent?: ReactNode;
};

type CosDropdownItem = {
  id?: string;
  label?: string;
  customComponent: ReactNode;
};

type DomainCosLinkProps = {
  cosMaxAccountList: Array<CosMaxAccountValues>;
  defaultCosId: string;
  domainId: string;
  domainName: string;
};

export const DomainCosLink = ({
  cosMaxAccountList,
  defaultCosId,
  domainId,
  domainName,
}: DomainCosLinkProps) => {
  const [t] = useTranslation();
  const [isCosSelect, setIsCosSelect] = useState(false);
  const [isCosListExpand, setIsCosListExpand] = useState(false);
  const [searchCosName, setSearchCosName] = useState('');
  const [cosId, setCosId] = useState('');
  const [maxAccountValue, setMaxAccountValue] = useState('');
  const modifyDomainMutation = useModifyDomain(domainId);
  const copyCosMutation = useCopyCos();
  const grantCosRightsMutation = useGrantCosRights();
  const revokeCosRightsMutation = useRevokeCosRights();
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

  const debouncedSearch = useDebouncedValue(searchCosName, 700);
  const { data: cosData } = useCosList({
    searchQuery: debouncedSearch,
    limit: 0,
    offset: 0,
    enabled: !isCosSelect,
  });
  const cosList = cosData?.cos ?? [];

  const domainCosMaxAccountList = cosMaxAccountList.map((item) => ({
    id: item.id,
    name: cosList.find((cos) => cos.id === item.id)?.name,
    value: item.value,
  }));

  const customIconDetail = {
    icon: isCosListExpand ? ('ArrowIosUpward' as const) : ('ArrowIosDownwardOutline' as const),
    onClick: () => {
      setIsCosListExpand(!isCosListExpand);
    },
    style: { width: '1.25rem', height: '1.25rem' },
  };

  function selectedCos(id: string, name: string): void {
    setIsCosSelect(true);
    setSearchCosName(name);
    setIsCosListExpand(false);
    setCosId(id);
  }

  function onSaveCosLinkToDomain(cId: string, cosMaxAccValue: string): void {
    if (!cId || !cosMaxAccValue) return;

    const attributes: Array<Attribute> = [];
    const isOverride = cosMaxAccountList.some((item) => item.id === cId);

    if (isOverride) {
      cosMaxAccountList.forEach((item) => {
        if (item.id !== cId) {
          attributes.push({ n: 'zimbraDomainCOSMaxAccounts', _content: `${item.id}:${item.value}` });
        }
      });
      attributes.push({ n: 'zimbraDomainCOSMaxAccounts', _content: `${cId}:${cosMaxAccValue}` });
    } else {
      attributes.push({ n: '+zimbraDomainCOSMaxAccounts', _content: `${cId}:${cosMaxAccValue}` });
    }

    modifyDomainMutation.mutateAsync({ id: domainId, _jsns: ZIMBRA_ADMIN_URN, a: attributes }).then(() => {
      setMaxAccountValue('');
    });

    if (!isOverride) {
      grantCosRightsMutation.mutate({ cosId: cId, domainName });
    }
  }

  function onDuplicate(cId: string, cosMaxAccValue: string, cosName: string): void {
    if (!cId || !cosMaxAccValue) return;
    const newName = `${cosName}.${domainName}`;
    copyCosMutation
      .mutateAsync({ newName, cosId: cId })
      .then((data) => {
        const copiedCosId = data.cos?.[0]?.id;
        if (!copiedCosId) return;
        setTimeout(() => {
          onSaveCosLinkToDomain(copiedCosId, cosMaxAccValue);
        }, 1500);
      })
      .catch(() => {});
  }

  function onRemoveCosLinkToDomain(cId: string, cosMaxAccValue: string): void {
    if (!cId || !cosMaxAccValue) return;

    const attributes: Array<Attribute> = [
      { n: '-zimbraDomainCOSMaxAccounts', _content: `${cId}:${cosMaxAccValue}` },
    ];

    modifyDomainMutation.mutateAsync({ id: domainId, _jsns: ZIMBRA_ADMIN_URN, a: attributes }).then(() => {
      setMaxAccountValue('');
    });

    revokeCosRightsMutation.mutate({ cosId: cId, domainName });
  }

  function markAsDefaultCos(cId: string): void {
    if (!cId) return;
    modifyDomainMutation.mutateAsync({
      id: domainId,
      _jsns: ZIMBRA_ADMIN_URN,
      a: [{ n: 'zimbraDomainDefaultCOSId', _content: cId }],
    });
  }

  const headers: Array<THeader> = [
    {
      id: 'cos_list',
      label: t('label.cos_list', 'Cos List'),
      width: '35%',
      bold: true,
    },
    {
      id: 'accounts',
      label: t('label.how_many_accounts_handled', 'How many accounts are handled? (-1 if unlimited)'),
      width: '45%',
      bold: true,
    },
    {
      id: 'description',
      label: '',
      width: '20%',
      bold: true,
    },
  ];

  const cosMaxAccountListRow: Array<CosLinkTableRow> = domainCosMaxAccountList.map((item, index) => ({
    id: index.toString(),
    columns: [
      <Container crossAlignment="flex-start" mainAlignment="center" key={`${item.id}-name`}>
        <ds-text as="span" size="medium" weight="light" color="gray0">
          {item.name}
        </ds-text>
      </Container>,
      <Container crossAlignment="flex-start" mainAlignment="center" key={`${item.id}-value`}>
        <ds-text as="span" size="medium" weight="light" color="gray0">
          {item.value}
        </ds-text>
      </Container>,
      <Container key={`${item.id}-default`}>
        {defaultCosId === item.id && (
          <Row>
            <Padding right="small">
              <ds-text as="span" size="medium" weight="light" color="gray0">
                {t('label.default_cos', 'Default COS')}
              </ds-text>
            </Padding>
            <ds-icon icon="Star" color="primary"></ds-icon>
          </Row>
        )}
      </Container>,
    ],
    hoverContent:
      defaultCosId !== item.id && isGlobalAdmin ? (
        <Container>
          <Row>
            <Padding right="small">
              <ds-text as="span">{t('label.set_as_default', 'Set as Default')}</ds-text>
            </Padding>
            <Padding right="small">
              <ds-icon
                icon="StarOutline"
                color="primary"
                onClick={(event: { stopPropagation: () => void }) => {
                  event.stopPropagation();
                  markAsDefaultCos(item.id);
                }}
              ></ds-icon>
            </Padding>
            <ds-icon
              icon="Close"
              color="primary"
              onClick={(event: { stopPropagation: () => void }) => {
                event.stopPropagation();
                onRemoveCosLinkToDomain(item.id, item.value);
              }}
            ></ds-icon>
          </Row>
        </Container>
      ) : (
        ''
      ),
  }));

  const items: Array<CosDropdownItem> =
    cosList.length > MAX_COS_DISPLAY
      ? [
          {
            customComponent: (
              <>
                <Row mainAlignment="flex-start">
                  <Padding horizontal="small">
                    <ds-icon icon="InfoOutline" style={{ width: '1.25rem', height: '1.25rem' }}></ds-icon>
                  </Padding>
                </Row>
                <Row mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
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
      : cosList.map((cos) => ({
          id: cos.id,
          label: cos.name,
          customComponent: (
            <Row
              style={{
                display: 'block',
                textAlign: 'left',
                height: 'inherit',
                padding: '0.188rem',
                width: 'inherit',
              }}
              onClick={() => {
                selectedCos(cos.id, cos.name);
              }}
            >
              {cos.name}
            </Row>
          ),
        }));

  return (
    <Container height="fit" crossAlignment="flex-start" background="gray6">
      <Row
        orientation="horizontal"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        padding={{ top: 'large', bottom: 'large' }}
      >
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('label.class_of_service', 'Class of Service (cos)')}
        </ds-text>
      </Row>
      {isGlobalAdmin && (
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <DropDownInput
              items={items}
              inputLabel={t(
                'cos.select_cos_to_include_in_domain',
                'Select a COS to include in this domain',
              )}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                setIsCosSelect(false);
                setSearchCosName(ev.target.value);
              }}
              inputValue={searchCosName}
              isCustomIcon
              customIconDetail={customIconDetail}
            />
          </Container>

          <Container padding={{ all: 'small' }}>
            <Input
              label={t('label.handle_accounts', 'Handle Accounts (-1 if unlimited)')}
              value={maxAccountValue}
              backgroundColor="gray6"
              type="number"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (
                  ![
                    'Backspace',
                    'Delete',
                    'ArrowLeft',
                    'ArrowRight',
                    '0',
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '-',
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (Number(e.target.value) < -1) {
                  setMaxAccountValue('-1');
                } else {
                  setMaxAccountValue(e.target.value);
                }
              }}
            />
          </Container>
          <Container crossAlignment="flex-end" padding={{ all: 'small' }} width="17%" minWidth="11.5rem">
            <Row>
              <Padding right="large">
                <Button
                  type="outlined"
                  label={t('label.duplicate', 'Duplicate')}
                  color="primary"
                  onClick={(event: { stopPropagation: () => void }) => {
                    event.stopPropagation();
                    onDuplicate(cosId, maxAccountValue, searchCosName);
                  }}
                />
              </Padding>
              <Button
                type="outlined"
                label={t('label.link', 'Link')}
                color="primary"
                onClick={(event: { stopPropagation: () => void }) => {
                  event.stopPropagation();
                  onSaveCosLinkToDomain(cosId, maxAccountValue);
                }}
              />
            </Row>
          </Container>
        </ListRow>
      )}
      <Row mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
        <Table
          rows={cosMaxAccountListRow}
          headers={headers}
          showCheckbox={isGlobalAdmin}
          multiSelect={false}
          style={{ overflow: 'auto', height: '100%' }}
          RowFactory={HoverableRowFactory}
          HeaderFactory={CustomHeaderFactory}
        />
        {cosMaxAccountListRow.length === 0 && (
          <Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '1rem' }}>
            <Padding all="medium" width="30.875rem">
              <ds-text
                as="p"
                color="gray1"
                overflow="break-word"
                weight="regular"
                size="large"
                style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
              >
                {t(
                  'label.cos_not_included_for_domain_notes',
                  'There are not COS included for this domain, please select one from the dropwdown menu and click on "DUPLICATE" or "LINK"',
                )}
              </ds-text>
            </Padding>
          </Container>
        )}
      </Row>
    </Container>
  );
};

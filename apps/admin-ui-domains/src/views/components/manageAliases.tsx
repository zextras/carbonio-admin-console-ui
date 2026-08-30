/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Input,
  LabeledValue,
  Modal,
  Row,
  Select,
} from '@zextras/ui-components';
import { useDomainById } from '@zextras/ui-shared';
import { cloneDeep, noop, uniqBy } from 'lodash-es';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useDomainList } from '../../services/use-domain-list';
import { CustomChip } from './customChip';

export const ManageAliases: FC<{
  listAliases: Array<{ label: string }>;
  setListAliases: (arg: Array<{ label: string }>) => void;
  setAliasChange: (arg: Array<{ label: string }>) => void;
  aliasType?: string;
  viewType?: string;
}> = ({ listAliases, setListAliases, setAliasChange, aliasType = '', viewType = 'large' }) => {
  const [t] = useTranslation();
  const [showManageAliesModal, setShowManageAliesModal] = useState<boolean>(false);
  const { domainId } = useParams();
  const { data: domain } = useDomainById<{ name?: string }>({ domainId });
  const domainName = domain?.name;
  const { data: domainList = [] } = useDomainList();
  const [aliasNameValue, setAliasNameValue] = useState<string>('');
  const [selectedDomainName, setSelectedDomainName] = useState<string>('');
  const onDomainOptionChange = (v: string): void => {
    setSelectedDomainName(v);
  };

  return (
    <>
      <Row width="100%">
        {viewType === 'large' ? (
          <>
            <Row width="76%" mainAlignment="flex-start" crossAlignment="flex-start">
              <Row padding={{ left: 'large', bottom: 'small' }}>
                <ds-text as="label" size="small" color="secondary">
                  {t('account_details.aliases', 'Aliases')}
                </ds-text>
              </Row>
              <Row width="100%">
                <Container
                  orientation="horizontal"
                  wrap="wrap"
                  mainAlignment="flex-start"
                  maxWidth="44rem"
                  style={{ gap: '0.5rem' }}
                >
                  {listAliases?.map(
                    (ele, index) =>
                      (aliasType !== 'accounts' || index > 0) && (
                        <CustomChip key={`chip${index}`} label={ele?.label} />
                      ),
                  )}
                  <Row width="100%" padding={{ top: 'medium' }}>
                    <ds-divider></ds-divider>
                  </Row>
                </Container>
              </Row>
            </Row>
            <Row width="24%" mainAlignment="flex-end">
              <Button
                type="outlined"
                label={t('account_details.manage_aliases', 'MANAGE ALIAS')}
                color="primary"
                onClick={(): void => setShowManageAliesModal(true)}
              />
            </Row>
          </>
        ) : (
          <LabeledValue
            label={t('account_details.aliases', 'Aliases')}
            value={(listAliases?.length || 1) - 1}
            CustomIcon={() => (
              <ds-icon
                icon="EditAsNewOutline"
                onClick={(): void => setShowManageAliesModal(true)}
                style={{ cursor: 'pointer' }}
                size="large"
                onChange={noop}
              ></ds-icon>
            )}
          />
        )}
      </Row>
      <Modal
        title={t(
          'account_details.manage_the_aliases_for_this_account',
          'Manage the Aliases for this account',
        )}
        open={showManageAliesModal}
        onClose={(): void => setShowManageAliesModal(false)}
        showCloseIcon
        hideFooter
        size={'medium'}
      >
        <Row padding={{ top: 'large', bottom: 'large' }} width="100%">
          <Row padding={{ top: 'medium', bottom: 'large' }}>
            <ds-text as="p">
              {t(
                'account_details.type_the_new_alias_name',
                'Type the new Alias Name and select a domain to add it to your available aliases',
              )}
            </ds-text>
          </Row>
          <Row
            padding={{ bottom: 'large' }}
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            width="100%"
            wrap={'nowrap'}
          >
            <Container mainAlignment="flex-start" crossAlignment="flex-start" width="40%">
              <Input
                label={t('account_details.new_alias_name', 'New Alias Name')}
                backgroundColor="gray5"
                value={aliasNameValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setAliasNameValue(e.target.value);
                }}
              />
            </Container>
            <Container padding={{ top: 'large', left: 'small', right: 'small' }} width="10%">
              <ds-icon icon="AtOutline" size="large"></ds-icon>
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ right: 'large' }}
              width="40%"
            >
              <Select
                items={domainList.map((ele) => ({
                  label: ele.name,
                  value: ele.name,
                }))}
                background="gray5"
                label={t('account_details.domain', 'Domain')}
                showCheckbox={false}
                // @ts-expect-error - needs a fix
                selection={{
                  label: selectedDomainName || domainName,
                  value: selectedDomainName || domainName,
                }}
                // @ts-expect-error - needs a fix // Need to fix it with custom soultion
                onChange={onDomainOptionChange}
              />
            </Container>
            <Container width="10%">
              <Button
                type="outlined"
                icon="PlusOutline"
                color="primary"
                size="extralarge"
                onClick={(): void => {
                  if (!aliasNameValue.trim()) return;
                  const aliaes: Array<{ label: string }> = cloneDeep(listAliases);
                  aliaes.push({
                    label: `${aliasNameValue.trim()}@${selectedDomainName || domainName}`,
                  });
                  const aliaesUniq: Array<{ label: string }> = uniqBy(aliaes, 'label');
                  setListAliases(aliaesUniq);
                  setAliasChange(aliaesUniq);
                  setAliasNameValue('');
                }}
              />
            </Container>
          </Row>
          <Row padding={{ top: 'medium', bottom: 'large' }}>
            <ds-text as="p">
              {t(
                'account_details.click_on_the_pencil_to_edit',
                'Click on the pencil to edit the available alias or click on the cross to delete it',
              )}
            </ds-text>
          </Row>
          <Row width="100%" mainAlignment="flex-start" crossAlignment="flex-start">
            <Row padding={{ left: 'large', bottom: 'small' }}>
              <ds-text as="label" size="small" color="secondary">
                {t('account_details.your_available_aliases', 'Your Available Aliases')}
              </ds-text>
            </Row>
            <Row width="100%">
              <Container
                orientation="horizontal"
                wrap="wrap"
                mainAlignment="flex-start"
                maxWidth="44rem"
                style={{ gap: '0.5rem' }}
              >
                {listAliases?.map(
                  (ele, index) =>
                    (aliasType !== 'accounts' || index > 0) && (
                      <CustomChip
                        key={`chip${index}`}
                        label={ele.label}
                        onClose={(): void => {
                          const aliaes = cloneDeep(listAliases);
                          aliaes.splice(index, 1);
                          setListAliases(aliaes);
                          setAliasChange(aliaes);
                        }}
                        actions={[
                          {
                            id: `chipAliasId${index}`,
                            label: ele.label,
                            type: 'button',
                            icon: 'Edit2Outline',
                            onClick: (): void => {
                              const aliaes = cloneDeep(listAliases);

                              const selectedItemArr: Array<{ label: string }> = aliaes.splice(
                                index,
                                1,
                              );
                              const selectedItem: string = selectedItemArr[0].label;
                              const selectedItemSplit = selectedItem.split('@');

                              setAliasNameValue(selectedItemSplit[0]);
                              setSelectedDomainName(selectedItemSplit[1]);
                              setListAliases(aliaes);
                              setAliasChange(aliaes);
                            },
                          },
                        ]}
                      />
                    ),
                )}
                <Row width="100%" padding={{ top: 'medium' }}>
                  <ds-divider></ds-divider>
                </Row>
              </Container>
            </Row>
          </Row>
        </Row>
      </Modal>
    </>
  );
};

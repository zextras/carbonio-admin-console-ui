/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  DefaultTabBarItem,
  Padding,
  Row,
  TabBar,
  useSnackbar,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EditHsmPolicyProps, HsmPolicyFromServer, TabBarItem } from '../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';
import type { HsmPolicyFormValues } from '../types';
import { EditHsmPolicyDetailSection } from './edit-hsm-policy-detail-section';
import { EditHsmPolicyVolumesSection } from './edit-hsm-policy-volumes-section';

type ReusedDefaultTabBarProps = {
  readonly item: TabBarItem;
  readonly selected: boolean;
  readonly onClick: () => void;
};

function ReusedDefaultTabBar({
  item,
  selected,
  onClick,
}: ReusedDefaultTabBarProps) {
  return (
    <DefaultTabBarItem
      item={item as unknown as { id: string; label: string }}
      selected={selected}
      onClick={onClick}
      orientation="horizontal"
      background={'transparent'}
      underlineColor={'primary'}
      forceWidthEquallyDistributed={false}
    >
      <Row padding="small">
        <Padding horizontal="small">
          <ds-icon
            size="medium"
            color={selected ? 'primary' : 'gray'}
            icon={item.icon as 'InfoOutline' | 'OptionsOutline'}
          ></ds-icon>
        </Padding>
        <ds-text as="span" size="small" color={selected ? 'primary' : 'gray'}>
          {item.label}
        </ds-text>
      </Row>
    </DefaultTabBarItem>
  );
}

export function EditHsmPolicy({
  setShowEditHsmPolicyView,
  policies,
  selectedPolicies,
  volumeList,
  onEditSave,
  isEditSaveInProgress,
}: EditHsmPolicyProps) {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const [change, setChange] = useState('details');
  const currentPolicy = policies.find(
    (item: HsmPolicyFromServer) => item?.hsmQuery === selectedPolicies,
  );
  const form = useForm({
    defaultValues: {
      isAllEnabled: false,
      isMessageEnabled: false,
      isEventEnabled: false,
      isContactEnabled: false,
      isDocumentEnabled: false,
      policyCriteria: [],
      sourceVolume: [],
      destinationVolume: [],
    } as HsmPolicyFormValues,
  });
  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  const items = [
    {
      id: 'details',
      label: t('hsm.details', 'Details'),
      CustomComponent: ReusedDefaultTabBar,
      icon: 'InfoOutline',
    },
    {
      id: 'volumes',
      label: t('hsm.volumes', 'Volumes'),
      CustomComponent: ReusedDefaultTabBar,
      icon: 'OptionsOutline',
    },
  ] as Array<TabBarItem>;

  const showSnackbar = (msg: string) => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: msg,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const onSave = () => {
    const values = form.state.values;
    if (
      values.isContactEnabled === false &&
      values.isDocumentEnabled === false &&
      values.isEventEnabled === false &&
      values.isMessageEnabled === false
    ) {
      showSnackbar(t('hsm.select_at_least_one_type', 'Select at least one type'));
      return;
    }
    if (values.policyCriteria.length === 0) {
      showSnackbar(t('hsm.add_at_lease_one_criteria', 'Add at least one criteria'));
      return;
    }
    onEditSave({ ...values, allVolumes: volumeList });
  };

  return (
    <Container
      background="gray5"
      mainAlignment="flex-start"
      style={{
        position: 'absolute',
        left: `${'max(calc(100% - 40rem), 0.75rem)'}`,
        top: '2.688rem',
        height: 'auto',
        width: '40rem',
        overflow: 'hidden',
        transition: 'left 0.2s ease-in-out',
        boxShadow: '-0.375rem 0.25rem 0.313rem 0rem rgba(0, 0, 0, 0.1)',
      }}
    >
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="3rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('hsm.editing_policy', 'Editing Policy')}
          </ds-text>
        </Row>
        <Row padding={{ right: 'extrasmall' }}>
          {isDirty && (
            <Row>
              <Padding right="medium">
                <Button
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  onClick={(): void => {
                    form.reset();
                    setShowEditHsmPolicyView(false);
                  }}
                />
              </Padding>

              <Button
                label={t('label.save', 'Save')}
                color="primary"
                onClick={onSave}
                disabled={isEditSaveInProgress}
                loading={isEditSaveInProgress}
              />
            </Row>
          )}
          {!isDirty && (
            <Button
              type="ghost"
              color={'text'}
              size="medium"
              icon="CloseOutline"
              onClick={(): void => setShowEditHsmPolicyView(false)}
            />
          )}
        </Row>
      </Row>
      <Row>
        <ds-divider color="gray3"></ds-divider>
      </Row>

      <Container
        padding={{ all: 'small' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 9.5rem)"
        background="white"
        style={{ overflow: 'auto' }}
      >
        <Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
          <TabBar
            items={items as unknown as Array<{ id: string; label: string }>}
            selected={change}
            onChange={(ev: unknown, selectedId: string): void => {
              setChange(selectedId);
            }}
            width={540}
            onClick={(): void => {}}
            background="gray6"
          />
        </Row>
        <Row width="100%">
          <ds-divider></ds-divider>
        </Row>
        <HSMContext.Provider value={{ form, allVolumes: volumeList }}>
          <Container crossAlignment="flex-start" padding={{ all: '0rem' }}>
            {change === 'details' && <EditHsmPolicyDetailSection currentPolicy={currentPolicy} />}
            {change === 'volumes' && <EditHsmPolicyVolumesSection currentPolicy={currentPolicy} />}
          </Container>
        </HSMContext.Provider>
      </Container>
    </Container>
  );
}

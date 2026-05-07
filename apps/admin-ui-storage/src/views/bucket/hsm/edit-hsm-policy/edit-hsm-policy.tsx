/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  DefaultTabBarItem,
  Padding,
  Row,
  TabBar,
  useSnackbar,
} from '@zextras/ui-components';
import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type EditHsmDetailObj, type HsmPolicy, type VolumeItem } from '../../../../../types';
import { EditHSMContext } from '../hsm-context/hsm-context';
import EditHsmPolicyDetailSection from './edit-hsm-policy-detail-section';
import EditHsmPolicyVolumesSection from './edit-hsm-policy-volumes-section';

const EditHsmPolicy: FC<{
  setShowEditHsmPolicyView: (value: boolean) => void;
  policies: Array<HsmPolicy>;
  selectedPolicies: string;
  volumeList: Array<VolumeItem>;
  onEditSave: (detail: EditHsmDetailObj) => void;
  isEditSaveInProgress: boolean;
}> = ({
  setShowEditHsmPolicyView,
  policies,
  selectedPolicies,
  volumeList,
  onEditSave,
  isEditSaveInProgress,
}) => {
    const { t } = useTranslation();
    const createSnackbar = useSnackbar();
    const [change, setChange] = useState('details');
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [currentPolicy, setCurrentPolicy] = useState<HsmPolicy>();
    const [hsmDetail, setHsmDetail] = useState<EditHsmDetailObj>({
      allVolumes: volumeList,
      isAllEnabled: false,
      isMessageEnabled: false,
      isEventEnabled: false,
      isContactEnabled: false,
      isDocumentEnabled: false,
      policyCriteria: [],
      sourceVolume: [],
      destinationVolume: [],
      isDataLoaded: false,
      isVolumeLoaded: false,
    });

    useEffect(() => {
      const policy = policies.find((item) => item?.hsmQuery === selectedPolicies);
      if (policy) {
        setCurrentPolicy(policy);
      }
    }, [selectedPolicies, policies]);

    const ReusedDefaultTabBar: FC<{
      item: { id: string; label: string; icon: string };
      index: number;
      selected: boolean;
      onClick: () => void;
    }> = ({ item, selected, onClick }): ReactElement => (
      <DefaultTabBarItem
        item={item}
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
              icon={item.icon}
            ></ds-icon>
          </Padding>
          <ds-text as="span" size="small" color={selected ? 'primary' : 'gray'}>
            {item.label}
          </ds-text>
        </Row>
      </DefaultTabBarItem>
    );
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
    ];

    const showSnackbar = useCallback(
      (msg: string) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: msg,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      },
      [createSnackbar],
    );

    const onSave = useCallback(() => {
      if (
        hsmDetail?.isContactEnabled === false &&
        hsmDetail?.isDocumentEnabled === false &&
        hsmDetail?.isEventEnabled === false &&
        hsmDetail?.isMessageEnabled === false
      ) {
        showSnackbar(t('hsm.select_at_least_one_type', 'Select at least one type'));
        return;
      }
      if (hsmDetail?.policyCriteria.length === 0) {
        showSnackbar(t('hsm.add_at_lease_one_criteria', 'Add at least one criteria'));
        return;
      }
      onEditSave(hsmDetail);
    }, [hsmDetail, onEditSave, showSnackbar, t]);

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
                    onClick={(): void => setShowEditHsmPolicyView(false)}
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
              items={items}
              selected={change}
              onChange={(ev: unknown, selectedId: string): void => {
                setChange(selectedId);
              }}
              width={540}
              onClick={(): void => {
                // console.log('__');
              }}
              background="gray6"
            />
          </Row>
          <Row width="100%">
            <ds-divider></ds-divider>
          </Row>
          <EditHSMContext.Provider value={{ hsmDetail, setHsmDetail }}>
            <Container crossAlignment="flex-start" padding={{ all: '0rem' }}>
              {change === 'details' && (
                <EditHsmPolicyDetailSection currentPolicy={currentPolicy} setIsDirty={setIsDirty} />
              )}
              {change === 'volumes' && (
                <EditHsmPolicyVolumesSection currentPolicy={currentPolicy} setIsDirty={setIsDirty} />
              )}
            </Container>
          </EditHSMContext.Provider>
        </Container>
      </Container>
    );
  };

export default EditHsmPolicy;

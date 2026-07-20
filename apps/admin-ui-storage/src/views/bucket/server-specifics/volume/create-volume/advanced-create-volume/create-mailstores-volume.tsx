/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { type FC, type ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AdvancedVolumeWizardDetail } from '../../../../../../../types';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { volumeTypeList } from '../../../../../utility/utils';
import AdvancedMailstoresConfig from './advanced-mailstores-config';
import AdvancedMailstoresCreate from './advanced-mailstores-create';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection, externalData }) => {
  const { t } = useTranslation();
  return (
    <Section
      title={`${externalData} | ${t('volume.create_storage_volume', 'Create Storage Volume')}`}
      padding={{ all: '0' }}
      footer={wizardFooter}
      divider
      showClose
      onClose={(): void => {
        setToggleWizardSection(false);
      }}
    >
      {wizard}
    </Section>
  );
};

const CreateMailstoresVolume: FC<{
  setToggleWizardExternal: (value: boolean) => void;
  volName: string;
  CreateAdvancedRequest: (attr: Record<string, unknown>) => void;
  CreateVolumeRequest: (attr: Record<string, unknown>) => void;
}> = ({ setToggleWizardExternal, volName, CreateAdvancedRequest, CreateVolumeRequest }) => {
  const { t } = useTranslation();
  const volTypeList = useMemo(() => volumeTypeList(t, true), [t]);
  const isAllocationToggle = useBucketVolumeStore((state) => state?.isAllocationToggle);
  const [advancedVolumeDetail, setAdvancedVolumeDetail] = useState<AdvancedVolumeWizardDetail>({
    volumeName: '',
    volumeMain: 0,
    isCurrent: false,
    volumeAllocation: '',
    bucketName: '',
    unusedBucketType: '',
    tieringSupported: false,
    bucketId: '',
    prefix: '',
    path: '',
    isCompression: false,
    compressionThreshold: '',
    centralized: false,
    useInfrequentAccess: false,
    infrequentAccessThreshold: '',
    useIntelligentTiering: false,
  });

  const isLocalBlockDevice = advancedVolumeDetail?.volumeAllocation === 'Local Block Device';

  const wizardSteps = [
    {
      name: 'volume',
      label: t('label.volume_definition', 'DEFINITION'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresDefinition,
      canGoNext: (): any => true,
      CancelButton: (props: any) => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (): any => '',
      NextButton: (props: any): ReactElement => (
        <Button
          {...props}
          label={t('label.volume_next_step_button', 'NEXT STEP')}
          icon={'ChevronRightOutline'}
          iconPlacement="right"
        />
      ),
    },
    {
      name: 'config',
      label: t('label.new_volume_config', 'CONFIGURATION'),
      icon: 'Options2Outline',
      view: AdvancedMailstoresConfig,
      canGoNext: (): any => true,
      clickDisabled: !isLocalBlockDevice && !!isAllocationToggle,
      CancelButton: (props: any) => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (props: any): any => (
        <Button
          {...props}
          label={t('label.volume_back_button', 'BACK')}
          icon={'ChevronLeftOutline'}
          iconPlacement="left"
          disable={props?.completeLoading}
          color="secondary"
        />
      ),
      NextButton: (props: any): any => (
        <Button
          {...props}
          label={t('label.volume_next_button', 'NEXT')}
          icon={'ChevronRightOutline'}
          iconPlacement="right"
          disable={props?.completeLoading}
        />
      ),
    },
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE VOLUME'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresCreate,
      canGoNext: (): any => true,
      clickDisabled: !isLocalBlockDevice && !!isAllocationToggle,
      CancelButton: (props: any) => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (props: any): any => (
        <Button
          {...props}
          label={t('label.volume_back_button', 'BACK')}
          icon={'ChevronLeftOutline'}
          iconPlacement="left"
          disable={props?.completeLoading}
          color="secondary"
        />
      ),
      NextButton: (props: any): any => (
        <Button
          {...props}
          label={t('label.volume_create', 'CREATE')}
          icon={'PowerOutline'}
          iconPlacement="right"
          disable={props?.completeLoading}
        />
      ),
    },
  ];

  const onComplete = useCallback(() => {
    if (isLocalBlockDevice) {
      CreateVolumeRequest({
        id: advancedVolumeDetail?.id,
        name: advancedVolumeDetail?.volumeName,
        rootpath: advancedVolumeDetail?.path,
        type: advancedVolumeDetail?.volumeMain,
        compressBlobs: advancedVolumeDetail?.isCompression ? 1 : 0,
        compressionThreshold: advancedVolumeDetail?.isCompression
          ? advancedVolumeDetail?.compressionThreshold
          : 0,
        isCurrent: advancedVolumeDetail?.isCurrent ? 1 : 0,
      });
      return;
    }

    const volumeType = volTypeList
      ?.filter((item) => item?.value === advancedVolumeDetail?.volumeMain)[0]
      ?.label?.toLowerCase();
    CreateAdvancedRequest({
      volumeName: advancedVolumeDetail?.volumeName,
      volumeType,
      storeType: advancedVolumeDetail?.unusedBucketType,
      bucketConfigurationId: advancedVolumeDetail?.bucketId,
      volumePrefix: advancedVolumeDetail?.prefix,
      centralized: advancedVolumeDetail?.centralized,
      isCurrent: advancedVolumeDetail?.isCurrent ? 1 : 0,
      useInfrequentAccess: advancedVolumeDetail?.useInfrequentAccess,
      useIntelligentTiering: advancedVolumeDetail?.useIntelligentTiering,
      infrequentAccessThreshold: advancedVolumeDetail?.infrequentAccessThreshold,
    });
  }, [
    CreateAdvancedRequest,
    CreateVolumeRequest,
    advancedVolumeDetail,
    isLocalBlockDevice,
    volTypeList,
  ]);

  return (
    <AdvancedVolumeContext.Provider value={{ advancedVolumeDetail, setAdvancedVolumeDetail }}>
      <HorizontalWizard
        steps={wizardSteps}
        Wrapper={WizardInSection}
        onComplete={onComplete}
        setToggleWizardSection={setToggleWizardExternal}
        externalData={volName}
      />
    </AdvancedVolumeContext.Provider>
  );
};

export default CreateMailstoresVolume;

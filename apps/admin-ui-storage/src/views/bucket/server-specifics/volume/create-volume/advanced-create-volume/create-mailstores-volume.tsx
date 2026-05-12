/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, type ButtonProps, HorizontalWizard, Section } from '@zextras/ui-components';
import { type FC, type ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AdvancedVolumeWizardDetail, CreateMailstoresVolumeProps, WizardButtonProps, WizardInSectionProps } from '../../../../../../../types';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { volumeTypeList } from '../../../../../utility/utils';
import AdvancedMailstoresConfig from './advanced-mailstores-config';
import AdvancedMailstoresCreate from './advanced-mailstores-create';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const WizardInSection: FC<WizardInSectionProps> = ({ wizard, wizardFooter, setToggleWizardSection, externalData }) => {
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

const CreateMailstoresVolume: FC<CreateMailstoresVolumeProps> = ({ setToggleWizardExternal, setToggleWizardLocal, volName, CreateAdvancedRequest }) => {
  const { t } = useTranslation();
  const volTypeList = useMemo(() => volumeTypeList(t), [t]);
  const isAllocationToggle = useBucketVolumeStore((state) => state?.isAllocationToggle);
  const [advancedVolumeDetail, setAdvancedVolumeDetail] = useState<AdvancedVolumeWizardDetail>({
    volumeName: '',
    volumeMain: 0,
    isCurrent: false,
    volumeAllocation: '',
    bucketName: '',
    unusedBucketType: '',
    bucketId: '',
    prefix: '',
    centralized: false,
    useInfrequentAccess: false,
    infrequentAccessThreshold: '',
    useIntelligentTiering: false,
  });

  const wizardSteps = [
    {
      name: 'volume',
      label: t('label.volume_definition', 'DEFINITION'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresDefinition,
      canGoNext: (): boolean => true,
      CancelButton: () => (
        <Button
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (): ReactElement | string => '',
      NextButton: (props: WizardButtonProps): ReactElement =>
        (props as { toggleNextBtn?: boolean }).toggleNextBtn ? (
          <Button
            label={t('label.volume_next_step_button', 'NEXT STEP')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
            onClick={(): void => setToggleWizardLocal(true)}
          />
        ) : (
          <Button
            label={t('label.volume_next_step_button', 'NEXT STEP')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
            onClick={props.onClick as ButtonProps['onClick']}
          />
        ),
    },
    {
      name: 'config',
      label: t('label.new_volume_config', 'CONFIGURATION'),
      icon: 'Options2Outline',
      view: AdvancedMailstoresConfig,
      canGoNext: (): boolean => true,
      clickDisabled: !!isAllocationToggle,
      CancelButton: () => (
        <Button
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (props: WizardButtonProps): ReactElement => (
        <Button
          label={t('label.volume_back_button', 'BACK')}
          icon={'ChevronLeftOutline'}
          iconPlacement="left"
          disabled={!(props as { completeLoading?: boolean })?.completeLoading}
          color="secondary"
          onClick={props.onClick as ButtonProps['onClick']}
        />
      ),
      NextButton: (props: WizardButtonProps): ReactElement => (
        <Button
          label={t('label.volume_next_button', 'NEXT')}
          icon={'ChevronRightOutline'}
          iconPlacement="right"
          disabled={!(props as { completeLoading?: boolean })?.completeLoading}
          onClick={props.onClick as ButtonProps['onClick']}
        />
      ),
    },
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE VOLUME'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresCreate,
      canGoNext: (): boolean => true,
      clickDisabled: !!isAllocationToggle,
      CancelButton: () => (
        <Button
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardExternal(false)}
        />
      ),
      PrevButton: (props: WizardButtonProps): ReactElement => (
        <Button
          label={t('label.volume_back_button', 'BACK')}
          icon={'ChevronLeftOutline'}
          iconPlacement="left"
          disabled={!(props as { completeLoading?: boolean })?.completeLoading}
          color="secondary"
          onClick={props.onClick as ButtonProps['onClick']}
        />
      ),
      NextButton: (props: WizardButtonProps): ReactElement => (
        <Button
          label={t('label.volume_create', 'CREATE')}
          icon={'PowerOutline'}
          iconPlacement="right"
          disabled={!(props as { completeLoading?: boolean })?.completeLoading}
          onClick={props.onClick as ButtonProps['onClick']}
        />
      ),
    },
  ];

  const onComplete = useCallback(() => {
    const volumeType = volTypeList
      ?.find((item) => item?.value === advancedVolumeDetail?.volumeMain)
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
    });
  }, [CreateAdvancedRequest, advancedVolumeDetail, volTypeList]);

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

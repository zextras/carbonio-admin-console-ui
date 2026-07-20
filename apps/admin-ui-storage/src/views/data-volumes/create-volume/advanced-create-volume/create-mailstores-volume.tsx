/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreateMailstoresVolumeProps, WizardInSectionProps } from '../../../../../types';
import { volumeTypeList } from '../../../utility/utils';
import { volumeCreateSchema } from '../schema';
import type { VolumeCreateFormValues } from '../types';
import { VolumeContext } from '../volume-context';
import { AdvancedMailstoresConfig } from './advanced-mailstores-config';
import { AdvancedMailstoresCreate } from './advanced-mailstores-create';
import { AdvancedMailstoresDefinition } from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import type { AdvancedVolumeFormValues, WizardButtonRenderProps, WizardStep } from './types';

type WizardActions = {
  onCancel: () => void;
  onNextLocal: () => void;
};

export const WizardActionsContext = createContext<WizardActions>({
  onCancel: () => {},
  onNextLocal: () => {},
});

const WizardInSection = ({
  wizard,
  wizardFooter,
  setToggleWizardSection,
  externalData,
}: WizardInSectionProps) => {
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

function WizardCancelButton() {
  const { t } = useTranslation();
  const { onCancel } = useContext(WizardActionsContext);
  return (
    <Button
      type="outlined"
      key="wizard-cancel"
      label={t('label.volume_cancel_button', 'CANCEL')}
      icon={'CloseOutline'}
      iconPlacement="right"
      color="secondary"
      onClick={onCancel}
    />
  );
}

function EmptyPrevButton() {
  return <></>;
}

function DefinitionNextButton({ onClick, toggleNextBtn }: WizardButtonRenderProps) {
  const { t } = useTranslation();
  const { onNextLocal } = useContext(WizardActionsContext);
  return toggleNextBtn ? (
    <Button
      onClick={onNextLocal}
      label={t('label.volume_next_step_button', 'NEXT STEP')}
      icon={'ChevronRightOutline'}
      iconPlacement="right"
    />
  ) : (
    <Button
      onClick={onClick}
      label={t('label.volume_next_step_button', 'NEXT STEP')}
      icon={'ChevronRightOutline'}
      iconPlacement="right"
    />
  );
}

function WizardPrevButton({ onClick, completeLoading }: WizardButtonRenderProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_back_button', 'BACK')}
      icon={'ChevronLeftOutline'}
      iconPlacement="left"
      disabled={completeLoading}
      color="secondary"
    />
  );
}

function ConfigNextButton({ onClick, completeLoading }: WizardButtonRenderProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_next_button', 'NEXT')}
      icon={'ChevronRightOutline'}
      iconPlacement="right"
      disabled={completeLoading}
    />
  );
}

function CreateNextButton({ onClick, completeLoading }: WizardButtonRenderProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_create', 'CREATE')}
      icon={'PowerOutline'}
      iconPlacement="right"
      disabled={completeLoading}
    />
  );
}

export const CreateMailstoresVolume = ({
  setToggleWizardExternal,
  setToggleWizardLocal,
  volName,
  CreateAdvancedRequest,
}: CreateMailstoresVolumeProps) => {
  const { t } = useTranslation();
  const volTypeList = volumeTypeList(t);
  const [isAllocationToggle, setIsAllocationToggle] = useState(false);

  const volumeForm = useForm({
    defaultValues: {
      id: '',
      volumeName: '',
      volumeMain: 1,
      path: '',
      isCurrent: false,
      isCompression: false,
      compressionThreshold: '',
      volumeAllocation: 0,
    } as VolumeCreateFormValues,
    validators: {
      onChange: volumeCreateSchema,
    },
    onSubmit: async () => {},
  });

  const form = useForm({
    defaultValues: {
      volumeName: '',
      volumeMain: 0,
      isCurrent: false,
      volumeAllocation: '',
      bucketName: '',
      unusedBucketType: '',
      tieringSupported: false,
      bucketId: '',
      prefix: '',
      centralized: false,
      useInfrequentAccess: false,
      infrequentAccessThreshold: '',
      useIntelligentTiering: false,
    } as AdvancedVolumeFormValues,
    onSubmit: async () => {},
  });

  const wizardSteps: Array<WizardStep> = [
    {
      name: 'volume',
      label: t('label.volume_definition', 'DEFINITION'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresDefinition,
      canGoNext: () => true,
      CancelButton: WizardCancelButton,
      PrevButton: EmptyPrevButton,
      NextButton: DefinitionNextButton,
    },
    {
      name: 'config',
      label: t('label.new_volume_config', 'CONFIGURATION'),
      icon: 'Options2Outline',
      view: AdvancedMailstoresConfig,
      canGoNext: () => true,
      clickDisabled: !!isAllocationToggle,
      CancelButton: WizardCancelButton,
      PrevButton: WizardPrevButton,
      NextButton: ConfigNextButton,
    },
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE VOLUME'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresCreate,
      canGoNext: () => true,
      clickDisabled: !!isAllocationToggle,
      CancelButton: WizardCancelButton,
      PrevButton: WizardPrevButton,
      NextButton: CreateNextButton,
    },
  ];

  const onComplete = () => {
    const v = form.state.values;
    const volumeType = volTypeList
      ?.find((item) => item?.value === v.volumeMain)
      ?.label?.toLowerCase();
    CreateAdvancedRequest({
      volumeName: v.volumeName,
      volumeType,
      storeType: v.unusedBucketType,
      bucketConfigurationId: v.bucketId,
      volumePrefix: v.prefix,
      centralized: v.centralized,
      isCurrent: v.isCurrent ? 1 : 0,
      useInfrequentAccess: v.useInfrequentAccess,
      infrequentAccessThreshold: v.infrequentAccessThreshold,
      useIntelligentTiering: v.useIntelligentTiering,
    });
  };

  return (
    <WizardActionsContext.Provider
      value={{
        onCancel: () => setToggleWizardExternal(false),
        onNextLocal: () => setToggleWizardLocal(true),
      }}
    >
      <AdvancedVolumeContext.Provider value={{ form, isAllocationToggle, setIsAllocationToggle }}>
        <VolumeContext.Provider value={{ form: volumeForm }}>
          <HorizontalWizard
            steps={wizardSteps}
            Wrapper={WizardInSection}
            onComplete={onComplete}
            setToggleWizardSection={setToggleWizardExternal}
            externalData={volName}
          />
        </VolumeContext.Provider>
      </AdvancedVolumeContext.Provider>
    </WizardActionsContext.Provider>
  );
};

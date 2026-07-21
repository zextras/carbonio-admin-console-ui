/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Button, HorizontalWizardV2, Section } from '@zextras/ui-components';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreateMailstoresVolumeProps, WizardInSectionProps } from '../../../../../types';
import { LOCAL_TYPE_VALUE } from '../../../../constants';
import { volumeTypeList } from '../../../utility/utils';
import { volumeCreateSchema } from '../schema';
import type { VolumeCreateFormValues } from '../types';
import { VolumeContext } from '../volume-context';
import { AdvancedMailstoresConfig } from './advanced-mailstores-config';
import { AdvancedMailstoresCreate } from './advanced-mailstores-create';
import { AdvancedMailstoresDefinition } from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import type { AdvancedVolumeFormValues } from './types';

type WizardActions = {
  onCancel: () => void;
};

export const WizardActionsContext = createContext<WizardActions>({
  onCancel: () => {},
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

type WizardButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

type PrevButtonProps = {
  readonly onClick: () => void;
};

type NextButtonProps = {
  readonly onClick: () => void;
  readonly disabled?: boolean;
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

function DefinitionNextButton({ onClick, disabled }: WizardButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      label={t('label.volume_next_step_button', 'NEXT STEP')}
      icon={'ChevronRightOutline'}
      iconPlacement="right"
    />
  );
}

function WizardPrevButton({ onClick }: PrevButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_back_button', 'BACK')}
      icon={'ChevronLeftOutline'}
      iconPlacement="left"
      color="secondary"
    />
  );
}

function ConfigNextButton({ onClick, disabled }: NextButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_next_button', 'NEXT')}
      icon={'ChevronRightOutline'}
      iconPlacement="right"
      disabled={disabled}
    />
  );
}

function CreateNextButton({ onClick, disabled }: NextButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      label={t('label.volume_create', 'CREATE')}
      icon={'PowerOutline'}
      iconPlacement="right"
      disabled={disabled}
    />
  );
}

export const CreateMailstoresVolume = ({
  setToggleWizardExternal,
  volName,
  CreateAdvancedRequest,
  CreateVolumeRequest,
}: CreateMailstoresVolumeProps) => {
  const { t } = useTranslation();
  const volTypeList = volumeTypeList(t);

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
      path: '',
      isCompression: false,
      compressionThreshold: '',
    } as AdvancedVolumeFormValues,
    onSubmit: async () => {},
  });

  const step1VolumeName = useSelector(volumeForm.store, (s) => s.values.volumeName);
  const basicVolumeAllocation = useSelector(volumeForm.store, (s) => s.values.volumeAllocation);
  const unusedBucketType = useSelector(form.store, (s) => s.values.unusedBucketType);
  const volumeMain = useSelector(form.store, (s) => s.values.volumeMain);
  const advVolumeName = useSelector(form.store, (s) => s.values.volumeName);
  const advVolumeAllocation = useSelector(form.store, (s) => s.values.volumeAllocation);
  const advPath = useSelector(form.store, (s) => s.values.path);

  const isLocalBlockDevice = basicVolumeAllocation === LOCAL_TYPE_VALUE;

  const volumeType =
    volTypeList?.find((item) => item?.value === volumeMain)?.label ?? '';

  const step1IsComplete =
    !!step1VolumeName &&
    !!basicVolumeAllocation &&
    (isLocalBlockDevice || !!unusedBucketType);
  const step2IsComplete = isLocalBlockDevice ? !!(volumeMain && advPath) : volumeMain !== 0;
  const step3IsComplete = isLocalBlockDevice
    ? !!(advVolumeAllocation && advVolumeName && volumeType && advPath)
    : !!(advVolumeAllocation && advVolumeName && unusedBucketType && volumeType);
  const isAllocationToggle = !step1IsComplete || volumeMain === 0;

  const wizardSteps = [
    {
      name: 'volume',
      label: t('label.volume_definition', 'DEFINITION'),
      icon: 'CubeOutline',
      view: AdvancedMailstoresDefinition,
      canGoNext: () => true,
      isComplete: step1IsComplete,
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
      clickDisabled: !isLocalBlockDevice && isAllocationToggle,
      isComplete: step2IsComplete,
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
      clickDisabled: !isLocalBlockDevice && isAllocationToggle,
      isComplete: step3IsComplete,
      CancelButton: WizardCancelButton,
      PrevButton: WizardPrevButton,
      NextButton: CreateNextButton,
    },
  ];

  const onComplete = () => {
    const v = form.state.values;
    if (isLocalBlockDevice) {
      CreateVolumeRequest({
        name: v.volumeName,
        rootpath: v.path,
        type: v.volumeMain,
        compressBlobs: v.isCompression ? '1' : '0',
        compressionThreshold: v.isCompression ? v.compressionThreshold : '',
        isCurrent: v.isCurrent ? 1 : 0,
      });
      return;
    }

    const volType = volTypeList
      ?.find((item) => item?.value === v.volumeMain)
      ?.label?.toLowerCase();
    CreateAdvancedRequest({
      volumeName: v.volumeName,
      volumeType: volType,
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
      }}
    >
      <AdvancedVolumeContext.Provider value={{ form }}>
        <VolumeContext.Provider value={{ form: volumeForm }}>
          <HorizontalWizardV2
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

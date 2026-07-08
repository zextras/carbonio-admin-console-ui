/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { type FC, type ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { volumeTypeList } from '../../../../../utility/utils';
import AdvancedMailstoresConfig from './advanced-mailstores-config';
import AdvancedMailstoresCreate from './advanced-mailstores-create';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import type { AdvancedVolumeFormValues } from './types';

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
  setToggleWizardExternal: any;
  setToggleWizardLocal: any;
  volName: any;
  CreateAdvancedRequest: any;
}> = ({ setToggleWizardExternal, setToggleWizardLocal, volName, CreateAdvancedRequest }) => {
  const { t } = useTranslation();
  const volTypeList = useMemo(() => volumeTypeList(t), [t]);
  const [isAllocationToggle, setIsAllocationToggle] = useState(false);

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
      NextButton: (props: any): ReactElement =>
        !props.toggleNextBtn ? (
          <Button
            {...props}
            label={t('label.volume_next_step_button', 'NEXT STEP')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
          />
        ) : (
          <Button
            {...props}
            label={t('label.volume_next_step_button', 'NEXT STEP')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
            onClick={(): void => setToggleWizardLocal(true)}
          />
        ),
    },
    {
      name: 'config',
      label: t('label.new_volume_config', 'CONFIGURATION'),
      icon: 'Options2Outline',
      view: AdvancedMailstoresConfig,
      canGoNext: (): any => true,
      clickDisabled: !!isAllocationToggle,
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
      clickDisabled: !!isAllocationToggle,
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
    const v = form.state.values;
    const volumeType = volTypeList
      ?.filter((item) => item?.value === v.volumeMain)[0]
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
      useIntelligentTiering: v.useIntelligentTiering,
    });
  }, [CreateAdvancedRequest, form, volTypeList]);

  return (
    <AdvancedVolumeContext.Provider value={{ form, isAllocationToggle, setIsAllocationToggle }}>
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

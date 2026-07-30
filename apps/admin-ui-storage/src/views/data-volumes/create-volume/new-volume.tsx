/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Button, HorizontalWizardV2, Section } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type ComponentProps, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { MailstoresCreate } from './mailstores-create';
import { volumeCreateSchema } from './schema';
import type { VolumeCreateFormValues } from './types';
import { VolumeContext } from './volume-context';

type WizardStepButtonProps = ComponentProps<typeof Button>;

type NewVolumeActions = {
	isAdvanced: boolean;
	onCancel: () => void;
	onPrev: () => void;
};

const NewVolumeActionsContext = createContext<NewVolumeActions>({
	isAdvanced: false,
	onCancel: () => {},
	onPrev: () => {},
});

function NewVolumeCancelButton(props: WizardStepButtonProps) {
	const { t } = useTranslation();
	const { onCancel } = useContext(NewVolumeActionsContext);
	return (
		<Button
			{...props}
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

function NewVolumePrevButton() {
	const { t } = useTranslation();
	const { isAdvanced, onPrev } = useContext(NewVolumeActionsContext);
	if (!isAdvanced) {
		return <></>;
	}
	return (
		<Button
			label={t('label.volume_back_button', 'BACK')}
			icon={'ChevronLeftOutline'}
			iconPlacement="left"
			color="secondary"
			onClick={onPrev}
		/>
	);
}

function NewVolumeNextButton(props: WizardStepButtonProps) {
	const { t } = useTranslation();
	const { isAdvanced } = useContext(NewVolumeActionsContext);
	return isAdvanced ? (
		<Button
			{...props}
			label={t('label.volume_create', 'CREATE')}
			icon={'PowerOutline'}
			iconPlacement="right"
		/>
	) : (
		<Button
			{...props}
			label={t('label.volume_create', 'CREATE')}
			icon={'ChevronRightOutline'}
			iconPlacement="right"
		/>
	);
}

function WizardInSection({ wizard, wizardFooter, setToggleWizardSection, externalData }: any) {
	const { t } = useTranslation();
	return (
		<Section
			title={t(
				'volume.serverName_volumes_create_mailstores_volume',
				'{{serverName}} | Create Mailstores Volume',
				{
					serverName: externalData,
				},
			)}
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
}

export function NewVolume({
  setToggleWizardLocal,
  setToggleWizardExternal,
  volName,
  CreateVolumeRequest,
}: Readonly<{
  setToggleWizardLocal: any;
  setToggleWizardExternal: any;
  volName: any;
  CreateVolumeRequest: any;
}>) {
  const { t } = useTranslation();
  const form = useForm({
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

  const isAdvanced = useIsAdvanced();
  const isFormValid = useSelector(form.store, (s) => s.isValid);
  const volumeName = useSelector(form.store, (s) => s.values.volumeName);
  const path = useSelector(form.store, (s) => s.values.path);
  const isComplete = !!volumeName && !!path && isFormValid;

  const wizardSteps = [
    {
      name: 'create',
      label: t('label.create', 'CREATE'),
      icon: 'CubeOutline',
      view: MailstoresCreate,
      isComplete,
      CancelButton: NewVolumeCancelButton,
      PrevButton: NewVolumePrevButton,
      NextButton: NewVolumeNextButton,
    },
  ];

  const onComplete = () => {
    const values = form.state.values;
    CreateVolumeRequest({
      id: values.id,
      name: values.volumeName,
      rootpath: values.path,
      type: values.volumeMain,
      compressBlobs: values.isCompression ? 1 : 0,
      compressionThreshold: values.isCompression ? values.compressionThreshold : 0,
      isCurrent: values.isCurrent ? 1 : 0,
    });
  };

  return (
    <>
      <NewVolumeActionsContext.Provider
        value={{
          isAdvanced,
          onCancel: (): void => setToggleWizardLocal(false),
          onPrev: (): void => {
            setToggleWizardLocal(false);
            setToggleWizardExternal(true);
          },
        }}
      >
        <VolumeContext.Provider value={{ form }}>
          <HorizontalWizardV2
            steps={wizardSteps}
            Wrapper={WizardInSection}
            onComplete={onComplete}
            setToggleWizardSection={setToggleWizardLocal}
            externalData={volName}
          />
        </VolumeContext.Provider>
      </NewVolumeActionsContext.Provider>
    </>
  );
}


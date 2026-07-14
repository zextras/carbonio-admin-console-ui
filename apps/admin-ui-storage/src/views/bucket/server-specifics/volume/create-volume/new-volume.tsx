/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type ComponentProps, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { MailstoresCreate } from './mailstores-create';
import { VolumeContext } from './volume-context';

type WizardStepButtonProps = ComponentProps<typeof Button> & {
	completeLoading?: boolean;
};

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

function NewVolumePrevButton({ completeLoading }: WizardStepButtonProps) {
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
			disabled={completeLoading}
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
			disabled={props?.completeLoading}
		/>
	) : (
		<Button
			{...props}
			label={t('label.volume_create', 'CREATE')}
			icon={'ChevronRightOutline'}
			iconPlacement="right"
			disabled={props?.completeLoading}
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
  isLoading,
}: {
  setToggleWizardLocal: any;
  setToggleWizardExternal: any;
  volName: any;
  CreateVolumeRequest: any;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { form } = useContext(VolumeContext);

  const isAdvanced = useIsAdvanced();

  const wizardSteps = [
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE'),
      icon: 'CubeOutline',
      view: MailstoresCreate,
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
      {isLoading && <ds-spinner></ds-spinner>}

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
        <HorizontalWizard
          steps={wizardSteps}
          Wrapper={WizardInSection}
          onComplete={onComplete}
          setToggleWizardSection={setToggleWizardLocal}
          externalData={volName}
        />
      </NewVolumeActionsContext.Provider>
    </>
  );
}


/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection, externalData }) => {
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
};

const NewVolume: FC<{
  setToggleWizardLocal: any;
  setToggleWizardExternal: any;
  volName: any;
  CreateVolumeRequest: any;
  isLoading: boolean;
}> = ({
  setToggleWizardLocal,
  setToggleWizardExternal,
  volName,
  CreateVolumeRequest,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { form } = useContext(VolumeContext);

  const isAdvanced = useIsAdvanced();

  const wizardSteps = [
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE'),
      icon: 'CubeOutline',
      view: MailstoresCreate,
      CancelButton: (props: any) => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.volume_cancel_button', 'CANCEL')}
          icon={'CloseOutline'}
          iconPlacement="right"
          color="secondary"
          onClick={(): void => setToggleWizardLocal(false)}
        />
      ),
      PrevButton: (props: any): any =>
        isAdvanced ? (
          <Button
            {...props}
            label={t('label.volume_back_button', 'BACK')}
            icon={'ChevronLeftOutline'}
            iconPlacement="left"
            disable={props?.completeLoading}
            color="secondary"
            onClick={(): void => {
              setToggleWizardLocal(false);
              setToggleWizardExternal(true);
            }}
          />
        ) : (
          <></>
        ),
      NextButton: (props: any) =>
        isAdvanced ? (
          <Button
            {...props}
            label={t('label.volume_create', 'CREATE')}
            icon={'PowerOutline'}
            iconPlacement="right"
            disable={props?.completeLoading}
          />
        ) : (
          <Button
            {...props}
            label={t('label.volume_create', 'CREATE')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
            disable={props?.completeLoading}
          />
        ),
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

      <HorizontalWizard
        steps={wizardSteps}
        Wrapper={WizardInSection}
        onComplete={onComplete}
        setToggleWizardSection={setToggleWizardLocal}
        externalData={volName}
      />
    </>
  );
};

export default NewVolume;

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, HorizontalWizard, Section } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { type FC, type ReactElement, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import type { NewVolumeProps, WizardButtonProps, WizardInSectionProps } from '../../../../../../types';
import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';

const WizardInSection: FC<WizardInSectionProps> = ({ wizard, wizardFooter, setToggleWizardSection, externalData }) => {
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

const NewVolume: FC<NewVolumeProps> = ({
  setToggleWizardLocal,
  setToggleWizardExternal,
  volName,
  CreateVolumeRequest,
  isLoading,
}) => {
  const { t } = useTranslation();
  const context = useContext(VolumeContext);

  const isAdvanced = useIsAdvanced();
  const { volumeDetail } = context;

  const wizardSteps = [
    {
      name: 'create',
      label: t('label.new_volume_create', 'CREATE'),
      icon: 'CubeOutline',
      view: MailstoresCreate,
      CancelButton: (props: WizardButtonProps) => (
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
      PrevButton: (props: WizardButtonProps): ReactElement =>
        isAdvanced ? (
          <Button
            {...props}
            label={t('label.volume_back_button', 'BACK')}
            icon={'ChevronLeftOutline'}
            iconPlacement="left"
            disable={(props as { completeLoading?: boolean })?.completeLoading}
            color="secondary"
            onClick={(): void => {
              setToggleWizardLocal(false);
              setToggleWizardExternal(true);
            }}
          />
        ) : (
          <></>
        ),
      NextButton: (props: WizardButtonProps) =>
        isAdvanced ? (
          <Button
            {...props}
            label={t('label.volume_create', 'CREATE')}
            icon={'PowerOutline'}
            iconPlacement="right"
            disable={(props as { completeLoading?: boolean })?.completeLoading}
          />
        ) : (
          <Button
            {...props}
            label={t('label.volume_create', 'CREATE')}
            icon={'ChevronRightOutline'}
            iconPlacement="right"
            disable={(props as { completeLoading?: boolean })?.completeLoading}
          />
        ),
    },
  ];

  const onComplete = useCallback(() => {
    CreateVolumeRequest({
      id: volumeDetail?.id,
      name: volumeDetail?.volumeName,
      rootpath: volumeDetail?.path,
      type: volumeDetail?.volumeMain,
      compressBlobs: volumeDetail?.isCompression ? 1 : 0,
      compressionThreshold: volumeDetail?.isCompression ? volumeDetail?.compressionThreshold : 0,
      isCurrent: volumeDetail?.isCurrent ? 1 : 0,
    });
  }, [volumeDetail, CreateVolumeRequest]);

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

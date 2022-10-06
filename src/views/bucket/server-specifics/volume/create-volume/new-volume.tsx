/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section';
import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

const WizardInSection: FC<any> = ({
	wizard,
	wizardFooter,
	setToggleWizardSection,
	externalData
}) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t(
				'volume.serverName_volumes_create_mailstores_volume',
				'{{serverName}} | Create Mailstores Volume',
				{
					serverName: externalData
				}
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
	setDetailsVolume: any;
	volName: any;
	setCreateMailstoresVolumeData: any;
	CreateVolumeRequest: any;
}> = ({
	setToggleWizardLocal,
	setToggleWizardExternal,
	setDetailsVolume,
	volName,
	setCreateMailstoresVolumeData,
	CreateVolumeRequest
}) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const context = useContext(VolumeContext);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const { volumeDetail, setVolumeDetail } = context;

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
						disable={props.completeLoading}
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
						disable={props.completeLoading}
					/>
				) : (
					<Button
						{...props}
						label={t('label.volume_create', 'CREATE')}
						icon={'ChevronRightOutline'}
						iconPlacement="right"
						disable={props.completeLoading}
					/>
				)
		}
	];

	const onComplete = useCallback(
		(data) => {
			CreateVolumeRequest({
				id: volumeDetail?.id,
				name: volumeDetail?.volumeName,
				rootpath: volumeDetail?.path,
				type: volumeDetail?.volumeMain,
				compressBlobs: volumeDetail?.isCompression ? 1 : 0,
				compressionThreshold: volumeDetail?.compressionThreshold,
				isCurrent: volumeDetail?.isCurrent ? 1 : 0
			});
			setCreateMailstoresVolumeData(volumeDetail);
		},
		[volumeDetail, CreateVolumeRequest, setCreateMailstoresVolumeData]
	);

	return (
		<HorizontalWizard
			steps={wizardSteps}
			Wrapper={WizardInSection}
			onChange={setWizardData}
			onComplete={onComplete}
			setToggleWizardSection={setToggleWizardLocal}
			externalData={volName}
		/>
	);
};

export default NewVolume;

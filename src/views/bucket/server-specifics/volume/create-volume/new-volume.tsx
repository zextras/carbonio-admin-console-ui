/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useState } from 'react';
import { Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section';
import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';

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

interface VolumeDetailObj {
	id: string;
	volumeName: string;
	volumeMain: number;
	path: string;
	isCurrent: boolean;
	isCompression: boolean;
	compressionThreshold: number;
}

const NewVolume: FC<{
	setToggleWizardSection: any;
	setDetailsVolume: any;
	volName: any;
	setCreateMailstoresVolumeData: any;
	CreateVolumeRequest: any;
}> = ({
	setToggleWizardSection,
	setDetailsVolume,
	volName,
	setCreateMailstoresVolumeData,
	CreateVolumeRequest
}) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const [volumeDetail, setVolumeDetail] = useState<VolumeDetailObj>({
		id: '',
		volumeName: '',
		volumeMain: 0,
		path: '',
		isCurrent: false,
		isCompression: false,
		compressionThreshold: 0
	});

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
					onClick={(): void => setToggleWizardSection(false)}
				/>
			),
			PrevButton: (props: any): ReactElement => <></>,
			NextButton: (props: any) => (
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
		<VolumeContext.Provider value={{ volumeDetail, setVolumeDetail }}>
			<HorizontalWizard
				steps={wizardSteps}
				Wrapper={WizardInSection}
				onChange={setWizardData}
				onComplete={onComplete}
				setToggleWizardSection={setToggleWizardSection}
				externalData={volName}
			/>
		</VolumeContext.Provider>
	);
};

export default NewVolume;

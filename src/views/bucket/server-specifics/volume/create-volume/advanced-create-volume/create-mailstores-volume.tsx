/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useState } from 'react';
import { Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { HorizontalWizard } from '../../../../../app/component/hwizard';
import { Section } from '../../../../../app/component/section';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import AdvancedMailstoresConfig from './advanced-mailstores-config';
import AdvancedMailstoresCreate from './advanced-mailstores-create';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';

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

const CreateMailstoresVolume: FC<{
	setToggleWizardExternal: any;
	setToggleWizardLocal: any;
	setDetailsVolume: any;
	volName: any;
	setCreateMailstoresVolumeData: any;
	CreateVolumeRequest: any;
}> = ({
	setToggleWizardExternal,
	setToggleWizardLocal,
	setDetailsVolume,
	volName,
	setCreateMailstoresVolumeData,
	CreateVolumeRequest
}) => {
	const { t } = useTranslation();
	const isAllocationToggle = useBucketVolumeStore((state) => state.isAllocationToggle);
	const [wizardData, setWizardData] = useState();
	const [advancedVolumeDetail, setAdvancedVolumeDetail] = useState<VolumeDetailObj>({
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
			PrevButton: (props: any): any => '',
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
				)
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
					disable={props.completeLoading}
					color="secondary"
				/>
			),
			NextButton: (props: any): any => (
				<Button
					{...props}
					label={t('label.volume_next_button', 'NEXT')}
					icon={'ChevronRightOutline'}
					iconPlacement="right"
					disable={props.completeLoading}
				/>
			)
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
					disable={props.completeLoading}
					color="secondary"
				/>
			),
			NextButton: (props: any): any => (
				<Button
					{...props}
					label={t('label.volume_create', 'CREATE')}
					icon={'PowerOutline'}
					iconPlacement="right"
					disable={props.completeLoading}
				/>
			)
		}
	];

	const onComplete = useCallback(
		(data) => {
			setCreateMailstoresVolumeData(data.steps.connection);
			setToggleWizardExternal(false);
			setDetailsVolume(false);
		},
		[setToggleWizardExternal, setDetailsVolume, setCreateMailstoresVolumeData]
	);

	return (
		<AdvancedVolumeContext.Provider value={{ advancedVolumeDetail, setAdvancedVolumeDetail }}>
			<HorizontalWizard
				steps={wizardSteps}
				Wrapper={WizardInSection}
				onChange={setWizardData}
				onComplete={onComplete}
				setToggleWizardSection={setToggleWizardExternal}
				externalData={volName}
			/>
		</AdvancedVolumeContext.Provider>
	);
};

export default CreateMailstoresVolume;

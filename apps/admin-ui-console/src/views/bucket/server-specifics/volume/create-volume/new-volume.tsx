/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvancedSupported } from '@zextras/admin-ui-bootstrap';
import { Button, Container } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section-component';
import OverlayDivision from '../../../../components/overlayDivision';

import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 39.4rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

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
	volName: any;
	CreateVolumeRequest: any;
	isLoading: boolean;
}> = ({
	setToggleWizardLocal,
	setToggleWizardExternal,
	volName,
	CreateVolumeRequest,
	isLoading
}) => {
	const { t } = useTranslation();
	const context = useContext(VolumeContext);

	const isAdvanced = useIsAdvancedSupported();
	const { volumeDetail } = context;

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
				)
		}
	];

	const onComplete = useCallback(() => {
		CreateVolumeRequest({
			id: volumeDetail?.id,
			name: volumeDetail?.volumeName,
			rootpath: volumeDetail?.path,
			type: volumeDetail?.volumeMain,
			compressBlobs: volumeDetail?.isCompression ? 1 : 0,
			compressionThreshold: volumeDetail?.isCompression ? volumeDetail?.compressionThreshold : 0,
			isCurrent: volumeDetail?.isCurrent ? 1 : 0
		});
	}, [volumeDetail, CreateVolumeRequest]);

	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
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

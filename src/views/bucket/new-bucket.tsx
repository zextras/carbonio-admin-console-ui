/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@zextras/carbonio-design-system';
import { HorizontalWizard } from '../app/component/hwizard';
import Connection from './connection';
import { Section } from '../app/component/section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('buckets.new.bucket_connection', 'Bucket Connection')}
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

// eslint-disable-next-line no-empty-pattern
const NewBucket: FC<{
	setToggleWizardSection: any;
	setDetailsBucket: any;
	// staticData: any;
	setConnectionData: any;
}> = ({
	setToggleWizardSection,
	setDetailsBucket,
	// staticData,
	setConnectionData
}) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();

	const wizardSteps = [
		{
			name: 'connection',
			label: t('new_bucket_connection', 'CONNECTION'),
			icon: 'Link2Outline',
			view: Connection,
			canGoNext: (): any => true,
			CancelButton: (props: any) => (
				<Button
					{...props}
					type="outlined"
					key="wizard-cancel"
					label={'NEED HELP?'}
					color="secondary"
					onClick={(): void => setToggleWizardSection(true)}
				/>
			),
			PrevButton: (props: any): any => (
				<>
					{!props.completeLoading ? (
						<Button
							{...props}
							key="wizard-cancel"
							label={'CANCEL'}
							color="secondary"
							icon="ChevronLeftOutline"
							iconPlacement="left"
							disable={!!props.disabled}
							onClick={(): void => setToggleWizardSection(false)}
						/>
					) : (
						''
					)}
				</>
			),
			NextButton: (props: any): any => (
				<Button
					{...props}
					label={!props.completeLoading ? 'VIEW DETAILS' : ' Done'}
					style={{ marginLeft: '16px' }}
					onClick={(): void => {
						setToggleWizardSection(false);
					}}
				/>
			)
		}
	];

	const onComplete = useCallback(
		(data) => {
			setConnectionData(data.steps.connection);
			setToggleWizardSection(false);
			setDetailsBucket(false);
		},
		[setToggleWizardSection, setDetailsBucket, setConnectionData]
	);

	return (
		<HorizontalWizard
			steps={wizardSteps}
			Wrapper={WizardInSection}
			onChange={setWizardData}
			onComplete={onComplete}
			setToggleWizardSection={setToggleWizardSection}
			// staticData={staticData}
		/>
	);
};
export default NewBucket;

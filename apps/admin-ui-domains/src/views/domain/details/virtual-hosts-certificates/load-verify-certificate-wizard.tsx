/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { HorizontalWizard } from '../../../app/component/hwizard';
import { Section } from '../../../app/component/section-component';

import LoadAndVerifyCert from './load-verify-certificate';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('virtual_hosts.load_and_verify_certificate', 'Load and Verify Certificate')}
			padding={{ all: '0' }}
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

const LoadVerifyCertificateWizard: FC<{
	setToggleWizard: any;
	setAlertToggle: any;
}> = ({ setToggleWizard, setAlertToggle }) => {
	const { t } = useTranslation();

	const wizardSteps = [
		{
			name: 'load-certificate',
			label: t('virtual_hosts.load_certificate', 'LOAD CERTIFICATE'),
			icon: 'CubeOutline',
			view: LoadAndVerifyCert,
			canGoNext: (): any => true,
			CancelButton: (props: any): ReactElement => <></>,
			PrevButton: (props: any): ReactElement => <></>,
			NextButton: (props: any): ReactElement => <></>
		}
	];

	return (
		<HorizontalWizard
			steps={wizardSteps}
			Wrapper={WizardInSection}
			setToggleWizardSection={setToggleWizard}
			externalData={setAlertToggle}
		/>
	);
};

export default LoadVerifyCertificateWizard;

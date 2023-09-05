/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Button, Padding } from '@zextras/carbonio-design-system';
import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { Section } from '../../../app/component/section';
import { HSMContext } from '../hsm-context/hsm-context';
import HSMcreatePolicy from './hsm-create-policy';
import HSMpolicySettings from './hsm-policy-settings';

interface hsmDetailObj {
	allVolumes: Array<any>;
	isAllEnabled: boolean;
	isMessageEnabled: boolean;
	isEventEnabled: boolean;
	isContactEnabled: boolean;
	isDocumentEnabled: boolean;
	policyCriteria: Array<any>;
	sourceVolume: Array<any>;
	destinationVolume: Array<any>;
}

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	const { operation, server }: { operation: string; server: string } = useParams();

	return (
		<Section
			title={`${server} | ${t('hsm.create_new_policy', 'Create New Policy')}`}
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
const CreateHsmPolicy: FC<{
	setShowCreateHsmPolicyView: any;
	volumeList: Array<any>;
	createHSMpolicy: any;
	runCustomHSMpolicy: any;
}> = ({ setShowCreateHsmPolicyView, volumeList, createHSMpolicy, runCustomHSMpolicy }) => {
	const [wizardData, setWizardData] = useState();
	const [hsmDetail, setHsmDetail] = useState<hsmDetailObj>({
		allVolumes: volumeList,
		isAllEnabled: true,
		isMessageEnabled: true,
		isEventEnabled: true,
		isContactEnabled: true,
		isDocumentEnabled: true,
		policyCriteria: [],
		sourceVolume: [],
		destinationVolume: []
	});
	const { t } = useTranslation();

	const onCreate = useCallback(() => {
		createHSMpolicy(hsmDetail);
	}, [createHSMpolicy, hsmDetail]);

	const onRunCustomPolicy = useCallback(() => {
		runCustomHSMpolicy(hsmDetail);
	}, [runCustomHSMpolicy, hsmDetail]);

	const standardHsmPolicyWizardStep = useMemo(
		() => [
			{
				name: 'policy-settings',
				label: t('hsm.policy_settings', 'Policy Settings'),
				icon: 'OptionsOutline',
				view: HSMpolicySettings,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
					/>
				),
				PrevButton: () => null,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'hsm-create-policy',
				label: t('hsm.create_policy', 'Create Policy'),
				icon: 'PowerOutline',
				view: HSMcreatePolicy,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<>
						<Padding right="medium">
							<Button
								{...props}
								label={t('label.run_only', 'RUN ONLY (SKIP CREATE)')}
								iconPlacement="left"
								onClick={onRunCustomPolicy}
							/>
						</Padding>
						<Button
							{...props}
							label={t('label.create', 'CREATE')}
							icon="PowerOutline"
							iconPlacement="right"
							onClick={onCreate}
						/>
					</>
				)
			}
		],
		[t, onRunCustomPolicy, onCreate]
	);

	const onComplete = useCallback(() => {
		setShowCreateHsmPolicyView(false);
	}, [setShowCreateHsmPolicyView]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '0rem',
				right: '0rem',
				bottom: '0rem',
				transition: 'left 0.2s ease-in-out',
				maxHeight: '100%',
				overflow: 'hidden',
				inset: '0rem'
			}}
		>
			<HSMContext.Provider value={{ hsmDetail, setHsmDetail }}>
				<HorizontalWizard
					steps={standardHsmPolicyWizardStep}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowCreateHsmPolicyView}
				/>
			</HSMContext.Provider>
		</Container>
	);
};
export default CreateHsmPolicy;

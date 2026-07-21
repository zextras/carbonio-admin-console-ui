/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef } from 'react';

import { useWizardV2, type WizardStepV2 } from '../../hooks/use-wizard-v2';
import { HorizontalWizardLayoutV2 } from './horizontal-wizard-layout-v2';

type Props = {
	data?: any;
	defaultData?: any;
	steps: Array<WizardStepV2>;
	onChange?: any;
	onComplete: (data: unknown) => void | Promise<void>;
	nextI18nLabel?: string;
	backI18nLabel?: string;
	cancelI18nLabel?: string;
	Wrapper: any;
	title?: string;
	currentStep?: any;
	currentStepIndex?: any;
	setToggleWizardSection: (value: boolean) => void;
	externalData: any;
	activeStep?: any;
};

const WizardV2: React.FC<Props> = ({
	data,
	defaultData,
	steps,
	onChange,
	onComplete,
	nextI18nLabel,
	backI18nLabel,
	cancelI18nLabel,
	Wrapper,
	title,
	setToggleWizardSection,
	externalData,
	activeStep,
}) => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLDivElement>(null);
	const useWizardAnswer = useWizardV2({
		data,
		defaultData,
		steps,
		onChange,
		onComplete,
		sectionRef,
		activeRef,
		title,
		activeStep,
	});
	return (
		<HorizontalWizardLayoutV2
			Wrapper={Wrapper}
			nextI18nLabel={nextI18nLabel}
			backI18nLabel={backI18nLabel}
			cancelI18nLabel={cancelI18nLabel}
			sectionRef={sectionRef}
			activeRef={activeRef}
			setToggleWizardSection={setToggleWizardSection}
			{...useWizardAnswer}
			externalData={externalData}
		/>
	);
};

export const HorizontalWizardV2: React.FC<Props> = (props) => <WizardV2 {...props} />;

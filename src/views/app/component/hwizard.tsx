/* eslint-disable @typescript-eslint/explicit-module-boundary-types */ /* eslint-disable @typescript-eslint/explicit-function-return-type */ /* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useRef } from 'react';
import useWizard from '../hooks/usewizard';
import { HorizontalWizardLayout } from './horizontal-wizard-layout';

type Props = {
	data: any;
	defaultData: any;
	steps: Array<any>;
	onChange: any;
	onComplete: any;
	nextI18nLabel?: string;
	backI18nLabel?: string;
	cancelI18nLabel?: string;
	Wrapper: any;
	Layout: any;
	title: string;
	currentStep: any;
	currentStepIndex: any;
	setToggleBucket: any;

	bucketType: any;
};

const Wizard: React.FC<Props> = ({
	data,
	defaultData,
	Layout,
	steps,
	onChange,
	onComplete,
	nextI18nLabel,
	backI18nLabel,
	cancelI18nLabel,
	Wrapper,
	title,
	setToggleBucket,
	bucketType
}) => {
	const sectionRef = useRef();
	const activeRef = useRef();
	const useWizardAnswer = useWizard({
		data,
		defaultData,
		steps,
		onChange,
		onComplete,
		sectionRef,
		activeRef,
		title
	});
	return (
		<Layout
			Wrapper={Wrapper}
			nextI18nLabel={nextI18nLabel}
			backI18nLabel={backI18nLabel}
			cancelI18nLabel={cancelI18nLabel}
			ref={{ sectionRef, activeRef }}
			setToggleBucket={setToggleBucket}
			
			bucketType={bucketType}
			{...useWizardAnswer}
		/>
	);
};

export const HorizontalWizard: React.FC<any> = (props) => (
	<Wizard Layout={HorizontalWizardLayout} {...props} />
);

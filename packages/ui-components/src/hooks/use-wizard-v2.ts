/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { findIndex, isEmpty, map, pick, take } from 'lodash-es';
import { type ComponentType, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type WizardStepV2 = {
	name: string;
	label: string;
	icon: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	view: ComponentType<any>;
	canGoNext?: () => boolean;
	clickDisabled?: boolean;
	isComplete?: boolean;
	toggleNextBtn?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	CancelButton?: ComponentType<any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	PrevButton?: ComponentType<any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	NextButton?: ComponentType<any>;
};

type WizardV2Props = {
	data: any;
	defaultData: any;
	steps: Array<WizardStepV2>;
	onChange: any;
	onComplete: (data: unknown) => void | Promise<void>;
	sectionRef: any;
	activeRef: any;
	title: any;
	activeStep: any;
};

export const useWizardV2 = ({
	data,
	defaultData,
	steps,
	onChange,
	onComplete,
	sectionRef,
	activeRef,
	title,
	activeStep,
}: WizardV2Props): any => {
	const uncontrolledMode = !data;
	const [internalData, setInternalData] = useState(
		isEmpty(data) ? defaultData || { currentStep: steps[0].name, steps: {} } : data,
	);
	const innerData = isEmpty(data) ? internalData : data;
	const dataRef = useRef(innerData);
	const [internalStep, setInternalStep] = useState(activeStep || innerData.currentStep);
	const [prevActiveStep, setPrevActiveStep] = useState(activeStep);
	if (activeStep !== prevActiveStep) {
		setPrevActiveStep(activeStep);
		if (activeStep) {
			setInternalStep(activeStep);
		}
	}
	const currentStep = isEmpty(data) ? internalStep : data.currentStep;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const stepKeys = map(steps, (step) => step.name);

	const getStepIndex = (stepName: string) => findIndex(steps, (step) => step.name === stepName);

	const currentStepIndex = getStepIndex(currentStep);
	const isFirstStep = getStepIndex(currentStep) === 0;

	const onSelection = (_data: any, replace = true) => {
		const newState = {
			currentStep: dataRef.current.currentStep,
			steps: {
				...dataRef.current.steps,
				[currentStep]: replace ? _data : { ...dataRef.current.steps[currentStep], ..._data },
			},
		};
		if (uncontrolledMode) {
			dataRef.current = newState;
			setInternalData(newState);
		}
		onChange?.(newState);
	};

	const resetWizard = () => {
		const newState = { currentStep: steps[0].name, steps: {}, reset: true };
		if (uncontrolledMode) {
			dataRef.current = newState;
			setInternalData(newState);
			setInternalStep(steps[0].name);
		}
		onChange?.(newState);
	};

	const scrollActiveIntoView = (): void => {
		const section = sectionRef.current;
		const active = activeRef.current;
		if (!section || !active) {
			return;
		}
		const sectionTop = section.getBoundingClientRect().top;
		const activeTop = active.getBoundingClientRect().top;
		const sectionBottom = section.getBoundingClientRect().bottom;
		const activeBottom = active.getBoundingClientRect().bottom;
		if (activeTop < sectionTop || activeBottom > sectionBottom) {
			section.scrollBy({ top: activeTop - sectionTop - 16, behavior: 'smooth' });
		}
	};

	useLayoutEffect(() => {
		scrollActiveIntoView();
	}, []);

	const goToStep = (stepName: any) => {
		const keysToKeep = take(stepKeys, findIndex(stepKeys, (step) => step === stepName) + 1);
		const newState = {
			currentStep: stepName,
			steps: pick(dataRef.current.steps, keysToKeep),
		};
		if (uncontrolledMode) {
			dataRef.current = newState;
			setInternalData(newState);
			setInternalStep(stepName);
		}
		onChange?.(newState);
		globalThis.requestAnimationFrame(scrollActiveIntoView);
	};

	const goNext = async () => {
		if (currentStepIndex === steps.length - 1) {
			setIsSubmitting(true);
			try {
				await onComplete(dataRef.current);
			} finally {
				setIsSubmitting(false);
			}
		} else {
			goToStep(steps[currentStepIndex + 1].name);
		}
	};

	const goBack = () => {
		if (currentStepIndex > 0) {
			goToStep(steps[currentStepIndex - 1].name);
		}
	};

	const getData = () => dataRef.current;

	const canGoToStep = (stepName: any) => {
		const stepIndex = getStepIndex(stepName);
		return steps[stepIndex]?.canGoNext ? steps[stepIndex].canGoNext() : true;
	};
	const canGoNext = () => canGoToStep(currentStep);

	useEffect(() => {
		if (!isEmpty(data)) {
			dataRef.current = data;
		}
	}, [data]);

	const activeStepConfig = steps[currentStepIndex];
	const isComplete = activeStepConfig?.isComplete ?? true;
	const toggleNextBtn = activeStepConfig?.toggleNextBtn ?? false;

	return {
		steps,
		data: innerData,
		currentStep,
		currentStepIndex,
		goNext,
		goBack,
		goToStep,
		resetWizard,
		onSelection,
		getStepIndex,
		getData,
		canGoToStep,
		canGoNext,
		isComplete,
		isSubmitting,
		isFirstStep,
		title,
		onComplete,
		toggleNextBtn,
	};
};

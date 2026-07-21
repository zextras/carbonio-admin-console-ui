/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { findIndex, isEmpty, map, pick, take } from 'lodash-es';
import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
	const uncontrolledMode = useMemo(() => !data, [data]);
	const [innerData, setInnerData] = useState(
		isEmpty(data) ? defaultData || { currentStep: steps[0].name, steps: {} } : data,
	);
	const dataRef = useRef(innerData);
	const [currentStep, setCurrentStep] = useState(innerData.currentStep);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const stepKeys = useMemo(() => map(steps, (step) => step.name), [steps]);

	const getStepIndex = useCallback(
		(stepName: string) => findIndex(steps, (step) => step.name === stepName),
		[steps],
	);

	const currentStepIndex = useMemo(() => getStepIndex(currentStep), [getStepIndex, currentStep]);
	const isFirstStep = useMemo(() => getStepIndex(currentStep) === 0, [currentStep, getStepIndex]);

	const onSelection = useCallback(
		(_data: any, replace = true) => {
			const newState = {
				currentStep: dataRef.current.currentStep,
				steps: {
					...dataRef.current.steps,
					[currentStep]: replace ? _data : { ...dataRef.current.steps[currentStep], ..._data },
				},
			};
			if (uncontrolledMode) {
				dataRef.current = newState;
				setInnerData(newState);
			}
			onChange?.(newState);
		},
		[uncontrolledMode, currentStep, onChange],
	);

	const resetWizard = useCallback(() => {
		const newState = { currentStep: steps[0].name, steps: {}, reset: true };
		if (uncontrolledMode) {
			dataRef.current = newState;
			setInnerData(newState);
			setCurrentStep(steps[0].name);
		}
		onChange?.(newState);
	}, [uncontrolledMode, onChange, steps]);

	const goToStep = useCallback(
		(stepName: any) => {
			const keysToKeep = take(stepKeys, findIndex(stepKeys, (step) => step === stepName) + 1);
			const newState = {
				currentStep: stepName,
				steps: pick(dataRef.current.steps, keysToKeep),
			};
			if (uncontrolledMode) {
				dataRef.current = newState;
				setInnerData(newState);
				setCurrentStep(stepName);
			}
			onChange?.(newState);
		},
		[stepKeys, uncontrolledMode, onChange],
	);

	const goNext = useCallback(async () => {
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
	}, [currentStepIndex, steps, onComplete, goToStep]);

	const goBack = useCallback(() => {
		currentStepIndex > 0 && goToStep(steps[currentStepIndex - 1].name);
	}, [goToStep, steps, currentStepIndex]);

	const getData = useCallback(() => dataRef.current, []);

	const canGoToStep = useCallback(
		(stepName: any) => {
			const stepIndex = getStepIndex(stepName);
			return steps[stepIndex]?.canGoNext ? steps[stepIndex].canGoNext() : true;
		},
		[getStepIndex, steps],
	);
	const canGoNext = useCallback(() => canGoToStep(currentStep), [canGoToStep, currentStep]);

	useEffect(() => {
		const sectionTop = sectionRef.current?.getBoundingClientRect().top;
		const activeTop = activeRef.current?.getBoundingClientRect().top;
		const sectionBottom = sectionRef.current?.getBoundingClientRect().bottom;
		const activeBottom = activeRef.current?.getBoundingClientRect().bottom;
		const offset = activeTop - sectionTop - 16;
		if (activeTop < sectionTop || activeBottom > sectionBottom) {
			if (sectionRef.current && activeRef.current) {
				sectionRef.current.scrollBy({ top: offset, behavior: 'smooth' });
			} else if (sectionRef.current) {
				sectionRef.current.scrollTo(0, sectionRef.current.scrollHeight);
			}
		}
		if (activeStep) {
			goToStep(activeStep);
		}
	}, [activeRef, activeStep, currentStep, goToStep, sectionRef]);

	useEffect(() => {
		if (!isEmpty(data)) {
			setCurrentStep(data.currentStep);
			dataRef.current.currentStep = data.currentStep;
		}
	}, [data]);

	useEffect(() => {
		if (!isEmpty(data)) {
			dataRef.current = data;
			setInnerData(data);
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

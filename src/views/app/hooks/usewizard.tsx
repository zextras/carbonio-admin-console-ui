/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findIndex, isEmpty, take, pick, map } from 'lodash';

type WizardProps = {
	data: any;
	defaultData: any;
	steps: Array<any>;
	onChange: any;
	onComplete: any;
	sectionRef: any;
	activeRef: any;
	title: any;
	activeStep: any;
};
const useWizard = ({
	data,
	defaultData,
	steps,
	onChange,
	onComplete,
	sectionRef,
	activeRef,
	title,
	activeStep
}: WizardProps): any => {
	const uncontrolledMode = useMemo(() => !data, [data]);
	const [innerData, setInnerData] = useState(
		isEmpty(data) ? defaultData || { currentStep: steps[0].name, steps: {} } : data
	);
	const dataRef = useRef(innerData);
	const [currentStep, setCurrentStep] = useState(innerData.currentStep);
	const [completeLoading, setCompleteLoading] = useState(true);
	const [toggleNextBtn, setToggleNextBtn] = useState(false);
	const stepKeys = useMemo(() => map(steps, (step) => step.name), [steps]);

	const getStepIndex = useCallback(
		(stepName) => findIndex(steps, (step) => step.name === stepName),
		[steps]
	);

	const currentStepIndex = useMemo(() => getStepIndex(currentStep), [getStepIndex, currentStep]);
	const isFirstStep = useMemo(() => getStepIndex(currentStep) === 0, [currentStep, getStepIndex]);

	const onSelection = useCallback(
		(_data, replace = true) => {
			const newState = {
				currentStep: dataRef.current.currentStep,
				steps: {
					...dataRef.current.steps,
					[currentStep]: replace ? _data : { ...dataRef.current.steps[currentStep], ..._data }
				}
			};
			if (uncontrolledMode) {
				dataRef.current = newState;
				setInnerData(newState);
			}
			onChange && onChange(newState);
		},
		[uncontrolledMode, currentStep, onChange]
	);

	const resetWizard = useCallback(() => {
		const newState = { currentStep: steps[0].name, steps: {}, reset: true };
		if (uncontrolledMode) {
			dataRef.current = newState;
			setInnerData(newState);
			setCurrentStep(steps[0].name);
		}
		onChange && onChange(newState);
		setCompleteLoading(true);
	}, [uncontrolledMode, onChange, steps]);

	const goToStep = useCallback(
		(stepName) => {
			const keysToKeep = take(stepKeys, findIndex(stepKeys, (step) => step === stepName) + 1);
			const newState = {
				currentStep: stepName,
				steps: pick(dataRef.current.steps, keysToKeep)
			};
			if (uncontrolledMode) {
				dataRef.current = newState;
				setInnerData(newState);
				setCurrentStep(stepName);
			}
			onChange && onChange(newState);
		},
		[stepKeys, uncontrolledMode, onChange]
	);

	const goNext = useCallback(() => {
		if (currentStepIndex === steps.length - 1) {
			setCompleteLoading(false);
			onComplete(dataRef.current, setCompleteLoading, resetWizard);
		} else {
			goToStep(steps[currentStepIndex + 1].name);
		}
	}, [currentStepIndex, steps, onComplete, resetWizard, goToStep]);

	const goBack = useCallback(() => {
		currentStepIndex > 0 && goToStep(steps[currentStepIndex - 1].name);
	}, [goToStep, steps, currentStepIndex]);

	const getData = useCallback(() => dataRef.current, []);

	const canGoToStep = useCallback(
		(stepName) => {
			const stepIndex = getStepIndex(stepName);
			return steps[stepIndex].canGoNext
				? steps[stepIndex].canGoNext(dataRef.current.steps[stepName], dataRef.current)
				: true;
		},
		[getStepIndex, steps]
	);
	const canGoNext = useCallback(() => canGoToStep(currentStep), [canGoToStep, currentStep]);

	useEffect(() => {
		const sectionTop = sectionRef.current && sectionRef.current.getBoundingClientRect().top;
		const activeTop = activeRef.current && activeRef.current.getBoundingClientRect().top;
		const sectionBottom = sectionRef.current && sectionRef.current.getBoundingClientRect().bottom;
		const activeBottom = activeRef.current && activeRef.current.getBoundingClientRect().bottom;
		const offset = activeTop - sectionTop - 16;
		if (activeTop < sectionTop || activeBottom > sectionBottom) {
			sectionRef.current && activeRef.current
				? sectionRef.current.scrollBy({ top: offset, behavior: 'smooth' })
				: sectionRef.current.scrollTo(0, sectionRef.current.scrollHeight);
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
		completeLoading,
		isFirstStep,
		title,
		onComplete,
		setCompleteLoading,
		toggleNextBtn,
		setToggleNextBtn
	};
};

export default useWizard;

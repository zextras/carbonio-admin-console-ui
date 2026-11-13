/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEmpty, pick, take } from 'lodash-es';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

export const useWizard = ({
  data,
  defaultData,
  steps,
  onChange,
  onComplete,
  sectionRef,
  activeRef,
  title,
  activeStep,
}: WizardProps): any => {
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
  const [completeLoading, setCompleteLoading] = useState(true);
  const [toggleNextBtn, setToggleNextBtn] = useState(false);
  const stepKeys = steps.map((step) => step.name);

  const getStepIndex = (stepName: string) => steps.findIndex((step) => step.name === stepName);

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
    setCompleteLoading(true);
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
    const keysToKeep = take(stepKeys, stepKeys.findIndex((step) => step === stepName) + 1);
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

  const goNext = () => {
    if (currentStepIndex === steps.length - 1) {
      setCompleteLoading(false);
      onComplete(dataRef.current, setCompleteLoading, resetWizard);
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
    return steps[stepIndex].canGoNext
      ? steps[stepIndex].canGoNext(dataRef.current.steps[stepName], dataRef.current)
      : true;
  };
  const canGoNext = () => canGoToStep(currentStep);

  useEffect(() => {
    if (!isEmpty(data)) {
      dataRef.current = data;
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
    setToggleNextBtn,
  };
};

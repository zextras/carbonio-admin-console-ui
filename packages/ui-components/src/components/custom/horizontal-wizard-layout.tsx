/* eslint-disable react-hooks/exhaustive-deps */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Padding, Row, Text } from '@zextras/ui-components';
import { map } from 'lodash-es';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './horizontal-wizard-layout.module.css';

const StepNavigator: FC<{
  isDone: boolean;
  steps: Array<any>;
  step: any;
  isActive: boolean;
  isLastStep: boolean;
  onClick: any;
  stepIndex: any;
  goToStep: any;
  goNext: any;
  currentStepIndex: any;
  canGoToStep: any;
  isFirstStep: any;
}> = ({ step, isDone, isActive, isLastStep, onClick, stepIndex, currentStepIndex, steps }) => {
  const color = useMemo(() => {
    if (isActive) return 'primary';
    return isDone ? 'secondary' : 'gray1';
  }, [isActive, isDone]);

  const renderElement = useMemo(
    () =>
      !!(
        (currentStepIndex === 0 && (stepIndex === 0 || stepIndex === 1 || stepIndex === 2)) ||
        (currentStepIndex === steps.length - 1 &&
          (stepIndex === steps.length - 1 ||
            stepIndex === steps.length - 2 ||
            stepIndex === steps.length - 3)) ||
        currentStepIndex === stepIndex ||
        currentStepIndex === stepIndex + 1 ||
        currentStepIndex === stepIndex - 1
      ),
    [currentStepIndex, stepIndex],
  );

  return (
    <Row
      width={renderElement ? '100%' : '50%'}
      className={styles.rowContainer}
      data-is-active={isActive}
    >
      <Row wrap="nowrap" onClick={onClick} width="80%">
        <Row style={{ padding: renderElement ? '12px 8px' : '', borderRadius: '50%' }}>
          <icon-wc icon={step.icon} color={color} size="large"></icon-wc>
        </Row>
        {renderElement && (
          <Padding left="small">
            <Text color={color} weight="medium" style={{ textTransform: 'uppercase' }}>
              {step.label}
            </Text>
          </Padding>
        )}
      </Row>
      <Row wrap="nowrap" style={{ cursor: 'pointer' }} width={'20%'}>
        {!isLastStep && <icon-wc icon="ChevronRight" color={color} size="large"></icon-wc>}
      </Row>
    </Row>
  );
};

const DefaultWrapper: FC<{ wizard: any; wizardFooter: any }> = ({ wizard, wizardFooter }) => (
  <>
    {wizard}
    {wizardFooter}
  </>
);

type Refs = {
  sectionRef: React.RefObject<HTMLDivElement>;
  activeRef: React.RefObject<HTMLDivElement>;
};

type Props = {
  steps: Array<any>;
  onSelection: any;
  currentStep: any;
  currentStepIndex: any;
  goNext: any;
  goBack: any;
  goToStep: any;
  getData: any;
  completeLoading: any;
  resetWizard: any;
  canGoToStep: any;
  canGoNext: any;
  isFirstStep: any;
  Wrapper: any;
  nextI18nLabel: any;
  backI18nLabel: any;
  cancelI18nLabel: any;
  title: string;
  onComplete: any;
  setCompleteLoading: any;
  setToggleWizardSection: (val: boolean) => void;
  externalData: any;
  toggleNextBtn: any;
  setToggleNextBtn: any;
} & Refs;

export const HorizontalWizardLayout = ({
  steps,
  onComplete,
  onSelection,
  currentStep,
  canGoNext,
  canGoToStep,
  completeLoading,
  currentStepIndex,
  getData,
  goBack,
  goNext,
  goToStep,
  setCompleteLoading,
  isFirstStep,
  Wrapper = DefaultWrapper,
  title,
  setToggleWizardSection,
  externalData,
  toggleNextBtn,
  setToggleNextBtn,
  activeRef,
}: Props): React.ReactElement => {
  const { t } = useTranslation();
  const stepsToRender = useMemo(
    () =>
      map(steps, (step, stepIndex) => {
        const isDone = stepIndex < currentStepIndex;
        const isActive = currentStep === step.name;

        const renderElement = (): any =>
          !!(
            (currentStepIndex === 0 && (stepIndex === 0 || stepIndex === 1 || stepIndex === 2)) ||
            (currentStepIndex === steps.length - 1 &&
              (stepIndex === steps.length - 1 ||
                stepIndex === steps.length - 2 ||
                stepIndex === steps.length - 3)) ||
            currentStepIndex === stepIndex ||
            currentStepIndex === stepIndex + 1 ||
            currentStepIndex === stepIndex - 1
          );

        return (
          <Row
            key={step.name}
            height="auto"
            minWidth={renderElement() ? '120px' : '50px'}
            minHeight="50px"
          >
            <StepNavigator
              step={step}
              isDone={isDone}
              isActive={isActive}
              isLastStep={stepIndex === steps.length - 1}
              onClick={(): any =>
                !step.clickDisabled &&
                !isActive &&
                (isDone ? goToStep(step.name) : (canGoNext() && goNext()) || goToStep(step.name))
              }
              goToStep={goToStep}
              goNext={goNext}
              canGoToStep={canGoToStep}
              stepIndex={stepIndex}
              currentStepIndex={currentStepIndex}
              isFirstStep={isFirstStep}
              steps={steps}
            />
          </Row>
        );
      }),
    [
      steps,
      currentStepIndex,
      currentStep,
      goToStep,
      goNext,
      canGoToStep,
      getData,
      onSelection,
      title,
      setCompleteLoading,
      activeRef,
      onComplete,
      canGoNext,
      externalData,
    ],
  );

  const [NextButton, PrevButton, CancelButton] = useMemo(
    () => [
      steps[currentStepIndex].NextButton || Button,
      steps[currentStepIndex].PrevButton || Button,
      steps[currentStepIndex].CancelButton || Button,
    ],
    [currentStepIndex],
  );

  const wizard = (
    <div ref={activeRef} style={{ overflowY: 'auto', width: '100%' }}>
      <Row
        orientation="horizontal"
        width="100%"
        padding={{ horizontal: 'small' }}
        background="#F5F6F8"
      >
        {stepsToRender}
      </Row>

      <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        {map(steps, (step, stepIndex) => {
          const View = steps[stepIndex].view;
          const isDone = stepIndex < currentStepIndex;
          const isActive = currentStep === step.name;
          return (
            <Row>
              {View && isDone && isActive && (
                <View
                  step={step}
                  isActive={isActive}
                  getData={getData}
                  onSelection={onSelection}
                  goToStep={goToStep}
                  title={title}
                  setCompleteLoading={setCompleteLoading}
                  externalData={externalData}
                  setToggleNextBtn={setToggleNextBtn}
                  setToggleWizardSection={setToggleWizardSection}
                />
              )}
              {View && isActive && (
                <View
                  step={step}
                  isActive={isActive}
                  getData={getData}
                  onSelection={onSelection}
                  goToStep={goToStep}
                  title={title}
                  onComplete={onComplete}
                  setCompleteLoading={setCompleteLoading}
                  externalData={externalData}
                  setToggleNextBtn={setToggleNextBtn}
                  setToggleWizardSection={setToggleWizardSection}
                />
              )}
            </Row>
          );
        })}
      </div>
    </div>
  );

  const wizardFooter = (
    <Row mainAlignment="space-between" width="100%">
      <Row mainAlignment="flex-start" takeAvailableSpace>
        <Padding right="large">
          <CancelButton
            key="wizard-cancel"
            label={t('label.wizard_cancel_button', 'CANCEL')}
            setCompleteLoading={setCompleteLoading}
            completeLoading={completeLoading}
            onClick={(): void => setToggleWizardSection(false)}
          />
        </Padding>
      </Row>
      <Row mainAlignment="flex-start">
        <Padding right="large">
          <PrevButton
            key="wizard-prev"
            setCompleteLoading={setCompleteLoading}
            completeLoading={completeLoading}
            label={t('label.wizard_previous_button', 'PREVIOUS')}
            onClick={goBack}
          />
        </Padding>
      </Row>
      <Row mainAlignment="flex-start">
        <NextButton
          key="wizard-next"
          label={t('label.wizard_previous_button', 'NEXT')}
          onClick={goNext}
          setCompleteLoading={setCompleteLoading}
          completeLoading={completeLoading}
          disabled={!canGoNext() || !completeLoading}
          toggleNextBtn={toggleNextBtn}
        />
      </Row>
    </Row>
  );

	return (
		<Wrapper
			title={title}
			wizard={wizard}
			wizardFooter={wizardFooter}
			setToggleWizardSection={setToggleWizardSection}
			externalData={externalData}
		/>
	);
};

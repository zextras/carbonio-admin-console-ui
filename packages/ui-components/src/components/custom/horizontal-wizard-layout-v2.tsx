/* eslint-disable react-hooks/exhaustive-deps */
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { map } from 'lodash-es';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { WizardStepV2 } from '../../hooks/use-wizard-v2';
import { Button } from '../basic/button/Button';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';
import styles from './horizontal-wizard-layout.module.css';

const StepNavigator: React.FC<{
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
					<ds-icon icon={step.icon} color={color} size="large"></ds-icon>
				</Row>
				{renderElement && (
					<Padding left="small">
						<ds-text as="h2" color={color} weight="medium" style={{ textTransform: 'uppercase' }}>
							{step.label}
						</ds-text>
					</Padding>
				)}
			</Row>
			<Row wrap="nowrap" style={{ cursor: 'pointer' }} width={'20%'}>
				{!isLastStep && <ds-icon icon="ChevronRight" color={color} size="large"></ds-icon>}
			</Row>
		</Row>
	);
};

const DefaultWrapper: React.FC<{ wizard: any; wizardFooter: any }> = ({ wizard, wizardFooter }) => (
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
	steps: Array<WizardStepV2>;
	onSelection: any;
	currentStep: any;
	currentStepIndex: any;
	goNext: any;
	goBack: any;
	goToStep: any;
	getData: any;
	isComplete: boolean;
	isSubmitting: boolean;
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
	setToggleWizardSection: (val: boolean) => void;
	externalData: any;
	toggleNextBtn: any;
} & Refs;

export const HorizontalWizardLayoutV2 = ({
	steps,
	onComplete,
	onSelection,
	currentStep,
	canGoNext,
	canGoToStep,
	isComplete,
	isSubmitting,
	currentStepIndex,
	getData,
	goBack,
	goNext,
	goToStep,
	isFirstStep,
	Wrapper = DefaultWrapper,
	title,
	setToggleWizardSection,
	externalData,
	toggleNextBtn,
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
			activeRef,
			onComplete,
			canGoNext,
			externalData,
		],
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [NextButton, PrevButton, CancelButton] = useMemo(
		() =>
			[
				(steps[currentStepIndex].NextButton || Button) as React.ComponentType<any>,
				(steps[currentStepIndex].PrevButton || Button) as React.ComponentType<any>,
				(steps[currentStepIndex].CancelButton || Button) as React.ComponentType<any>,
			] as const,
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
						<Row key={step.name}>
							{View && isDone && isActive && (
								<View
									step={step}
									isActive={isActive}
									getData={getData}
									onSelection={onSelection}
									goToStep={goToStep}
									title={title}
									externalData={externalData}
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
									externalData={externalData}
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
						onClick={(): void => setToggleWizardSection(false)}
					/>
				</Padding>
			</Row>
			<Row mainAlignment="flex-start">
				<Padding right="large">
					<PrevButton
						key="wizard-prev"
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
					disabled={!canGoNext() || !isComplete || isSubmitting}
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

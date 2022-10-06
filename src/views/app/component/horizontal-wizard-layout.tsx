/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useRef } from 'react';
import { map } from 'lodash';
import styled from 'styled-components';
import { Button, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const StepContainer = styled(Row)``;
const StepView = styled(Row)``;

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
}> = ({
	step,
	isDone,
	isActive,
	isLastStep,
	onClick,
	stepIndex,
	currentStepIndex,
	isFirstStep,
	steps
}) => {
	const color = useMemo(() => {
		if (isActive) return 'primary';
		return isDone ? '#abc7ed' : 'gray1';
	}, [isActive, isDone]);

	const renderElement = useMemo(() => {
		if (
			(currentStepIndex === 0 && (stepIndex === 0 || stepIndex === 1 || stepIndex === 2)) ||
			(currentStepIndex === steps.length - 1 &&
				(stepIndex === steps.length - 1 ||
					stepIndex === steps.length - 2 ||
					stepIndex === steps.length - 3)) ||
			currentStepIndex === stepIndex ||
			currentStepIndex === stepIndex + 1 ||
			currentStepIndex === stepIndex - 1
		)
			return true;
		return false;
	}, [currentStepIndex, stepIndex]);

	return (
		<Row
			width={renderElement ? '100%' : '50%'}
			style={{
				borderBottom: isActive ? '2px solid #2b73d2' : '',
				cursor: 'pointer'
			}}
		>
			<Row wrap="nowrap" onClick={onClick} width="80%">
				<Row style={{ padding: renderElement ? '12px 8px' : '', borderRadius: '50%' }}>
					<Icon icon={step.icon} color={color} size="large" />
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
				{!isLastStep && <Icon icon="ChevronRight" color={color} size={'large'} />}
			</Row>
		</Row>
	);
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const DefaultWrapper: FC<{ wizard: any; wizardFooter: any }> = ({ wizard, wizardFooter }) => (
	<>
		{wizard}
		{wizardFooter}
	</>
);

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
	sectionRef: any;
	activeRef: any;
	externalData: any;
	toggleNextBtn: any;
	setToggleNextBtn: any;
};

export const HorizontalWizardLayout = React.forwardRef<HTMLDivElement, Props>(
	(
		{
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
			setToggleNextBtn
		}: Props,
		{ sectionRef, activeRef }: any
	): JSX.Element => {
		const { t } = useTranslation();
		const stepsToRender = useMemo(
			() =>
				map(steps, (step, stepIndex) => {
					const View = steps[stepIndex].view;
					const isDone = stepIndex < currentStepIndex;
					const isActive = currentStep === step.name;

					const renderElement = (): any => {
						if (
							(currentStepIndex === 0 && (stepIndex === 0 || stepIndex === 1 || stepIndex === 2)) ||
							(currentStepIndex === steps.length - 1 &&
								(stepIndex === steps.length - 1 ||
									stepIndex === steps.length - 2 ||
									stepIndex === steps.length - 3)) ||
							currentStepIndex === stepIndex ||
							currentStepIndex === stepIndex + 1 ||
							currentStepIndex === stepIndex - 1
						)
							return true;
						return false;
					};

					return (
						<StepContainer
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
						</StepContainer>
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
				externalData
			]
		);

		const [NextButton, PrevButton, CancelButton] = useMemo(
			() => [
				steps[currentStepIndex].NextButton || Button,
				steps[currentStepIndex].PrevButton || Button,
				steps[currentStepIndex].CancelButton || Button
			],
			[currentStepIndex]
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
							<StepView>
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
									/>
								)}
							</StepView>
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
				wizard={wizard}
				wizardFooter={wizardFooter}
				setToggleWizardSection={setToggleWizardSection}
				externalData={externalData}
			/>
		);
	}
);

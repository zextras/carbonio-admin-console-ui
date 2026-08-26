/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type DsStepperStep } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './create-new-domain.module.css';
import { Step1GeneralInformation } from './parts/step-1-general-information';
import { Step2Gal } from './parts/step-2-gal';
import { Step3Advanced } from './parts/step-3-advanced';
import { useCreateDomainForm } from './use-create-domain-form';

export const CreateDomain = () => {
  const [t] = useTranslation();
  const {
    form,
    currentStep,
    mailServerItems,
    cosItems,
    isCosListLoading,
    isSubmitting,
    handleCancel,
    handleBack,
  } = useCreateDomainForm();

  const stepperSteps: Array<DsStepperStep> = [
    {
      label: t('label.general_information', 'General Information'),
      description: t(
        'domain.createNewDomain.generalInfoDescription',
        'Type the name of the new domain and set its basic limits.',
      ),
    },
    {
      label: t('label.gal', 'GAL'),
      description: t(
        'domain.createNewDomain.galDescription',
        'Configure the Global Address List sync account.',
      ),
    },
    {
      label: t('label.advanced', 'Advanced'),
      description: t(
        'domain.createNewDomain.advancedDescription',
        'Pick the default Class of Service, delegated administration and notifications.',
      ),
    },
  ];

  return (
    <>
      {(isSubmitting || isCosListLoading) && <ds-spinner></ds-spinner>}
      <div className={styles.outer}>
        <div className={styles.stepperColumn}>
          <ds-stepper steps={stepperSteps} current={currentStep}></ds-stepper>
        </div>
				<div className={styles.contentColumn}>
					{currentStep === 0 && (
						<Step1GeneralInformation
							form={form}
							isSubmitting={isSubmitting}
							onCancel={handleCancel}
							onBack={handleBack}
						/>
					)}
					{currentStep === 1 && (
						<Step2Gal
							form={form}
							isSubmitting={isSubmitting}
							mailServerItems={mailServerItems}
							onCancel={handleCancel}
							onBack={handleBack}
						/>
					)}
					{currentStep === 2 && (
						<Step3Advanced
							form={form}
							isSubmitting={isSubmitting}
							cosItems={cosItems}
							onCancel={handleCancel}
							onBack={handleBack}
						/>
					)}
				</div>
      </div>
    </>
  );
};

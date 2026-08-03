/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { DsStepperStep } from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../../types/attribute';
import { GENERAL_INFORMATION } from '../../../constants';
import { useCreateCos } from '../../../services/use-create-cos';
import styles from './create-new-cos.module.css';
import { CreateNewCosStep1 } from './parts/step-1';
import { CreateNewCosStep2 } from './parts/step-2';
import { createCosSchema } from './schema';

export const CreateNewCos = () => {
  const [t] = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const createCosMutation = useCreateCos();

  const stepperSteps: Array<DsStepperStep> = [
    {
      label: t('label.general_information', 'General Information'),
      description: t(
        'cos.createCos.generalInfoDescription',
        'Give this Class of Service a recognizable name and pick the edition it is based on.',
      ),
    },
    {
      label: t('label.features', 'Features'),
      description: t(
        'cos.createCos.featuresDescription',
        'Choose features available for this COS based on the edition enabled.',
      ),
    },
  ];

  const form = useForm({
    defaultValues: { cn: '', description: '', zimbraNotes: '' },
    validators: {
      onChange: createCosSchema,
      onSubmit: createCosSchema,
    },
    onSubmit: async ({ value }) => {
      const attributes: Array<Attribute> = [
        { n: 'zimbraNotes', _content: value.zimbraNotes },
        { n: 'description', _content: value.description },
        { n: 'cn', _content: value.cn },
      ];
      createCosMutation.mutate(
        { name: value.cn, attributes },
        {
          onSuccess: (data) => {
            const cos = data?.cos[0];
            replaceHistory(cos ? `/${cos.id}/${GENERAL_INFORMATION}` : '/');
          },
        },
      );
    },
  });

  return (
    <div className={styles.outer}>
      <div className={styles.stepperColumn}>
        <ds-stepper steps={stepperSteps} current={currentStep}></ds-stepper>
      </div>
      <div className={styles.contentColumn}>
        {currentStep === 0 ? (
          <CreateNewCosStep1 form={form} onNext={() => setCurrentStep((s) => s + 1)} />
        ) : (
          <CreateNewCosStep2 form={form} onBack={() => setCurrentStep((s) => s - 1)} />
        )}
      </div>
    </div>
  );
};

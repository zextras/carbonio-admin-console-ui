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
import { StepTwoEmailEdition } from './parts/step-2-email-edition';
import { StepTwoWorkspaceEdition } from './parts/step-2-workspace-edition';
import { createCosSchema } from './schema';
import type { CosEdition, CreateCosFormValues } from './types';

const FEATURE_FIELDS: Array<keyof CreateCosFormValues> = [
  'carbonioFeatureMailsAppEnabled',
  'zimbraFeatureContactsEnabled',
  'zimbraFeatureCalendarEnabled',
  'carbonioFeatureFilesEnabled',
  'carbonioFeatureFilesAppEnabled',
  'carbonioFeatureTasksEnabled',
  'carbonioFeatureWscEnabled',
  'carbonioWscVideoCallEnabled',
];

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
    defaultValues: {
      cn: '',
      description: '',
      zimbraNotes: '',
      edition: 'mail' as CosEdition,
      carbonioFeatureMailsAppEnabled: 'TRUE',
      zimbraFeatureContactsEnabled: 'TRUE',
      zimbraFeatureCalendarEnabled: 'TRUE',
      carbonioFeatureFilesEnabled: 'TRUE',
      carbonioFeatureFilesAppEnabled: 'TRUE',
      carbonioFeatureTasksEnabled: 'TRUE',
      carbonioFeatureWscEnabled: 'TRUE',
      carbonioWscVideoCallEnabled: 'TRUE',
    },
    validators: {
      onChange: createCosSchema,
      onMount: createCosSchema,
      onSubmit: createCosSchema,
    },
    onSubmit: async ({ value }) => {
      const attributes: Array<Attribute> = [
        { n: 'zimbraNotes', _content: value.zimbraNotes },
        { n: 'description', _content: value.description },
        { n: 'cn', _content: value.cn },
        { n: 'edition', _content: value.edition },
        ...FEATURE_FIELDS.map((field) => ({ n: field, _content: value[field] })),
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

  function onBack(): void {
    return setCurrentStep((step) => step - 1);
  }

  function onNext() {
    return setCurrentStep((step) => step + 1);
  }

  return (
    <div className={styles.outer}>
      <div className={styles.stepperColumn}>
        <ds-stepper steps={stepperSteps} current={currentStep}></ds-stepper>
      </div>
      <div className={styles.contentColumn}>
        {currentStep === 0 && <CreateNewCosStep1 form={form} onNext={onNext} />}
        {currentStep === 1 && (
          <form.Subscribe selector={(state) => state.values.edition}>
            {(edition) =>
              edition === 'email' ? (
                <StepTwoEmailEdition form={form} onBack={onBack} />
              ) : (
                <StepTwoWorkspaceEdition form={form} onBack={onBack} />
              )
            }
          </form.Subscribe>
        )}
      </div>
    </div>
  );
};

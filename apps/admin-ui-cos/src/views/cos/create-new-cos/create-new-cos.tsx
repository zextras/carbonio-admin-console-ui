/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DsStepperStep } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './create-new-cos.module.css';
import { CreateNewCosStep1 } from './parts/step-1';
import { CreateNewCosStep2 } from './parts/step-2';

export const CreateNewCos = () => {
  const [t] = useTranslation();
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

  return (
    <div className={styles.outer}>
      <div className={styles.stepperColumn}>
        <ds-stepper steps={stepperSteps} current={0}></ds-stepper>
      </div>
      <div className={styles.contentColumn}>
        <CreateNewCosStep1 />
        <CreateNewCosStep2 />
      </div>
    </div>
  );
};

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HorizontalWizardLayout, useWizard } from '@zextras/ui-components';
import React, { useRef } from 'react';

type Props = {
  data: any;
  defaultData: any;
  steps: Array<any>;
  onChange: any;
  onComplete: any;
  nextI18nLabel?: string;
  backI18nLabel?: string;
  cancelI18nLabel?: string;
  Wrapper: any;
  Layout: any;
  title: string;
  currentStep: any;
  currentStepIndex: any;
  setToggleWizardSection: any;
  externalData: any;
  activeStep: any;
};

const Wizard: React.FC<Props> = ({
  data,
  defaultData,
  Layout,
  steps,
  onChange,
  onComplete,
  nextI18nLabel,
  backI18nLabel,
  cancelI18nLabel,
  Wrapper,
  title,
  setToggleWizardSection,
  externalData,
  activeStep,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const useWizardAnswer = useWizard({
    data,
    defaultData,
    steps,
    onChange,
    onComplete,
    sectionRef,
    activeRef,
    title,
    activeStep,
  });
  return (
    <Layout
      Wrapper={Wrapper}
      nextI18nLabel={nextI18nLabel}
      backI18nLabel={backI18nLabel}
      cancelI18nLabel={cancelI18nLabel}
      sectionRef={sectionRef}
      activeRef={activeRef}
      setToggleWizardSection={setToggleWizardSection}
      {...useWizardAnswer}
      externalData={externalData}
    />
  );
};

export const HorizontalWizard: React.FC<any> = (props) => (
  <Wizard Layout={HorizontalWizardLayout} {...props} />
);

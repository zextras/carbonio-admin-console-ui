/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HorizontalWizard, Section } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { LoadAndVerifyCert } from './load-verify-certificate';

function WizardNoopButton() {
  return <></>;
}

function WizardInSection({
  wizard,
  setToggleWizardSection,
}: {
  wizard: React.ReactNode;
  setToggleWizardSection: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section
      title={t('virtual_hosts.load_and_verify_certificate', 'Load and Verify Certificate')}
      padding={{ all: '0' }}
      divider
      showClose
      onClose={(): void => {
        setToggleWizardSection(false);
      }}
    >
      {wizard}
    </Section>
  );
}

type LoadVerifyCertificateWizardProps = {
  setToggleWizard: (open: boolean) => void;
  setAlertToggle: (open: boolean) => void;
};

export const LoadVerifyCertificateWizard = ({
  setToggleWizard,
  setAlertToggle,
}: LoadVerifyCertificateWizardProps) => {
  const { t } = useTranslation();

  const wizardSteps = [
    {
      name: 'load-certificate',
      label: t('virtual_hosts.load_certificate', 'LOAD CERTIFICATE'),
      icon: 'CubeOutline',
      view: LoadAndVerifyCert,
      canGoNext: () => true,
      CancelButton: WizardNoopButton,
      PrevButton: WizardNoopButton,
      NextButton: WizardNoopButton,
    },
  ];

  return (
    <HorizontalWizard
      steps={wizardSteps}
      Wrapper={WizardInSection}
      setToggleWizardSection={setToggleWizard}
      externalData={setAlertToggle}
    />
  );
};

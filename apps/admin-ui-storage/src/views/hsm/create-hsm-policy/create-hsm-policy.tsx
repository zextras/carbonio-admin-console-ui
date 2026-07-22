/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { Button, type ButtonProps, Container, HorizontalWizard, Padding, Section } from '@zextras/ui-components';
import { createContext, type ReactElement, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { CreateHsmPolicyProps, HsmPolicyEditDetail } from '../../../../types';
import { HSMContext } from '../hsm-context/hsm-context';
import type { HsmPolicyFormValues } from '../types';
import { HSMcreatePolicy } from './hsm-create-policy';
import { HSMpolicySettings } from './hsm-policy-settings';

export type HsmDetailObj = HsmPolicyEditDetail;

type WizardButtonProps = Partial<ButtonProps> & { onClick?: ButtonProps['onClick'] };

type HsmWizardActions = {
  onRunCustomPolicy: () => void;
  onCreate: () => void;
};

const HsmWizardActionsContext = createContext<HsmWizardActions>({
  onRunCustomPolicy: () => {},
  onCreate: () => {},
});

function WizardInSection({ wizard, wizardFooter, setToggleWizardSection }: Readonly<{ wizard: ReactElement; wizardFooter: ReactElement; setToggleWizardSection: (v: boolean) => void }>) {
  const { t } = useTranslation();
  const { server } = useParams();

  return (
    <Section
      title={`${server} | ${t('hsm.create_new_policy', 'Create New Policy')}`}
      padding={{ all: '0' }}
      footer={wizardFooter}
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

function HsmWizardCancelButton({ onClick }: Readonly<WizardButtonProps>): ReactElement {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick!}
      type="outlined"
      key="wizard-cancel"
      label={t('label.cancel', 'Cancel')}
      color="secondary"
      icon="CloseOutline"
      iconPlacement="right"
    />
  );
}

function HsmWizardNextButton({ onClick }: Readonly<WizardButtonProps>): ReactElement {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick!}
      label={t('label.next', 'NEXT')}
      icon="ChevronRightOutline"
      iconPlacement="right"
    />
  );
}

function HsmWizardPrevButton({ onClick }: Readonly<WizardButtonProps>): ReactElement {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick!}
      label={t('label.back', 'BACK')}
      icon="ChevronLeftOutline"
      color="secondary"
      iconPlacement="left"
    />
  );
}

function HsmWizardCreateNextButton(): React.ReactElement {
  const { t } = useTranslation();
  const { onRunCustomPolicy, onCreate } = useContext(HsmWizardActionsContext);
  return (
    <>
      <Padding right="medium">
        <Button
          label={t('label.run_only', 'RUN ONLY (SKIP CREATE)')}
          iconPlacement="left"
          onClick={onRunCustomPolicy}
        />
      </Padding>
      <Button
        label={t('label.create', 'CREATE')}
        icon="PowerOutline"
        iconPlacement="right"
        onClick={onCreate}
      />
    </>
  );
}

export function CreateHsmPolicy({ setShowCreateHsmPolicyView, volumeList, createHSMpolicy, runCustomHSMpolicy }: CreateHsmPolicyProps) {
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      isAllEnabled: true,
      isMessageEnabled: true,
      isEventEnabled: true,
      isContactEnabled: true,
      isDocumentEnabled: true,
      policyCriteria: [],
      sourceVolume: [],
      destinationVolume: [],
    } as HsmPolicyFormValues,
    onSubmit: async () => {},
  });

  const onCreate = () => {
    const v = form.state.values;
    createHSMpolicy({ ...v, allVolumes: volumeList });
  };

  const onRunCustomPolicy = () => {
    const v = form.state.values;
    runCustomHSMpolicy({ ...v, allVolumes: volumeList });
  };

  const standardHsmPolicyWizardStep = [
    {
      name: 'policy-settings',
      label: t('hsm.policy_settings', 'Policy Settings'),
      icon: 'OptionsOutline',
      view: HSMpolicySettings,
      CancelButton: HsmWizardCancelButton,
      PrevButton: () => null,
      NextButton: HsmWizardNextButton,
    },
    {
      name: 'hsm-create-policy',
      label: t('hsm.create_policy', 'Create Policy'),
      icon: 'PowerOutline',
      view: HSMcreatePolicy,
      CancelButton: HsmWizardCancelButton,
      PrevButton: HsmWizardPrevButton,
      NextButton: HsmWizardCreateNextButton,
    },
  ];

  const onComplete = () => {
    setShowCreateHsmPolicyView(false);
  };

  return (
    <Container
      background="gray5"
      mainAlignment="flex-start"
      style={{
        position: 'absolute',
        top: '0rem',
        right: '0rem',
        bottom: '0rem',
        transition: 'left 0.2s ease-in-out',
        maxHeight: '100%',
        overflow: 'hidden',
        inset: '0rem',
      }}
    >
      <HSMContext.Provider value={{ form, allVolumes: volumeList }}>
        <HsmWizardActionsContext.Provider value={{ onRunCustomPolicy, onCreate }}>
          <HorizontalWizard
            steps={standardHsmPolicyWizardStep}
            Wrapper={WizardInSection}
            onComplete={onComplete}
            setToggleWizardSection={setShowCreateHsmPolicyView}
          />
        </HsmWizardActionsContext.Provider>
      </HSMContext.Provider>
    </Container>
  );
}

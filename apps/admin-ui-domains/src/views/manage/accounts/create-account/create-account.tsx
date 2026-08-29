/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  HorizontalWizard,
  WizardInSection,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';
import { ComponentProps, ComponentType, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import CreateOtpSectionView from './account-otp-section';
import styles from './create-account.module.css';
import CreateAccountDetailSection from './create-account-detail-section';
import { CreateAccountFormContext } from './create-account-form-context';
import type { CreateAccountProps } from './create-account-types';
import { useCreateAccountForm } from './use-create-account-form';

type WizardStepButtonProps = { toggleNextBtn?: boolean } & ComponentProps<typeof Button>;

type WizardStep = {
  name: string;
  label: string;
  icon: string;
  view: ComponentType<{ setToggleNextBtn?: (newValue: boolean) => void }>;
  clickDisabled?: boolean;
  CancelButton: (buttonProps?: WizardStepButtonProps) => ReactElement;
  PrevButton: () => ReactElement;
  NextButton: (buttonProps?: WizardStepButtonProps) => ReactElement;
};

type WizardStepsFactoryDeps = {
  t: TFunction;
  onCancel: () => void;
  onCreateClick: () => void;
  onNextClick: () => void;
  onCreateAnotherClick: () => void;
  isAdminRightsEnabled: boolean;
  otpToggleNextBtn: boolean;
};

function createWizardSteps({
  t,
  onCancel,
  onCreateClick,
  onNextClick,
  onCreateAnotherClick,
  isAdminRightsEnabled,
  otpToggleNextBtn,
}: WizardStepsFactoryDeps): Array<WizardStep> {
  const DetailsCancelButton = (buttonProps?: WizardStepButtonProps): ReactElement => (
    <Button
      {...buttonProps}
      type="outlined"
      key="wizard-cancel"
      label={'CANCEL'}
      color="secondary"
      icon="CloseOutline"
      iconPlacement="right"
      onClick={onCancel}
    />
  );

  const EmptyButton = (): ReactElement => <></>;

  const DetailsNextButton = (): ReactElement => (
    <Button
      label={t('commons.create_with_there_data', 'CREATE WITH THESE DATA')}
      icon="PersonOutline"
      iconPlacement="right"
      onClick={onCreateClick}
    />
  );

  const OtpPrevButton = (): ReactElement => (
    <div className="pr-sm">
      <Button
        type="outlined"
        disabled={isAdminRightsEnabled}
        label={t('label.create_another_account', 'CREATE ANOTHER ACCOUNT')}
        onClick={onCreateAnotherClick}
      />
    </div>
  );

  const OtpNextButton = (buttonProps?: WizardStepButtonProps): ReactElement => (
    <Button
      {...buttonProps}
      label={otpToggleNextBtn ? t('commons.next', 'NEXT') : t('commons.close', 'CLOSE')}
      onClick={onNextClick}
    />
  );

  return [
    {
      name: 'details',
      label: t('label.details', 'DETAILS'),
      icon: 'Edit2Outline',
      view: CreateAccountDetailSection,
      CancelButton: DetailsCancelButton,
      PrevButton: EmptyButton,
      NextButton: DetailsNextButton,
    },
    {
      name: 'otp',
      label: t('label.otp', 'OTP'),
      icon: 'KeyOutline',
      view: CreateOtpSectionView,
      clickDisabled: true,
      CancelButton: EmptyButton,
      PrevButton: OtpPrevButton,
      NextButton: OtpNextButton,
    },
  ];
}

const CreateAccount = (props: CreateAccountProps) => {
  const { t } = useTranslation();
  const isAdvanced = useIsAdvanced();
  const {
    form,
    activeStep,
    isSubmitting,
    submitAttempted,
    handleCreateClick,
    handleNextClick,
    handleCreateAnotherAccount,
  } = useCreateAccountForm(props);

  const accountValues = useSelector(form.store, (s) => s.values);

  const wizardSteps = createWizardSteps({
    t,
    onCancel: (): void => {
      props.setShowCreateAccountView(false);
    },
    onCreateClick: handleCreateClick,
    onNextClick: handleNextClick,
    onCreateAnotherClick: handleCreateAnotherAccount,
    isAdminRightsEnabled: !!accountValues.administrationRigths,
    otpToggleNextBtn: !!accountValues.generateOTP || !!accountValues.administrationRigths,
  });

  const onComplete = (): void => {
    props.setShowCreateAccountView(false);
    props.setIsAccountCreated(true);
  };

  const wizardStepItems: Array<WizardStep> = isAdvanced
    ? wizardSteps
    : wizardSteps.filter((item) => item?.name !== 'otp');

  return (
    <>
      {isSubmitting && <ds-spinner></ds-spinner>}
      <div className={styles.wizardPanel}>
        <CreateAccountFormContext.Provider
          value={{
            form,
            setShowCreateAccountView: props.setShowCreateAccountView,
            submitAttempted,
          }}
        >
          <HorizontalWizard
            steps={wizardStepItems}
            title={t('account.new.create_account_wizard', 'Create Account Wizard')}
            Wrapper={WizardInSection}
            onComplete={onComplete}
            activeStep={activeStep}
            setToggleWizardSection={props.setShowCreateAccountView}
          />
        </CreateAccountFormContext.Provider>
      </div>
    </>
  );
};
export default CreateAccount;

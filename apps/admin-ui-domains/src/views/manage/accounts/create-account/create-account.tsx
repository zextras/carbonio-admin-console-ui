/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  HorizontalWizard,
  WizardInSection,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import CreateOtpSectionView from './account-otp-section';
import styles from './create-account.module.css';
import CreateAccountDetailSection from './create-account-detail-section';
import { CreateAccountFormContext } from './create-account-form-context';
import type { CreateAccountProps } from './create-account-types';
import { useCreateAccountForm } from './use-create-account-form';

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

  const wizardSteps = useMemo(
    () => [
      {
        name: 'details',
        label: t('label.details', 'DETAILS'),
        icon: 'Edit2Outline',
        view: CreateAccountDetailSection,
        CancelButton: (buttonProps: any): ReactElement => (
          <Button
            {...buttonProps}
            type="outlined"
            key="wizard-cancel"
            label={'CANCEL'}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              props.setShowCreateAccountView(false);
            }}
          />
        ),
        PrevButton: (): ReactElement => <></>,
        NextButton: (): ReactElement => (
          <Button
            label={t('commons.create_with_there_data', 'CREATE WITH THESE DATA')}
            icon="PersonOutline"
            iconPlacement="right"
            onClick={(): void => {
              handleCreateClick();
            }}
          />
        ),
      },

      {
        name: 'otp',
        label: t('label.otp', 'OTP'),
        icon: 'KeyOutline',
        view: CreateOtpSectionView,
        clickDisabled: true,
        CancelButton: (): ReactElement => <></>,
        PrevButton: (): ReactElement => (
          <div className="pr-sm">
            <Button
              type="outlined"
              disabled={form.state.values.administrationRigths}
              label={t('label.create_another_account', 'CREATE ANOTHER ACCOUNT')}
              onClick={(): void => handleCreateAnotherAccount()}
            />
          </div>
        ),
        NextButton: (buttonProps: { toggleNextBtn: boolean }): ReactElement => (
          <Button
            label={
              buttonProps?.toggleNextBtn ? t('commons.next', 'NEXT') : t('commons.close', 'CLOSE')
            }
            onClick={(): void => {
              handleNextClick();
            }}
          />
        ),
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, handleCreateClick, handleNextClick, handleCreateAnotherAccount, form],
  );

  const onComplete = useCallback(() => {
    props.setShowCreateAccountView(false);
    props.setIsAccountCreated(true);
  }, [props]);

  const wizardStepItems = useMemo(
    () => (!isAdvanced ? wizardSteps.filter((item: any) => item?.name !== 'otp') : wizardSteps),
    [isAdvanced, wizardSteps],
  );

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

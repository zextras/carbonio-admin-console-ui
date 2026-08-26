/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSnackbar } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import type { TotpGenerateResponse } from '../../../../services/otp-service';
import { useCreateAccount } from '../../../../services/use-create-account';
import { useGenerateTotp } from '../../../../services/use-otp-mutations';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import type { AccountRowItem } from '../account-row';
import { getEffectiveUserName } from './auto-fill-utils';
import { CREATE_ACCOUNT_DEFAULT_VALUES } from './create-account-constants';
import { createAccountSchema } from './create-account-schema';
import type {
  CreateAccountFormApi,
  CreateAccountFormValues,
  CreateAccountProps,
} from './create-account-types';

type CreateAccountSoapResponse = {
  account?: Array<{ id?: string; name?: string }>;
};

/** Mirrors the attribute payload of the legacy create flow, key for key. */
function buildCreateAccountAttributes(value: CreateAccountFormValues): Record<string, string> {
  return {
    givenName: value.givenName,
    initials: value.initials,
    sn: value.sn,
    zimbraPasswordMustChange: value.zimbraPasswordMustChange ? 'TRUE' : 'FALSE',
    zimbraAuthLdapExternalDn: value.zimbraAuthLdapExternalDn,
    zimbraAccountStatus: value.zimbraAccountStatus,
    zimbraPrefLocale: value.zimbraPrefLocale,
    zimbraPrefTimeZoneId: value.zimbraPrefTimeZoneId,
    zimbraNotes: value.zimbraNotes,
    displayName: value.displayName,
    zimbraCOSId: value.defaultCOS ? '' : value.zimbraCOSId,
    description: value.description,
    telephoneNumber: value.telephoneNumber,
    homePhone: value.homePhone,
    mobile: value.mobile,
    pager: value.pager,
    facsimileTelephoneNumber: value.facsimileTelephoneNumber,
    company: value.company,
    title: value.title,
    co: value.co,
    l: value.l,
    postalCode: value.postalCode,
    street: value.street,
    st: value.st,
  };
}

export function useCreateAccountForm(props: CreateAccountProps): {
  form: CreateAccountFormApi;
  activeStep: string;
  setActiveStep: (step: string) => void;
  isSubmitting: boolean;
  submitAttempted: boolean;
  handleCreateClick: () => void;
  handleNextClick: () => void;
  handleCreateAnotherAccount: () => void;
} {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const isAdvanced = useIsAdvanced();
  const [activeStep, setActiveStep] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const createAccountMutation = useCreateAccount();

  const form = useForm({
    defaultValues: CREATE_ACCOUNT_DEFAULT_VALUES,
    validators: {
      onMount: createAccountSchema,
      onChange: createAccountSchema,
      onSubmit: createAccountSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = (await createAccountMutation.mutateAsync({
          attr: buildCreateAccountAttributes(value),
          name: `${getEffectiveUserName(value)}@${domainName}`,
          password: value.password || '',
        })) as CreateAccountSoapResponse;
        form.setFieldValue('id', data?.account?.[0]?.id ?? '');
        form.setFieldValue('name', data?.account?.[0]?.name ?? '');

        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.account_created_successfully', 'The account has been created successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });

        if (isAdvanced) {
          setActiveStep('otp');
        } else {
          props.setShowCreateAccountView(false);
          props.setIsAccountCreated(true);
        }
        props.getAccountList();
      } catch (error) {
        createSnackbar(generateSnackbarFromError(error as Error, t));
      }
    },
  });

  const generateTotpMutation = useGenerateTotp();

  const handleGenerateOtp = (): void => {
    generateTotpMutation.mutate({ account: form.state.values.name }, {
      onSuccess: (res: TotpGenerateResponse) => {
        if (!res.ok) {
          return;
        }
        const response = res.response ?? {};
        form.setFieldValue(
          'qrData',
          `otpauth://totp/${encodeURIComponent(response.label ?? '')}?secret=${
            response.secret ?? ''
          }&issuer=${response.issuer ?? ''}&algorithm=${response.algorithm ?? ''}&digits=${
            response.digits_length ?? ''
          }&period=${response.period ?? ''}`,
        );
        form.setFieldValue('secrateCode', response.secret ?? '');
        form.setFieldValue('pinCodes', response.static_otp_codes ?? []);
        form.setFieldValue('showOtpOptionSection', false);
      },
    });
  };

  const handleCreateClick = (): void => {
    setSubmitAttempted(true);
    void form.handleSubmit();
  };

  const handleNextClick = (): void => {
    const values = form.state.values;
    if (values.generateOTP && values.showOtpOptionSection) {
      handleGenerateOtp();
      return;
    }
    if (values.administrationRigths) {
      props.setShowCreateAccountView(false);
      props.openDetailView(values as unknown as AccountRowItem);
      props.setShowAccountDetailView(false);
      props.setShowEditAccountView(true);
      props.setDefaultTab('administration');
      return;
    }
    props.setShowCreateAccountView(false);
    props.setIsAccountCreated(true);
  };

  const handleCreateAnotherAccount = (): void => {
    form.reset(CREATE_ACCOUNT_DEFAULT_VALUES);
    setSubmitAttempted(false);
    setActiveStep('details');
  };

  return {
    form,
    activeStep,
    setActiveStep,
    isSubmitting: createAccountMutation.isPending,
    submitAttempted,
    handleCreateClick,
    handleNextClick,
    handleCreateAnotherAccount,
  };
}

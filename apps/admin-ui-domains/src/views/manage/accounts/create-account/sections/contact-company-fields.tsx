/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type AnyFormApi,useField } from '@tanstack/react-form';
import { Input, Tooltip } from '@zextras/ui-components';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateAccountFormContext } from '../create-account-form-context';
import { CREATE_ACCOUNT_VALIDATION_MESSAGES } from '../create-account-schema';
import { getCreateAccountFieldErrorProps } from '../field-error';

function PhoneInputField({
  form,
  name,
  label,
  tooltipLabel,
}: {
  form: AnyFormApi;
  name: 'telephoneNumber' | 'homePhone' | 'mobile' | 'pager' | 'facsimileTelephoneNumber';
  label: string;
  tooltipLabel: string;
}): ReactElement {
  const [t] = useTranslation();
  const field = useField({ form, name });
  const error = getCreateAccountFieldErrorProps(
    field,
    t,
    CREATE_ACCOUNT_VALIDATION_MESSAGES,
  );

  return (
    <Tooltip placement="top" label={tooltipLabel}>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          field.handleChange(e.target.value);
        }}
        hasError={error.hasError}
        description={error.description}
        inputName={name}
        label={label}
        backgroundColor="gray5"
        value={field.state.value}
      />
    </Tooltip>
  );
}

type TextFieldLike = {
  name: string;
  state: { value: string };
  handleChange: (value: string) => void;
};

/** Plain-text Input wired to a form field (module-level factory, props-driven). */
function textField(field: TextFieldLike, label: string): ReactElement {
  return (
    <Input
      backgroundColor="gray5"
      label={label}
      value={field.state.value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
        field.handleChange(e.target.value);
      }}
      inputName={field.name}
    />
  );
}

export const ContactCompanyFields = (): ReactElement => {
  const [t] = useTranslation();
  const { form } = useCreateAccountFormContext();

  const companyField = useField({ form, name: 'company' });
  const titleField = useField({ form, name: 'title' });
  const countryField = useField({ form, name: 'co' });
  const stateField = useField({ form, name: 'st' });
  const cityField = useField({ form, name: 'l' });
  const postalCodeField = useField({ form, name: 'postalCode' });
  const streetField = useField({ form, name: 'street' });

  const phoneTooltipLabel = t(
    'domain.accounts.phoneNumber.tooltip',
    'allowed chars are whitespaces, numbers and symbols -+()/,.',
  );

  return (
    <>
      <div className="flex w-full flex-wrap justify-start pl-sm">
        <div className="flex w-full flex-wrap justify-between pt-lg">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.phone', 'Phone')}
          </ds-text>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-between">
            <PhoneInputField
              form={form}
              name="telephoneNumber"
              label={t('label.phone', 'Phone')}
              tooltipLabel={phoneTooltipLabel}
            />
          </div>
          <div className="flex w-[48%] flex-wrap justify-between">
            <PhoneInputField
              form={form}
              name="homePhone"
              label={t('label.home', 'Home')}
              tooltipLabel={phoneTooltipLabel}
            />
          </div>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-start">
            <PhoneInputField
              form={form}
              name="mobile"
              label={t('label.mobile', 'Mobile')}
              tooltipLabel={phoneTooltipLabel}
            />
          </div>
          <div className="flex w-[48%] flex-wrap justify-start">
            <PhoneInputField
              form={form}
              name="pager"
              label={t('label.pager', 'Pager')}
              tooltipLabel={phoneTooltipLabel}
            />
          </div>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-start">
            <PhoneInputField
              form={form}
              name="facsimileTelephoneNumber"
              label={t('label.fax_number', 'Fax Number')}
              tooltipLabel={phoneTooltipLabel}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
        <div className="flex flex-wrap justify-center pt-lg">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.company', 'Company')}
          </ds-text>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(companyField, t('label.company', 'Company'))}
          </div>
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(titleField, t('label.job_title', 'Job Title'))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
        <div className="flex flex-wrap justify-center pt-lg">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.address', 'Address')}
          </ds-text>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(countryField, t('label.country', 'Country'))}
          </div>
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(stateField, t('label.state', 'State'))}
          </div>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(cityField, t('label.city', 'City'))}
          </div>
          <div className="flex w-[48%] flex-wrap justify-start">
            {textField(postalCodeField, t('label.postal_code', 'Postal Code'))}
          </div>
        </div>
        <div className="flex w-full flex-wrap justify-between pt-lg pl-lg">
          <div className="flex w-full flex-wrap justify-start">
            {textField(streetField, t('label.address', 'Address'))}
          </div>
        </div>
      </div>
    </>
  );
};

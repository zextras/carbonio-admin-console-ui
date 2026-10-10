/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Row,TextInput } from '@zextras/ui-components';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isValidPhoneNumber } from '../utility/utils';
import { useAccountForm, useSetAccountValues } from './account-form-context';

export const EditAccountContactsSection: React.FC = () => {
  const { form } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const [t] = useTranslation();
  const [isValidPhone, setIsValidPhone] = useState<boolean>(true);
  const [isValidHomePhone, setIsValidHomePhone] = useState<boolean>(true);
  const [isValidMobile, setIsValidMobile] = useState<boolean>(true);
  const [isValidPager, setIsValidPager] = useState<boolean>(true);
  const [isValidFaxNumber, setIsValidFaxNumber] = useState<boolean>(true);

  const changeAccDetail = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      [e?.target.name]: e.target.value,
    }));
  };

  const changeValidatedPhoneDetail = (
    e: ChangeEvent<HTMLInputElement>,
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>,
  ): void => {
    if (e.target.value) {
      const validPhone = isValidPhoneNumber(e.target.value);
      setIsValid(validPhone);
      if (validPhone) {
        changeAccDetail(e);
      }
    } else {
      changeAccDetail(e);
    }
  };

  const phoneTooltipLabel = t(
    'domain.accounts.phoneNumber.tooltip',
    'allowed chars are whitespaces, numbers and symbols -+()/,.',
  );
  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.phone', 'Phone')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="48%" mainAlignment="space-between">
            <TextInput
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                changeValidatedPhoneDetail(e, setIsValidPhone);
              }}
              hasError={!isValidPhone}
              description={isValidPhone ? undefined : phoneTooltipLabel}
              name="telephoneNumber"
              label={t('label.phone', 'Phone')}
              autoComplete="off"
              value={values?.telephoneNumber ?? ''}
            />
          </Row>
          <Row width="48%" mainAlignment="space-between">
            <TextInput
              label={t('label.home', 'Home')}
              autoComplete="off"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                changeValidatedPhoneDetail(e, setIsValidHomePhone);
              }}
              hasError={!isValidHomePhone}
              description={isValidHomePhone ? undefined : phoneTooltipLabel}
              name="homePhone"
              value={values?.homePhone ?? ''}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              label={t('label.mobile', 'Mobile')}
              autoComplete="off"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                changeValidatedPhoneDetail(e, setIsValidMobile);
              }}
              hasError={!isValidMobile}
              description={isValidMobile ? undefined : phoneTooltipLabel}
              name="mobile"
              value={values?.mobile ?? ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              label={t('label.pager', 'Pager')}
              autoComplete="off"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                changeValidatedPhoneDetail(e, setIsValidPager);
              }}
              hasError={!isValidPager}
              description={isValidPager ? undefined : phoneTooltipLabel}
              name="pager"
              value={values?.pager ?? ''}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              label={t('label.fax_number', 'Fax Number')}
              autoComplete="off"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                changeValidatedPhoneDetail(e, setIsValidFaxNumber);
              }}
              hasError={!isValidFaxNumber}
              description={isValidFaxNumber ? undefined : phoneTooltipLabel}
              name="facsimileTelephoneNumber"
              value={values?.facsimileTelephoneNumber ?? ''}
            />
          </Row>
        </Row>
      </Row>
      <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }}>
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.company', 'Company')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.company', 'Company')}
              onChange={changeAccDetail}
              name="company"
              value={values?.company ?? ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.job_title', 'Job Title')}
              onChange={changeAccDetail}
              name="title"
              value={values?.title ?? ''}
            />
          </Row>
        </Row>
      </Row>
      <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
        <Row padding={{ top: 'large' }}>
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.address', 'Address')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.country', 'Country')}
              onChange={changeAccDetail}
              name="co"
              value={values?.co ?? ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.state', 'State')}
              onChange={changeAccDetail}
              name="st"
              value={values?.st ?? ''}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.city', 'City')}
              onChange={changeAccDetail}
              name="l"
              value={values?.l ?? ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.postal_code', 'Postal Code')}
              onChange={changeAccDetail}
              name="postalCode"
              value={values?.postalCode ?? ''}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="flex-start">
            <TextInput
              autoComplete="off"
              label={t('label.address', 'Address')}
              onChange={changeAccDetail}
              name="street"
              value={values?.street ?? ''}
            />
          </Row>
        </Row>
      </Row>
    </Container>
  );
};

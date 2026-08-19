/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, Row, Tooltip } from '@zextras/ui-components';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isValidPhoneNumber } from '../../../../utility/utils';
import { useAccountForm, useSetAccountValues } from './account-form-context';

const EditAccountContactsSection: React.FC = () => {
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

  const phoneTooltipLabel = t(
    'domain.accounts.phoneNumber.tooltip',
    'allowed chars are whitespaces, numbers and symbols -+()/,.'
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
            <Tooltip placement="top" label={phoneTooltipLabel}>
              <Input
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.value) {
                    const validPhone = isValidPhoneNumber(e.target.value);
                    setIsValidPhone(validPhone);
                    if (validPhone) {
                      changeAccDetail(e);
                    }
                  } else {
                    changeAccDetail(e);
                  }
                }}
                hasError={!isValidPhone}
                inputName="telephoneNumber"
                label={t('label.phone', 'Phone')}
                backgroundColor="gray5"
                value={values?.telephoneNumber || ''}
              />
            </Tooltip>
          </Row>
          <Row width="48%" mainAlignment="space-between">
            <Tooltip placement="top" label={phoneTooltipLabel}>
              <Input
                label={t('label.home', 'Home')}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.value) {
                    const validPhone = isValidPhoneNumber(e.target.value);
                    setIsValidHomePhone(validPhone);
                    if (validPhone) {
                      changeAccDetail(e);
                    }
                  } else {
                    changeAccDetail(e);
                  }
                }}
                hasError={!isValidHomePhone}
                inputName="homePhone"
                value={values?.homePhone || ''}
              />
            </Tooltip>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <Tooltip placement="top" label={phoneTooltipLabel}>
              <Input
                backgroundColor="gray5"
                label={t('label.mobile', 'Mobile')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.value) {
                    const validPhone = isValidPhoneNumber(e.target.value);
                    setIsValidMobile(validPhone);
                    if (validPhone) {
                      changeAccDetail(e);
                    }
                  } else {
                    changeAccDetail(e);
                  }
                }}
                hasError={!isValidMobile}
                inputName="mobile"
                value={values?.mobile || ''}
              />
            </Tooltip>
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <Tooltip placement="top" label={phoneTooltipLabel}>
              <Input
                backgroundColor="gray5"
                label={t('label.pager', 'Pager')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.value) {
                    const validPhone = isValidPhoneNumber(e.target.value);
                    setIsValidPager(validPhone);
                    if (validPhone) {
                      changeAccDetail(e);
                    }
                  } else {
                    changeAccDetail(e);
                  }
                }}
                hasError={!isValidPager}
                inputName="pager"
                value={values?.pager || ''}
              />
            </Tooltip>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <Tooltip placement="top" label={phoneTooltipLabel}>
              <Input
                backgroundColor="gray5"
                label={t('label.fax_number', 'Fax Number')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.value) {
                    const validPhone = isValidPhoneNumber(e.target.value);
                    setIsValidFaxNumber(validPhone);
                    if (validPhone) {
                      changeAccDetail(e);
                    }
                  } else {
                    changeAccDetail(e);
                  }
                }}
                hasError={!isValidFaxNumber}
                inputName="facsimileTelephoneNumber"
                value={values?.facsimileTelephoneNumber || ''}
              />
            </Tooltip>
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
            <Input
              backgroundColor="gray5"
              label={t('label.company', 'Company')}
              onChange={changeAccDetail}
              inputName="company"
              value={values?.company || ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.job_title', 'Job Title')}
              onChange={changeAccDetail}
              inputName="title"
              value={values?.title || ''}
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
            <Input
              backgroundColor="gray5"
              label={t('label.country', 'Country')}
              onChange={changeAccDetail}
              inputName="co"
              value={values?.co || ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.state', 'State')}
              onChange={changeAccDetail}
              inputName="st"
              value={values?.st || ''}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.city', 'City')}
              onChange={changeAccDetail}
              inputName="l"
              value={values?.l || ''}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.postal_code', 'Postal Code')}
              onChange={changeAccDetail}
              inputName="postalCode"
              value={values?.postalCode || ''}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="flex-start">
            <Input
              backgroundColor="gray5"
              label={t('label.address', 'Address')}
              onChange={changeAccDetail}
              inputName="street"
              value={values?.street || ''}
            />
          </Row>
        </Row>
      </Row>
    </Container>
  );
};

export default EditAccountContactsSection;

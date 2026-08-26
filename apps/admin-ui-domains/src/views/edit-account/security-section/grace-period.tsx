/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { DatePicker, ListRow, Padding, Row } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useAccountForm,
  useSetAccountValues,
} from '../account-form-context';

export function computeGracePeriodDefaultDate(
  gentimeValue: string | undefined,
  enabled: string | undefined,
): Date | null {
  if (gentimeValue) {
    const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(gentimeValue);
    if (match) {
      return new Date(
        Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4]),
          Number(match[5]),
          Number(match[6]),
        ),
      );
    }
  }
  if (enabled) {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
  return null;
}

export const GracePeriodDatePicker = () => {
  const { form, accSpecificDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();

  const graceGentime =
    accSpecificDetail?.carbonioOtpGracePeriodEndingTime ??
    values?.carbonioOtpGracePeriodEndingTime;
  const graceEnabled = values?.carbonioOtpGracePeriodEnabled;
  const gracePeriodDefaultDate = computeGracePeriodDefaultDate(graceGentime, graceEnabled);

  const [fromDate, setFromDate] = useState<Date | null>(() =>
    computeGracePeriodDefaultDate(graceGentime, graceEnabled),
  );

  const [prevGraceGentime, setPrevGraceGentime] = useState(graceGentime);
  const [prevGraceEnabled, setPrevGraceEnabled] = useState(graceEnabled);
  if (prevGraceGentime !== graceGentime || prevGraceEnabled !== graceEnabled) {
    setPrevGraceGentime(graceGentime);
    setPrevGraceEnabled(graceEnabled);
    setFromDate(gracePeriodDefaultDate);
  }

  const isGracePeriodEnabled =
    values?.carbonioOtpGracePeriodEnabled === 'TRUE' &&
    values?.carbonioOtpWizardFromUntrusted === 'TRUE' &&
    values?.carbonioFeatureOTPMgmtEnabled === 'TRUE';

  const handleFromDateChange = (d: Date | null) => {
    setFromDate(d);
    if (!d) {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        carbonioOtpGracePeriodEndingTime: '',
      }));
      return;
    }
    const gentime = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(
      d.getUTCDate(),
    ).padStart(2, '0')}${String(d.getUTCHours()).padStart(2, '0')}${String(
      d.getUTCMinutes(),
    ).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      carbonioOtpGracePeriodEndingTime: gentime,
    }));
  };

  return (
    <ListRow padding={{ top: 'large' }}>
      <Padding left={'extralarge'} width="100%">
        <Row width="100%">
          <DatePicker
            disabled={!isGracePeriodEnabled}
            width={'21.625rem'}
            label={t(
              'domain.accounts.gracePeriodExpirationDate',
              'Set grace period expiration date',
            )}
            onChange={handleFromDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            selected={fromDate}
          />
        </Row>
      </Padding>
    </ListRow>
  );
};

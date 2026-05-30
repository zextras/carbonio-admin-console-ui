/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useField } from '@tanstack/react-form';
import { DatePicker } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CosFeaturesFormApi } from '../../types';

type GracePeriodEndDatePickerProps = {
  form: CosFeaturesFormApi;
};

export const GracePeriodEndDatePicker = ({ form }: GracePeriodEndDatePickerProps) => {
  const [t] = useTranslation();
  const field = useField({ form, name: 'carbonioOtpGracePeriodEndingTime' });
  const gracePeriodField = useField({ form, name: 'carbonioOtpGracePeriodEnabled' });

  const gentimeValue = field.state.value;
  let defaultDate = null;
  if (gentimeValue) {
    const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(gentimeValue);
    if (match) {
      defaultDate = new Date(
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

  return (
    <DatePicker
      disabled={gracePeriodField.state.value === 'FALSE'}
      width={'21.625rem'}
      label={t('cos.features.gracePeriodExpirationDate', 'Set grace period expiration date')}
      onChange={(d) => {
        if (!d) {
          field.handleChange('');
          return;
        }
        const gentime = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(
          2,
          '0',
        )}${String(d.getUTCDate()).padStart(2, '0')}${String(d.getUTCHours()).padStart(
          2,
          '0',
        )}${String(d.getUTCMinutes()).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(
          2,
          '0',
        )}Z`;
        field.handleChange(gentime);
      }}
      dateFormat="dd/MM/yyyy"
      minDate={new Date()}
      selected={defaultDate}
    />
  );
};

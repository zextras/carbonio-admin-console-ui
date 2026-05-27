/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useStore } from '@tanstack/react-form';
import { Container, Input, Padding } from '@zextras/ui-components';
import { isValidDecimalInput } from '@zextras/ui-shared';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../utility/utils';
import { getFieldErrorProps } from './cos-field-error';
import { CosAdvancedFormValues, CosFormApi } from './cos-form-api';
import { QuotaRevertIcon } from './quota-revert-icon';

type QuotaGBFieldInnerProps = {
  fieldState: {
    value: string | undefined;
    handleChange: (value: string) => void;
  };
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
  hasError: boolean;
  description?: string;
  onBlur: () => void;
};

const QuotaGBFieldInner = ({
  fieldState,
  label,
  maximumDigitsLabel,
  disabled,
  hasError,
  description,
  onBlur,
}: QuotaGBFieldInnerProps) => {
  const [rawGB, setRawGB] = useState(
    () => (fieldState.value ? BytesToGB(fieldState.value).toFixed(2) : ''),
  );
  const [showMsg, setShowMsg] = useState(false);
  const isUserEditing = useRef(false);
  const initialValue = useRef(fieldState.value);
  const [t] = useTranslation();

  useEffect(() => {
    if (isUserEditing.current) {
      isUserEditing.current = false;
      return;
    }
    setRawGB(fieldState.value ? BytesToGB(fieldState.value).toFixed(2) : '');
    setShowMsg(false);
  }, [fieldState.value]);

  const showRevert = fieldState.value !== initialValue.current;

  const handleRevert = () => {
    const bytes = initialValue.current;
    fieldState.handleChange(bytes ?? '');
    setRawGB(bytes ? BytesToGB(bytes).toFixed(2) : '');
    setShowMsg(false);
  };

  const revertLabel = t('cos_quota.click_to_revert', 'Click to revert to the inherited value');
  const RevertIcon = showRevert
    ? () => <QuotaRevertIcon label={revertLabel} onClick={handleRevert} />
    : undefined;

  return (
    <>
      <Input
        label={label}
        value={rawGB}
        backgroundColor="gray5"
        inputName="zimbraMailQuota"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (!isValidDecimalInput(e.target.value)) return;
          const dp = e.target.value?.split('.')[1];
          if (dp && dp.length > 3) {
            setShowMsg(true);
            return;
          }
          setShowMsg(false);
          isUserEditing.current = true;
          setRawGB(e.target.value);
          fieldState.handleChange(
            e.target.value ? String(Math.round(GbToBytes(e.target.value))) : '',
          );
        }}
        onBlur={onBlur}
        hasError={hasError}
        description={description}
        disabled={disabled}
        CustomIcon={RevertIcon}
      />
      {showMsg && (
        <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
          <Padding top="small">
            <ds-text as="span" size="extrasmall" weight="regular" color="primary">
              {maximumDigitsLabel}
            </ds-text>
          </Padding>
        </Container>
      )}
    </>
  );
};

type QuotaGBFieldProps = {
  form: CosFormApi;
  name: keyof CosAdvancedFormValues;
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
};

export const QuotaGBField = ({
  form,
  name,
  label,
  maximumDigitsLabel,
  disabled,
}: QuotaGBFieldProps) => {
  const [t] = useTranslation();
  const isSubmitted = useStore(form.store, (s) => s.submissionAttempts > 0);
  return (
    <form.Field name={name}>
      {(field) => {
        const error = getFieldErrorProps(field, isSubmitted, t);
        return (
          <QuotaGBFieldInner
            fieldState={{
              value: field.state.value as string | undefined,
              handleChange: field.handleChange,
            }}
            label={label}
            maximumDigitsLabel={maximumDigitsLabel}
            disabled={disabled}
            hasError={error.hasError}
            description={error.description}
            onBlur={() => field.handleBlur()}
          />
        );
      }}
    </form.Field>
  );
};

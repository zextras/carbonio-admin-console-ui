/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, Padding } from '@zextras/ui-components';
import { isValidDecimalInput } from '@zextras/ui-shared';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../../utility/utils';
import { CosAdvancedFormValues, CosFormApi } from '../types';
import { getFieldErrorProps } from './field-error';
import { QuotaRevertIcon } from './quota-revert-icon';

function gbFromBytes(bytes: string | undefined): string {
  return bytes ? BytesToGB(bytes).toFixed(2) : '';
}

type QuotaGBFieldInnerProps = {
  value: string;
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
  hasError: boolean;
  description?: string;
  showMsg: boolean;
  showRevert: boolean;
  revertLabel: string;
  onChange: (gb: string) => void;
  onRevert: () => void;
  onBlur: () => void;
};

const QuotaGBFieldInner: FC<QuotaGBFieldInnerProps> = ({
  value,
  label,
  maximumDigitsLabel,
  disabled,
  hasError,
  description,
  showMsg,
  showRevert,
  revertLabel,
  onChange,
  onRevert,
  onBlur,
}) => {
  const RevertIcon = showRevert
    ? () => <QuotaRevertIcon label={revertLabel} onClick={onRevert} />
    : undefined;

  return (
    <>
      <Input
        label={label}
        value={value}
        backgroundColor="gray5"
        inputName="zimbraMailQuota"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (!isValidDecimalInput(e.target.value)) return;
          onChange(e.target.value);
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

type QuotaGBFieldControllerProps = {
  fieldValue: string | undefined;
  handleChange: (value: string) => void;
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
  hasError: boolean;
  description?: string;
  onBlur: () => void;
};

const QuotaGBFieldController = ({
  fieldValue,
  handleChange,
  label,
  maximumDigitsLabel,
  disabled,
  hasError,
  description,
  onBlur,
}: QuotaGBFieldControllerProps) => {
  const [t] = useTranslation();
  const initialValue = useRef(fieldValue);
  const lastEmitted = useRef(fieldValue);
  const [rawGB, setRawGB] = useState(() => gbFromBytes(fieldValue));
  const [showMaxDigitsMsg, setShowMaxDigitsMsg] = useState(false);

  if (fieldValue !== lastEmitted.current) {
    lastEmitted.current = fieldValue;
    setRawGB(gbFromBytes(fieldValue));
    setShowMaxDigitsMsg(false);
  }

  const showRevert = fieldValue !== initialValue.current;
  const revertLabel = t('cos_quota.click_to_revert', 'Click to revert to the inherited value');

  const onChange = (gb: string) => {
    const dp = gb?.split('.')[1];
    if (dp && dp.length > 3) {
      setShowMaxDigitsMsg(true);
      return;
    }
    setShowMaxDigitsMsg(false);
    setRawGB(gb);
    const bytes = gb ? String(Math.round(GbToBytes(gb))) : '';
    lastEmitted.current = bytes;
    handleChange(bytes);
  };

  const onRevert = () => {
    const bytes = initialValue.current ?? '';
    lastEmitted.current = bytes;
    handleChange(bytes);
    setRawGB(gbFromBytes(initialValue.current));
    setShowMaxDigitsMsg(false);
  };

  return (
    <QuotaGBFieldInner
      value={rawGB}
      label={label}
      maximumDigitsLabel={maximumDigitsLabel}
      disabled={disabled}
      hasError={hasError}
      description={description}
      showMsg={showMaxDigitsMsg}
      showRevert={showRevert}
      revertLabel={revertLabel}
      onChange={onChange}
      onRevert={onRevert}
      onBlur={onBlur}
    />
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
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  return (
    <form.Field name={name}>
      {(field) => {
        const error = getFieldErrorProps(field, isSubmitted, t);
        return (
          <QuotaGBFieldController
            fieldValue={field.state.value as string | undefined}
            handleChange={field.handleChange}
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

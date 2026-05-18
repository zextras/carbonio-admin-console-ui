/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, InheritedInput, Padding, Row } from '@zextras/ui-components';
import { isValidDecimalInput, useIsAdvanced } from '@zextras/ui-shared';
import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

type EditAccountQuotaInputsLegacyProps = {
  focusableFileQuota: boolean;
  highlightFileQuota: boolean;
  focusableMailboxQuota: boolean;
  highlightMailboxQuota: boolean;
  setFocusableFileQuota: (value: boolean) => void;
  setHighlightFileQuota: (value: boolean) => void;
  setFocusableMailboxQuota: (value: boolean) => void;
  setHighlightMailboxQuota: (value: boolean) => void;
};

export const EditAccountQuotaInputsLegacy = ({
  focusableFileQuota,
  highlightFileQuota,
  focusableMailboxQuota,
  highlightMailboxQuota,
  setFocusableFileQuota,
  setHighlightFileQuota,
  setFocusableMailboxQuota,
  setHighlightMailboxQuota,
}: EditAccountQuotaInputsLegacyProps): React.JSX.Element => {
  const { accountDetail, setAccountDetail, accSpecificDetail, cosDetail, initAccountDetail } =
    useContext(AccountContext);

  const setEmptyValue = useCallback(
    (keyName: string) => {
      setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
    },
    [setAccountDetail],
  );

  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const [accountQuotaGBValue, setAccountQuotaGBValue] = useState('');
  const [fileQuotaGBValue, setFileQuotaGBValue] = useState('');
  const [showFileQuotaLimitMsg, setShowFileQuotaLimitMsg] = useState<boolean>(false);
  const [showAccountQuotaLimitMsg, setShowAccountQuotaLimitMsg] = useState<boolean>(false);

  const setEmptyAccountQuota = useCallback(
    (keyName: string) => {
      setEmptyValue(keyName);
      setAccountQuotaGBValue('');
    },
    [setEmptyValue],
  );

  const setEmptyFileQuota = useCallback(
    (keyName: string) => {
      setEmptyValue(keyName);
      setFileQuotaGBValue('');
    },
    [setEmptyValue],
  );

  const handleQuotaChange = useCallback(
    (
      value: string,
      setQuotaLimitMsg: (msg: boolean) => void,
      setQuotaGBValue: (value: string) => void,
      name: string,
    ) => {
      if (!isValidDecimalInput(value)) return;
      const decimalPoints = value?.split('.')[1];
      if (!!decimalPoints && decimalPoints?.length > 3) {
        setQuotaLimitMsg(true);
        return;
      }
      setQuotaLimitMsg(false);
      setQuotaGBValue(value);
      setAccountDetail((prev: any) => ({
        ...prev,
        [name]: value ? Math.round(GbToBytes(value)) : '',
      }));
    },
    [setAccountDetail],
  );

  const changeFileQuotaLimit = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleQuotaChange(
        e.target.value,
        setShowFileQuotaLimitMsg,
        setFileQuotaGBValue,
        e.target.name,
      );
    },
    [handleQuotaChange, setShowFileQuotaLimitMsg, setFileQuotaGBValue],
  );

  const changeAccountQuota = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleQuotaChange(
        e.target.value,
        setShowAccountQuotaLimitMsg,
        setAccountQuotaGBValue,
        e.target.name,
      );
    },
    [handleQuotaChange, setShowAccountQuotaLimitMsg, setAccountQuotaGBValue],
  );

  useEffect(() => {
    if (
      initAccountDetail?.zimbraMailQuota &&
      accountDetail?.zimbraMailQuota === initAccountDetail?.zimbraMailQuota
    ) {
      setAccountQuotaGBValue(
        initAccountDetail.zimbraMailQuota
          ? BytesToGB(initAccountDetail.zimbraMailQuota).toFixed(2)
          : '',
      );
    }
  }, [accountDetail.zimbraMailQuota, initAccountDetail.zimbraMailQuota]);

  useEffect(() => {
    if (
      initAccountDetail?.filesQuotaLimit &&
      initAccountDetail?.filesQuotaLimit === accountDetail?.filesQuotaLimit
    ) {
      setFileQuotaGBValue(
        initAccountDetail?.filesQuotaLimit &&
          initAccountDetail?.filesQuotaLimit < 9223372036854776000
          ? BytesToGB(initAccountDetail?.filesQuotaLimit).toFixed(2)
          : '0.00',
      );
    }
  }, [accountDetail?.filesQuotaLimit, initAccountDetail?.filesQuotaLimit]);

  return (
    <Row
      width="100%"
      padding={{ top: 'large', left: 'large' }}
      mainAlignment="space-between"
      crossAlignment="flex-start"
    >
      <Row
        width={isAdvanced && initAccountDetail?.filesQuotaLimit ? '49%' : '100%'}
        mainAlignment="flex-start"
      >
        <InheritedInput
          label={t('label.mailbox_quota_limit_gb', 'Mailbox Quota Limit (GB)')}
          subValue={accountQuotaGBValue}
          inheritedValue={
            cosDetail?.zimbraMailQuota ? BytesToGB(cosDetail.zimbraMailQuota).toFixed(2) : ''
          }
          fromSubValue={
            accSpecificDetail?.zimbraMailQuota
              ? BytesToGB(accSpecificDetail.zimbraMailQuota).toFixed(2)
              : undefined
          }
          background="gray5"
          inputName="zimbraMailQuota"
          onChange={changeAccountQuota}
          focus={focusableMailboxQuota}
          highlighted={highlightMailboxQuota}
          onBlur={(): void => {
            setFocusableMailboxQuota(false);
            setHighlightMailboxQuota(false);
          }}
          onChangeReset={(): void => setEmptyAccountQuota('zimbraMailQuota')}
        />
        {showAccountQuotaLimitMsg && (
          <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
            <Padding top="small">
              <ds-text size="extrasmall" weight="regular" color="primary" as="small">
                {t(
                  'label.maximum_3_digits_allowed_decimal_point',
                  'Maximum 3 digits allowed after the decimal point',
                )}
              </ds-text>
            </Padding>
          </Container>
        )}
      </Row>
      {isAdvanced && initAccountDetail?.filesQuotaLimit && (
        <Row width="49%" mainAlignment="flex-start">
          <InheritedInput
            background="gray5"
            label={t('label.files_space_limit_gb', 'Files Space Limit (GB)')}
            subValue={fileQuotaGBValue}
            inheritedValue={
              cosDetail.filesQuotaLimit && cosDetail.filesQuotaLimit < 9223372036854776000
                ? BytesToGB(cosDetail.filesQuotaLimit).toFixed(2)
                : '0.00'
            }
            fromSubValue={cosDetail.filesQuotaLimit !== accountDetail.filesQuotaLimit}
            onChange={changeFileQuotaLimit}
            onChangeReset={(): void => setEmptyFileQuota('filesQuotaLimit')}
            inputName="filesQuotaLimit"
            focus={focusableFileQuota}
            highlighted={highlightFileQuota}
            onBlur={(): void => {
              setFocusableFileQuota(false);
              setHighlightFileQuota(false);
            }}
          />
          {showFileQuotaLimitMsg && (
            <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
              <Padding top="small">
                <ds-text size="extrasmall" weight="regular" color="primary" as="small">
                  {t(
                    'label.maximum_3_digits_allowed_decimal_point',
                    'Maximum 3 digits allowed after the decimal point',
                  )}
                </ds-text>
              </Padding>
            </Container>
          )}
        </Row>
      )}
    </Row>
  );
};

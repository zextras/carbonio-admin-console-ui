/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button, ChipInput, Container, CustomHeaderFactory, DatePicker, HorizontalWizard, HoverableRowFactory, InheritedInput, InheritedSelect, InheritedSwitch, Input, ListRow, Modal, Padding, Row, Select, Switch, Table, Tooltip, useSnackbar, WizardInSection, } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { map } from 'lodash-es';
import { QRCodeSVG } from 'qrcode.react';
import {
  ChangeEvent,
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { DISABLED, ENABLED, FALSE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { fetchSoap } from '../../../services/generateOTP-service';
import { sendMail } from '../../../services/send-mail-service';
import CustomChip from '../../components/customChip';
import { isValidEmail } from '../../utility/utils';
import { emailContent } from '../manange/accounts/create-account/email-content';
import { useAccountForm, useSetAccountValues, useToggleAccountValue } from './account-form-context';
import styles from './security-section.module.css';
import { ServicesPassphrase } from './services-passphrase';

const EditAccountSecuritySection: FC = () => {
  const {
    form,
    otpList,
    accSpecificDetail,
    cosDetail,
    account,
  } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const queryClient = useQueryClient();
  const getListOtp = useCallback(
    // account name is taken from context; queries are invalidated by key
    (): void => {
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.otpList(account.name) });
    },
    [queryClient, account.name],
  );
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [showCreateOTP, setShowCreateOTP] = useState<boolean>(false);
  const [qrData, setQrData] = useState('');
  const [secrateCode, setSecrateCode] = useState('');
  const [sendEmailTo, setSendEmailTo] = useState<any[]>([]);
  const [pinCodes, setPinCodes] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRestoreOtpModalOpen, setIsRestoreOtpModalOpen] = useState<boolean>(false);
  const [selectedOtpIdForRestore, setSelectedOtpIdForRestore] = useState<string | undefined>();
  const [isRestoreOtpInProgress, setIsRestoreOtpInProgress] = useState<boolean>(false);
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const isAdvanced = useIsAdvanced();

  const handleSendOTPEmail = useCallback((): void => {
    const emailRecipients = [
      {
        t: 'f',
        a: `${values?.name}@${domainName}`,
        d: values?.name,
      },
      ...map(sendEmailTo, (email: any) => ({ t: 't', a: email.label, d: '' })),
    ];

    sendMail('SendMsgRequest', {
      _jsns: 'urn:zimbraMail',
      m: {
        attach: { mp: [] },
        su: { _content: 'Account 2FA code' },
        e: emailRecipients,
        mp: [
          {
            ct: 'text/html',
            body: true,
            content: {
              _content: emailContent(pinCodes, secrateCode),
            },
          },
        ],
      },
    })
      .then(() => {
        setSendEmailTo([]);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('domain.editAccount.otpSentSuccessfully', 'OTP has been sent successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .catch(() => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [values?.name, domainName, sendEmailTo, pinCodes, secrateCode, createSnackbar, t]);

  const handleEmailChange = useCallback((contacts: any): void => {
    const data = map(contacts, (contact) => {
      const isValid = isValidEmail(contact.label ?? '');
      return {
        ...contact,
        error: !isValid,
      };
    });
    setSendEmailTo(data);
  }, []);

  const hasEmailError = useMemo(
    () => sendEmailTo?.some((contact: any) => contact.error),
    [sendEmailTo],
  );

  const isSendDisabled = useMemo(
    () => sendEmailTo.length === 0 || hasEmailError,
    [sendEmailTo, hasEmailError],
  );

  const wizardSteps = useMemo(
    () => [
      {
        name: 'otp',
        label: t('label.create_otp', 'CREATE OTP'),
        icon: 'KeyOutline',
        view: (): ReactElement => (
          <Container mainAlignment="flex-start">
            <Row
              padding={{ top: 'large', left: 'large' }}
              width="100%"
              mainAlignment="space-between"
            >
              <Row width="40%" mainAlignment="flex-start">
                <QRCodeSVG data-testid="qrcode-password" size={179} value={qrData} />
              </Row>
              <Row width="60%" mainAlignment="flex-start">
                <Container>
                  <Padding top="large">
                    <Row mainAlignment="center">
                      <Row background="gray5" style={{ maxWidth: '350px' }}>
                        <div className={styles.staticCodesWrapper}>
                          {map(pinCodes, (singleCode: any) => (
                            <label key={singleCode.code} className={styles.staticCode}>
                              {singleCode.code}
                            </label>
                          ))}
                        </div>
                      </Row>
                    </Row>
                  </Padding>
                </Container>
                <Container
                  orientation="horizontal"
                  width="99%"
                  crossAlignment="center"
                  mainAlignment="space-between"
                >
                  <Row
                    mainAlignment="center"
                    width="100%"
                    padding={{
                      top: 'small',
                      bottom: 'small',
                    }}
                  >
                    <ds-text as="h3">{t('account_details.secret_code', 'Secret Code')}</ds-text>
                  </Row>
                </Container>
                <Container
                  orientation="horizontal"
                  width="99%"
                  crossAlignment="center"
                  mainAlignment="space-between"
                >
                  <Row
                    mainAlignment="center"
                    width="100%"
                    padding={{
                      top: 'small',
                      bottom: 'small',
                    }}
                  >
                    <ds-text as="strong">{secrateCode}</ds-text>
                  </Row>
                </Container>
              </Row>
            </Row>
            <Container
              orientation="horizontal"
              width="99%"
              crossAlignment="center"
              mainAlignment="space-between"
            >
              <Row
                mainAlignment="center"
                width="100%"
                padding={{
                  top: 'small',
                  bottom: 'small',
                }}
              >
                <ds-text as="p">
                  {t(
                    'account_details.please_note_code',
                    `Please note: you'll be able to see these codes just once.`,
                  )}
                </ds-text>
              </Row>
            </Container>
            <Container
              orientation="horizontal"
              width="99%"
              crossAlignment="center"
              mainAlignment="space-between"
            >
              <Row
                mainAlignment="center"
                width="100%"
                padding={{
                  top: 'small',
                  bottom: 'small',
                }}
              >
                <ds-text as="p">
                  {t(
                    'account_details.select_email_otp',
                    `Select an email address to send the OTP to or copy the code above`,
                  )}
                </ds-text>
              </Row>
            </Container>
            <Row
              padding={{ top: 'large', left: 'large' }}
              width="100%"
              mainAlignment="space-between"
            >
              <Row width="80%" mainAlignment="space-between" padding={{ right: 'large' }}>
                <ChipInput
                  placeholder={t('account_details.send_the_otp_to', 'Send the OTP to')}
                  onChange={handleEmailChange}
                  value={sendEmailTo}
                  background="gray5"
                  ChipComponent={CustomChip}
                  maxChips={null}
                  hasError={hasEmailError}
                  data-testid="otp-email-input"
                />
                <ds-text as="strong" color="error" size="small">
                  {hasEmailError &&
                    t(
                      'domain.editAccount.invalidaEmailError',
                      'One or more email addresses are invalid.',
                    )}
                </ds-text>
              </Row>
              <Row width="20%" mainAlignment="space-between">
                <Button
                  label={t('account_details.send', 'SEND')}
                  icon="PaperPlaneOutline"
                  size="large"
                  iconPlacement="right"
                  disabled={isSendDisabled}
                  onClick={handleSendOTPEmail}
                />
              </Row>
            </Row>
          </Container>
        ),
        clickDisabled: true,
        CancelButton: () => <></>,
        PrevButton: (): ReactElement => <></>,
        NextButton: (props: any) => (
          <Button
            {...props}
            label={t('commons.data_already_sent_to_the_user', 'DATA ALREADY SENT TO THE USER')}
            icon="PersonOutline"
            iconPlacement="right"
            onClick={(): void => setShowCreateOTP(false)}
          />
        ),
      },
    ],
    [
      handleEmailChange,
      handleSendOTPEmail,
      hasEmailError,
      isSendDisabled,
      pinCodes,
      qrData,
      secrateCode,
      sendEmailTo,
      t,
    ],
  );
  const [zimbraPasswordLockoutDurationNum, setZimbraPasswordLockoutDurationNum] = useState(
    values?.zimbraPasswordLockoutDuration?.slice(0, -1),
  );
  const zimbraPasswordLockoutDurationType =
    values?.zimbraPasswordLockoutDuration?.slice(-1) || '';
  const [zimbraPasswordLockoutFailureLifetimeNum, setZimbraPasswordLockoutFailureLifetimeNum] =
    useState(values?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1));
  const zimbraPasswordLockoutFailureLifetimeType =
    values?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || '';
  const [recoveryEmailError, setRecoveryEmailError] = useState<boolean>(false);

  const headers: any = useMemo(
    () => [
      {
        id: 'description',
        label: t('label.description', 'Description'),
        width: '40%',
        bold: true,
      },
      {
        id: 'status',
        label: t('label.status', 'Status'),
        width: '20%',
        bold: true,
      },
      {
        id: 'failed',
        label: t('label.failed', 'Failed'),
        width: '20%',
        bold: true,
      },
      {
        id: 'creation-date',
        label: t('label.creation_date', 'Creation Date'),
        width: '15%',
        bold: true,
      },
      {
        id: 'actions',
        label: t('label.actions', 'Actions'),
        width: '15%',
        bold: true,
      },
    ],
    [t],
  );

  const openRestoreOtpModal = useCallback((otpId: string): void => {
    setSelectedOtpIdForRestore(otpId);
    setIsRestoreOtpModalOpen(true);
  }, []);

  const closeRestoreOtpModal = useCallback((): void => {
    setSelectedOtpIdForRestore(undefined);
    setIsRestoreOtpModalOpen(false);
  }, []);

  const otpRows = useMemo(
    () =>
      map(otpList, (otpEntry: any) => {
        const isDisabledOtp = otpEntry?.enabled === false;
        return {
          id: otpEntry?.id,
          columns: [
            <ds-text as="span" size="medium" key={`${otpEntry?.id}-label`} color="gray0">
              {otpEntry?.label || ' '}
            </ds-text>,
            <ds-text as="span" size="medium" key={`${otpEntry?.id}-status`} color="gray0">
              {otpEntry?.enabled
                ? t('label.enabled', 'Enabled')
                : t('label.disabled', 'Disabled')}
            </ds-text>,
            <ds-text as="span" size="medium" key={`${otpEntry?.id}-failed`}>
              {otpEntry?.failed_attempts}
            </ds-text>,
            <ds-text as="span" size="medium" key={`${otpEntry?.id}-created`}>
              {otpEntry?.created ? format(new Date(otpEntry?.created), 'dd/MMM/yyyy') : ''}
            </ds-text>,
            isDisabledOtp ? (
              <Tooltip label={t('domain.editAccount.restoreOtpTooltip', "Restore OTP's")}>
                <button
                  type="button"
                  className={styles.restoreOtpAction}
                  onClick={(): void => openRestoreOtpModal(otpEntry.id)}
                  data-testid={`restore-otp-${otpEntry.id}`}
                >
                  <ds-icon icon="RefreshOutline"></ds-icon>
                </button>
              </Tooltip>
            ) : (
              <>&nbsp;</>
            ),
          ],
        };
      }),
    [otpList, t, openRestoreOtpModal],
  );

  const timeItems: any[] = useMemo(
    () => [
      {
        label: t('label.days', 'Days'),
        value: 'd',
      },
      {
        label: t('label.hours', 'Hours'),
        value: 'h',
      },
      {
        label: t('label.minutes', 'Minutes'),
        value: 'm',
      },
      {
        label: t('label.seconds', 'Seconds'),
        value: 's',
      },
    ],
    [t],
  );

  const recoveryStatus: any[] = useMemo(
    () => [
      {
        label: t('label.pending', 'Pending'),
        value: 'pending',
      },
      {
        label: t('label.verified', 'Verified'),
        value: 'verified',
      },
    ],
    [t],
  );

  const handleOnGenerateOTP = (): void => {
    fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxAuth',
      action: 'totp_generate_command',
      account: `${values?.uid}@${domainName}`,
    }).then((res: any) => {
      if (res.ok) {
        setQrData(
          `otpauth://totp/${encodeURIComponent(res.response.label)}?secret=${
            res.response.secret
          }&issuer=${res.response.issuer}&algorithm=${res.response.algorithm}&digits=${
            res.response.digits_length
          }&period=${res.response.period}`,
        );
        setSecrateCode(res.response.secret);
        setPinCodes(res.response.static_otp_codes);
        setShowCreateOTP(true);
        getListOtp();
      }
    });
  };
  const handleDeleteOTP = (): void => {
    fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxAuth',
      action: 'delete_totp_command',
      account: `${values?.uid}@${domainName}`,
      id: selectedRows?.[0],
    }).then((res: any) => {
      if (res.ok) {
        setSelectedRows([]);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.otp_deleted_successfully', 'OTP has been deleted successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        getListOtp();
      } else {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    });
  };

  const handleRestoreOTP = useCallback((): void => {
    if (!selectedOtpIdForRestore) {
      return;
    }

    setIsRestoreOtpInProgress(true);
    fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxAuth',
      action: 'restore-otp',
      account: `${values?.uid}@${domainName}`,
      id: selectedOtpIdForRestore,
    })
      .then(
        (res: {
          ok?: boolean | string;
          Body?: { response?: { content?: unknown } };
          response?: { content?: unknown };
        }) => {
          const parseRestoreResult = (content: unknown): { ok?: boolean | string } | undefined => {
            if (typeof content === 'string') {
              try {
                return JSON.parse(content) as { ok?: boolean | string };
              } catch {
                return undefined;
              }
            }

            if (content && typeof content === 'object') {
              return content as { ok?: boolean | string };
            }

            return undefined;
          };

          const parsedFromBody = parseRestoreResult(res.Body?.response?.content);
          const parsedFromResponse = parseRestoreResult(res.response?.content);
          const restoreResult = parsedFromBody ?? parsedFromResponse ?? res;
          const isRestoreSuccess =
            restoreResult.ok === true || restoreResult.ok === 'true' || restoreResult.ok === 'ok';

          if (isRestoreSuccess) {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t('label.otp_restored_successfully', 'OTP has been restored successfully'),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
            closeRestoreOtpModal();
            getListOtp();
            return;
          }

          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        },
      )
      .catch(() => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .finally(() => {
        setIsRestoreOtpInProgress(false);
      });
  }, [
    selectedOtpIdForRestore,
    values?.uid,
    domainName,
    createSnackbar,
    t,
    closeRestoreOtpModal,
    getListOtp,
  ]);

  const changeValue = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAccountValues((prev: Record<string, any>) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [setAccountValues],
  );

  const setEmptyValue = useCallback(
    (keyName: string) => {
      setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
    },
    [setAccountValues],
  );

  const onZimbraPasswordLockoutDurationTypeChange = useCallback(
    (v: string) => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
          ? `${zimbraPasswordLockoutDurationNum}${v}`
          : '',
      }));
    },
    [zimbraPasswordLockoutDurationNum, setAccountValues],
  );
  const onZimbraPasswordLockoutDurationNumChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        zimbraPasswordLockoutDuration: e.target.value
          ? `${e.target.value}${zimbraPasswordLockoutDurationType}`
          : '',
      }));
      setZimbraPasswordLockoutDurationNum(e.target.value);
    },
    [zimbraPasswordLockoutDurationType, setAccountValues],
  );

  const onZimbraPasswordLockoutFailureLifetimeTypeChange = useCallback(
    (v: string) => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        zimbraPasswordLockoutFailureLifetime: zimbraPasswordLockoutFailureLifetimeNum
          ? `${zimbraPasswordLockoutFailureLifetimeNum}${v}`
          : '',
      }));
    },
    [zimbraPasswordLockoutFailureLifetimeNum, setAccountValues],
  );
  const onZimbraPasswordLockoutFailureLifetimeNumChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAccountValues((prev: Record<string, any>) => ({
        ...prev,
        zimbraPasswordLockoutFailureLifetime: e.target.value
          ? `${e.target.value}${zimbraPasswordLockoutFailureLifetimeType}`
          : '',
      }));
      setZimbraPasswordLockoutFailureLifetimeNum(e.target.value);
    },
    [zimbraPasswordLockoutFailureLifetimeType, setAccountValues],
  );

  const onRecoveryStatusChange = (v: unknown): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setAccountValues((prev: Record<string, any>) => ({ ...prev, zimbraPrefPasswordRecoveryAddressStatus: v }));
  };

  const gracePeriodDefaultDate = useMemo(() => {
    const gentimeValue =
      accSpecificDetail?.carbonioOtpGracePeriodEndingTime ??
      values?.carbonioOtpGracePeriodEndingTime;
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
    if (values?.carbonioOtpGracePeriodEnabled) {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
    return null;
  }, [
    accSpecificDetail?.carbonioOtpGracePeriodEndingTime,
    values?.carbonioOtpGracePeriodEndingTime,
    values?.carbonioOtpGracePeriodEnabled,
  ]);

  const [fromDate, setFromDate] = useState<Date | null>(gracePeriodDefaultDate);

  useEffect(() => {
    setFromDate(gracePeriodDefaultDate);
  }, [gracePeriodDefaultDate]);

  const isGracePeriodEnabled =
    values?.carbonioOtpGracePeriodEnabled === 'TRUE' &&
    values?.carbonioOtpWizardFromUntrusted === 'TRUE' &&
    values?.carbonioFeatureOTPMgmtEnabled === 'TRUE';

  const handleFromDateChange = useCallback(
    (d: Date | null) => {
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
    },
    [setAccountValues],
  );

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      {isAdvanced && <ServicesPassphrase />}
      {isAdvanced && (
        <>
          {!showCreateOTP && (
            <Row mainAlignment="flex-start" width="100%">
              <Row mainAlignment="flex-start" width="100%" padding={{ left: 'large' }}>
                <Container
                  height="fit"
                  crossAlignment="flex-start"
                  background="gray6"
                  padding={{ top: 'large' }}
                >
                  <ListRow>
                    <Container crossAlignment="flex-start">
                      <ds-text as="h2" color="gray0" weight="bold">
                        {t('domain.accounts.twoFactorAuthenticator', 'Two-Factor authenticator')}
                      </ds-text>
                      <Row padding={{ top: 'large' }}></Row>
                      <InheritedSwitch
                        subValue={values?.carbonioFeatureOTPMgmtEnabled}
                        onChange={toggleAccountValue}
                        label={t(
                          'domain.accounts.allowUsersToConfigure2FA',
                          'Allow users to configure 2FA',
                        )}
                        iconColor="primary"
                        inheritedValue={cosDetail.carbonioFeatureOTPMgmtEnabled}
                        fromSubValue={accSpecificDetail?.carbonioFeatureOTPMgmtEnabled}
                        inputName={'carbonioFeatureOTPMgmtEnabled'}
                        onChangeReset={(): void => setEmptyValue('carbonioFeatureOTPMgmtEnabled')}
                      />
                      <Padding left={'extralarge'}>
                        <Row padding={{ left: 'small' }}>
                          <ds-text as="small" color="gray1" size="small" overflow="break-word">
                            {t(
                              'domain.accounts.allowUsersToConfigure2FAInfo',
                              'Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.',
                            )}
                          </ds-text>
                        </Row>
                      </Padding>
                    </Container>
                  </ListRow>
                </Container>
              </Row>
              <Row
                width="100%"
                mainAlignment="flex-end"
                crossAlignment="flex-end"
                padding={{ right: 'large', top: 'large' }}
              >
                <Padding right="large">
                  <Button
                    type="outlined"
                    label={t('label.NEW_OTP', 'NEW OTP')}
                    icon="PlusOutline"
                    iconPlacement="right"
                    color="primary"
                    onClick={(): void => handleOnGenerateOTP()}
                  />
                </Padding>
                <Button
                  type="outlined"
                  label={t('label.DELETE', 'DELETE')}
                  icon="Trash2Outline"
                  iconPlacement="right"
                  color="error"
                  disabled={!selectedRows?.length}
                  onClick={(): void => handleDeleteOTP()}
                />
              </Row>
              <Row
                padding={{ top: 'large', left: 'large', right: 'large' }}
                width="100%"
                mainAlignment="space-between"
              >
                <Row
                  orientation="horizontal"
                  mainAlignment="space-between"
                  crossAlignment="flex-start"
                  width="fill"
                >
                  {otpList.length !== 0 && (
                    <Table
                      rows={otpRows}
                      headers={headers}
                      multiSelect={false}
                      onSelectionChange={setSelectedRows}
                      style={{ overflow: 'auto', height: '100%' }}
                      RowFactory={HoverableRowFactory}
                      HeaderFactory={CustomHeaderFactory}
                    />
                  )}
                  {otpList.length === 0 && (
                    <Container
                      orientation="column"
                      crossAlignment="center"
                      mainAlignment="center"
                      padding={{ bottom: 'large' }}
                    >
                      <Row>
                        <img src={logo} alt="logo" />
                      </Row>
                      <Row
                        padding={{ top: 'extralarge' }}
                        orientation="vertical"
                        crossAlignment="center"
                        style={{ textAlign: 'center' }}
                      >
                        <ds-text
                          as="p"
                          weight="light"
                          color="#828282"
                          size="large"
                          overflow="break-word"
                        >
                          {t('label.this_list_is_empty', 'This list is empty.')}
                        </ds-text>
                      </Row>
                      <Row
                        orientation="vertical"
                        crossAlignment="center"
                        style={{ textAlign: 'center' }}
                        padding={{ top: 'small' }}
                        width="53%"
                      >
                        <ds-text
                          as="p"
                          weight="light"
                          color="#828282"
                          size="large"
                          overflow="break-word"
                        >
                          <Trans
                            i18nKey="label.create_otp_list_msg"
                            defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
                            components={{ bold: <strong /> }}
                          />
                        </ds-text>
                      </Row>
                    </Container>
                  )}
                </Row>
                <ds-divider></ds-divider>
              </Row>
            </Row>
          )}
          <Modal
            title={t('domain.editAccount.restoreOtpTitle', 'Restore OTP')}
            open={isRestoreOtpModalOpen}
            showCloseIcon
            onClose={closeRestoreOtpModal}
            customFooter={
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Padding right="small">
                  <Button
                    label={t('label.no_cancel', 'NO, CANCEL')}
                    color="secondary"
                    onClick={closeRestoreOtpModal}
                  />
                </Padding>
                <Button
                  label={t('domain.editAccount.yesRestoreOtpAnyway', 'YES, RESTORE ANYWAY')}
                  color="primary"
                  onClick={handleRestoreOTP}
                  disabled={isRestoreOtpInProgress}
                />
              </Container>
            }
          >
            <Padding all="medium">
              <ds-text as="p" overflow="break-word" className={styles.restoreOtpModalInfoText}>
                {t(
                  'domain.editAccount.restoreOtpInfo',
                  'Before proceeding, verify the user requested this. If you suspect an unauthorized attack, do not restore.',
                )}
              </ds-text>
              <Padding top="medium">
                <ds-text as="p" overflow="break-word">
                  {t('domain.editAccount.restoreOtpQuestion', 'Are you sure you want to proceed?')}
                </ds-text>
              </Padding>
            </Padding>
          </Modal>
          {showCreateOTP && (
            <>
              <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
                <HorizontalWizard
                  steps={wizardSteps}
                  title={t('account.new.create_otp_wizard', 'Create OTP Wizard')}
                  Wrapper={WizardInSection}
                  setToggleWizardSection={setShowCreateOTP}
                />
              </Row>
            </>
          )}
        </>
      )}

      {isAdvanced && (
        <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
          <ds-text as="h2" weight="bold">
            {t(
              'domain.accounts.twoFactorAuthSetupEnforcement',
              'Two-Factor authenticator setup enforcement',
            )}
          </ds-text>
          <Row mainAlignment="flex-start" width="100%">
            <Container
              height="fit"
              crossAlignment="flex-start"
              background="gray6"
              padding={{ top: 'large' }}
            >
              <ListRow>
                <Container crossAlignment="flex-start">
                  <InheritedSwitch
                    subValue={values?.carbonioOtpWizardFromUntrusted}
                    onChange={toggleAccountValue}
                    label={t(
                      'domain.accounts.allowSetupFromUntrustedNetworks',
                      'Allow 2FA setup from untrusted networks',
                    )}
                    disabled={values?.carbonioFeatureOTPMgmtEnabled === FALSE}
                    iconColor="primary"
                    inheritedValue={cosDetail.carbonioOtpWizardFromUntrusted}
                    fromSubValue={accSpecificDetail?.carbonioOtpWizardFromUntrusted}
                    inputName={'carbonioOtpWizardFromUntrusted'}
                    onChangeReset={(): void => setEmptyValue('carbonioOtpWizardFromUntrusted')}
                  />
                  <Padding left={'extralarge'}>
                    <Row padding={{ left: 'small' }}>
                      <ds-text
                        as="small"
                        color="gray1"
                        size="small"
                        overflow="break-word"
                        disabled={values?.carbonioFeatureOTPMgmtEnabled === FALSE}
                      >
                        {t(
                          'domain.accounts.allowSetupFromUntrustedNetworksInfo',
                          'Lets users without an OTP complete the 2FA setup wizard at sign-in from untrusted networks. Disable this option to block access from untrusted networks until 2FA is already configured.',
                        )}
                      </ds-text>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
              <ListRow padding={{ top: 'large' }}>
                <Container crossAlignment="flex-start">
                  <InheritedSwitch
                    subValue={values?.carbonioOtpGracePeriodEnabled}
                    onChange={toggleAccountValue}
                    label={t(
                      'domain.accounts.allowSetupDeferralDuringGracePeriod',
                      'Allow setup deferral during grace period',
                    )}
                    disabled={
                      values?.carbonioFeatureOTPMgmtEnabled === FALSE ||
                      values?.carbonioOtpWizardFromUntrusted === FALSE
                    }
                    iconColor="primary"
                    inheritedValue={cosDetail.carbonioOtpGracePeriodEnabled}
                    fromSubValue={accSpecificDetail?.carbonioOtpGracePeriodEnabled}
                    inputName={'carbonioOtpGracePeriodEnabled'}
                    onChangeReset={(): void => setEmptyValue('carbonioOtpGracePeriodEnabled')}
                  />
                  <Padding left={'extralarge'}>
                    <Row padding={{ left: 'small' }}>
                      <ds-text
                        as="small"
                        color="gray1"
                        size="small"
                        overflow="break-word"
                        disabled={
                          values?.carbonioFeatureOTPMgmtEnabled === FALSE ||
                          values?.carbonioOtpWizardFromUntrusted === FALSE
                        }
                      >
                        {t(
                          'domain.accounts.allowSetupDeferralDuringGracePeriodInfo',
                          'Users can skip the wizard for a limited time. The prompt will reappear at every login until setup is completed or the grace period expires.',
                        )}
                      </ds-text>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
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
            </Container>
          </Row>
        </Row>
      )}
      {isAdvanced && (
        <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
          <ds-text as="h2" weight="bold">
            {t('label.backup', 'Backup')}
          </ds-text>
          <Row mainAlignment="flex-start" width="100%">
            <Container
              height="fit"
              crossAlignment="flex-start"
              background="gray6"
              padding={{ top: 'large' }}
            >
              <ListRow>
                <Container crossAlignment="flex-start">
                  <Switch
                    value={values?.backupSelfUndeleteAllowed}
                    onClick={(): void => toggleAccountValue('backupSelfUndeleteAllowed', true, false)}
                    label={t('label.allow_restore_message', 'Allow user to restore messages')}
                    iconColor="primary"
                  />
                </Container>
              </ListRow>
            </Container>
          </Row>
        </Row>
      )}
      {!showCreateOTP && (
        <Row mainAlignment="flex-start" width="100%">
          <Row
            mainAlignment="flex-start"
            width="100%"
            padding={{ top: 'large', left: 'large', right: 'large' }}
          >
            <Container
              orientation="horizontal"
              width="100%"
              crossAlignment="center"
              mainAlignment="space-between"
              background="#D3EBF8"
              padding={{
                all: 'large',
              }}
              style={{ borderRadius: '2px 2px 0px 0px' }}
            >
              <Row mainAlignment="flex-start">
                <Padding horizontal="small">
                  <ds-icon
                    icon="InfoOutline"
                    color="primary"
                    style={{ width: '20px', height: '20px' }}
                  ></ds-icon>
                </Padding>
              </Row>
              <Row
                mainAlignment="flex-start"
                width="100%"
                padding={{
                  all: 'small',
                }}
              >
                <ds-text as="p" overflow="break-word">
                  {t(
                    'label.account_password_setting_note_for_external_authentication',
                    'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.',
                  )}
                </ds-text>
              </Row>
            </Container>
          </Row>
          <Row
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ all: 'large' }}
            width="100%"
          >
            <ds-text as="h2" weight="bold">
              {t('cos.password', 'Password')}
            </ds-text>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container crossAlignment="flex-start">
                    <InheritedSwitch
                      subValue={values?.zimbraPasswordLocked}
                      onChange={toggleAccountValue}
                      label={t(
                        'cos.prevent_user_from_changing_password',
                        'Prevent user from changing password',
                      )}
                      iconColor="primary"
                      inheritedValue={cosDetail.zimbraPasswordLocked}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLocked}
                      inputName={'zimbraPasswordLocked'}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordLocked')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.minimum_password_length', 'Minimum password length')}
                      subValue={values.zimbraPasswordMinLength}
                      inheritedValue={cosDetail.zimbraPasswordMinLength}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinLength}
                      background="gray5"
                      inputName="zimbraPasswordMinLength"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinLength')}
                    />
                  </Container>
                  <Container padding={{ left: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.maximum_password_length', 'Maximum password length')}
                      subValue={values.zimbraPasswordMaxLength}
                      inheritedValue={cosDetail.zimbraPasswordMaxLength}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMaxLength}
                      background="gray5"
                      inputName="zimbraPasswordMaxLength"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMaxLength')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.minimum_upper_case_characters',
                        'Minimum upper case characters',
                      )}
                      subValue={values.zimbraPasswordMinUpperCaseChars}
                      inheritedValue={cosDetail.zimbraPasswordMinUpperCaseChars}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinUpperCaseChars}
                      background="gray5"
                      inputName="zimbraPasswordMinUpperCaseChars"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinUpperCaseChars')}
                    />
                  </Container>
                  <Container padding={{ left: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.minimum_lower_case_characters',
                        'Minimum lower case characters',
                      )}
                      subValue={values.zimbraPasswordMinLowerCaseChars}
                      inheritedValue={cosDetail.zimbraPasswordMinLowerCaseChars}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinLowerCaseChars}
                      background="gray5"
                      inputName="zimbraPasswordMinLowerCaseChars"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinLowerCaseChars')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
                      subValue={values.zimbraPasswordMinPunctuationChars}
                      inheritedValue={cosDetail.zimbraPasswordMinPunctuationChars}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinPunctuationChars}
                      background="gray5"
                      inputName="zimbraPasswordMinPunctuationChars"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinPunctuationChars')}
                    />
                  </Container>
                  <Container padding={{ left: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
                      subValue={values.zimbraPasswordMinNumericChars}
                      inheritedValue={cosDetail.zimbraPasswordMinNumericChars}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinNumericChars}
                      background="gray5"
                      inputName="zimbraPasswordMinNumericChars"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinNumericChars')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
                      subValue={values.zimbraPasswordMinAge}
                      inheritedValue={cosDetail.zimbraPasswordMinAge}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinAge}
                      background="gray5"
                      inputName="zimbraPasswordMinAge"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinAge')}
                    />
                  </Container>
                  <Container padding={{ left: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
                      subValue={values.zimbraPasswordMaxAge}
                      inheritedValue={cosDetail.zimbraPasswordMaxAge}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMaxAge}
                      background="gray5"
                      inputName="zimbraPasswordMaxAge"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMaxAge')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.minimum_numeric_characters_or_punctuation_symbols',
                        'Minimum numeric characters or punctuation symbols',
                      )}
                      subValue={values.zimbraPasswordMinDigitsOrPuncs}
                      inheritedValue={cosDetail.zimbraPasswordMinDigitsOrPuncs}
                      fromSubValue={accSpecificDetail?.zimbraPasswordMinDigitsOrPuncs}
                      background="gray5"
                      inputName="zimbraPasswordMinDigitsOrPuncs"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordMinDigitsOrPuncs')}
                    />
                  </Container>
                  <Container padding={{ left: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.minimum_number_of_unique_password_history',
                        'Minimum number of unique passwords history',
                      )}
                      subValue={values.zimbraPasswordEnforceHistory}
                      inheritedValue={cosDetail.zimbraPasswordEnforceHistory}
                      fromSubValue={accSpecificDetail?.zimbraPasswordEnforceHistory}
                      background="gray5"
                      inputName="zimbraPasswordEnforceHistory"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordEnforceHistory')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container height="fit" crossAlignment="flex-start" background="gray6">
                <ListRow>
                  <Container crossAlignment="flex-start" padding={{ top: 'large' }}>
                    <InheritedSwitch
                      subValue={values?.zimbraPasswordBlockCommonEnabled}
                      onChange={toggleAccountValue}
                      label={t('cos.reject_common_passwords', 'Reject common passwords')}
                      iconColor="primary"
                      inheritedValue={cosDetail.zimbraPasswordBlockCommonEnabled}
                      fromSubValue={accSpecificDetail?.zimbraPasswordBlockCommonEnabled}
                      inputName={'zimbraPasswordBlockCommonEnabled'}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordBlockCommonEnabled')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
          </Row>
          <Row
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ all: 'large' }}
            width="100%"
          >
            <ds-text as="h2" weight="bold">
              {t('label.forgotten_password', 'Forgotten Password')}
            </ds-text>
            <Row mainAlignment="center" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container crossAlignment="flex-start" width="30%" padding={{ right: 'small' }}>
                    <Switch
                      value={values?.zimbraFeatureResetPasswordStatus === 'enabled'}
                      onClick={(): void => toggleAccountValue('zimbraFeatureResetPasswordStatus', ENABLED, DISABLED)}
                      label={t(
                        'label.user_can_ask_for_forgotten_password_token',
                        'User can ask for a forgotten password token',
                      )}
                      iconColor="primary"
                    />
                  </Container>
                  <Container width="40%" padding={{ right: 'small', left: 'small' }}>
                    <Input
                      backgroundColor="gray5"
                      label={t('label.user_recovery_email', 'User Recovery Email')}
                      value={values?.zimbraPrefPasswordRecoveryAddress || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        if (isValidEmail(e?.target?.value)) {
                          changeValue(e);
                          setRecoveryEmailError(false);
                        } else {
                          setRecoveryEmailError(true);
                        }
                      }}
                      inputName="zimbraPrefPasswordRecoveryAddress"
                      description={t(
                        'label.enter_valid_email_address',
                        'Enter valid email Address',
                      )}
                      hasError={recoveryEmailError}
                    />
                  </Container>
                  <Container width="30%" padding={{ left: 'small' }}>
                    <Select
                      items={recoveryStatus}
                      background="gray5"
                      label={t('label.status', 'Status')}
                      showCheckbox={false}
                      onChange={onRecoveryStatusChange}
                      defaultSelection={recoveryStatus.find(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) =>
                          item.value === values?.zimbraPrefPasswordRecoveryAddressStatus,
                      )}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
          </Row>
          <Row
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ all: 'large' }}
            width="100%"
          >
            <ds-text as="h2" weight="bold">
              {t('cos.failed_login_policy', 'Failed Login Policy')}
            </ds-text>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container crossAlignment="flex-start">
                    <InheritedSwitch
                      subValue={values?.zimbraPasswordLockoutEnabled}
                      onChange={toggleAccountValue}
                      label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
                      iconColor="primary"
                      inheritedValue={cosDetail.zimbraPasswordLockoutEnabled}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutEnabled}
                      inputName={'zimbraPasswordLockoutEnabled'}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutEnabled')}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container crossAlignment="flex-start">
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.number_of_consecutive_failed_login_allowed',
                        'Number of consecutive failed logins allowed',
                      )}
                      subValue={values.zimbraPasswordLockoutMaxFailures}
                      inheritedValue={cosDetail.zimbraPasswordLockoutMaxFailures}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutMaxFailures}
                      background="gray5"
                      inputName="zimbraPasswordLockoutMaxFailures"
                      onChange={changeValue}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutMaxFailures')}
                      disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large' }}
              >
                <ListRow>
                  <Container width="75%" padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
                      subValue={values.zimbraPasswordLockoutDuration?.slice(0, -1)}
                      inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(0, -1)}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
                      background="gray5"
                      inputName="zimbraPasswordLockoutDuration"
                      onChange={onZimbraPasswordLockoutDurationNumChange}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                      disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                    />
                  </Container>
                  <Container width="25%" padding={{ left: 'small' }}>
                    <InheritedSelect
                      label={t('cos.time_range', 'Time Range')}
                      items={timeItems}
                      subValue={values?.zimbraPasswordLockoutDuration?.slice(-1) || ''}
                      inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(-1) || ''}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
                      background="gray5"
                      selectName="zimbraPasswordLockoutDuration"
                      onChange={onZimbraPasswordLockoutDurationTypeChange}
                      onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
                      disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
            <Row mainAlignment="flex-start" width="100%">
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ top: 'large', bottom: 'large' }}
              >
                <ListRow>
                  <Container width="75%" padding={{ right: 'small' }}>
                    <InheritedInput
                      isRequired
                      label={t(
                        'cos.time_window_failed_logins_must_occur_to_lock_account',
                        'Time window in which the failed logins must occur to lock the account:',
                      )}
                      subValue={values.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)}
                      inheritedValue={cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)}
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
                      background="gray5"
                      inputName="zimbraPasswordLockoutFailureLifetime"
                      onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
                      onChangeReset={(): void =>
                        setEmptyValue('zimbraPasswordLockoutFailureLifetime')
                      }
                      disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                    />
                  </Container>
                  <Container width="25%" padding={{ left: 'small' }}>
                    <InheritedSelect
                      label={t('cos.time_range', 'Time Range')}
                      items={timeItems}
                      subValue={
                        values?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''
                      }
                      inheritedValue={
                        cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''
                      }
                      fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
                      background="gray5"
                      selectName="zimbraPasswordLockoutFailureLifetime"
                      onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
                      onChangeReset={(): void =>
                        setEmptyValue('zimbraPasswordLockoutFailureLifetime')
                      }
                      disabled={values.zimbraPasswordLockoutEnabled !== 'TRUE'}
                    />
                  </Container>
                </ListRow>
              </Container>
            </Row>
          </Row>
        </Row>
      )}
    </Container>
  );
};

export default EditAccountSecuritySection;

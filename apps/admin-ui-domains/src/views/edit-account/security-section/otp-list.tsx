/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  InheritedSwitch,
  ListRow,
  Modal,
  Padding,
  Row,
  Table,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { format } from 'date-fns';
import { map } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useDeleteTotp, useRestoreTotp } from '../../../services/use-otp-mutations';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';
import styles from '../security-section.module.css';

type OtpListProps = {
  onGenerate: () => void;
};

export const OtpList = ({ onGenerate }: OtpListProps) => {
  const { form, otpList, accSpecificDetail, cosDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRestoreOtpModalOpen, setIsRestoreOtpModalOpen] = useState<boolean>(false);
  const [selectedOtpIdForRestore, setSelectedOtpIdForRestore] = useState<string | undefined>();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const otpAccount = `${values?.uid}@${domainName}`;
  const deleteTotpMutation = useDeleteTotp(otpAccount);
  const restoreTotpMutation = useRestoreTotp(otpAccount);

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const headers: any = [
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
  ];

  const openRestoreOtpModal = (otpId: string): void => {
    setSelectedOtpIdForRestore(otpId);
    setIsRestoreOtpModalOpen(true);
  };

  const closeRestoreOtpModal = (): void => {
    setSelectedOtpIdForRestore(undefined);
    setIsRestoreOtpModalOpen(false);
  };

  const otpRows = map(otpList, (otpEntry: any) => {
    const isDisabledOtp = otpEntry?.enabled === false;
    return {
      id: otpEntry?.id,
      columns: [
        <ds-text as="span" size="medium" key={`${otpEntry?.id}-label`} color="gray0">
          {otpEntry?.label || ' '}
        </ds-text>,
        <ds-text as="span" size="medium" key={`${otpEntry?.id}-status`} color="gray0">
          {otpEntry?.enabled ? t('label.enabled', 'Enabled') : t('label.disabled', 'Disabled')}
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
  });

  const handleDeleteOTP = (): void => {
    deleteTotpMutation.mutate(
      { id: selectedRows?.[0] },
      {
        onSuccess: (res) => {
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
          } else {
            createSnackbar({
              key: 'error',
              severity: 'error',
              label: t(
                'label.something_wrong_wrror_msg',
                'Something went wrong. Please try again.',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }
        },
      },
    );
  };

  const handleRestoreOTP = (): void => {
    if (!selectedOtpIdForRestore) {
      return;
    }
    restoreTotpMutation.mutate(
      { id: selectedOtpIdForRestore },
      {
        onSuccess: (res) => {
          const isRestoreSuccess =
            res.ok === true || res.ok === 'true' || res.ok === 'ok';
          if (isRestoreSuccess) {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.otp_restored_successfully',
                'OTP has been restored successfully',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
            closeRestoreOtpModal();
            return;
          }
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t(
              'label.something_wrong_wrror_msg',
              'Something went wrong. Please try again.',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        },
        onError: (): void => {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t(
              'label.something_wrong_wrror_msg',
              'Something went wrong. Please try again.',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        },
      },
    );
  };

  return (
    <>
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
              onClick={onGenerate}
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
              disabled={restoreTotpMutation.isPending}
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
    </>
  );
};

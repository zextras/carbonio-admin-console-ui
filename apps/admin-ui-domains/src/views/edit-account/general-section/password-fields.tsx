/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button, Container, Input, Modal, Row, Tooltip, useSnackbar } from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { domainQueryKeys } from '../../../services/domain-query-keys';
import { useModifyAccountAttributes } from '../../../services/use-modify-account-attributes';
import {
  useAccountForm,
  useSetAccountValues,
} from '../account-form-context';
import { somethingWrongSnackbarConfig } from './utils';

type PasswordFieldRowProps = {
  readonly label: string;
  readonly inputName: string;
  readonly value: string | undefined;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly disabled: boolean;
  readonly tooltipLabel?: string;
};

function PasswordFieldRow({
  label,
  inputName,
  value,
  onChange,
  disabled,
  tooltipLabel,
}: PasswordFieldRowProps) {
  const input = (
    <Input
      isRequired
      backgroundColor="gray5"
      label={label}
      onChange={onChange}
      inputName={inputName}
      type="password"
      autoComplete="new-password"
      value={value}
      disabled={disabled}
    />
  );
  if (!tooltipLabel) {
    return input;
  }
  return (
    <Tooltip placement="top" label={tooltipLabel}>
      {input}
    </Tooltip>
  );
}

export const PasswordFields = ({
  isHidePassword,
  allowedDeletePassword,
}: {
  isHidePassword: boolean;
  allowedDeletePassword: boolean;
}) => {
  const { form, account } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState<boolean>(false);
  const modifyAccount = useModifyAccountAttributes();

  const changeAccDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const ldapTooltip = t(
    'label.try_local_password_management_ldap',
    'Disable the "Try local password management in case of failure" toggle or change your default Auth method to edit these fields',
  );

  const deleteUserPassword = (): void => {
    setShowDeletePasswordModal(false);
    modifyAccount.mutate(
      { id: values?.zimbraId, modifiedData: { userPassword: '' } },
      {
        onSuccess: (data) => {
          setAccountValues((prev: Record<string, any>) => ({
            ...prev,
            userPassword: '',
            password: '',
            repeatPassword: '',
          }));
          void queryClient.invalidateQueries({
            queryKey: domainQueryKeys.accountDetail(account.id),
          });
          if (data) {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'account_details.user_password_deleted',
                'User password deleted successfully',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }
        },
        onError: (error) => {
          createSnackbar(somethingWrongSnackbarConfig(error, t));
        },
      },
    );
  };

  return (
    <>
      <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
        <Row width="49%" mainAlignment="flex-start">
          <PasswordFieldRow
            label={t('label.password', 'Password')}
            inputName="password"
            value={values?.password}
            onChange={changeAccDetail}
            disabled={isHidePassword}
            tooltipLabel={isHidePassword ? ldapTooltip : undefined}
          />
        </Row>
        <Row width="49%" mainAlignment="flex-start">
          <PasswordFieldRow
            label={t('label.repeat_password', 'Repeat Password')}
            inputName="repeatPassword"
            value={values?.repeatPassword}
            onChange={changeAccDetail}
            disabled={isHidePassword}
            tooltipLabel={isHidePassword ? ldapTooltip : undefined}
          />
        </Row>
      </Row>
      {allowedDeletePassword && (
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="100%" mainAlignment="space-between">
            {isHidePassword ? (
              <Tooltip placement="top" label={ldapTooltip}>
                <Button
                  type="outlined"
                  label={t(
                    'account_details.delete_user_password',
                    'DELETE USER PASSWORD FROM THE LDAP',
                  )}
                  color="error"
                  width="fill"
                  onClick={(): void => setShowDeletePasswordModal(true)}
                  disabled={isHidePassword}
                />
              </Tooltip>
            ) : (
              <Button
                type="outlined"
                label={t(
                  'account_details.delete_user_password',
                  'DELETE USER PASSWORD FROM THE LDAP',
                )}
                color="error"
                width="fill"
                onClick={(): void => setShowDeletePasswordModal(true)}
                disabled={isHidePassword}
              />
            )}
          </Row>
        </Row>
      )}
      <Modal
        size="small"
        title={t('account_details.delete_password', 'Delete Password', {
          name: values?.givenName,
        })}
        open={showDeletePasswordModal}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '0.5rem' }}>
              <Button
                label={t('label.no_go_back', 'No, go back')}
                color="secondary"
                onClick={(): void => setShowDeletePasswordModal(false)}
              />
              <Button
                label={t('label.yes_delete_it', 'Yes, delete it')}
                color="error"
                onClick={(): void => deleteUserPassword()}
              />
            </Row>
          </Container>
        }
        showCloseIcon
        onClick={(): void => setShowDeletePasswordModal(false)}
      >
        <ds-text
          as="p"
          size={'extralarge'}
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 1rem' }}
        >
          <Trans
            i18nKey="account_details.delete_password_of_user_ldap"
            defaults="You are deleting the password of <bold>{{name}}</bold> from the LDAP. Are you sure you want to delete it?"
            components={{ bold: <strong /> }}
            values={{
              name: values?.givenName,
            }}
          />
        </ds-text>
      </Modal>
    </>
  );
};

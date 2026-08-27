/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, LabeledValue, Modal, Row } from '@zextras/ui-components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

/** Copy-to-clipboard icon for the one-time service password (module-level factory: S6478). */
function createCopyPasswordIcon(password?: string): React.ComponentType {
	return function CopyPasswordIcon() {
		return (
			<ds-icon
				icon="CopyOutline"
				size="large"
				color="Gray0"
				onClick={(e: React.MouseEvent): void => {
					e.preventDefault();
					e.stopPropagation();
					navigator.clipboard.writeText(password || '');
				}}
				style={{ cursor: 'pointer' }}
			></ds-icon>
		);
	};
}

type CredentialCreatedDialogProps = {
  /** Service label of the created credential (dialog title). */
  serviceLabel?: string;
  /** The one-time password shown to the user. */
  password?: string;
  onClose: () => void;
};

/**
 * One-time services-passphrase dialog shown after a credential is created.
 * Rendered conditionally by the parent; closes via its explicit actions.
 */
export const CredentialCreatedDialog = ({
  serviceLabel,
  password,
  onClose,
}: CredentialCreatedDialogProps) => {
  const [t] = useTranslation();

  return (
    <Modal
      size="medium"
      title={t('account_details.service_label_password', ' {{ service_label }}’s Password', {
        service_label: serviceLabel,
      })}
      open
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '1rem' }}>
            <Button
              label={t(
                'account_details.i_have_copied_the_password',
                'I HAVE COPIED THE PASSWORD',
              )}
              color="primary"
              onClick={onClose}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={onClose}
    >
      <Row padding={{ vertical: 'extralarge' }} mainAlignment="center" crossAlignment="center">
        <Row
          width="80%"
          mainAlignment="center"
          crossAlignment="center"
          padding={{ bottom: 'large' }}
        >
          <ds-text size={'extralarge'} overflow="break-word" as="p">
            {t(
              'account_details.password_allow_once_user_to_connect',
              `This password will allow user to connect to this service without the 2FA even from an un-trusted network.`,
            )}
          </ds-text>
        </Row>
        <Row width="80%" mainAlignment="center" crossAlignment="center">
          <ds-text size={'extralarge'} overflow="break-word" as="p">
            <Trans
              i18nKey="account_details.able_to_see_password_once"
              defaults=" Please note: you'll be able to see the password <bold>just once.</bold>"
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </Row>
        <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
          <LabeledValue
            label={t('account_details.service_password', 'Service Password')}
            backgroundColor="gray5"
            value={password}
            CustomIcon={createCopyPasswordIcon(password)}
            textColor={'gray1'}
          />
        </Row>
      </Row>
    </Modal>
  );
};

/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type GalAccountType = {
  id: string;
  name: string;
  server: string;
};

type AccountDataType = {
  id?: string;
  name?: string;
  galAccount?: GalAccountType | null;
};

type DestroyGalsyncAccountModelProps = {
  open: boolean;
  closeHandler: () => void;
  saveHandler: (accountData: AccountDataType) => void;
  accountData: AccountDataType;
};

export const DestroyGalsyncAccountModel = ({
  open,
  closeHandler,
  saveHandler,
  accountData,
}: DestroyGalsyncAccountModelProps) => {
  const [t] = useTranslation();
  return (
    <Modal
      size="medium"
      title={`${t('label.destroy_account', 'Destroy')} ${accountData?.galAccount?.name}`}
      open={open}
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
            <Button
              label={t('label.keep_it_button', 'NO, KEEP IT')}
              color="primary"
              type="outlined"
              onClick={closeHandler}
            />
            <Button
              label={t('label.destroy_account_button', 'YES, DELETE IT')}
              color="error"
              type="outlined"
              onClick={(): void => {
                saveHandler(accountData);
              }}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={closeHandler}
    >
      <ds-text
        as="p"
        style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
      >
        {t('label.delete_account', `Are you sure you want to delete {{accountId}}?`, {
          accountId: accountData?.galAccount?.name,
        })}
      </ds-text>
    </Modal>
  );
};

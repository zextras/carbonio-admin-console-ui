/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Input,
  ListRow,
  Modal,
  Padding,
  Row,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';

type CreateGalsyncAccountModelProps = {
  open: boolean;
  closeHandler: () => void;
  saveHandler: (
    accountData: {
      id?: string;
      name: string;
      galAccount?: { id: string; name: string; server: string } | null;
    },
    galDomainName: string,
  ) => void;
  accountData: {
    id?: string;
    name: string;
    galAccount?: { id: string; name: string; server: string } | null;
  };
};

export const CreateGalsyncAccountModel = ({
  open,
  closeHandler,
  saveHandler,
  accountData,
}: CreateGalsyncAccountModelProps) => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();

  const [galDomainName, setGalDomainName] = useState('');
  return (
    <Modal
      size="medium"
      title={t('label.model_label_create_account', 'Create Account')}
      open={open}
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
            <Button
              label={t('label.go_back_button', 'GO BACK')}
              color="secondary"
              type="ghost"
              onClick={(): void => {
                closeHandler();
                setGalDomainName('');
              }}
            />
            <Button
              label={t('label.create_account_button', 'CREATE ACCOUNT')}
              color="primary"
              type="outlined"
              onClick={(): void => {
                saveHandler(accountData, galDomainName);
                setGalDomainName('');
              }}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={(): void => {
        setGalDomainName('');
        closeHandler();
      }}
    >
      <ListRow>
        <Padding top="large" horizontal="small" width="100%">
          <ds-text as="span">
            {t(
              'label.type_account_name_for_global_address_list',
              'Type the Account Name for the Global Address List (GAL)',
            )}
          </ds-text>
        </Padding>
      </ListRow>
      <Row
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="center"
        width="fill"
        wrap="nowrap"
      >
        <Container padding={{ horizontal: 'small', bottom: 'small' }}>
          <Padding top="medium" bottom="small" horizontal="small" width="100%">
            <Input
              label={t('label.account_name', 'Account Name')}
              backgroundColor="gray5"
              value={galDomainName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setGalDomainName(e.target.value);
              }}
            />
          </Padding>
        </Container>
        <Container
          padding={{ all: 'small' }}
          width="55%"
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="center"
        >
          <ds-text as="label">{`.${accountData?.name}@${domain?.name}`}</ds-text>
        </Container>
      </Row>
    </Modal>
  );
};

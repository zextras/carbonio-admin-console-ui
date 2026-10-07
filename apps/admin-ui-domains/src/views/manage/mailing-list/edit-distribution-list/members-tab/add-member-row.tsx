/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, ComboboxInput, type ComboboxItem, Container, Row } from '@zextras/ui-components';
import { type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';

type AddMemberRowProps = {
  items: Array<ComboboxItem>;
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: ComboboxItem) => void;
  hasError: boolean;
  errorMessage: string | null;
  onAdd: () => void;
};

export const AddMemberRow: FC<AddMemberRowProps> = ({
  items,
  inputValue,
  onChange,
  onSelect,
  hasError,
  errorMessage,
  onAdd,
}) => {
  const [t] = useTranslation();

  return (
    <Container orientation="vertical" mainAlignment="flex-start" background="gray6">
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        width="100%"
        padding={{ top: 'large' }}
      >
        <ComboboxInput
          label={t('label.type_accounts_paste_them_here', 'Type the Accounts or paste them here')}
          items={items}
          value={inputValue}
          onChange={onChange}
          onSelect={onSelect}
          hasError={hasError}
          description={hasError && errorMessage ? errorMessage : undefined}
        />
      </Row>
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        width="100%"
        padding={{ top: 'large', bottom: 'large' }}
      >
        <Button
          icon="Plus"
          key="add-members-button"
          label={t('domain.distributionList.members.addMembers', 'Add Members')}
          color="primary"
          iconPlacement="left"
          onClick={onAdd}
          size="medium"
        />
      </Row>
    </Container>
  );
};

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Switch } from '@zextras/ui-components';



export const FormSwitch = ({
  fieldValue,
  allowSetPrivacy,
  onClick,
  label,
}: {
  fieldValue: boolean;
  allowSetPrivacy: boolean;
  onClick: () => void;
  label: string;
}) => (
  <ListRow>
    <Container
      orientation="horizontal"
      mainAlignment="space-between"
      crossAlignment="flex-start"
      padding={{ all: 'small' }}
    >
      <Switch
        value={fieldValue}
        label={label}
        onClick={onClick}
        iconColor="primary"
        disabled={!allowSetPrivacy}
      />
    </Container>
  </ListRow>
);

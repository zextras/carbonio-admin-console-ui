/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { useResourceForm } from './resource-form-context';
import { SendInviteAccounts } from './send-invite-accounts';

export const ResourceSharingSection = () => {
  const form = useResourceForm();
  const { t } = useTranslation();
  const sendInviteList = useSelector(form.store, (s) => s.values.sendInviteList);

  return (
    <Container mainAlignment="flex-start">
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 300px)"
        background="white"
        style={{ overflow: 'auto', padding: '16px' }}
      >
        <Row>
          <ds-text as="h3" size="small" weight="bold">
            {t('label.invites', 'Invites')}
          </ds-text>
        </Row>

        <SendInviteAccounts
          isEditable
          sendInviteList={sendInviteList}
          setSendInviteList={(v) => form.setFieldValue('sendInviteList', v)}
          hideHeaderBar
        />
      </Container>
    </Container>
  );
};

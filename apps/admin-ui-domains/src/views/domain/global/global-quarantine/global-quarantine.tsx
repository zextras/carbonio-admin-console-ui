/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { Button, Container, Row } from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { useQuarantineAccount } from '../../../../services/use-quarantine-account';
import { useQuarantineMessages } from '../../../../services/use-quarantine-messages';
import { MessageListTable } from './message-list-table';
import { MessageViewModal } from './message-view-modal';
import { QuarantineAccountSection } from './quarantine-account-section';
import type { IncompleteMessage } from './quarantine-types';

/**
 * Global quarantine view: quarantine account management and quarantined
 * messages list.
 */
export const GlobalQuarantine = () => {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const { isPending: configPending } = useAllConfig({ placeholderData: keepPreviousData });
  const { data: account } = useQuarantineAccount();
  const { data: messages = [], isFetching } = useQuarantineMessages(account?.id);
  const [selectedMessage, setSelectedMessage] = useState<IncompleteMessage | null>(null);

  const onRefreshList = (): void => {
    void queryClient.invalidateQueries({ queryKey: domainQueryKeys.quarantineMessages() });
  };

  const onOpenMessage = (message: IncompleteMessage): void => {
    setSelectedMessage(message);
  };

  return (
    <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
      <Row mainAlignment="flex-start" width="100%">
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="3.625rem"
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('quarantine.quarantine', 'Quarantine')}
              </ds-text>
            </Row>
          </Row>
        </Container>
      </Row>

      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflow: 'auto' }}
        width="100%"
        height="calc(100vh - 9.375rem)"
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            {configPending ? (
              <Container
                crossAlignment="center"
                mainAlignment="center"
                height="auto"
                padding={{ top: 'medium' }}
              >
                <ds-spinner></ds-spinner>
              </Container>
            ) : (
              <>
                <QuarantineAccountSection account={account} />
                {account && (
                  <>
                    <Row
                      padding={{ vertical: 'extralarge' }}
                      orientation="horizontal"
                      width="100%"
                      background="gray6"
                    >
                      <ds-divider></ds-divider>
                    </Row>
                    <Row
                      orientation="horizontal"
                      width="100%"
                      padding={{ top: 'small', bottom: 'large' }}
                    >
                      <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
                        <ds-text as="h2" size="medium" weight="bold" color="gray0">
                          {t('label.messages', 'Messages')}
                        </ds-text>
                      </Row>
                    </Row>
                    <Row width="100%" padding={{ bottom: 'large' }}>
                      <Container mainAlignment="flex-end" crossAlignment="flex-end">
                        <Button
                          label={t('quarantine.refresh_list', 'REFRESH LIST')}
                          color="primary"
                          type="outlined"
                          onClick={(): void => {
                            onRefreshList();
                          }}
                        />
                      </Container>
                    </Row>

                    <Row width="100%" padding={{ bottom: 'extralarge' }}>
                      <MessageListTable
                        messages={messages}
                        isFetching={isFetching}
                        onOpenMessage={onOpenMessage}
                      />
                    </Row>
                  </>
                )}
              </>
            )}
          </Container>
        </Row>
      </Container>
      {selectedMessage && account?.id && (
        <MessageViewModal
          message={selectedMessage}
          accountId={account.id}
          onClose={(): void => setSelectedMessage(null)}
        />
      )}
    </Container>
  );
};

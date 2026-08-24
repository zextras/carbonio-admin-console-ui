/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Row,
  Table,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../../../assets/ninja_robo.svg';
import { MessageTableHeaders } from '../../../utility/utils';
import { getDateTime } from './quarantine-message-normalizer';
import type { IncompleteMessage } from './quarantine-types';

type MessageListTableProps = {
  messages: Array<IncompleteMessage>;
  isFetching: boolean;
  onOpenMessage: (message: IncompleteMessage) => void;
};

export const MessageListTable = ({ messages, isFetching, onOpenMessage }: MessageListTableProps) => {
  const [t] = useTranslation();
  const [messageSelection, setMessageSelection] = useState<Array<string>>([]);
  const tableRows = messages.map((v, i) => ({
    id: String(i),
    columns: [
      <Row
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
        key={v.id}
        onClick={(): void => {
          onOpenMessage(v);
        }}
      >
        <ds-text as="span" size="small" weight="regular">
          {getDateTime(v?.date)}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
        onClick={(): void => {
          onOpenMessage(v);
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v.envelopeFrom || ''}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
        onClick={(): void => {
          onOpenMessage(v);
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v.subject}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
        onClick={(): void => {
          onOpenMessage(v);
        }}
      >
        <ds-text
          as="span"
          size="small"
          weight="bold"
          color={Number(v.score) > 50 ? 'secondry' : Number(v.score) > 35 ? 'warning' : 'error'}
        >
          {v.score}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
        onClick={(): void => {
          onOpenMessage(v);
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v.reason}
        </ds-text>
      </Row>,
    ],
    clickable: true,
  }));
  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start">
      <ListRow>
        <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
          <Table
            // @ts-expect-error - needs a fix // Need to fix it with custom soultion
            headers={MessageTableHeaders(t)}
            rows={tableRows}
            showCheckbox={false}
            multiSelect={false}
            selectedRows={messageSelection}
            onSelectionChange={setMessageSelection}
            HeaderFactory={CustomHeaderFactory}
            RowFactory={HoverableRowFactory}
          />
          {isFetching && (
            <Container
              crossAlignment="center"
              mainAlignment="center"
              height="auto"
              padding={{ top: 'large' }}
            >
              <ds-spinner></ds-spinner>
            </Container>
          )}
          {tableRows.length === 0 && !isFetching && (
            <Container
              orientation="column"
              crossAlignment="center"
              mainAlignment="center"
              padding={{ top: 'large' }}
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
                <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                  {t('label.this_list_is_empty', 'This list is empty.')}
                </ds-text>
              </Row>
            </Container>
          )}
        </Container>
      </ListRow>
    </Container>
  );
};

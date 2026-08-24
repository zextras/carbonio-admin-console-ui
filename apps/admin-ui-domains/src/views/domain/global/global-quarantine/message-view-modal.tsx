/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Collapse,
  Container,
  Modal,
  ModalOverlay,
  Padding,
  Row,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { format } from 'date-fns';
import { find } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getDelegateAuthRequest } from '../../../../services/get-delegate-auth-request';
import {
  useDeleteQuarantineMessage,
  useDeliverQuarantineMessage,
} from '../../../../services/use-quarantine-message-actions';
import AttachmentsBlock from './attachments-block';
import MailMessageRenderer from './mail-message-renderer';
import { getScoreColor } from './quarantine-message-normalizer';
import type { IncompleteMessage } from './quarantine-types';

type MessageViewModalProps = {
  message: IncompleteMessage;
  /** id of the quarantine account, used for the delegate-auth download link */
  accountId: string;
  onClose: () => void;
};

export const MessageViewModal = ({ message, accountId, onClose }: MessageViewModalProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const deleteMutation = useDeleteQuarantineMessage();
  const deliverMutation = useDeliverQuarantineMessage();

  const onDeleteMessage = (): void => {
    setIsDeleteModalOpen(false);
    void deleteMutation
      .mutateAsync(message.id)
      .then(() => {
        onClose();
      })
      .catch(() => {
        // snackbar already reported by the hook
      });
  };

  const onDeliverMessage = (): void => {
    setIsDeliverDialogOpen(false);
    void deliverMutation
      .mutateAsync(message)
      .then(() => {
        onClose();
      })
      .catch(() => {
        // snackbar already reported by the hook
      });
  };

  const downloadMail = async (): Promise<void> => {
    try {
      const data = await getDelegateAuthRequest(accountId);
      const token = data?.authToken?.[0]?._content;
      if (!token) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      globalThis.open(
        `https://${globalThis.location.hostname}/service/preauth?authtoken=${token}` +
          `&isredirect=1&adminPreAuth=1&redirectURL=${encodeURIComponent(
            '/service/home/~/?auth=co&view=text&id=',
          )}${message.id.split(':')[1]}`,
        'blank',
      );
    } catch (error) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          (error as Error)?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  };

  return (
    <>
      <Modal
        size="small"
        title={`${t('quarantine.delete_message', 'Delete message')}`}
        open={isDeleteModalOpen}
        customFooter={
          <Container orientation="horizontal" mainAlignment="flex-end">
            <Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
              <Button
                label={t('label.keep_it_button', 'NO, KEEP IT')}
                color="primary"
                type="outlined"
                onClick={(): void => setIsDeleteModalOpen(false)}
              />
              <Button
                label={t('quarantine.yes_delete_message', 'YES, DELETE')}
                color="error"
                type="outlined"
                onClick={(): void => {
                  onDeleteMessage();
                }}
              />
            </Row>
          </Container>
        }
        showCloseIcon
        onClose={(): void => setIsDeleteModalOpen(false)}
      >
        <ds-text
          as="p"
          size={'extralarge'}
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
        >
          {t('quarantine.delete_msg_warning', `Are you sure you want to delete message?`)}
        </ds-text>
      </Modal>
      <ModalOverlay open maxWidth="58.75rem">
        {(deleteMutation.isPending || deliverMutation.isPending) && <ds-spinner></ds-spinner>}
        <Container background="white" mainAlignment="flex-start">
          <Row
            mainAlignment="flex-start"
            crossAlignment="center"
            orientation="horizontal"
            background="white"
            width="fill"
            height="48px"
            style={{ borderBottom: '1px solid #E6E9ED' }}
          >
            <Row padding={{ horizontal: 'small' }}></Row>
            <Row takeAvailableSpace mainAlignment="flex-start">
              <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
                {`${find(message?.participants, { type: 'f' })?.address} <${message?.subject}>`}
              </ds-text>
            </Row>
            <Row padding={{ right: 'extrasmall' }}>
              <Button
                type="ghost"
                color={'text'}
                size="medium"
                icon="CloseOutline"
                onClick={(): void => onClose()}
                aria-label={t('label.close', 'Close')}
              />
            </Row>
          </Row>
          <Row
            mainAlignment="flex-end"
            orientation="horizontal"
            width="fill"
            padding={{ all: 'large' }}
          >
            <Row
              mainAlignment="flex-start"
              orientation="horizontal"
              width="70%"
              padding={{ all: 'large' }}
            >
              <ds-text as="label" size="large">
                {t('label.score', 'Score')}
              </ds-text>
              {' : '}
              <ds-text
                as="strong"
                size="large"
                weight="bold"
                color={getScoreColor(message.score)}
                style={{ display: 'flex', paddingLeft: '0.25rem' }}
              >
                {message.score}
              </ds-text>
              <Tooltip placement="top" label={message.reason}>
                <ds-text as="span" style={{ paddingLeft: '0.25rem' }}>
                  <ds-icon
                    color={getScoreColor(message.score)}
                    size="large"
                    icon={'QuestionMarkCircleOutline'}
                  ></ds-icon>
                </ds-text>
              </Tooltip>
            </Row>
            <Button
              label={t('quarantine.download', 'DOWNLOAD')}
              type="outlined"
              onClick={(): void => {
                void downloadMail();
              }}
            />
            <Padding left="small">
              <Button
                label={t('quarantine.deliver', 'DELIVER')}
                type="outlined"
                onClick={(): void => {
                  setIsDeliverDialogOpen(true);
                }}
              />
            </Padding>
            <Padding left="small">
              <Button
                label={t('label.delete_button', 'DELETE')}
                color="error"
                type="ghost"
                onClick={(): void => {
                  setIsDeleteModalOpen(true);
                }}
              />
            </Padding>
          </Row>
          <Container
            background="white"
            mainAlignment="flex-start"
            style={{
              overflow: 'auto',
            }}
          >
            <Row
              mainAlignment="flex-start"
              orientation="horizontal"
              width="fill"
              padding={{ all: 'large' }}
            >
              <Row borderColor="gray3" padding={{ all: 'large' }} width="fill">
                <Row
                  width="50%"
                  mainAlignment="flex-start"
                  crossAlignment="center"
                  orientation="horizontal"
                >
                  <Row width="95%" mainAlignment="flex-start">
                    <ds-text as="h3" size="large" weight="bold">
                      {message?.subject}
                    </ds-text>
                  </Row>
                </Row>
                <Row
                  width="50%"
                  mainAlignment="flex-end"
                  crossAlignment="center"
                  orientation="vertical"
                >
                  <Row width="95%" mainAlignment="flex-end" orientation="horizontal">
                    <ds-text as="label" size="small" weight="bold">
                      {t('label.date', 'Date')} :{' '}
                    </ds-text>
                    <ds-text as="span" size="small">
                      {' '}
                      {format(message?.date, 'dd-MM-yyyy - HH:mm a')}
                    </ds-text>
                  </Row>
                  <Row width="95%" mainAlignment="flex-end" orientation="horizontal">
                    <ds-text as="label" size="small" weight="bold">
                      {t('label.received', 'Received')} :{' '}
                    </ds-text>
                    <ds-text as="span" size="small">
                      {' '}
                      {format(message?.date, 'dd-MM-yyyy - HH:mm a')}
                    </ds-text>
                  </Row>
                </Row>
                <Row width="100%" padding={{ top: 'medium' }}>
                  <ds-divider></ds-divider>
                </Row>
                <Row
                  width="100%"
                  mainAlignment="flex-start"
                  orientation="horizontal"
                  padding={{ top: 'large' }}
                >
                  <ds-text as="label" size="small" weight="bold">
                    {t('label.from', 'From')} :{' '}
                  </ds-text>
                  <ds-text as="span" size="small">
                    {' '}
                    {message.envelopeFrom || ''}
                  </ds-text>
                </Row>
                <Row
                  width="100%"
                  mainAlignment="flex-start"
                  orientation="horizontal"
                  padding={{ top: 'medium' }}
                >
                  <ds-text as="label" size="small" weight="bold">
                    {t('label.to', 'To')} :{' '}
                  </ds-text>
                  <ds-text as="span" size="small">
                    {' '}
                    {message.envelopeTo || ''}
                  </ds-text>
                </Row>
                <Row
                  width="100%"
                  mainAlignment="flex-start"
                  orientation="horizontal"
                  padding={{ top: 'medium' }}
                >
                  <AttachmentsBlock message={message} onClose={onClose} />
                  <MailMessageRenderer mailMsg={message} />
                </Row>
              </Row>
              <Row mainAlignment="flex-start" padding={{ all: 'large' }} width="fill">
                <Button
                  icon={showSource ? 'ChevronUpOutline' : 'ChevronDownOutline'}
                  size="small"
                  onClick={(): void => setShowSource(!showSource)}
                  label={
                    showSource
                      ? t('quarantine.hide_source', 'Hide source')
                      : t('quarantine.show_source', 'Show source')
                  }
                  color="primary"
                  type="ghost"
                />
              </Row>
              <Collapse open={showSource}>
                <Row borderColor="gray3" padding={{ all: 'large' }} width="fill">
                  <ds-text
                    as="span"
                    overflow="break-word"
                    color="text"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {message?.body?.content}
                  </ds-text>
                </Row>
              </Collapse>
            </Row>
          </Container>
        </Container>
        <Modal
          title={`${t('quarantine.is_content_email_safe', 'Is the content of the email safe?')}`}
          open={isDeliverDialogOpen}
          showCloseIcon
          onClose={(): void => {
            setIsDeliverDialogOpen(false);
          }}
          customFooter={
            <Container orientation="horizontal" mainAlignment="space-between">
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Padding all="small">
                  <Button
                    label={t('quarantine.no_cancel', 'NO, CANCEL')}
                    color="primary"
                    type="ghost"
                    onClick={(): void => {
                      setIsDeliverDialogOpen(false);
                    }}
                  />
                </Padding>

                <Button
                  label={t('quarantine.yes_deliver', 'YES, DELIVER')}
                  color="primary"
                  type="outlined"
                  onClick={(): void => {
                    onDeliverMessage();
                  }}
                />
              </Container>
            </Container>
          }
        >
          <Padding all="medium">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t(
                'quarantine.please_note_email_contains_dangerous_file_not_be_delivered',
                'Please note that if the email still contains a dangerous file it will not be delivered',
              )}
            </ds-text>
          </Padding>
        </Modal>
      </ModalOverlay>
    </>
  );
};

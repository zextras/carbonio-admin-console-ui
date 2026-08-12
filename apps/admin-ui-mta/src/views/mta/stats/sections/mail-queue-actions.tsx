/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type MailQueueActionsProps = Readonly<{
  selectedRowCount: number;
  holdInProgress: boolean;
  releaseInProgress: boolean;
  requeueInProgress: boolean;
  deleteInProgress: boolean;
  requestInprogress: boolean;
  flushRequestInProgress: boolean;
  onHoldPress: () => void;
  onReleasePress: () => void;
  onRequeuePress: () => void;
  onDeletePress: () => void;
  flushQueues: () => void;
}>;

export function MailQueueActions({
  selectedRowCount,
  holdInProgress,
  releaseInProgress,
  requeueInProgress,
  deleteInProgress,
  requestInprogress,
  flushRequestInProgress,
  onHoldPress,
  onReleasePress,
  onRequeuePress,
  onDeletePress,
  flushQueues,
}: MailQueueActionsProps) {
  const [t] = useTranslation();

  return (
    <Container
      height="auto"
      crossAlignment="flex-end"
      mainAlignment="flex-end"
      orientation="horizontal"
      padding={{ top: 'large', bottom: 'large' }}
    >
      <Container height="auto" width="auto" padding={{ right: 'medium' }}>
        <Button
          label={t('mta.hold', 'Hold')}
          color="primary"
          size="large"
          type="outlined"
          onClick={onHoldPress}
          loading={holdInProgress}
          disabled={holdInProgress || selectedRowCount === 0}
        />
      </Container>
      <Container height="auto" width="auto" padding={{ right: 'medium' }}>
        <Button
          label={t('mta.release', 'Release')}
          color="primary"
          size="large"
          type="outlined"
          onClick={onReleasePress}
          loading={releaseInProgress}
          disabled={releaseInProgress || selectedRowCount === 0}
        />
      </Container>
      <Container height="auto" width="auto" padding={{ right: 'medium' }}>
        <Button
          label={t('mta.requeue', 'Requeue')}
          color="primary"
          size="large"
          type="outlined"
          onClick={onRequeuePress}
          loading={requeueInProgress}
          disabled={requeueInProgress || selectedRowCount === 0}
        />
      </Container>

      <Container height="auto" width="auto" padding={{ right: 'medium' }}>
        <Button
          label={t('label.delete', 'Delete')}
          color="error"
          size="large"
          type="outlined"
          onClick={onDeletePress}
          loading={deleteInProgress}
          disabled={deleteInProgress || selectedRowCount === 0}
        />
      </Container>
      <Container height="auto" width="auto" padding={{ right: 'medium' }}>
        <Button
          label={t('mta.flush_queues', 'Flush queues')}
          color="primary"
          size="large"
          type="outlined"
          onClick={flushQueues}
          disabled={requestInprogress || flushRequestInProgress}
          loading={requestInprogress || flushRequestInProgress}
        />
      </Container>
    </Container>
  );
}

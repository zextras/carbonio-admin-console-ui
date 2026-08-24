/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { MessageListTable } from '../message-list-table';
import type { IncompleteMessage } from '../quarantine-types';

function createMessage(): IncompleteMessage {
  return {
    id: 'msg-1',
    parent: '2',
    conversation: '',
    read: true,
    size: 100,
    hasAttachment: false,
    flagged: false,
    urgent: false,
    isDeleted: false,
    isSentByMe: false,
    isForwarded: false,
    isInvite: false,
    isDraft: false,
    isScheduled: false,
    date: new Date(2025, 5, 15, 14, 30).getTime(),
    subject: 'Spam subject',
    fragment: '',
    tags: [],
    parts: [],
    body: { contentType: 'text/plain', content: '' },
    isComplete: true,
    isReplied: false,
    score: '42',
    reason: 'bad content',
    envelopeFrom: 'spammer@example.com',
    envelopeTo: 'admin@example.com',
  };
}

describe('MessageListTable', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders one row per message with all columns', async () => {
    const onOpenMessage = vi.fn();
    await setupBrowserTest(
      <MessageListTable messages={[createMessage()]} isFetching={false} onOpenMessage={onOpenMessage} />,
    );

    await expect.element(page.getByText('15/06/25 14:30')).toBeVisible();
    await expect.element(page.getByText('spammer@example.com')).toBeVisible();
    await expect.element(page.getByText('Spam subject')).toBeVisible();
    await expect.element(page.getByText('42', { exact: true })).toBeVisible();
    await expect.element(page.getByText('bad content')).toBeVisible();
  });

  it('calls onOpenMessage with the message when a row is clicked', async () => {
    const onOpenMessage = vi.fn();
    await setupBrowserTest(
      <MessageListTable messages={[createMessage()]} isFetching={false} onOpenMessage={onOpenMessage} />,
    );

    await page.getByText('Spam subject').click();

    expect(onOpenMessage).toHaveBeenCalledTimes(1);
    expect(onOpenMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 'msg-1' }));
  });

  it('shows a spinner while fetching', async () => {
    await setupBrowserTest(
      <MessageListTable messages={[]} isFetching onOpenMessage={vi.fn()} />,
    );

    await expect.element(page.getByRole('status')).toBeVisible();
  });

  it('shows the empty state when there are no messages and nothing is fetching', async () => {
    await setupBrowserTest(
      <MessageListTable messages={[]} isFetching={false} onOpenMessage={vi.fn()} />,
    );

    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });
});
